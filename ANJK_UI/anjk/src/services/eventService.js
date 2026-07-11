import apiClient from './apiClient';

const eventApi = {
  getAll: async () => {
    const response = await apiClient.get('/Events');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/Events/${id}`);
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Events', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await apiClient.put(`/Events/${id}`, payload);
    return response.data;
  },
  register: async (id, amountPaid) => {
    const response = await apiClient.post(`/Events/${id}/register`, amountPaid);
    return response.data;
  }
};

export default eventApi;
