const { validate } = require('../services/validator');
const { deduplicate } = require('../services/deduplicator');
const { filterMultiParent } = require('../services/multiParentFilter');
const { buildGraph } = require('../services/graphBuilder');
const { buildHierarchies } = require('../services/hierarchyBuilder');
const { buildSummary } = require('../services/summaryBuilder');
const {
  USER_ID,
  EMAIL_ID,
  COLLEGE_ROLL_NUMBER,
  OPERATION_CODE,
} = require('../utils/constants');

/**
 * POST /bfhl — processes hierarchical relationships from edge strings.
 */
function handlePost(req, res, next) {
  try {
    const { data } = req.body;

    // Step 1: Validate entries
    const { validEdges, invalidEntries } = validate(data);

    // Step 2: Deduplicate
    const { uniqueEdges, duplicateEdges } = deduplicate(validEdges);

    // Step 3: Multi-parent filter (first-parent-wins)
    const filteredEdges = filterMultiParent(uniqueEdges);

    // Step 4–5: Build graph and discover connected components
    const { adjacencyList, components } = buildGraph(filteredEdges);

    // Step 6–7: Build hierarchy for each component (tree or cycle)
    const hierarchies = buildHierarchies(components, adjacencyList);

    // Step 8: Build summary
    const summary = buildSummary(hierarchies);

    // Step 9: Assemble and return response
    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /bfhl — returns operation code (health check).
 */
function handleGet(req, res) {
  return res.json({ operation_code: OPERATION_CODE });
}

module.exports = { handlePost, handleGet };
