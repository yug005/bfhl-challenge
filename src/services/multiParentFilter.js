/**
 * Applies the first-parent-wins rule.
 * If a child already has a parent from an earlier edge, silently discard the later edge.
 * Discarded edges do NOT go into invalid_entries or duplicate_edges.
 *
 * @param {Array<{parent:string, child:string, normalized:string}>} uniqueEdges
 * @returns {Array<{parent:string, child:string, normalized:string}>} filteredEdges
 */
function filterMultiParent(uniqueEdges) {
  const childToParent = new Map();
  const filteredEdges = [];

  for (const edge of uniqueEdges) {
    if (childToParent.has(edge.child)) {
      // This child already has a parent — silently discard
      continue;
    }
    childToParent.set(edge.child, edge.parent);
    filteredEdges.push(edge);
  }

  return filteredEdges;
}

module.exports = { filterMultiParent };
