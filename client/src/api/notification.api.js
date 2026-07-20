import api from './axios';

export const getNotifications = async (params) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const clearRead = async () => {
  const response = await api.delete('/notifications/clear-read');
  return response.data;
};

export const createBroadcast = async (broadcastData) => {
  const response = await api.post('/notifications/broadcast', broadcastData);
  return response.data;
};
