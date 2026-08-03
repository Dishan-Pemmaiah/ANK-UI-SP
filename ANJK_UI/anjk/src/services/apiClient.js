import axios from 'axios';
import { getApiBase } from '../config/apiBase';

const BASE_URL = getApiBase();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again in a few seconds.'));
    }

    if (!error?.response) {
      return Promise.reject(new Error('Unable to reach server. Please check your internet connection and try again.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
