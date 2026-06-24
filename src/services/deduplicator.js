/**
 * Detects and removes duplicate edges.
 * - First occurrence is kept for tree construction.
 * - Each unique duplicate edge string is reported exactly once in duplicateEdges[].
 *
 * Example: ["A->B", "A->B", "A->B"] → duplicateEdges: ["A->B"] (one entry, not two)
 *
 * @param {Array<{parent:string, child:string, normalized:string}>} validEdges
 * @returns {{ uniqueEdges: Array, duplicateEdges: string[] }}
 */
function deduplicate(validEdges) {
  const seen = new Set();
  const dupReported = new Set();
  const uniqueEdges = [];
  const duplicateEdges = [];

  for (const edge of validEdges) {
    const key = edge.normalized;

    if (seen.has(key)) {
      // Already seen — this is a duplicate
      if (!dupReported.has(key)) {
        duplicateEdges.push(key);
        dupReported.add(key);
      }
    } else {
      seen.add(key);
      uniqueEdges.push(edge);
    }
  }

  return { uniqueEdges, duplicateEdges };
}

module.exports = { deduplicate };
