import apiClient from './apiClient';

const authApi = {
  register: async (payload) => {
    const response = await apiClient.post('/Auth/register', payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await apiClient.post('/Auth/login', payload);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/Members/profile');
    return response.data;
  },
  updateProfile: async (payload) => {
    const response = await apiClient.put('/Members/profile', payload);
    return response.data;
  }
};

export default authApi;
