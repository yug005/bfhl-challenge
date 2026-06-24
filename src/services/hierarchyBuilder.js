/**
 * Builds the hierarchies[] array from connected components.
 *
 * For each component:
 *   - Find root (node never appearing as a child in this component's edges).
 *   - Run explicit DFS cycle detection.
 *   - TREE: { root, tree: nested object, depth: node count on longest path }
 *   - CYCLE: { root: lex-smallest node, tree: {}, has_cycle: true }
 *
 * @param {Array<{nodes: Set<string>, edges: Array}>} components
 * @param {Map<string, string[]>} adjacencyList
 * @returns {Array} hierarchies
 */
function buildHierarchies(components, adjacencyList) {
  const hierarchies = [];

  for (const component of components) {
    const { nodes, edges } = component;

    // Find children set — nodes that appear as a child in this component
    const childrenSet = new Set(edges.map((e) => e.child));

    // Root candidates: nodes NOT appearing as a child
    const roots = [...nodes].filter((n) => !childrenSet.has(n));

    // Explicit DFS cycle detection
    const hasCycle = detectCycle(nodes, adjacencyList);

    if (hasCycle || roots.length === 0) {
      // ── CYCLE GROUP ──
      // Pick lexicographically smallest node as root
      const sortedNodes = [...nodes].sort();
      hierarchies.push({
        root: sortedNodes[0],
        tree: {},
        has_cycle: true,
      });
    } else {
      // ── TREE GROUP ──
      const root = roots[0];
      const tree = buildNestedTree(root, adjacencyList);
      const depth = computeDepth(root, adjacencyList);
      hierarchies.push({
        root,
        tree,
        depth,
      });
    }
  }

  return hierarchies;
}

/**
 * DFS 3-color cycle detection on a directed graph.
 *
 * WHITE (0) = unvisited
 * GREY  (1) = in current recursion stack (being explored)
 * BLACK (2) = fully explored, no cycle through this node
 *
 * A back-edge to a GREY node means a cycle exists.
 */
function detectCycle(nodes, adjacencyList) {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const color = new Map();

  for (const node of nodes) {
    color.set(node, WHITE);
  }

  function dfs(node) {
    color.set(node, GREY);
    const neighbors = adjacencyList.get(node) || [];

    for (const neighbor of neighbors) {
      // Only consider nodes within this component
      if (!nodes.has(neighbor)) continue;

      if (color.get(neighbor) === GREY) {
        // Back-edge found — cycle!
        return true;
      }
      if (color.get(neighbor) === WHITE) {
        if (dfs(neighbor)) return true;
      }
    }

    color.set(node, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node) === WHITE) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

/**
 * Builds a nested tree object from the root.
 * Format: { "A": { "B": { "D": {} }, "C": {} } }
 *
 * Root key at top level; each value is an object whose keys are children.
 * Leaf nodes map to {}.
 */
function buildNestedTree(root, adjacencyList) {
  const result = {};
  result[root] = buildSubtree(root, adjacencyList);
  return result;
}

function buildSubtree(node, adjacencyList) {
  const children = adjacencyList.get(node) || [];
  const subtree = {};
  for (const child of children) {
    subtree[child] = buildSubtree(child, adjacencyList);
  }
  return subtree;
}

/**
 * Computes depth = number of nodes on the longest root-to-leaf path.
 * A single node has depth 1. A->B has depth 2. A->B->C has depth 3.
 */
function computeDepth(node, adjacencyList) {
  const children = adjacencyList.get(node) || [];
  if (children.length === 0) return 1;

  let maxChildDepth = 0;
  for (const child of children) {
    const d = computeDepth(child, adjacencyList);
    if (d > maxChildDepth) maxChildDepth = d;
  }
  return 1 + maxChildDepth;
}

module.exports = { buildHierarchies };
