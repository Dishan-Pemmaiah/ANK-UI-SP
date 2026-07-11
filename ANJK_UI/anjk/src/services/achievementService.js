import apiClient from './apiClient';

const achievementApi = {
  getAll: async () => {
    const response = await apiClient.get('/Achievements');
    return response.data;
  }
};

export default achievementApi;
