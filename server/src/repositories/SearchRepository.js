const VendorRepository = require("./VendorRepository");
const PurchaseRequestRepository = require("./PurchaseRequestRepository");
const RFQRepository = require("./RFQRepository");
const escapeRegex = require("../utils/escapeRegex");

class SearchRepository {
  async search(sessionOrOrgId, query) {
    if (!query || query.trim().length === 0) {
      return { vendors: [], purchaseRequests: [], rfqs: [] };
    }

    const orgId = sessionOrOrgId.organization ? sessionOrOrgId.organization : sessionOrOrgId._id ? sessionOrOrgId._id : sessionOrOrgId;
    const escaped = escapeRegex(query.trim());
    const regex = { $regex: escaped, $options: "i" };

    const [vendors, purchaseRequests, rfqs] = await Promise.all([
      VendorRepository.findMany(orgId, {
        isDeleted: false,
        $or: [
          { companyName: regex },
          { vendorCode: regex },
          { category: regex }
        ]
      }, "companyName vendorCode category status", { limit: 5 }),

      PurchaseRequestRepository.findMany(orgId, {
        isDeleted: false,
        $or: [
          { title: regex },
          { requestNumber: regex },
          { department: regex }
        ]
      }, "title requestNumber department status priority", { limit: 5 }),

      RFQRepository.findMany(orgId, {
        isDeleted: false,
        $or: [
          { title: regex },
          { rfqNumber: regex }
        ]
      }, "title rfqNumber status", { limit: 5 })
    ]);

    return { vendors, purchaseRequests, rfqs };
  }
}

module.exports = new SearchRepository();
