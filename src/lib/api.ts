import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/common';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const DJANGO_ADMIN_URL = process.env.NEXT_PUBLIC_DJANGO_ADMIN_URL || 'http://localhost:8000/eesa';

// Create axios instance for public API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
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
    schemes: () => apiClient.get('/academics/schemes/'),
    subjects: (params?: any) => apiClient.get('/academics/subjects/', { params }),
    categories: () => apiClient.get('/academics/categories/'),
    resources: (params?: any) => apiClient.get('/academics/resources/', { params }),
  },

  // Projects
  projects: {
    list: (params?: any) => apiClient.get('/projects/', { params }),
    get: (id: string) => apiClient.get(`/projects/${id}/`),
    featured: () => apiClient.get('/projects/featured/'),
  },

  // Placements
  placements: {
    companies: () => apiClient.get('/placements/companies/'),
    drives: () => apiClient.get('/placements/drives/'),
    statistics: () => apiClient.get('/placements/statistics/'),
    placedStudents: () => apiClient.get('/placements/placed-students/'),
  },

  // Careers
  careers: {
    list: () => apiClient.get('/careers/'),
    get: (id: string) => apiClient.get(`/careers/${id}/`),
  },

  // Gallery
  gallery: {
    list: () => apiClient.get('/gallery/'),
    get: (id: string) => apiClient.get(`/gallery/${id}/`),
  },

  // Alumni
  alumni: {
    list: () => apiClient.get('/alumni/'),
    get: (id: string) => apiClient.get(`/alumni/${id}/`),
  },
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

// Generic API request handler
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
