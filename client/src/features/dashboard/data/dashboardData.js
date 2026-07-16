export const kpiData = {
  vendors: {
    total: 124,
    trend: 'up',
    percentage: '12',
    label: '4 new this month'
  },
  purchaseRequests: {
    total: 8,
    trend: 'up',
    percentage: '5',
    label: '3 pending approval'
  },
  activeRfqs: {
    total: 14,
    trend: 'up',
    percentage: '4',
    label: '2 closing this week'
  },
  totalSpend: {
    total: '$1.4M',
    trend: 'up',
    percentage: '8',
    label: 'vs last month'
  }
};

export const spendAnalyticsData = [
  { name: 'Jan', spend: 850000 },
  { name: 'Feb', spend: 920000 },
  { name: 'Mar', spend: 880000 },
  { name: 'Apr', spend: 1050000 },
  { name: 'May', spend: 1100000 },
  { name: 'Jun', spend: 1250000 },
  { name: 'Jul', spend: 1400000 }
];

export const vendorDistributionData = [
  { name: 'Software', value: 45, color: '#3B82F6' }, // primary-500
  { name: 'Hardware', value: 25, color: '#8B5CF6' }, // violet-500
  { name: 'Services', value: 20, color: '#10B981' }, // success-500
  { name: 'Marketing', value: 10, color: '#F59E0B' } // warning-500
];

export const recentPurchaseRequests = [
  { id: 'PR-1042', title: 'MacBook Pro M3 Max for Engineering', department: 'Engineering', vendor: 'Apple Inc.', amount: '$4,200.00', status: 'Pending', date: 'Oct 24, 2024' },
  { id: 'PR-1043', title: 'Q3 Cloud Infrastructure Renewal', department: 'DevOps', vendor: 'AWS', amount: '$12,500.00', status: 'Approved', date: 'Oct 24, 2024' },
  { id: 'PR-1044', title: 'Annual Figma Enterprise License', department: 'Design', vendor: 'Figma', amount: '$3,600.00', status: 'Approved', date: 'Oct 23, 2024' },
  { id: 'PR-1045', title: 'Office Supplies Q4', department: 'Operations', vendor: 'Staples', amount: '$450.00', status: 'Draft', date: 'Oct 22, 2024' },
  { id: 'PR-1046', title: 'Salesforce CRM Expansion', department: 'Sales', vendor: 'Salesforce', amount: '$8,000.00', status: 'Rejected', date: 'Oct 20, 2024' }
];

export const pendingApprovals = [
  { id: 'PR-1042', title: 'MacBook Pro M3 Max', requester: 'Sarah Chen', department: 'Engineering', amount: '$4,200.00', urgency: 'High', date: '2 hours ago' },
  { id: 'PR-1047', title: 'Adobe Creative Cloud', requester: 'Mike Ross', department: 'Marketing', amount: '$1,200.00', urgency: 'Normal', date: '5 hours ago' },
  { id: 'PR-1048', title: 'Data Center Upgrade', requester: 'DevOps Team', department: 'IT', amount: '$24,500.00', urgency: 'Critical', date: '1 day ago' }
];

export const activityTimelineData = [
  { id: 1, type: 'award', title: 'RFQ-2024-08 Awarded', description: 'Awarded to Acme Corp', time: '2 hours ago' },
  { id: 2, type: 'request', title: 'New PR Submitted', description: 'Marketing Q4 Budget', time: '5 hours ago' },
  { id: 3, type: 'warning', title: 'Vendor Compliance Expiring', description: 'Global Tech Inc (SOC2)', time: '1 day ago' },
  { id: 4, type: 'success', title: 'Invoice Paid', description: 'INV-0992 for Cloud Services', time: '2 days ago' }
];
