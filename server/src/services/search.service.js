const SearchRepository = require("../repositories/SearchRepository");

/**
 * Global search across Vendors, Purchase Requests, and RFQs
 * Scoped to organization context
 */
const globalSearch = async (sessionOrOrgId, query) => {
  return await SearchRepository.search(sessionOrOrgId, query);
};

module.exports = { globalSearch };
