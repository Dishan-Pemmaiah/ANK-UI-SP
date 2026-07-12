import apiClient from './apiClient';

const memberApi = {
  getAll: async () => {
    const response = await apiClient.get('/Members/all');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Members/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Members', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Members/${id}`, payload);
    return response.data;
  },
  approveAdmin: async (id) => {
    const response = await apiClient.post(`/Members/${id}/approve-admin`);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/Members/${id}`);
    return response.data;
  }
};

export default memberApi;
