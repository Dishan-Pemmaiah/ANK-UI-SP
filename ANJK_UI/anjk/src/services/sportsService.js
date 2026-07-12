import apiClient from './apiClient';

const sportsApi = {
  getCategories: async () => {
    const response = await apiClient.get('/Sports/categories');
    return response.data;
  },
  getCategoryById: async (id) => {
    const response = await apiClient.get(`/Sports/categories/${id}`);
    return response.data;
  },
  createCategory: async (payload) => {
    const response = await apiClient.post('/Sports/categories', payload);
    return response.data;
  },
  updateCategory: async (id, payload) => {
    const response = await apiClient.put(`/Sports/categories/${id}`, payload);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/Sports/categories/${id}`);
    return response.data;
  },
  getTournaments: async () => {
    const response = await apiClient.get('/Sports/tournaments');
    return response.data;
  },
  getTournamentById: async (id) => {
    const response = await apiClient.get(`/Sports/tournaments/${id}`);
    return response.data;
  },
  createTournament: async (payload) => {
    const response = await apiClient.post('/Sports/tournaments', payload);
    return response.data;
  },
  updateTournament: async (id, payload) => {
    const response = await apiClient.put(`/Sports/tournaments/${id}`, payload);
    return response.data;
  },
  deleteTournament: async (id) => {
    const response = await apiClient.delete(`/Sports/tournaments/${id}`);
    return response.data;
  }
};

export default sportsApi;