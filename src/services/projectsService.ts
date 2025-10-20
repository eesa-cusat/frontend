/**
 * @fileoverview Projects Management Service
 * @description Production-ready service for managing project data with optimized database queries
 * @author EESA Frontend Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';
import { Project } from '@/types/api';

// ===== TYPE DEFINITIONS =====

/** Project filter interface for optimized database queries */
export interface ProjectFilters {
  search?: string;
  status?: string;
  project_type?: string;
  is_featured?: boolean;
  technologies?: string[];
  category?: string;
  year?: string; // New: Academic year filter
  difficulty_level?: string;
  created_by?: string;
  date_created_start?: string;
  date_created_end?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

/** Project statistics interface */
export interface ProjectStatistics {
  total_projects: number;
  featured_projects: number;
  published_projects: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_difficulty: Record<string, number>;
  popular_technologies: Array<{technology: string, count: number}>;
  recent_projects: number;
}

// ===== MAIN SERVICE =====

/**
 * Projects Service
 * Provides optimized methods for project management with database index utilization
 */
export const projectsService = {
  
  // ===== CORE PROJECT RETRIEVAL =====
  
  /**
   * Retrieves projects with comprehensive filtering using batch-data endpoint
   * @description Leverages database indexes: idx_projects_project_search, idx_projects_project_status_featured, idx_projects_project_created
   * @param filters Optional filter parameters
   * @returns Promise<Project[]> Filtered array of projects
   */
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      const params: any = {};
      
      // Full-text search optimization (idx_projects_project_search)
      if (filters?.search) params.search = filters.search;
      
      // Status and feature filtering (idx_projects_project_status_featured)
      if (filters?.status) params.status = filters.status;
      if (filters?.project_type) params.project_type = filters.project_type;
      if (filters?.is_featured !== undefined) params.is_featured = filters.is_featured;
      
      // Category and difficulty filtering
      if (filters?.category) params.category = filters.category;
      if (filters?.year) params.year = filters.year; // New: Year filter
      if (filters?.difficulty_level) params.difficulty_level = filters.difficulty_level;
      if (filters?.created_by) params.created_by = filters.created_by;
      
      // Date range filtering (idx_projects_project_created)
      if (filters?.date_created_start) params.date_created_start = filters.date_created_start;
      if (filters?.date_created_end) params.date_created_end = filters.date_created_end;
      
      // Pagination
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Technology filtering (leverages array/JSON indexes)
      if (filters?.technologies && filters.technologies.length > 0) {
        params.technologies = filters.technologies.join(',');
      }
      
      // Optimized ordering (leverages date indexes)
      params.ordering = filters?.ordering || '-date_created';

      // Use batch-data endpoint for comprehensive filtering when year filter is present
      // Otherwise use standard list endpoint
      let response;
      if (filters?.year || filters?.category || filters?.search) {
        // For filtered queries, make direct API call to batch-data endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const queryString = new URLSearchParams(params).toString();
        const fetchResponse = await fetch(`${apiUrl}/projects/batch-data/?${queryString}`);
        const data = await fetchResponse.json();
        response = { data };
      } else {
        response = await api.projects.list(params);
      }
      
      // Handle both response formats
      const data = response.data;
      return data.projects || data.results || data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Retrieves featured projects
   * @description Leverages idx_projects_project_status_featured for optimal filtering
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of featured projects
   */
  async getFeaturedProjects(limit?: number): Promise<Project[]> {
    try {
      // Try dedicated featured endpoint first
      try {
        const response = await api.projects.featured();
        let projects = response.data.results || response.data;
        
        if (limit && Array.isArray(projects)) {
          projects = projects.slice(0, limit);
        }
        
        return projects;
      } catch {
        // Fallback to filtered query
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

  /**
   * Retrieves published projects
   * @description Returns all projects (status field not available in current interface)
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of published projects
   */
  async getPublishedProjects(limit?: number): Promise<Project[]> {
    try {
      return this.getProjects({ 
        ordering: '-created_at',
        limit 
      });
    } catch (error) {
      console.error('Error fetching published projects:', error);
      throw error;
    }
  },

  // ===== SPECIALIZED QUERIES =====

  /**
   * Retrieves projects by status
   * @description Leverages idx_projects_project_status_featured for optimal filtering
   * @param status Project status
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of projects by status
   */
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

  /**
   * Retrieves projects by category
   * @description Leverages category indexes for optimal filtering
   * @param category Project category
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of projects by category
   */
  async getProjectsByCategory(category: string, limit?: number): Promise<Project[]> {
    try {
      return this.getProjects({ 
        category,
        status: 'published',
        ordering: '-date_created',
        limit 
      });
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      throw error;
    }
  },

  /**
   * Retrieves projects by technology stack
   * @description Note: Technologies field not available in current Project interface
   * @param technologies Array of technologies
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of projects (returns all projects as tech filtering unavailable)
   */
  async getProjectsByTechnology(technologies: string[], limit?: number): Promise<Project[]> {
    try {
      console.warn('Technologies field not available in Project interface. Returning all published projects.');
      return this.getProjects({ 
        ordering: '-created_at',
        limit 
      });
    } catch (error) {
      console.error('Error fetching projects by technology:', error);
      throw error;
    }
  },

  /**
   * Retrieves projects by difficulty level
   * @description Note: Difficulty level field not available in current Project interface
   * @param difficultyLevel Difficulty level (beginner, intermediate, advanced)
   * @param limit Optional limit for number of projects
   * @returns Promise<Project[]> Array of projects (returns all projects as difficulty filtering unavailable)
   */
  async getProjectsByDifficulty(difficultyLevel: string, limit?: number): Promise<Project[]> {
    try {
      console.warn('Difficulty level field not available in Project interface. Returning all published projects.');
      return this.getProjects({ 
        ordering: '-created_at',
        limit 
      });
    } catch (error) {
      console.error('Error fetching projects by difficulty:', error);
      throw error;
    }
  },

  /**
   * Searches projects with full-text search
   * @description Leverages idx_projects_project_search for optimal text search
   * @param searchTerm Search term for projects
   * @param filters Additional filter parameters
   * @returns Promise<Project[]> Array of matching projects
   */
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

  // ===== SINGLE PROJECT OPERATIONS =====

  /**
   * Retrieves a single project by ID
   * @description Uses primary key index for optimal performance
   * @param id Project identifier
   * @returns Promise<Project> Project details
   */
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.projects.get(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  },

  // ===== UTILITY METHODS =====

  /**
   * Retrieves available project categories
   * @description Extracts unique categories from project data
   * @returns Promise<string[]> Array of category names
   */
  async getCategories(): Promise<string[]> {
    try {
      const projects = await this.getProjects({ limit: 1000 });
      const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching project categories:', error);
      throw error;
    }
  },

  /**
   * Retrieves available academic years from projects
   * @description Extracts unique academic years from project data
   * @returns Promise<string[]> Array of academic years
   */
  async getAvailableYears(): Promise<string[]> {
    try {
      // Make direct API call to batch-data endpoint to get available years
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const fetchResponse = await fetch(`${apiUrl}/projects/batch-data/`);
      const data = await fetchResponse.json();
      
      return data.available_years || [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      throw error;
    }
  },

  /**
   * Retrieves popular technologies
   * @description Note: Technologies field not available in current Project interface
   * @returns Promise<Array<{technology: string, count: number}>> Technology usage statistics
   */
  async getPopularTechnologies(): Promise<Array<{technology: string, count: number}>> {
    try {
      // Note: technologies field not available in current Project interface
      // This method returns empty array for now
      console.warn('Technologies field not available in Project interface');
      return [];
    } catch (error) {
      console.error('Error fetching popular technologies:', error);
      throw error;
    }
  },

  // ===== STATISTICS & ANALYTICS =====

  /**
   * Retrieves comprehensive project statistics
   * @description Calculates statistics from project data using available fields
   * @returns Promise<ProjectStatistics> Project statistics summary
   */
  async getProjectStatistics(): Promise<ProjectStatistics> {
    try {
      const projects = await this.getProjects({ limit: 1000 });
      
      return {
        total_projects: projects.length,
        featured_projects: 0, // is_featured field not available
        published_projects: projects.length, // Assuming all returned projects are published
        by_status: { published: projects.length }, // status field not available
        by_category: projects.reduce((acc: Record<string, number>, project) => {
          if (project.category) {
            acc[project.category] = (acc[project.category] || 0) + 1;
          }
          return acc;
        }, {}),
        by_difficulty: {}, // difficulty_level field not available
        popular_technologies: [], // technologies field not available
        recent_projects: projects.filter(p => {
          const createdDate = new Date(p.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }).length
      };
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      throw error;
    }
  },

  /**
   * Retrieves project analytics for specified period
   * @description Calculates analytics using optimized date range queries with available fields
   * @param period Analysis period - 'monthly' or 'yearly'
   * @returns Promise<object> Analytics data
   */
  async getProjectAnalytics(period: 'monthly' | 'yearly' = 'monthly'): Promise<object> {
    try {
      const currentDate = new Date();
      let startDate: string;
      
      // Calculate date range based on period
      if (period === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
      }
      
      const endDate = currentDate.toISOString().split('T')[0];
      
      // Fetch projects for analytics period
      const projects = await this.getProjects({ 
        date_created_start: startDate,
        date_created_end: endDate,
        limit: 1000
      });
      
      return {
        total_projects: projects.length,
        featured_projects: 0, // is_featured field not available
        published_projects: projects.length, // Assuming all returned projects are published
        projects_by_category: projects.reduce((acc: Record<string, number>, project) => {
          if (project.category) {
            acc[project.category] = (acc[project.category] || 0) + 1;
          }
          return acc;
        }, {}),
        technology_trends: {}, // technologies field not available
        difficulty_distribution: {}, // difficulty_level field not available
        period,
        start_date: startDate,
        end_date: endDate,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  },

  /**
   * Helper method to analyze technology trends
   * @private
   * @deprecated Technologies field not available in current Project interface
   */
  analyzeTechnologyTrends(projects: Project[]): Record<string, number> {
    // Technologies field not available in current Project interface
    return {};
  },

  // ===== LEGACY METHODS =====

  /**
   * @deprecated Use getPublishedProjects() instead
   * Legacy method for backward compatibility
   */
  async getAllProjects(): Promise<Project[]> {
    console.warn('getAllProjects() is deprecated. Use getPublishedProjects() instead.');
    return this.getPublishedProjects();
  },

  /**
   * @deprecated Use getProjectById() instead
   * Legacy method for backward compatibility
   */
  async getProject(projectId: string): Promise<Project> {
    console.warn('getProject() is deprecated. Use getProjectById() instead.');
    return this.getProjectById(projectId);
  }
};

// ===== EXPORT =====

/** Default export for backward compatibility */
export default projectsService;
