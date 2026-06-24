const UnionFind = require('../utils/unionFind');

/**
 * Builds the adjacency list and discovers connected components using Union-Find.
 *
 * @param {Array<{parent:string, child:string}>} filteredEdges
 * @returns {{ adjacencyList: Map<string, string[]>, components: Array<{nodes: Set<string>, edges: Array}> }}
 */
function buildGraph(filteredEdges) {
  const adjacencyList = new Map();
  const uf = new UnionFind();

  for (const edge of filteredEdges) {
    uf.add(edge.parent);
    uf.add(edge.child);
    uf.union(edge.parent, edge.child);

    if (!adjacencyList.has(edge.parent)) {
      adjacencyList.set(edge.parent, []);
    }
    adjacencyList.get(edge.parent).push(edge.child);
  }

  // Group nodes into connected components
  const groupMap = uf.getGroups();
  const components = [];

  for (const [, nodes] of groupMap) {
    const componentEdges = filteredEdges.filter(
      (e) => nodes.has(e.parent) && nodes.has(e.child)
    );
    components.push({ nodes, edges: componentEdges });
  }

  return { adjacencyList, components };
}

module.exports = { buildGraph };
