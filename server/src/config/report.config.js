const Vendor = require('../models/Vendor');
const PurchaseRequest = require('../models/PurchaseRequest');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const AuditLog = require('../models/AuditLog');

const REPORT_TYPES = {
  vendors: {
    model: Vendor,
    name: 'Vendor Report',
    filenamePrefix: 'Vendor_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = {};
      if (filters.status) match.status = filters.status;
      if (filters.category) match.category = filters.category;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (match) => {
      const total = await Vendor.countDocuments(match);
      const active = await Vendor.countDocuments({ ...match, status: 'approved' });
      return { Total: total, Active: active, Inactive: total - active };
    },
    getColumns: () => [
      { header: 'Vendor Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Compliance Score', key: 'complianceScore', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  purchaseRequests: {
    model: PurchaseRequest,
    name: 'Purchase Request Report',
    filenamePrefix: 'PR_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = {};
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
    getSummary: async (match) => {
      const stats = await PurchaseRequest.aggregate([
        { $match: match },
        { $group: { _id: null, totalCount: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
      ]);
      const total = stats[0] ? stats[0].totalCount : 0;
      const amount = stats[0] ? stats[0].totalAmount : 0;
      return { 'Total PRs': total, 'Total Amount': `$${amount.toFixed(2)}` };
    },
    getColumns: () => [
      { header: 'PR Number', key: 'prNumber', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      totalAmount: `$${(record.totalAmount || 0).toFixed(2)}`,
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  rfqs: {
    model: RFQ,
    name: 'RFQ Report',
    filenamePrefix: 'RFQ_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = {};
      if (filters.status) match.status = filters.status;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (match) => {
      const total = await RFQ.countDocuments(match);
      const open = await RFQ.countDocuments({ ...match, status: 'open' });
      return { 'Total RFQs': total, 'Open RFQs': open };
    },
    getColumns: () => [
      { header: 'RFQ Number', key: 'rfqNumber', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      dueDate: new Date(record.dueDate).toLocaleDateString(),
      createdAt: new Date(record.createdAt).toLocaleDateString()
    })
  },
  quotations: {
    model: Quotation,
    name: 'Quotation Report',
    filenamePrefix: 'Quotation_Report',
    defaultSort: { createdAt: -1 },
    getMatchQuery: (filters) => {
      const match = {};
      if (filters.status) match.status = filters.status;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }
      return match;
    },
    getSummary: async (match) => {
      const stats = await Quotation.aggregate([
        { $match: match },
        { $group: { _id: null, totalCount: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
      ]);
      const total = stats[0] ? stats[0].totalCount : 0;
      const amount = stats[0] ? stats[0].totalAmount : 0;
      return { 'Total Quotations': total, 'Total Value': `$${amount.toFixed(2)}` };
    },
    getColumns: () => [
      { header: 'Quotation Number', key: 'quotationNumber', width: 20 },
      { header: 'Vendor ID', key: 'vendor', width: 25 },
      { header: 'RFQ ID', key: 'rfq', width: 25 },
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
    model: AuditLog,
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
    getSummary: async (match) => {
      const total = await AuditLog.countDocuments(match);
      return { 'Total Events': total };
    },
    getColumns: () => [
      { header: 'Action', key: 'action', width: 20 },
      { header: 'Entity Type', key: 'entityType', width: 20 },
      { header: 'User ID', key: 'user', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ],
    formatRecord: (record) => ({
      ...record,
      createdAt: new Date(record.createdAt).toLocaleString()
    })
  }
};

module.exports = { REPORT_TYPES };
