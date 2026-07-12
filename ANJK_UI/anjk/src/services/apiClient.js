import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:41809/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('ank_token');
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

export default apiClient;
