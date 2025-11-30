import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type {
  Account,
  Allocation,
  AuthResponse,
  Category,
  CategoryBalance,
  CreateAccountPayload,
  CreateAllocationPayload,
  CreateCategoryPayload,
  CreateTransactionPayload,
  LoginPayload,
  MoveMoneyPayload,
  MoveMoneyResponse,
  RegisterPayload,
  Transaction,
  UpdateAccountPayload,
  UpdateCategoryPayload,
} from '../types/models';

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const updatedConfig = { ...config };
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        // Normalize headers so we can safely add the auth token.
        const headers = AxiosHeaders.from(updatedConfig.headers as any);
        headers.set('Authorization', `Bearer ${token}`);
        updatedConfig.headers = headers;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return updatedConfig;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post<{ access: string }>(
            `${API_BASE_URL}/auth/token/refresh/`,
            { refresh: refreshToken },
          );

          const { access } = response.data;
          await AsyncStorage.setItem('access_token', access);

          // Normalize headers so we can safely overwrite the auth token after refresh.
          const headers = AxiosHeaders.from(originalRequest.headers as any);
          headers.set('Authorization', `Bearer ${access}`);
          originalRequest.headers = headers;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AxiosResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    return response;
  },
  login: async (data: LoginPayload): Promise<AxiosResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
    }
    return response;
  },
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },
  getCurrentUser: (): Promise<AxiosResponse<AuthResponse['user']>> => api.get('/auth/me/'),
  refreshToken: async (): Promise<AxiosResponse<{ access: string }>> => {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    const response = await api.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    if (response.data.access) {
      await AsyncStorage.setItem('access_token', response.data.access);
    }
    return response;
  },
};

export const accountsAPI = {
  getAll: (): Promise<AxiosResponse<Account[]>> => api.get('/accounts/'),
  create: (data: CreateAccountPayload): Promise<AxiosResponse<Account>> =>
    api.post('/accounts/', data),
  update: (id: number, data: UpdateAccountPayload): Promise<AxiosResponse<Account>> =>
    api.put(`/accounts/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => api.delete(`/accounts/${id}/`),
};

export const categoriesAPI = {
  getAll: (): Promise<AxiosResponse<Category[]>> => api.get('/categories/'),
  getBalances: (): Promise<AxiosResponse<CategoryBalance[]>> =>
    api.get('/categories/balances/'),
  create: (data: CreateCategoryPayload): Promise<AxiosResponse<Category>> =>
    api.post('/categories/', data),
  update: (id: number, data: UpdateCategoryPayload): Promise<AxiosResponse<Category>> =>
    api.put(`/categories/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => api.delete(`/categories/${id}/`),
};

export const allocationsAPI = {
  getAll: (): Promise<AxiosResponse<Allocation[]>> => api.get('/allocations/'),
  create: (data: CreateAllocationPayload): Promise<AxiosResponse<Allocation>> =>
    api.post('/allocations/', data),
  move: (data: MoveMoneyPayload): Promise<AxiosResponse<MoveMoneyResponse>> =>
    api.post('/allocations/move/', data),
};

export const transactionsAPI = {
  getAll: (): Promise<AxiosResponse<Transaction[]>> => api.get('/transactions/'),
  create: (data: CreateTransactionPayload): Promise<AxiosResponse<Transaction>> =>
    api.post('/transactions/', data),
  delete: (id: number): Promise<AxiosResponse<void>> => api.delete(`/transactions/${id}/`),
};

export default api;
