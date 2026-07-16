import { loadData, saveData, delay } from '../utils/storage';
import { mockVendors } from '../data/mockVendors';

const VENDORS_KEY = 'vendorhub_vendors';

const getStoredVendors = () => loadData(VENDORS_KEY, mockVendors);

export const getVendors = async (params = {}) => {
  await delay(); // Simulate network latency
  
  let vendors = getStoredVendors();
  
  // Apply Search
  if (params.search) {
    const s = params.search.toLowerCase();
    vendors = vendors.filter(v => 
      v.companyName.toLowerCase().includes(s) || 
      v.vendorCode.toLowerCase().includes(s) ||
      v.email.toLowerCase().includes(s)
    );
  }
  
  // Apply Status filter
  if (params.status) {
    vendors = vendors.filter(v => v.status === params.status);
  }
  
  // Apply Category filter
  if (params.category) {
    vendors = vendors.filter(v => v.vendorCategory === params.category);
  }
  
  // Apply Sort
  if (params.sort) {
    const sort = params.sort;
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    
    vendors.sort((a, b) => {
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
  
  const paginatedVendors = vendors.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      vendors: paginatedVendors,
      total: vendors.length,
      page,
      limit,
      totalPages: Math.ceil(vendors.length / limit) || 1
    }
  };
};

export const getVendorById = async (id) => {
  await delay();
  const vendors = getStoredVendors();
  const vendor = vendors.find(v => v._id === id);
  
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  
  return { success: true, data: vendor };
};

export const createVendor = async (data) => {
  await delay(800); // slightly longer for saves
  const vendors = getStoredVendors();
  
  const newVendor = {
    ...data,
    _id: `v-${Math.floor(1000 + Math.random() * 9000)}`,
    vendorCode: data.vendorCode || `VND-${Math.floor(1000 + Math.random() * 9000)}`,
    rating: 0,
    createdAt: new Date().toISOString()
  };
  
  vendors.unshift(newVendor); // Add to beginning
  saveData(VENDORS_KEY, vendors);
  
  return { success: true, data: newVendor };
};

export const updateVendor = async (id, data) => {
  await delay(800);
  const vendors = getStoredVendors();
  const index = vendors.findIndex(v => v._id === id);
  
  if (index === -1) {
    throw new Error('Vendor not found');
  }
  
  vendors[index] = { ...vendors[index], ...data, updatedAt: new Date().toISOString() };
  saveData(VENDORS_KEY, vendors);
  
  return { success: true, data: vendors[index] };
};

export const deleteVendor = async (id) => {
  await delay();
  const vendors = getStoredVendors();
  const index = vendors.findIndex(v => v._id === id);
  
  if (index === -1) {
    throw new Error('Vendor not found');
  }
  
  vendors.splice(index, 1);
  saveData(VENDORS_KEY, vendors);
  
  return { success: true, message: 'Vendor deleted successfully' };
};
