import axiosInstance from './axios';

export const getPurchaseRequests = async (params = {}) => {
  const response = await axiosInstance.get('/purchase-requests', { params });
  return response.data;
};

export const getPurchaseRequestById = async (id) => {
  const response = await axiosInstance.get(`/purchase-requests/${id}`);
  return response.data;
};

export const createPurchaseRequest = async (data) => {
  const response = await axiosInstance.post('/purchase-requests', data);
  return response.data;
};

export const updatePurchaseRequest = async (id, data) => {
  const response = await axiosInstance.patch(`/purchase-requests/${id}`, data);
  return response.data;
};

export const submitPurchaseRequest = async (id) => {
  const response = await axiosInstance.patch(`/purchase-requests/${id}/submit`);
  return response.data;
};

export const approvePurchaseRequest = async (id, managerComments = '') => {
  const response = await axiosInstance.patch(`/purchase-requests/${id}/approve`, { managerComments });
  return response.data;
};

export const rejectPurchaseRequest = async (id, managerComments = '') => {
  const response = await axiosInstance.patch(`/purchase-requests/${id}/reject`, { managerComments });
  return response.data;
};

export const deletePurchaseRequest = async (id) => {
  const response = await axiosInstance.delete(`/purchase-requests/${id}`);
  return response.data;
};
