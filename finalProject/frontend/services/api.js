import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this with your Django backend URL
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          await AsyncStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register/', data);
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    return response;
  },
  login: async (data) => {
    const response = await api.post('/auth/login/', data);
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    return response;
  },
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },
  getCurrentUser: () => api.get('/auth/me/'),
  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    if (response.data.access) {
      await AsyncStorage.setItem('access_token', response.data.access);
    }
    return response;
  },
};

// API service functions
export const accountsAPI = {
  getAll: () => api.get('/accounts/'),
  create: (data) => api.post('/accounts/', data),
  update: (id, data) => api.put(`/accounts/${id}/`, data),
  delete: (id) => api.delete(`/accounts/${id}/`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const allocationsAPI = {
  getAll: () => api.get('/allocations/'),
  create: (data) => api.post('/allocations/', data),
  move: (data) => api.post('/allocations/move/', data),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions/'),
  create: (data) => api.post('/transactions/', data),
  delete: (id) => api.delete(`/transactions/${id}/`),
};

export default api;
