export const mockPurchaseRequests = [
  {
    _id: 'pr-1001',
    requestNumber: 'PR-1042',
    title: 'MacBook Pro M3 Max for Engineering',
    department: 'Engineering',
    requester: 'Sarah Chen',
    vendorId: 'v-1001', // Acme Corp
    vendorName: 'Acme Corp',
    category: 'IT Equipment',
    estimatedCost: 4200.00,
    currency: 'USD',
    priority: 'High',
    requiredDate: '2024-11-15T00:00:00Z',
    description: 'Replacement laptop for Senior Engineer joining next month.',
    status: 'Pending Approval',
    createdAt: '2024-10-24T08:30:00Z',
    timeline: [
      { id: 1, status: 'Draft', timestamp: '2024-10-23T14:00:00Z', message: 'Request drafted' },
      { id: 2, status: 'Submitted', timestamp: '2024-10-24T08:30:00Z', message: 'Submitted for approval' }
    ]
  },
  {
    _id: 'pr-1002',
    requestNumber: 'PR-1043',
    title: 'Q3 Cloud Infrastructure Renewal',
    department: 'DevOps',
    requester: 'Mike Ross',
    vendorId: 'v-1001',
    vendorName: 'Acme Corp', // Using Acme as a placeholder for AWS for demo
    category: 'Software',
    estimatedCost: 12500.00,
    currency: 'USD',
    priority: 'Critical',
    requiredDate: '2024-10-31T00:00:00Z',
    description: 'Annual renewal for core cloud services.',
    status: 'Approved',
    createdAt: '2024-10-20T10:15:00Z',
    timeline: [
      { id: 1, status: 'Draft', timestamp: '2024-10-19T09:00:00Z', message: 'Request drafted' },
      { id: 2, status: 'Submitted', timestamp: '2024-10-20T10:15:00Z', message: 'Submitted for approval' },
      { id: 3, status: 'Approved', timestamp: '2024-10-21T11:00:00Z', message: 'Approved by VP Engineering' }
    ]
  },
  {
    _id: 'pr-1003',
    requestNumber: 'PR-1044',
    title: 'Office Supplies Q4',
    department: 'Operations',
    requester: 'Alice Johnson',
    vendorId: 'v-1004',
    vendorName: 'Secure Logistics',
    category: 'Office Supplies',
    estimatedCost: 450.00,
    currency: 'USD',
    priority: 'Low',
    requiredDate: '2024-11-01T00:00:00Z',
    description: 'General office supplies for Q4.',
    status: 'Draft',
    createdAt: '2024-10-25T13:45:00Z',
    timeline: [
      { id: 1, status: 'Draft', timestamp: '2024-10-25T13:45:00Z', message: 'Request drafted' }
    ]
  }
];
