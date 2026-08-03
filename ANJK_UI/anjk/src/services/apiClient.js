import axios from 'axios';
import { getApiBase } from '../config/apiBase';

const BASE_URL = getApiBase();
const REQUEST_TIMEOUT_MS = 45000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
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
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    if (error?.code === 'ECONNABORTED') {
      if (!originalRequest.__timeoutRetried) {
        originalRequest.__timeoutRetried = true;
        originalRequest.timeout = 60000;
        return apiClient.request(originalRequest);
      }

      return Promise.reject(new Error('Request timed out. Please try again in a few seconds.'));
    }

    if ([502, 503, 504].includes(status) && !originalRequest.__gatewayRetried) {
      originalRequest.__gatewayRetried = true;
      return apiClient.request(originalRequest);
    }

    if (!error?.response) {
      return Promise.reject(new Error('Unable to reach server. Please check your internet connection and try again.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
