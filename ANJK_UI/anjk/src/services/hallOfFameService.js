import apiClient from './apiClient';

const hallOfFameApi = {
  getAll: async () => {
    const response = await apiClient.get('/HallOfFame');
    return response.data;
  }
};

export default hallOfFameApi;
