import axiosInstance from './axios';

const BASE_URL = '/rfqs';

export const getRFQs = async (params) => {
  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data;
};

export const getRFQById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createRFQ = async (rfqData) => {
  const response = await axiosInstance.post(BASE_URL, rfqData);
  return response.data;
};

export const updateRFQ = async (id, rfqData) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${id}`, rfqData);
  return response.data;
};

export const sendRFQ = async (id) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${id}/send`);
  return response.data;
};

export const closeRFQ = async (id) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${id}/close`);
  return response.data;
};

export const cancelRFQ = async (id) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${id}/cancel`);
  return response.data;
};

export const deleteRFQ = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
