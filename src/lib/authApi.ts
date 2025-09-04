import axios, { AxiosResponse } from 'axios';
import { tokenStorage } from '@/utils/auth';
import { User, AuthTokens, LoginCredentials } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance for authenticated requests
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
authApiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
authApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newTokens = response.data;
        tokenStorage.setTokens(newTokens);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return authApiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clearTokens();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await authApiClient.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await authApiClient.post('/auth/logout/');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await authApiClient.get('/auth/me/');
    return response.data;
  },

  getCsrfToken: async (): Promise<string> => {
    const response = await authApiClient.get('/auth/csrf/');
    return response.data.csrfToken;
  },

  // Admin stats
  getAdminStats: async (): Promise<any> => {
    const response = await authApiClient.get('/admin/stats/');
    return response.data;
  },
};

export default authApiClient;
