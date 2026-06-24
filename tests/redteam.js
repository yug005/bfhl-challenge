/**
 * Red-team test suite — evaluates correctness of every edge case.
 * Run: node tests/redteam.js
 */
const http = require('http');

function post(data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ data });
    const req = http.request(
      { hostname: 'localhost', port: 3000, path: '/bfhl', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(JSON.parse(d)));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  let pass = 0, fail = 0;

  function check(name, actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) {
      console.log(`  ✅ ${name}`);
      pass++;
    } else {
      console.log(`  ❌ ${name}`);
      console.log(`     Expected: ${e}`);
      console.log(`     Actual:   ${a}`);
      fail++;
    }
  }

  // ─── TEST 1: Empty input ───
  console.log('\n--- TEST 1: Empty input ---');
  const r1 = await post([]);
  check('hierarchies empty', r1.hierarchies, []);
  check('invalid_entries empty', r1.invalid_entries, []);
  check('duplicate_edges empty', r1.duplicate_edges, []);
  check('summary', r1.summary, { total_trees: 0, total_cycles: 0, largest_tree_root: '' });

  // ─── TEST 2: All invalid entries ───
  console.log('\n--- TEST 2: All invalid entries ---');
  const r2 = await post(['hello', '1->2', 'AB->C', 'A=>B', 'A->', '', 'A->A']);
  check('hierarchies empty', r2.hierarchies, []);
  check('invalid count', r2.invalid_entries.length, 7);
  check('has hello', r2.invalid_entries.includes('hello'), true);
  check('has self-loop', r2.invalid_entries.includes('A->A'), true);
  check('has empty', r2.invalid_entries.includes(''), true);
  check('summary all zero', r2.summary, { total_trees: 0, total_cycles: 0, largest_tree_root: '' });

  // ─── TEST 3: Duplicate edge x10 ───
  console.log('\n--- TEST 3: Duplicate edge x10 ---');
  const r3 = await post(['A->B','A->B','A->B','A->B','A->B','A->B','A->B','A->B','A->B','A->B']);
  check('one hierarchy', r3.hierarchies.length, 1);
  check('tree depth 2', r3.hierarchies[0].depth, 2);
  check('dup reported once', r3.duplicate_edges, ['A->B']);
  check('dup count 1', r3.duplicate_edges.length, 1);

  // ─── TEST 4: Multiple disconnected trees ───
  console.log('\n--- TEST 4: Multiple disconnected trees ---');
  const r4 = await post(['A->B', 'B->C', 'X->Y', 'Y->Z']);
  check('two hierarchies', r4.hierarchies.length, 2);
  const t4a = r4.hierarchies.find(h => h.root === 'A');
  const t4b = r4.hierarchies.find(h => h.root === 'X');
  check('tree A exists', !!t4a, true);
  check('tree X exists', !!t4b, true);
  check('tree A depth 3', t4a.depth, 3);
  check('tree X depth 3', t4b.depth, 3);
  check('tree A structure', t4a.tree, { A: { B: { C: {} } } });
  check('tree X structure', t4b.tree, { X: { Y: { Z: {} } } });
  check('no has_cycle on trees', t4a.has_cycle, undefined);
  check('summary 2 trees', r4.summary.total_trees, 2);

  // ─── TEST 5: Multiple disconnected cycles ───
  console.log('\n--- TEST 5: Multiple disconnected cycles ---');
  const r5 = await post(['A->B', 'B->A', 'X->Y', 'Y->Z', 'Z->X']);
  check('two hierarchies', r5.hierarchies.length, 2);
  const c5a = r5.hierarchies.find(h => h.root === 'A');
  const c5b = r5.hierarchies.find(h => h.root === 'X');
  check('cycle A exists', !!c5a, true);
  check('cycle X exists', !!c5b, true);
  check('cycle A has_cycle', c5a.has_cycle, true);
  check('cycle X has_cycle', c5b.has_cycle, true);
  check('cycle A tree empty', c5a.tree, {});
  check('cycle A no depth', c5a.depth, undefined);
  check('summary 0 trees 2 cycles', r5.summary, { total_trees: 0, total_cycles: 2, largest_tree_root: '' });

  // ─── TEST 6: Tree + cycle mixed ───
  console.log('\n--- TEST 6: Tree + cycle mixed ---');
  const r6 = await post(['A->B', 'B->C', 'X->Y', 'Y->X']);
  check('two hierarchies', r6.hierarchies.length, 2);
  const tree6 = r6.hierarchies.find(h => !h.has_cycle);
  const cyc6 = r6.hierarchies.find(h => h.has_cycle);
  check('tree root A', tree6.root, 'A');
  check('tree depth 3', tree6.depth, 3);
  check('cycle root X', cyc6.root, 'X');
  check('cycle has_cycle', cyc6.has_cycle, true);
  check('summary', r6.summary, { total_trees: 1, total_cycles: 1, largest_tree_root: 'A' });

  // ─── TEST 7: Multi-parent order dependence ───
  console.log('\n--- TEST 7: Multi-parent order dependence ---');
  // Case A: A->D first, then B->D (discard B->D)
  const r7a = await post(['A->D', 'B->D', 'A->B']);
  console.log('  Case 7a: A->D first');
  // After multi-parent: A->D (kept), B->D (discard, D has parent A), A->B (kept)
  // Component: {A, B, D}. A->B, A->D. Root=A. tree={A:{B:{},D:{}}}. depth=2.
  const t7a = r7a.hierarchies.find(h => h.root === 'A');
  check('7a root A', t7a.root, 'A');
  check('7a tree', t7a.tree, { A: { D: {}, B: {} } });
  check('7a depth 2', t7a.depth, 2);

  // Case B: B->D first, then A->D (discard A->D). A orphaned if no other edges.
  const r7b = await post(['B->D', 'A->D', 'B->C']);
  console.log('  Case 7b: B->D first, A->D discarded, A orphaned');
  // After multi-parent: B->D (kept), A->D (discard, D has parent B), B->C (kept)
  // Only nodes in remaining edges: B, D, C. A vanishes.
  check('7b hierarchy count', r7b.hierarchies.length, 1);
  const t7b = r7b.hierarchies[0];
  check('7b root B', t7b.root, 'B');
  check('7b tree', t7b.tree, { B: { D: {}, C: {} } });
  check('7b depth 2', t7b.depth, 2);

  // ─── TEST 8: Self loops ───
  console.log('\n--- TEST 8: Self loops ---');
  const r8 = await post(['A->A', 'B->B', 'A->B']);
  check('A->A invalid', r8.invalid_entries.includes('A->A'), true);
  check('B->B invalid', r8.invalid_entries.includes('B->B'), true);
  check('A->B valid tree', r8.hierarchies.length, 1);
  check('tree root A', r8.hierarchies[0].root, 'A');

  // ─── TEST 9: Whitespace trimming ───
  console.log('\n--- TEST 9: Whitespace trimming ---');
  const r9 = await post([' A->B ', '  C->D  ', 'A->B']);
  check('two valid edges after trim', r9.hierarchies.length, 2);
  check('duplicate A->B', r9.duplicate_edges, ['A->B']);
  check('no invalid', r9.invalid_entries.length, 0);

  // ─── TEST 10: largest_tree_root tiebreaker ───
  console.log('\n--- TEST 10: largest_tree_root tiebreaker ---');
  // Two trees, both depth 2. Roots B and A. A < B lexicographically.
  const r10 = await post(['B->C', 'A->D']);
  check('two trees', r10.hierarchies.length, 2);
  check('both depth 2', r10.hierarchies.every(h => h.depth === 2), true);
  check('largest_tree_root is A (lex smaller)', r10.summary.largest_tree_root, 'A');

  // ─── TEST 11: Cycle root lex selection ───
  console.log('\n--- TEST 11: Cycle root lex selection ---');
  const r11 = await post(['Z->Y', 'Y->X', 'X->Z']);
  check('one cycle', r11.hierarchies.length, 1);
  check('cycle root is X (lex smallest)', r11.hierarchies[0].root, 'X');
  check('has_cycle true', r11.hierarchies[0].has_cycle, true);

  // ─── TEST 12: Multi-parent discards creating orphans ───
  console.log('\n--- TEST 12: Multi-parent discarded edges orphan nodes ---');
  // B->C first, C->D, D->B forms cycle. Then A->B — B already has parent D, A->B discarded. A orphaned.
  const r12 = await post(['B->C', 'C->D', 'D->B', 'A->B']);
  // After multi-parent: B->C (kept), C->D (kept), D->B (B.parent=? — B has no parent yet! kept!), A->B (B.parent=D, discard)
  // Wait: B->C is processed first. B is the PARENT. C gets parent B.
  // D->B: B gets parent D. (B didn't have a parent before — B was only a parent, not a child)
  // A->B: B already has parent D → discard.
  // Remaining: B->C, C->D, D->B → cycle {B,C,D}. Root = B (lex smallest)
  // A is orphaned — not in any remaining edge.
  check('one cycle', r12.hierarchies.length, 1);
  check('root is B', r12.hierarchies[0].root, 'B');
  check('has_cycle', r12.hierarchies[0].has_cycle, true);

  // ─── TEST 13: Deep tree depth calculation ───
  console.log('\n--- TEST 13: Deep tree (depth 10) ---');
  // A->B->C->D->E->F->G->H->I->J
  const r13 = await post(['A->B','B->C','C->D','D->E','E->F','F->G','G->H','H->I','I->J']);
  check('one tree', r13.hierarchies.length, 1);
  check('depth 10', r13.hierarchies[0].depth, 10);
  check('root A', r13.hierarchies[0].root, 'A');

  // ─── TEST 14: Tree serialization format ───
  console.log('\n--- TEST 14: Tree serialization format ---');
  const r14 = await post(['A->B', 'A->C', 'B->D']);
  const expected14 = { A: { B: { D: {} }, C: {} } };
  check('nested tree format', r14.hierarchies[0].tree, expected14);

  // ─── TEST 15: Response schema exactness ───
  console.log('\n--- TEST 15: Response schema exactness ---');
  const r15 = await post(['A->B']);
  const keys15 = Object.keys(r15).sort();
  check('top-level keys', keys15, ['college_roll_number','duplicate_edges','email_id','hierarchies','invalid_entries','summary','user_id'].sort());
  const treeKeys = Object.keys(r15.hierarchies[0]).sort();
  check('tree hierarchy keys (no has_cycle)', treeKeys, ['depth', 'root', 'tree']);
  const sumKeys = Object.keys(r15.summary).sort();
  check('summary keys', sumKeys, ['largest_tree_root', 'total_cycles', 'total_trees']);

  // Check cycle hierarchy keys
  const r15c = await post(['A->B', 'B->A']);
  const cycleKeys = Object.keys(r15c.hierarchies[0]).sort();
  check('cycle hierarchy keys (no depth)', cycleKeys, ['has_cycle', 'root', 'tree']);

  // ─── SUMMARY ───
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} checks`);
  if (fail > 0) console.log('⚠️  FAILURES DETECTED — SEE ABOVE');
  else console.log('🎉 ALL CHECKS PASSED');
}

run().catch(console.error);
