import api from './axios';

export const dashboardApi = {
  getPreferences: async () => {
    const response = await api.get('/dashboard/preferences');
    return response.data.data;
  },

  updatePreferences: async (data) => {
    const response = await api.put('/dashboard/preferences', data);
    return response.data.data;
  }
};
