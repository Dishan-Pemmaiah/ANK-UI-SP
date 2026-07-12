import axios from 'axios';
import { getApiBase } from '../config/apiBase';

const BASE_URL = getApiBase();

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
