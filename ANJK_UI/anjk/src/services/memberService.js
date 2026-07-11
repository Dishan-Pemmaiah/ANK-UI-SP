import apiClient from './apiClient';

const memberApi = {
  getAll: async () => {
    const response = await apiClient.get('/Members/all');
    return response.data;
  },
  create: async (payload) => {
    const response = await apiClient.post('/Members', payload);
    return response.data;
  }
};

export default memberApi;
