import apiClient from './apiClient';

const liveApi = {
  getCurrent: async () => {
    const response = await apiClient.get('/Live');
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get('/Live/history');
    return response.data;
  },
  getStatus: async () => {
    const response = await apiClient.get('/Live');
    return response.data;
  },
  broadcast: async (message) => {
    const response = await apiClient.post('/Live/broadcast', { message });
    return response.data;
  }
};

export default liveApi;
