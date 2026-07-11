import apiClient from './apiClient';

const newsApi = {
  getAll: async () => {
    const response = await apiClient.get('/News');
    return response.data;
  }
};

export default newsApi;
