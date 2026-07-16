import { loadData, saveData, delay } from '../utils/storage';
import { mockPurchaseRequests } from '../data/mockPurchaseRequests';

const PR_KEY = 'vendorhub_purchase_requests';

const getStoredPRs = () => loadData(PR_KEY, mockPurchaseRequests);

export const getPurchaseRequests = async (params = {}) => {
  await delay(); // Simulate network latency
  
  let prs = getStoredPRs();
  
  // Apply Search
  if (params.search) {
    const s = params.search.toLowerCase();
    prs = prs.filter(pr => 
      pr.title.toLowerCase().includes(s) || 
      pr.requestNumber.toLowerCase().includes(s) ||
      pr.vendorName?.toLowerCase().includes(s)
    );
  }
  
  // Apply Status filter
  if (params.status) {
    prs = prs.filter(pr => pr.status === params.status);
  }
  
  // Apply Sort
  if (params.sort) {
    const sort = params.sort;
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    
    prs.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }
  
  // Pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedPRs = prs.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      requests: paginatedPRs,
      total: prs.length,
      page,
      limit,
      totalPages: Math.ceil(prs.length / limit) || 1
    }
  };
};

export const getPurchaseRequestById = async (id) => {
  await delay();
  const prs = getStoredPRs();
  const pr = prs.find(p => p._id === id);
  
  if (!pr) {
    throw new Error('Purchase Request not found');
  }
  
  return { success: true, data: pr };
};

export const createPurchaseRequest = async (data) => {
  await delay(800);
  const prs = getStoredPRs();
  
  const newPR = {
    ...data,
    _id: `pr-${Math.floor(1000 + Math.random() * 9000)}`,
    requestNumber: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    timeline: [
      { id: 1, status: 'Draft', timestamp: new Date().toISOString(), message: 'Request drafted' }
    ]
  };
  
  prs.unshift(newPR);
  saveData(PR_KEY, prs);
  
  return { success: true, data: newPR };
};

export const updatePurchaseRequest = async (id, data) => {
  await delay(800);
  const prs = getStoredPRs();
  const index = prs.findIndex(p => p._id === id);
  
  if (index === -1) {
    throw new Error('Purchase Request not found');
  }
  
  prs[index] = { ...prs[index], ...data, updatedAt: new Date().toISOString() };
  saveData(PR_KEY, prs);
  
  return { success: true, data: prs[index] };
};

const _updateStatus = async (id, newStatus, message) => {
  await delay(800);
  const prs = getStoredPRs();
  const index = prs.findIndex(p => p._id === id);
  
  if (index === -1) throw new Error('Purchase Request not found');
  
  prs[index].status = newStatus;
  prs[index].timeline.push({
    id: prs[index].timeline.length + 1,
    status: newStatus,
    timestamp: new Date().toISOString(),
    message
  });
  
  saveData(PR_KEY, prs);
  return { success: true, data: prs[index] };
};

export const submitPurchaseRequest = async (id) => {
  return _updateStatus(id, 'Submitted', 'Submitted for approval');
};

export const approvePurchaseRequest = async (id, managerComments = '') => {
  return _updateStatus(id, 'Approved', managerComments || 'Approved by Manager');
};

export const rejectPurchaseRequest = async (id, managerComments = '') => {
  return _updateStatus(id, 'Rejected', managerComments || 'Rejected by Manager');
};

export const deletePurchaseRequest = async (id) => {
  await delay();
  const prs = getStoredPRs();
  const index = prs.findIndex(p => p._id === id);
  
  if (index === -1) {
    throw new Error('Purchase Request not found');
  }
  
  prs.splice(index, 1);
  saveData(PR_KEY, prs);
  
  return { success: true, message: 'Purchase Request deleted successfully' };
};
