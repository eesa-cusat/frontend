import axios, { AxiosError } from 'axios';
import { User, LoginCredentials } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance for auth operations
export const authClient = axios.create({
  baseURL: `${API_BASE_URL.replace('/api', '')}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
  timeout: 10000,
});

export interface LoginResponse {
  message: string;
  user: User;
}

export interface AdminStats {
  academics: {
    schemes: number;
    subjects: number;
    resources: number;
    pending_approvals: number;
  };
  events: {
    total_events: number;
    upcoming_events: number;
    total_registrations: number;
  };
  careers: {
    job_opportunities: number;
    internship_opportunities: number;
  };
  people: {
    alumni: number;
    team_members: number;
  };
}

export const authService = {
  // Get CSRF token
  async getCsrfToken(): Promise<{ csrfToken: string }> {
    const response = await authClient.get('/api/accounts/auth/csrf/');
    return response.data;
  },

  // Login with credentials
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // First get CSRF token
      const { csrfToken } = await this.getCsrfToken();
      
      // Then login
      const response = await authClient.post('/api/accounts/auth/login/', credentials, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw new Error((axiosError.response.data as { detail?: string }).detail || 'Login failed');
        }
      }
      throw new Error('Login failed');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authClient.get('/api/accounts/auth/me/');
      return response.data;
    } catch (error) {
      // If we get a 403, it means no valid session - this is expected behavior
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error('No valid session');
      }
      // For other errors, re-throw
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const { csrfToken } = await this.getCsrfToken();
      await authClient.post('/api/accounts/auth/logout/', {}, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
    } catch (error) {
      // Even if logout fails on server, we should clear client state
      console.error('Logout error:', error);
    }
  },

  // Get admin stats
  async getAdminStats(): Promise<AdminStats> {
    const response = await authClient.get('/api/accounts/admin/stats/');
    return response.data;
  },

  // Check if user has specific group access
  hasGroupAccess(user: User | null, requiredGroup: string): boolean {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.groups.some(group => group === requiredGroup);
  },

  // Check if user can access admin panel
  canAccessAdmin(user: User | null): boolean {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;
    return user.groups.length > 0;
  },
};

// Export axios instance with automatic CSRF token handling for other services
export const axiosWithCredentials = axios.create({
  baseURL: `${API_BASE_URL.replace('/api', '')}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token interceptor
axiosWithCredentials.interceptors.request.use(
  async (config) => {
    try {
      const { csrfToken } = await authService.getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
