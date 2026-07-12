import apiClient from './apiClient';

const galleryApi = {
  getAll: async () => {
    const response = await apiClient.get('/Gallery');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Gallery/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Gallery', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Gallery/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Gallery/${id}`);
    return response.data;
  }
};

export default galleryApi;
