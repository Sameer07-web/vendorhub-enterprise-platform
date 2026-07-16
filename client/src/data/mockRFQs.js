export const mockRFQs = [
  {
    _id: 'rfq-1001',
    rfqNumber: 'RFQ-2042',
    title: 'Q4 Developer Laptops Refresh',
    department: 'Engineering',
    status: 'Published',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    description: 'Procurement of 15 high-performance laptops for the incoming engineering cohort.',
    lineItems: [
      { id: 'li-1', name: 'MacBook Pro 16" M3 Max', description: '36GB RAM, 1TB SSD', quantity: 10 },
      { id: 'li-2', name: 'Dell XPS 15', description: '32GB RAM, 1TB SSD', quantity: 5 }
    ],
    invitedVendors: ['v-1001', 'v-1002'],
    awardedVendorId: null,
    awardedQuoteId: null,
    createdBy: 'Sarah Chen',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { id: 1, status: 'Draft', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), message: 'RFQ drafted', actor: 'Sarah Chen' },
      { id: 2, status: 'Published', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), message: 'RFQ published and vendors invited', actor: 'Sarah Chen' }
    ]
  },
  {
    _id: 'rfq-1002',
    rfqNumber: 'RFQ-2043',
    title: 'Cloud Infrastructure Audit Services',
    department: 'DevOps',
    status: 'Draft',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Looking for an external agency to perform a comprehensive security audit of our AWS infrastructure.',
    lineItems: [
      { id: 'li-1', name: 'Security Audit', description: 'Comprehensive AWS security audit', quantity: 1 },
      { id: 'li-2', name: 'Compliance Report', description: 'SOC2 readiness report', quantity: 1 }
    ],
    invitedVendors: [],
    awardedVendorId: null,
    awardedQuoteId: null,
    createdBy: 'Mike Ross',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { id: 1, status: 'Draft', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), message: 'RFQ drafted', actor: 'Mike Ross' }
    ]
  }
];
