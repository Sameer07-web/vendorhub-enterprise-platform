const VendorRepository = require('../repositories/VendorRepository');
const PurchaseRequestRepository = require('../repositories/PurchaseRequestRepository');
const RFQRepository = require('../repositories/RFQRepository');
const QuotationRepository = require('../repositories/QuotationRepository');
const AuditLogRepository = require('../repositories/AuditLogRepository');
const TenantAggregationBuilder = require('../utils/TenantAggregationBuilder');

const REPORT_TYPES = {
  vendors: {
    repository: VendorRepository,
    name: 'Vendor Report',
    filenamePrefix: 'Vendor_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = { isDeleted: false };
      if (filters.status) match.status = filters.status;
      if (filters.category) match.category = filters.category;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (orgId, match) => {
      const total = await VendorRepository.count(orgId, match);
      const active = await VendorRepository.count(orgId, { ...match, status: 'Active' });
      return { 'Total Vendors': total, 'Active Vendors': active, 'Inactive Vendors': total - active };
    },
    getColumns: () => [
      { header: 'Vendor Name', key: 'companyName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  purchaseRequests: {
    repository: PurchaseRequestRepository,
    name: 'Purchase Request Report',
    filenamePrefix: 'PR_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = { isDeleted: false };
      if (filters.status) match.status = filters.status;
      if (filters.department) match.department = filters.department;
      if (filters.priority) match.priority = filters.priority;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (orgId, match) => {
      const pipeline = TenantAggregationBuilder.build(orgId, [
        { $match: match },
        { $group: { _id: null, totalCount: { $sum: 1 }, totalAmount: { $sum: '$estimatedCost' } } }
      ]);
      const stats = await PurchaseRequestRepository.aggregate(orgId, pipeline);
      const total = stats[0] ? stats[0].totalCount : 0;
      const amount = stats[0] ? stats[0].totalAmount : 0;
      return { 'Total PRs': total, 'Total Amount': `$${amount.toFixed(2)}` };
    },
    getColumns: () => [
      { header: 'PR Number', key: 'requestNumber', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Amount', key: 'estimatedCost', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      estimatedCost: `$${(record.estimatedCost || 0).toFixed(2)}`,
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  rfqs: {
    repository: RFQRepository,
    name: 'RFQ Report',
    filenamePrefix: 'RFQ_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = { isDeleted: false };
      if (filters.status) match.status = filters.status;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (orgId, match) => {
      const total = await RFQRepository.count(orgId, match);
      const open = await RFQRepository.count(orgId, { ...match, status: { $in: ['SENT', 'PARTIALLY_RESPONDED'] } });
      return { 'Total RFQs': total, 'Open RFQs': open };
    },
    getColumns: () => [
      { header: 'RFQ Number', key: 'rfqNumber', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'quotationDeadline', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      quotationDeadline: new Date(record.quotationDeadline).toLocaleDateString(),
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  quotations: {
    repository: QuotationRepository,
    name: 'Quotation Report',
    filenamePrefix: 'Quotation_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = { isDeleted: false };
      if (filters.status) match.status = filters.status;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (orgId, match) => {
      const pipeline = TenantAggregationBuilder.build(orgId, [
        { $match: match },
        { $group: { _id: null, totalCount: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
      ]);
      const stats = await QuotationRepository.aggregate(orgId, pipeline);
      const total = stats[0] ? stats[0].totalCount : 0;
      const amount = stats[0] ? stats[0].totalAmount : 0;
      return { 'Total Quotations': total, 'Total Value': `$${amount.toFixed(2)}` };
    },
    getColumns: () => [
      { header: 'Quotation Number', key: 'quotationNumber', width: 20 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      totalAmount: `$${(record.totalAmount || 0).toFixed(2)}`,
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  auditLogs: {
    repository: AuditLogRepository,
    name: 'Audit Log Report',
    filenamePrefix: 'Audit_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = {};
      if (filters.action) match.action = filters.action;
      if (filters.entityType) match.entityType = filters.entityType;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (orgId, match) => {
      const total = await AuditLogRepository.count(orgId, match);
      return { 'Total Events': total };
    },
    getColumns: () => [
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Entity Type', key: 'entityType', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      createdAt: new Date(record.createdAt).toLocaleString()
    })
  }
};

module.exports = { REPORT_TYPES };
