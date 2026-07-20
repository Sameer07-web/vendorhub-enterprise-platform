import api from './axios';

export const savedReportApi = {
  getAll: async () => {
    const response = await api.get('/saved-reports');
    return response.data.data;
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/saved-reports/recent');
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/saved-reports', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/saved-reports/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/saved-reports/${id}`);
    return response.data.data;
  },

  markAsRun: async (id) => {
    const response = await api.patch(`/saved-reports/${id}/run`);
    return response.data.data;
  }
};
