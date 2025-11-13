import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
};

export const habitsAPI = {
  getAll: () => api.get('/habits/'),
  getOne: (id) => api.get(`/habits/${id}/`),
  create: (habitData) => api.post('/habits/', habitData),
  update: (id, habitData) => api.patch(`/habits/${id}/`, habitData),
  delete: (id) => api.delete(`/habits/${id}/`),
  toggleToday: (id) => api.post(`/habits/${id}/toggle_today/`),
  getLogs: (id, params) => api.get(`/habits/${id}/logs/`, { params }),
};

export const logsAPI = {
  getAll: (params) => api.get('/logs/', { params }),
  create: (logData) => api.post('/logs/', logData),
  update: (id, logData) => api.patch(`/logs/${id}/`, logData),
  delete: (id) => api.delete(`/logs/${id}/`),
};

export default api;
