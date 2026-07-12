import apiClient from './apiClient';

const achievementApi = {
  getAll: async () => {
    const response = await apiClient.get('/Achievements');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Achievements/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Achievements', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Achievements/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Achievements/${id}`);
    return response.data;
  }
};

export default achievementApi;
