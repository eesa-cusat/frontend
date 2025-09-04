import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/common';
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
  maxRedirects: 0, // Don't follow redirects automatically to avoid HTTPS issues
});

// Request interceptor for caching
apiClient.interceptors.request.use(
  (config) => {
    // Remove Accept-Encoding header - browser sets this automatically
    // Setting it manually causes "Refused to set unsafe header" error
    delete config.headers['Accept-Encoding'];
    
    // Add debugging for redirects
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Check cache for GET requests
    if (config.method === 'get' && !config.url?.includes('admin')) {
      const cacheKey = getCacheKey(config.url || '', config.params);
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        console.log('Using cached data for:', config.url);
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
    console.log('API Response:', response.status, response.config.url, typeof response.data);
    
    // Cache GET responses (excluding admin endpoints)
    if (response.config.method === 'get' && !response.config.url?.includes('admin')) {
      const cacheKey = getCacheKey(response.config.url || '', response.config.params);
      setCachedData(cacheKey, response.data, 5); // Cache for 5 minutes
    }
    
    // Normalize response data structure for consistency
    if (response.data && typeof response.data === 'object') {
      // If data has a results property but it's not an array, fix it
      if (response.data.results && !Array.isArray(response.data.results)) {
        console.warn('API returned non-array results, converting to array:', response.data.results);
        response.data.results = [];
      }
      
      // If data is directly an object but expected to be an array, wrap it
      if (!response.data.results && !Array.isArray(response.data) && 
          response.config.url?.includes('/api/')) {
        // Don't wrap if it's clearly a single object endpoint (contains ID)
        if (!response.config.url.match(/\/\d+\/?$/)) {
          console.warn('API returned non-array data for list endpoint, wrapping in array:', response.data);
          response.data = { results: [] };
        }
      }
    }
    
    return response;
  },
  async (error: AxiosError | any) => {
    console.log('API Error:', error.response?.status, error.config?.url, error.message);
    
    // Handle cached responses
    if (error.cached) {
      console.log('Returning cached data for:', error.config.url);
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    // Handle redirect responses (301, 302) - try different endpoint patterns
    if (error.response?.status === 301 || error.response?.status === 302) {
      const originalUrl = error.config?.url;
      console.warn('API redirect detected for:', originalUrl, 'Location:', error.response.headers?.location);
      
      // Try alternative endpoint patterns
      if (originalUrl?.includes('/events/')) {
        try {
          // Try /events/events/ pattern as suggested
          const alternativeUrl = originalUrl.replace('/events/', '/events/events/');
          console.log('Trying alternative endpoint:', alternativeUrl);
          const retryConfig = { ...error.config, url: alternativeUrl };
          const retryResponse = await apiClient.request(retryConfig);
          return retryResponse;
        } catch (retryError) {
          console.warn('Alternative endpoint also failed:', retryError);
        }
      }
      
      // If all retries fail, return empty data structure
      console.log('All endpoints failed, returning fallback data');
      return Promise.resolve({
        data: { results: [] },
        status: 200,
        statusText: 'OK (Fallback)',
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
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to API server. Is the backend running?');
      toast.error('Cannot connect to server. Please check if the backend is running.');
    }
    return Promise.reject(error);
  }
);

// API functions for public endpoints
export const api = {
  // Events - try both /events/ and /events/events/ patterns
  events: {
    list: (params?: any) => {
      // Try the suggested /events/events/ pattern first
      return apiClient.get('/events/events/', { params }).catch(error => {
        if (error.response?.status === 301 || error.response?.status === 404) {
          // Fallback to /events/
          return apiClient.get('/events/', { params });
        }
        throw error;
      });
    },
    get: (id: string) => {
      return apiClient.get(`/events/events/${id}/`).catch(error => {
        if (error.response?.status === 301 || error.response?.status === 404) {
          return apiClient.get(`/events/${id}/`);
        }
        throw error;
      });
    },
    upcoming: () => {
      return apiClient.get('/events/events/upcoming/').catch(error => {
        if (error.response?.status === 301 || error.response?.status === 404) {
          return apiClient.get('/events/upcoming/');
        }
        throw error;
      });
    },
    featured: () => {
      return apiClient.get('/events/events/featured/').catch(error => {
        if (error.response?.status === 301 || error.response?.status === 404) {
          return apiClient.get('/events/featured/');
        }
        throw error;
      });
    },
    stats: () => {
      return apiClient.get('/events/events/stats/').catch(error => {
        if (error.response?.status === 301 || error.response?.status === 404) {
          return apiClient.get('/events/stats/');
        }
        throw error;
      });
    },
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
    categories: (params?: any) => apiClient.get('/gallery/categories/', { params }),
    albums: (params?: any) => apiClient.get('/gallery/albums/', { params }),
    images: (params?: any) => apiClient.get('/gallery/images/', { params }),
    batchData: (params?: any) => apiClient.get('/gallery/batch-data/', { params }),
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
