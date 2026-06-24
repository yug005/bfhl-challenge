/**
 * Builds the summary object from the completed hierarchies array.
 *
 * {
 *   total_trees:        count of non-cyclic trees,
 *   total_cycles:       count of cyclic groups,
 *   largest_tree_root:  root of tree with greatest depth (tie: lex smallest root)
 * }
 *
 * @param {Array} hierarchies
 * @returns {{ total_trees: number, total_cycles: number, largest_tree_root: string }}
 */
function buildSummary(hierarchies) {
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const cycles = hierarchies.filter((h) => h.has_cycle);

  let largestTreeRoot = '';

  if (trees.length > 0) {
    // Sort by depth descending, then root ascending (lex) for tiebreaker
    const sorted = [...trees].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    largestTreeRoot = sorted[0].root;
  }

  return {
    total_trees: trees.length,
    total_cycles: cycles.length,
    largest_tree_root: largestTreeRoot,
  };
}

module.exports = { buildSummary };
