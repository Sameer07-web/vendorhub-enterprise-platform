/**
 * Escapes special regex characters in a string for safe use in MongoDB $regex queries.
 * Prevents ReDoS and regex injection attacks from user-supplied search input.
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = escapeRegex;
