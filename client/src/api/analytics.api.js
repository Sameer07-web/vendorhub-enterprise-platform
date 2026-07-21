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

export const getWorkflowSlaHealth = async (range = '30d') => {
  const response = await api.get('/analytics/workflows/health', { params: { range } });
  return response.data;
};

export const getWorkflowDepartmentScorecard = async (range = '30d') => {
  const response = await api.get('/analytics/workflows/departments', { params: { range } });
  return response.data;
};

export const getWorkflowFunnel = async (range = '30d') => {
  const response = await api.get('/analytics/workflows/funnel', { params: { range } });
  return response.data;
};

export const getAutomationMetrics = async (range = '30d') => {
  const response = await api.get('/analytics/automation/metrics', { params: { range } });
  return response.data;
};

export const getOverdueApprovals = async () => {
  const response = await api.get('/analytics/workflows/overdue');
  return response.data;
};
