const Vendor = require("../models/Vendor");
const PurchaseRequest = require("../models/PurchaseRequest");
const RFQ = require("../models/RFQ");
const escapeRegex = require("../utils/escapeRegex");

/**
 * Global search across Vendors, Purchase Requests, and RFQs
 * Returns top 5 matches from each collection
 */
const globalSearch = async (query) => {
  if (!query || query.trim().length === 0) {
    return { vendors: [], purchaseRequests: [], rfqs: [] };
  }

  const escaped = escapeRegex(query.trim());
  const regex = { $regex: escaped, $options: "i" };

  const [vendors, purchaseRequests, rfqs] = await Promise.all([
    Vendor.find({
      isDeleted: false,
      $or: [
        { companyName: regex },
        { vendorCode: regex },
        { vendorCategory: regex },
      ],
    })
      .select("companyName vendorCode vendorCategory status")
      .limit(5)
      .lean(),

    PurchaseRequest.find({
      isDeleted: false,
      $or: [
        { title: regex },
        { prId: regex },
        { department: regex },
      ],
    })
      .select("title prId department status priority")
      .limit(5)
      .lean(),

    RFQ.find({
      isDeleted: false,
      $or: [
        { title: regex },
        { rfqId: regex },
      ],
    })
      .select("title rfqId status")
      .limit(5)
      .lean(),
  ]);

  return { vendors, purchaseRequests, rfqs };
};

module.exports = { globalSearch };
