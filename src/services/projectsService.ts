import { api } from '@/lib/api';
import { Project } from '@/types/api';

export interface ProjectFilters {
  search?: string;
  status?: string;
  project_type?: string;
  is_featured?: boolean;
  technologies?: string[];
  category?: string;
  difficulty_level?: string;
  created_by?: string;
  date_created_start?: string;
  date_created_end?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

export const projectsService = {
  // Get all projects with optimized filters for database indexes
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      const params: any = {};
      
      // Optimize search for full-text search index (idx_projects_project_search)
      if (filters?.search) params.search = filters.search;
      if (filters?.status) params.status = filters.status;
      if (filters?.project_type) params.project_type = filters.project_type;
      if (filters?.is_featured !== undefined) params.is_featured = filters.is_featured;
      if (filters?.category) params.category = filters.category;
      if (filters?.difficulty_level) params.difficulty_level = filters.difficulty_level;
      if (filters?.created_by) params.created_by = filters.created_by;
      if (filters?.date_created_start) params.date_created_start = filters.date_created_start;
      if (filters?.date_created_end) params.date_created_end = filters.date_created_end;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Handle technologies array for tech stack filtering
      if (filters?.technologies && filters.technologies.length > 0) {
        params.technologies = filters.technologies.join(',');
      }
      
      // Leverage idx_projects_project_status_featured and idx_projects_project_created indexes
      params.ordering = filters?.ordering || '-date_created';

      const response = await api.projects.list(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get featured projects (leverages idx_projects_project_status_featured)
  async getFeaturedProjects(limit?: number): Promise<Project[]> {
    try {
      // Use dedicated featured endpoint if available
      try {
        const response = await api.projects.featured();
        let projects = response.data.results || response.data;
        
        if (limit && Array.isArray(projects)) {
          projects = projects.slice(0, limit);
        }
        
        return projects;
      } catch {
        // Fallback to general list with filters
        return this.getProjects({ 
          is_featured: true, 
          status: 'published',
          ordering: '-date_created',
          limit 
        });
      }
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      throw error;
    }
  },

  // Get projects by status (leverages idx_projects_project_status_featured)
  async getProjectsByStatus(status: string, limit?: number): Promise<Project[]> {
    try {
      return this.getProjects({ 
        status, 
        ordering: '-date_created',
        limit 
      });
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      throw error;
    }
  },

  // Search projects with full-text search (leverages idx_projects_project_search)
  async searchProjects(searchTerm: string, filters?: Partial<ProjectFilters>): Promise<Project[]> {
    try {
      const searchFilters: ProjectFilters = {
        search: searchTerm,
        status: 'published',
        ordering: '-date_created',
        ...filters
      };
      
      return this.getProjects(searchFilters);
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },

  // Get single project by ID
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.projects.get(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  // Get all projects (public access) - maps to optimized version
  getAllProjects: async (): Promise<Project[]> => {
    return projectsService.getProjects({ status: 'published', ordering: '-date_created' });
  },

  // Get a specific project by ID (public access) - maps to optimized version
  getProject: async (projectId: string): Promise<Project> => {
    return projectsService.getProjectById(projectId);
  }
};

export default projectsService;
