import apiClient from './apiClient';

const committeeApi = {
  getAll: async () => {
    const response = await apiClient.get('/Committee');
    return response.data;
  }
};

export default committeeApi;
