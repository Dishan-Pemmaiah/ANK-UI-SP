import apiClient from './apiClient';

const aboutApi = {
  getAll: async () => {
    const response = await apiClient.get('/About');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/About/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/About', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/About/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/About/${id}`);
    return response.data;
  }
};

export default aboutApi;