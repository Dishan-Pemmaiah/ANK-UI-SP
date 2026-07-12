import apiClient from './apiClient';

const committeeApi = {
  getAll: async () => {
    const response = await apiClient.get('/Committee');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Committee/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Committee', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Committee/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Committee/${id}`);
    return response.data;
  }
};

export default committeeApi;
