import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/common';
import { deduplicatedFetch } from '@/utils/requestDeduplication';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const DJANGO_ADMIN_URL = process.env.NEXT_PUBLIC_DJANGO_ADMIN_URL || 'http://localhost:8000/eesa';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache utility functions
const getCacheKey = (url: string, params?: any) => {
  return `${url}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttlMinutes: number = 5) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
  });
};

// Create axios instance for public API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for caching
apiClient.interceptors.request.use(
  (config) => {
    // Enable compression
    config.headers['Accept-Encoding'] = 'gzip, deflate, br';
    
    // Check cache for GET requests
    if (config.method === 'get' && !config.url?.includes('admin')) {
      const cacheKey = getCacheKey(config.url || '', config.params);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        // Return cached data by resolving promise
        return Promise.reject({
          cached: true,
          data: cachedData,
          config
        });
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and caching
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache GET responses (excluding admin endpoints)
    if (response.config.method === 'get' && !response.config.url?.includes('admin')) {
      const cacheKey = getCacheKey(response.config.url || '', response.config.params);
      setCachedData(cacheKey, response.data, 5); // Cache for 5 minutes
    }
    
    return response;
  },
  async (error: AxiosError | any) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config?.url);
    } else if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    }
    return Promise.reject(error);
  }
);

// API functions for public endpoints
export const api = {
  // Events
  events: {
    list: (params?: any) => apiClient.get('/events/', { params }),
    get: (id: string) => apiClient.get(`/events/${id}/`),
    upcoming: () => apiClient.get('/events/upcoming/'),
    featured: () => apiClient.get('/events/featured/'),
    stats: () => apiClient.get('/events/stats/'),
    register: (data: any) => apiClient.post('/events/quick-register/', data),
    submitFeedback: (data: any) => apiClient.post('/events/submit-feedback/', data),
  },

  // Academic Resources
  academics: {
    // New optimized endpoint that fetches all data in one call
    data: () => apiClient.get('/academics/data/'),
    schemes: (params?: any) => apiClient.get('/academics/schemes/', { params }),
    subjects: (params?: any) => apiClient.get('/academics/subjects/', { params }),
    categories: (params?: any) => apiClient.get('/academics/categories/', { params }),
    resources: (params?: any) => apiClient.get('/academics/resources/', { params }),
    departments: (params?: any) => apiClient.get('/academics/departments/', { params }),
  },

  // Projects
  projects: {
    list: (params?: any) => apiClient.get('/projects/', { params }),
    get: (id: string) => apiClient.get(`/projects/${id}/`),
    featured: () => apiClient.get('/projects/featured/'),
  },

  // Placements
  placements: {
    companies: (params?: any) => apiClient.get('/placements/companies/', { params }),
    drives: (params?: any) => apiClient.get('/placements/drives/', { params }),
    statistics: () => apiClient.get('/placements/statistics/'),
    placedStudents: () => apiClient.get('/placements/placed-students/'),
  },

  // Careers
  careers: {
    list: (params?: any) => apiClient.get('/careers/', { params }),
    get: (id: string) => apiClient.get(`/careers/${id}/`),
  },

  // Gallery
  gallery: {
    list: (params?: any) => apiClient.get('/gallery/', { params }),
    get: (id: string) => apiClient.get(`/gallery/${id}/`),
  },

  // Alumni
  alumni: {
    list: (params?: any) => apiClient.get('/alumni/', { params }),
    get: (id: string) => apiClient.get(`/alumni/${id}/`),
  },
};

// Clear cache function
export const clearApiCache = () => {
  cache.clear();
};

// Helper function to redirect to Django admin
export const redirectToDjangoAdmin = (path: string = '') => {
  const adminUrl = `${DJANGO_ADMIN_URL}/${path}`;
  window.open(adminUrl, '_blank');
};

// Helper function to check if user should be redirected to admin
export const shouldRedirectToAdmin = (action: string) => {
  const adminActions = [
    'upload',
    'create',
    'edit',
    'delete',
    'approve',
    'manage',
    'admin',
    'dashboard'
  ];

  return adminActions.some(adminAction =>
    action.toLowerCase().includes(adminAction)
  );
};

// Generic API request handler with caching
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await apiClient.request({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

// Handle API errors
const handleApiError = (error: AxiosError) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        toast.error((data as any)?.message || 'Bad request');
        break;
      case 401:
        toast.error('Authentication required');
        break;
      case 403:
        toast.error('Permission denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error((data as any)?.message || 'An error occurred');
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred');
  }
};

export default apiClient;
