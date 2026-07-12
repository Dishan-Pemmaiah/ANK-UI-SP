import apiClient from './apiClient';

const newsApi = {
  getAll: async () => {
    const response = await apiClient.get('/News');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/News/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/News', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/News/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/News/${id}`);
    return response.data;
  }
};

export default newsApi;
