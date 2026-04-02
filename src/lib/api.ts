import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { AlumniRegistrationPayload } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
type QueryParams = Record<string, string | number | boolean | null | undefined>;
type CacheEntry = { data: unknown; timestamp: number; ttl: number };
type CachedInterceptorError = { cached: true; data: unknown; config: unknown };
type ApiErrorBody = { message?: string; detail?: string };
type RequestData = Record<string, unknown> | FormData | string | null | undefined;
type RequestConfig = Record<string, unknown> | undefined;

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

// Cache utility functions
const getCacheKey = (url: string, params?: QueryParams) => {
  const normalized = params
    ? Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {})
    : undefined;
  return `${url}${normalized ? '?' + new URLSearchParams(normalized).toString() : ''}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: unknown, ttlMinutes: number = 5) => {
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
    if (config.method === 'get') {
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
    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = getCacheKey(response.config.url || '', response.config.params);
      setCachedData(cacheKey, response.data, 5); // Cache for 5 minutes
    }
    
    return response;
  },
  async (error: AxiosError | CachedInterceptorError) => {
    // Handle cached responses
    if ('cached' in error && error.cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config as never,
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
    list: (params?: QueryParams) => apiClient.get('/events/', { params }),
    get: (id: string) => apiClient.get(`/events/${id}/`),
    upcoming: () => apiClient.get('/events/upcoming/'),
    featured: () => apiClient.get('/events/featured/'),
    stats: () => apiClient.get('/events/stats/'),
    register: (data: { event: string | number } & Record<string, unknown>) => apiClient.post(`/events/events/${data.event}/register/`, data),
    submitFeedback: (data: Record<string, unknown>) => apiClient.post('/events/submit-feedback/', data),
  },

  // Academic Resources
  academics: {
    // New optimized endpoint that fetches all data in one call
    data: () => apiClient.get('/academics/data/'),
    schemes: (params?: QueryParams) => apiClient.get('/academics/schemes/', { params }),
    subjects: (params?: QueryParams) => apiClient.get('/academics/subjects/', { params }),
    categories: (params?: QueryParams) => apiClient.get('/academics/categories/', { params }),
    resources: (params?: QueryParams) => apiClient.get('/academics/resources/', { params }),
    departments: (params?: QueryParams) => apiClient.get('/academics/departments/', { params }),
  },

  // Projects
  projects: {
    list: (params?: QueryParams) => apiClient.get('/projects/', { params }),
    get: (id: string) => apiClient.get(`/projects/${id}/`),
    featured: () => apiClient.get('/projects/featured/'),
  },

  // Placements
  placements: {
    companies: (params?: QueryParams) => apiClient.get('/placements/companies/', { params }),
    drives: (params?: QueryParams) => apiClient.get('/placements/drives/', { params }),
    statistics: () => apiClient.get('/placements/statistics/'),
    placedStudents: () => apiClient.get('/placements/placed-students/'),
  },

  // Careers
  careers: {
    list: (params?: QueryParams) => apiClient.get('/careers/', { params }),
    get: (id: string) => apiClient.get(`/careers/${id}/`),
  },

  // Gallery
  gallery: {
    list: (params?: QueryParams) => apiClient.get('/gallery/', { params }),
    get: (id: string) => apiClient.get(`/gallery/${id}/`),
    categories: (params?: QueryParams) => apiClient.get('/gallery/categories/', { params }),
    albums: (params?: QueryParams) => apiClient.get('/gallery/albums/', { params }),
    images: (params?: QueryParams) => apiClient.get('/gallery/images/', { params }),
    batchData: (params?: QueryParams) => apiClient.get('/gallery/batch-data/', { params }),
  },

  // Alumni
  alumni: {
    list: (params?: QueryParams) => apiClient.get('/alumni/alumni/', { params }),
    batches: (params?: QueryParams) => apiClient.get('/alumni/batches/', { params }),
    get: (id: string) => apiClient.get(`/alumni/alumni/${id}/`),
    register: (data: AlumniRegistrationPayload) => {
      const formData = new FormData();
      formData.append('reg_no', data.reg_no);
      formData.append('full_name', data.full_name);
      if (data.batch) formData.append('batch', String(data.batch));
      formData.append('current_engagement', data.current_engagement);
      formData.append('willing_to_mentor', String(data.willing_to_mentor));
      if (data.linkedin_profile) formData.append('linkedin_profile', data.linkedin_profile);
      if (data.phone_number) formData.append('phone_number', data.phone_number);
      if (data.profile_image) formData.append('profile_image', data.profile_image);

      return apiClient.post('/alumni/alumni/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    bulkSyncCsv: (csvFile: File) => {
      const formData = new FormData();
      formData.append('csv_file', csvFile);
      return apiClient.post('/alumni/alumni/bulk_sync_csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};

// Clear cache function
export const clearApiCache = () => {
  cache.clear();
};

// Removed admin-related functions - using separate admin dashboard

// Generic API request handler with caching
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: RequestData,
  config?: RequestConfig
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
    const message = (data as ApiErrorBody)?.message || (data as ApiErrorBody)?.detail;

    switch (status) {
      case 400:
        toast.error(message || 'Bad request');
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
        toast.error(message || 'An error occurred');
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred');
  }
};

export default apiClient;
