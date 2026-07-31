const ApiError = require("../utils/ApiError");
const VendorRepository = require("../repositories/VendorRepository");
const RFQRepository = require("../repositories/RFQRepository");
const PurchaseRequestRepository = require("../repositories/PurchaseRequestRepository");
const QuotationRepository = require("../repositories/QuotationRepository");

class TenantReferenceValidator {
  /**
   * Validate that a Vendor belongs to the active tenant organization
   */
  static async validateVendor(sessionOrOrgId, vendorId) {
    if (!vendorId) return null;
    const vendor = await VendorRepository.findById(sessionOrOrgId, vendorId);
    if (!vendor || vendor.isDeleted) {
      throw new ApiError(404, "Referenced Vendor not found or does not belong to active organization");
    }
    return vendor;
  }

  /**
   * Validate that multiple Vendors belong to the active tenant organization
   */
  static async validateVendors(sessionOrOrgId, vendorIds = []) {
    if (!vendorIds || vendorIds.length === 0) return [];
    const vendors = await VendorRepository.findMany(sessionOrOrgId, {
      _id: { $in: vendorIds },
      isDeleted: { $ne: true }
    });
    if (vendors.length !== vendorIds.length) {
      throw new ApiError(400, "One or more referenced Vendors belong to another organization or do not exist");
    }
    return vendors;
  }

  /**
   * Validate that a Purchase Request belongs to the active tenant organization
   */
  static async validatePurchaseRequest(sessionOrOrgId, prId) {
    if (!prId) return null;
    const pr = await PurchaseRequestRepository.findById(sessionOrOrgId, prId);
    if (!pr || pr.isDeleted) {
      throw new ApiError(404, "Referenced Purchase Request not found or does not belong to active organization");
    }
    return pr;
  }

  /**
   * Validate that an RFQ belongs to the active tenant organization
   */
  static async validateRFQ(sessionOrOrgId, rfqId) {
    if (!rfqId) return null;
    const rfq = await RFQRepository.findById(sessionOrOrgId, rfqId);
    if (!rfq || rfq.isDeleted) {
      throw new ApiError(404, "Referenced RFQ not found or does not belong to active organization");
    }
    return rfq;
  }

  /**
   * Validate that a Quotation belongs to the active tenant organization
   */
  static async validateQuotation(sessionOrOrgId, quotationId) {
    if (!quotationId) return null;
    const quotation = await QuotationRepository.findById(sessionOrOrgId, quotationId);
    if (!quotation || quotation.isDeleted) {
      throw new ApiError(404, "Referenced Quotation not found or does not belong to active organization");
    }
    return quotation;
  }
}

module.exports = TenantReferenceValidator;
