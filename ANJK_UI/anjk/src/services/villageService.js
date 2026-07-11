import apiClient from './apiClient';

const villageApi = {
  getAll: async () => {
    const response = await apiClient.get('/Villages');
    return response.data;
  }
};

export default villageApi;
