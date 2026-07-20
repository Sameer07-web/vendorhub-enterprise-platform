import axiosInstance from './axios';

export const getRFQs = async (params = {}) => {
  const response = await axiosInstance.get('/rfqs', { params });
  return response.data;
};

export const getRFQById = async (id) => {
  const response = await axiosInstance.get(`/rfqs/${id}`);
  return response.data;
};

export const createRFQ = async (data) => {
  const response = await axiosInstance.post('/rfqs', data);
  return response.data;
};

export const updateRFQ = async (id, data) => {
  const response = await axiosInstance.patch(`/rfqs/${id}`, data);
  return response.data;
};

export const sendRFQ = async (id) => {
  const response = await axiosInstance.patch(`/rfqs/${id}/send`);
  return response.data;
};

export const closeRFQ = async (id) => {
  const response = await axiosInstance.patch(`/rfqs/${id}/close`);
  return response.data;
};

export const cancelRFQ = async (id) => {
  const response = await axiosInstance.patch(`/rfqs/${id}/cancel`);
  return response.data;
};

export const awardRFQ = async (id, vendorId, quoteId, justification) => {
  const response = await axiosInstance.patch(`/quotations/${quoteId}/select`, { justification });
  return response.data;
};

export const deleteRFQ = async (id) => {
  const response = await axiosInstance.delete(`/rfqs/${id}`);
  return response.data;
};
