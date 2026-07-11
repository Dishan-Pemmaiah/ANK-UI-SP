import apiClient from './apiClient';

const galleryApi = {
  getAll: async () => {
    const response = await apiClient.get('/Gallery');
    return response.data;
  }
};

export default galleryApi;
