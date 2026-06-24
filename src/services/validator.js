const { EDGE_REGEX } = require('../utils/constants');

/**
 * Validates each entry in the raw data array.
 * - Rejects non-strings, empty strings, wrong format, self-loops.
 * - Trims whitespace before validation.
 *
 * @param {Array} data - Raw input array from request body.
 * @returns {{ validEdges: Array<{parent:string, child:string, normalized:string}>, invalidEntries: string[] }}
 */
function validate(data) {
  const validEdges = [];
  const invalidEntries = [];

  for (const entry of data) {
    // Must be a string
    if (typeof entry !== 'string') {
      invalidEntries.push(String(entry));
      continue;
    }

    // Trim leading/trailing whitespace
    const trimmed = entry.trim();

    // Empty after trim
    if (trimmed.length === 0) {
      invalidEntries.push(entry);
      continue;
    }

    // Must match exactly: single uppercase letter, "->", single uppercase letter
    if (!EDGE_REGEX.test(trimmed)) {
      invalidEntries.push(entry);
      continue;
    }

    const parent = trimmed[0];
    const child = trimmed[3];

    // Self-loop is explicitly invalid
    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    validEdges.push({
      parent,
      child,
      normalized: parent + '->' + child,
    });
  }

  return { validEdges, invalidEntries };
}

module.exports = { validate };
