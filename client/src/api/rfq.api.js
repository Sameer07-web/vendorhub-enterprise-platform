import { loadData, saveData, delay } from '../utils/storage';
import { mockRFQs } from '../data/mockRFQs';

const RFQ_KEY = 'vendorhub_rfqs';

const getStoredRFQs = () => loadData(RFQ_KEY, mockRFQs);

export const getRFQs = async (params = {}) => {
  await delay();
  let rfqs = getStoredRFQs();

  if (params.search) {
    const s = params.search.toLowerCase();
    rfqs = rfqs.filter(r => 
      r.title.toLowerCase().includes(s) || 
      r.rfqNumber.toLowerCase().includes(s)
    );
  }
  
  if (params.status) {
    rfqs = rfqs.filter(r => r.status === params.status);
  }
  
  if (params.sort) {
    const sort = params.sort;
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    
    rfqs.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }
  
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedRFQs = rfqs.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      rfqs: paginatedRFQs,
      total: rfqs.length,
      page,
      limit,
      totalPages: Math.ceil(rfqs.length / limit) || 1
    }
  };
};

export const getRFQById = async (id) => {
  await delay();
  const rfqs = getStoredRFQs();
  const rfq = rfqs.find(r => r._id === id);
  if (!rfq) throw new Error('RFQ not found');
  return { success: true, data: rfq };
};

export const createRFQ = async (data) => {
  await delay(800);
  const rfqs = getStoredRFQs();
  
  const newRFQ = {
    ...data,
    _id: `rfq-${Math.floor(1000 + Math.random() * 9000)}`,
    rfqNumber: `RFQ-${Math.floor(2000 + Math.random() * 9000)}`,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    invitedVendors: data.invitedVendors || [],
    timeline: [
      { id: 1, status: 'Draft', timestamp: new Date().toISOString(), message: 'RFQ drafted', actor: 'Current User' }
    ]
  };
  
  rfqs.unshift(newRFQ);
  saveData(RFQ_KEY, rfqs);
  return { success: true, data: newRFQ };
};

export const updateRFQ = async (id, data) => {
  await delay(800);
  const rfqs = getStoredRFQs();
  const index = rfqs.findIndex(r => r._id === id);
  if (index === -1) throw new Error('RFQ not found');
  
  rfqs[index] = { ...rfqs[index], ...data, updatedAt: new Date().toISOString() };
  saveData(RFQ_KEY, rfqs);
  return { success: true, data: rfqs[index] };
};

const _updateStatus = async (id, newStatus, message) => {
  await delay(800);
  const rfqs = getStoredRFQs();
  const index = rfqs.findIndex(r => r._id === id);
  if (index === -1) throw new Error('RFQ not found');
  
  rfqs[index].status = newStatus;
  rfqs[index].timeline.push({
    id: rfqs[index].timeline.length + 1,
    status: newStatus,
    timestamp: new Date().toISOString(),
    message,
    actor: 'Current User'
  });
  
  saveData(RFQ_KEY, rfqs);
  return { success: true, data: rfqs[index] };
};

export const sendRFQ = async (id) => {
  return _updateStatus(id, 'Published', 'RFQ published and vendors invited');
};

export const closeRFQ = async (id) => {
  return _updateStatus(id, 'Closed', 'RFQ closed to new quotes');
};

export const cancelRFQ = async (id) => {
  return _updateStatus(id, 'Cancelled', 'RFQ cancelled');
};

export const awardRFQ = async (id, vendorId, quoteId, justification) => {
  await delay(800);
  const rfqs = getStoredRFQs();
  const index = rfqs.findIndex(r => r._id === id);
  if (index === -1) throw new Error('RFQ not found');

  rfqs[index].status = 'Awarded';
  rfqs[index].awardedVendorId = vendorId;
  rfqs[index].awardedQuoteId = quoteId;
  rfqs[index].timeline.push({
    id: rfqs[index].timeline.length + 1,
    status: 'Awarded',
    timestamp: new Date().toISOString(),
    message: `RFQ awarded. Justification: ${justification}`,
    actor: 'Current User'
  });

  saveData(RFQ_KEY, rfqs);
  return { success: true, data: rfqs[index] };
};

export const deleteRFQ = async (id) => {
  await delay();
  const rfqs = getStoredRFQs();
  const index = rfqs.findIndex(r => r._id === id);
  if (index === -1) throw new Error('RFQ not found');
  
  rfqs.splice(index, 1);
  saveData(RFQ_KEY, rfqs);
  return { success: true, message: 'RFQ deleted' };
};
