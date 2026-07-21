import api from './axios';

export const getAIDraft = async (id) => {
  const response = await api.get(`/ai/draft/${id}`);
  return response.data;
};
