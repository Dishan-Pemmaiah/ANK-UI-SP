import apiClient from './apiClient';

const heritageApi = {
  getAll: async () => {
    const response = await apiClient.get('/Heritage');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Heritage/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Heritage', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Heritage/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Heritage/${id}`);
    return response.data;
  }
};

export default heritageApi;
