import apiClient from './apiClient';

const heritageApi = {
  getAll: async () => {
    const response = await apiClient.get('/Heritage');
    return response.data;
  }
};

export default heritageApi;
