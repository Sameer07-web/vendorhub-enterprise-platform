import api from './axios';

export const updateProfile = async (data) => {
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch('/auth/change-password', data);
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/users/audit-logs', { params });
  return response.data;
};
