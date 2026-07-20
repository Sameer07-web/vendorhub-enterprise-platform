import api from './axios';

export const getAnalyticsOverview = async (range = '30d') => {
  const response = await api.get('/analytics/overview', { params: { range } });
  return response.data;
};

export const getDashboardKPIs = async (range = '30d') => {
  const response = await api.get('/analytics/dashboard', { params: { range } });
  return response.data;
};

export const getSpendAnalytics = async (range = '12m') => {
  const response = await api.get('/analytics/spend', { params: { range } });
  return response.data;
};

export const getVendorAnalytics = async (range = 'all') => {
  const response = await api.get('/analytics/vendors', { params: { range } });
  return response.data;
};

export const getDepartmentAnalytics = async (range = 'all') => {
  const response = await api.get('/analytics/departments', { params: { range } });
  return response.data;
};

export const getProcurementAnalytics = async (range = '30d') => {
  const response = await api.get('/analytics/procurement', { params: { range } });
  return response.data;
};
