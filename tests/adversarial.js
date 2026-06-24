/**
 * Adversarial red-team tests — edge cases that target subtle code-path bugs.
 * Run: node tests/adversarial.js
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

  // ─── ADV 1: Null/undefined/number entries in data array ───
  console.log('\n--- ADV 1: Non-string types in array ---');
  const r1 = await post([null, undefined, 42, true, 'A->B']);
  check('4 invalid entries', r1.invalid_entries.length, 4);
  check('null stringified', r1.invalid_entries[0], 'null');
  check('undefined stringified', r1.invalid_entries[1], 'undefined');
  check('42 stringified', r1.invalid_entries[2], '42');
  check('true stringified', r1.invalid_entries[3], 'true');
  check('one valid tree', r1.hierarchies.length, 1);

  // ─── ADV 2: "A->B" and "B->A" are NOT duplicates ───
  console.log('\n--- ADV 2: A->B and B->A are different edges ---');
  const r2 = await post(['A->B', 'B->A']);
  check('no duplicates', r2.duplicate_edges.length, 0);
  // This forms a cycle: A->B, B->A. Both survive multi-parent (A gets parent B via B->A, B gets parent A via A->B)
  // Wait: A->B makes B.parent=A. B->A makes A.parent=B. Both kept. Cycle.
  check('one cycle', r2.hierarchies.length, 1);
  check('has_cycle', r2.hierarchies[0].has_cycle, true);
  check('root A (lex)', r2.hierarchies[0].root, 'A');

  // ─── ADV 3: Multi-parent creates TWO disconnected components from what would be one ───
  console.log('\n--- ADV 3: Multi-parent orphans create separate components ---');
  // Input: C->D, A->D, A->B. After multi-parent: C->D kept (D.parent=C), A->D discard, A->B kept (B.parent=A)
  // Component 1: {C, D}. Component 2: {A, B}. Two separate trees!
  const r3 = await post(['C->D', 'A->D', 'A->B']);
  check('two hierarchies (not one)', r3.hierarchies.length, 2);
  const tree3c = r3.hierarchies.find(h => h.root === 'C');
  const tree3a = r3.hierarchies.find(h => h.root === 'A');
  check('tree C exists', !!tree3c, true);
  check('tree A exists', !!tree3a, true);
  check('C tree', tree3c.tree, { C: { D: {} } });
  check('A tree', tree3a.tree, { A: { B: {} } });

  // ─── ADV 4: Duplicate detection uses normalized (trimmed) key ───
  console.log('\n--- ADV 4: Whitespace-padded duplicates ---');
  const r4 = await post([' A->B ', 'A->B', '  A->B  ']);
  check('dup reported once', r4.duplicate_edges, ['A->B']);
  check('one tree', r4.hierarchies.length, 1);

  // ─── ADV 5: All 26 letters in a single chain ───
  console.log('\n--- ADV 5: Full 26-letter chain A->B->...->Z ---');
  const chain26 = [];
  for (let i = 0; i < 25; i++) {
    chain26.push(String.fromCharCode(65 + i) + '->' + String.fromCharCode(66 + i));
  }
  const r5 = await post(chain26);
  check('one tree', r5.hierarchies.length, 1);
  check('depth 26', r5.hierarchies[0].depth, 26);
  check('root A', r5.hierarchies[0].root, 'A');

  // ─── ADV 6: Wide tree (single root, many children) ───
  console.log('\n--- ADV 6: Wide tree A->B, A->C, ..., A->Z ---');
  const wide = [];
  for (let i = 1; i < 26; i++) {
    wide.push('A->' + String.fromCharCode(65 + i));
  }
  const r6 = await post(wide);
  check('one tree', r6.hierarchies.length, 1);
  check('depth 2 (wide not deep)', r6.hierarchies[0].depth, 2);
  check('root A', r6.hierarchies[0].root, 'A');

  // ─── ADV 7: largest_tree_root with 3 trees, two tied ───
  console.log('\n--- ADV 7: Three trees, largest_tree_root tiebreaker ---');
  // Tree C->D (depth 2), Tree A->B (depth 2), Tree E->F->G (depth 3)
  const r7 = await post(['C->D', 'A->B', 'E->F', 'F->G']);
  check('three trees', r7.hierarchies.length, 3);
  check('largest is E (depth 3)', r7.summary.largest_tree_root, 'E');

  // Now test tie: two trees both depth 3
  const r7b = await post(['C->D', 'D->E', 'A->B', 'B->F']);
  check('two trees depth 3', r7b.hierarchies.length, 2);
  check('largest is A (tie, A < C)', r7b.summary.largest_tree_root, 'A');

  // ─── ADV 8: Cycle with exactly 2 nodes ───
  console.log('\n--- ADV 8: 2-node cycle ---');
  const r8 = await post(['M->N', 'N->M']);
  check('one cycle', r8.hierarchies.length, 1);
  check('root M (M < N)', r8.hierarchies[0].root, 'M');
  check('empty tree', r8.hierarchies[0].tree, {});
  check('has_cycle', r8.hierarchies[0].has_cycle, true);
  check('no depth key', r8.hierarchies[0].depth, undefined);

  // ─── ADV 9: Edge case "A->B" where only the parent has no other connection ──
  console.log('\n--- ADV 9: Single edge tree structure ---');
  const r9 = await post(['A->B']);
  check('root A', r9.hierarchies[0].root, 'A');
  check('tree {A:{B:{}}}', r9.hierarchies[0].tree, { A: { B: {} } });
  check('depth 2', r9.hierarchies[0].depth, 2);

  // ─── ADV 10: Multi-parent discards create a cycle that wouldn't exist otherwise ───
  console.log('\n--- ADV 10: Order matters — same edges, different order, tree vs cycle ---');
  // Order 1: A->B, B->C, C->A → pure cycle (each gets exactly one parent)
  const r10a = await post(['A->B', 'B->C', 'C->A']);
  check('10a: cycle', r10a.hierarchies[0].has_cycle, true);

  // Order 2: C->A, A->B, B->C → same edges, still a cycle
  const r10b = await post(['C->A', 'A->B', 'B->C']);
  check('10b: still cycle', r10b.hierarchies[0].has_cycle, true);
  check('10b: root A', r10b.hierarchies[0].root, 'A');

  // ─── ADV 11: Diamond resolved by multi-parent, no cycle ───
  console.log('\n--- ADV 11: Diamond resolved to tree ---');
  // A->C, B->C, A->B. After multi-parent: A->C kept (C.parent=A), B->C discard (C has parent), A->B kept (B.parent=A)
  const r11 = await post(['A->C', 'B->C', 'A->B']);
  check('one tree (not cycle)', r11.hierarchies.length, 1);
  check('root A', r11.hierarchies[0].root, 'A');
  check('no cycle', r11.hierarchies[0].has_cycle, undefined);
  check('tree structure', r11.hierarchies[0].tree, { A: { C: {}, B: {} } });

  // ─── ADV 12: Edge case with only invalid and duplicate, no valid unique edges ───
  console.log('\n--- ADV 12: Only invalids + only duplicates ---');
  const r12 = await post(['hello', 'A->B', 'A->B']);
  check('one tree (from the unique A->B)', r12.hierarchies.length, 1);
  check('one invalid', r12.invalid_entries, ['hello']);
  check('one dup', r12.duplicate_edges, ['A->B']);

  // ─── ADV 13: Stress test — does it respond under 3 seconds? ───
  console.log('\n--- ADV 13: Performance (50 edges) ---');
  const stress = [];
  // 25 tree edges + 25 assorted
  for (let i = 0; i < 25; i++) {
    stress.push(String.fromCharCode(65 + i) + '->' + String.fromCharCode(66 + i));
  }
  for (let i = 0; i < 25; i++) {
    stress.push(String.fromCharCode(65 + i) + '->' + String.fromCharCode(66 + i)); // duplicates
  }
  const t0 = Date.now();
  const r13 = await post(stress);
  const elapsed = Date.now() - t0;
  check('responded in < 3000ms', elapsed < 3000, true);
  console.log(`  ⏱️  Response time: ${elapsed}ms`);

  // ─── SUMMARY ───
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${pass} passed, ${fail} failed out of ${pass + fail} checks`);
  if (fail > 0) console.log('⚠️  FAILURES DETECTED — SEE ABOVE');
  else console.log('🎉 ALL ADVERSARIAL CHECKS PASSED');
}

run().catch(console.error);
