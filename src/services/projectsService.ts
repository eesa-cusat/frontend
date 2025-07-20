import axios from 'axios';
import { Project, ProjectDetail } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create a simple axios instance for public endpoints
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsService = {
  // Get all projects (public access)
  getAllProjects: async (): Promise<Project[]> => {
    const response = await publicApiClient.get('/api/projects/');
    return response.data.projects || [];
  },

  // Get a specific project by ID (public access)
  getProject: async (projectId: string): Promise<ProjectDetail> => {
    const response = await publicApiClient.get(`/api/projects/${projectId}/`);
    return response.data;
  },

  // Get user's own projects (requires authentication)
  getMyProjects: async (): Promise<Project[]> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Project[]>('GET', '/projects/my/');
  },

  // Get featured projects (public access)
  getFeaturedProjects: async (): Promise<Project[]> => {
    const response = await publicApiClient.get('/api/projects/featured/');
    return response.data.projects || [];
  },

  // Create a new project (requires authentication)
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Project>('POST', '/projects/create/', projectData);
  },

  // Update a project (requires authentication)
  updateProject: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Project>('PUT', `/projects/${projectId}/update/`, projectData);
  },

  // Delete a project (requires authentication)
  deleteProject: async (projectId: string): Promise<void> => {
    const { apiRequest } = await import('@/lib/api');
    await apiRequest<void>('DELETE', `/projects/${projectId}/delete/`);
  },
};
