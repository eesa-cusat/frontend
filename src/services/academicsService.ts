/**
 * @fileoverview Academic Resources Service
 * @description Optimized service for managing academic schemes, subjects, and resources
 * @author EESA Frontend Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';

// ===== TYPE DEFINITIONS =====

/** Academic Scheme entity */
export interface AcademicScheme {
  id: number;
  name: string;
  year: number;
  department: string;
  is_active: boolean;
  created_at: string;
}

/** Academic Subject entity */
export interface AcademicSubject {
  id: number;
  name: string;
  code: string;
  scheme: AcademicScheme;
  semester: number;
  department: string;
  credits: number;
  is_active: boolean;
}

/** Academic Resource entity */
export interface AcademicResource {
  id: number;
  title: string;
  description?: string;
  category: string;
  subject: AcademicSubject;
  module_number?: number;
  uploaded_by: {
    id: number;
    name: string;
  };
  is_approved?: boolean;
  file_size_mb: number;
  download_count: number;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  file_url: string | null;
}

/** Filter interface for academic queries */
export interface AcademicFilters {
  search?: string;
  scheme_id?: number;
  subject_id?: number;
  category?: string;
  department?: string;
  semester?: number;
  module_number?: number;
  is_approved?: boolean;
  uploaded_by?: number;
  date_start?: string;
  date_end?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

/** Like response interface */
export interface LikeResponse {
  liked: boolean;
  like_count: number;
}

// ===== MAIN SERVICE =====

/**
 * Academic Resources Service
 * Provides optimized methods for managing academic data with database index utilization
 */

export const academicsService = {
  // Get academic schemes with optimized filters
  async getSchemes(filters?: Partial<AcademicFilters>): Promise<AcademicScheme[]> {
    try {
      const params: any = {};
      
      if (filters?.search) params.search = filters.search;
      if (filters?.department) params.department = filters.department;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Leverage idx_academics_scheme_dept_active for department filtering
      params.ordering = filters?.ordering || '-year';

      const response = await api.academics.schemes();
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching academic schemes:', error);
      throw error;
    }
  },

  // Get academic subjects with optimized filters (leverages idx_academics_subject_scheme_sem)
  async getSubjects(filters?: AcademicFilters): Promise<AcademicSubject[]> {
    try {
      const params: any = {};
      
      // Optimize search for full-text search index
      if (filters?.search) params.search = filters.search;
      if (filters?.scheme_id) params.scheme = filters.scheme_id;
      if (filters?.semester) params.semester = filters.semester;
      if (filters?.department) params.department = filters.department;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Leverage compound indexes for scheme and semester filtering
      params.ordering = filters?.ordering || 'semester';

      const response = await api.academics.subjects(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching academic subjects:', error);
      throw error;
    }
  },

  // Get academic resources with optimized filters (leverages idx_academics_resource_subject_approved)
  async getResources(filters?: AcademicFilters): Promise<AcademicResource[]> {
    try {
      const params: any = {};
      
      // Optimize search for full-text search index (idx_academics_resource_search)
      if (filters?.search) params.search = filters.search;
      if (filters?.subject_id) params.subject = filters.subject_id;
      if (filters?.category) params.category = filters.category;
      if (filters?.module_number) params.module_number = filters.module_number;
      if (filters?.is_approved !== undefined) params.is_approved = filters.is_approved;
      if (filters?.uploaded_by) params.uploaded_by = filters.uploaded_by;
      if (filters?.date_start) params.date_start = filters.date_start;
      if (filters?.date_end) params.date_end = filters.date_end;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Leverage idx_academics_resource_subject_approved and idx_academics_resource_uploaded indexes
      params.ordering = filters?.ordering || '-created_at';

      const response = await api.academics.resources(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching academic resources:', error);
      throw error;
    }
  },

  // Get resources by subject (leverages idx_academics_resource_subject_approved)
  async getResourcesBySubject(subjectId: number, filters?: Partial<AcademicFilters>): Promise<AcademicResource[]> {
    try {
      return this.getResources({
        subject_id: subjectId,
        is_approved: true,
        ordering: '-created_at',
        ...filters
      });
    } catch (error) {
      console.error('Error fetching resources by subject:', error);
      throw error;
    }
  },

  // Get resources by category (leverages idx_academics_resource_category)
  async getResourcesByCategory(category: string, filters?: Partial<AcademicFilters>): Promise<AcademicResource[]> {
    try {
      return this.getResources({
        category,
        is_approved: true,
        ordering: '-created_at',
        ...filters
      });
    } catch (error) {
      console.error('Error fetching resources by category:', error);
      throw error;
    }
  },

  // Get resources by module (leverages idx_academics_resource_module)
  async getResourcesByModule(subjectId: number, moduleNumber: number): Promise<AcademicResource[]> {
    try {
      return this.getResources({
        subject_id: subjectId,
        module_number: moduleNumber,
        is_approved: true,
        ordering: '-created_at'
      });
    } catch (error) {
      console.error('Error fetching resources by module:', error);
      throw error;
    }
  },

  // Search academic resources with full-text search (leverages idx_academics_resource_search)
  async searchResources(searchTerm: string, filters?: Partial<AcademicFilters>): Promise<AcademicResource[]> {
    try {
      const searchFilters: AcademicFilters = {
        search: searchTerm,
        is_approved: true,
        ordering: '-created_at',
        ...filters
      };
      
      return this.getResources(searchFilters);
    } catch (error) {
      console.error('Error searching academic resources:', error);
      throw error;
    }
  },

  // Get subjects by scheme and semester (leverages idx_academics_subject_scheme_sem)
  async getSubjectsBySchemeAndSemester(schemeId: number, semester: number): Promise<AcademicSubject[]> {
    try {
      return this.getSubjects({
        scheme_id: schemeId,
        semester,
        ordering: 'name'
      });
    } catch (error) {
      console.error('Error fetching subjects by scheme and semester:', error);
      throw error;
    }
  },

  // Get subjects by department (leverages idx_academics_subject_dept_sem)
  async getSubjectsByDepartment(department: string, semester?: number): Promise<AcademicSubject[]> {
    try {
      return this.getSubjects({
        department,
        semester,
        ordering: 'semester'
      });
    } catch (error) {
      console.error('Error fetching subjects by department:', error);
      throw error;
    }
  },

  // Get academic categories
  async getCategories(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await api.academics.categories();
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching academic categories:', error);
      throw error;
    }
  },

  // Get academic departments
  async getDepartments(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await api.academics.departments();
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching academic departments:', error);
      throw error;
    }
  },

  // Like/Unlike academic resource (leverages idx_academics_resource_likes)
  async toggleResourceLike(resourceId: number): Promise<LikeResponse | null> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/like/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data: LikeResponse = await response.json();
        return data;
      } else {
        console.error('Failed to toggle like, status:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return null;
    }
  },

  // Get user's liked resources (leverages idx_academics_resource_user_likes)
  async getUserLikedResources(): Promise<number[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/academics/resources/liked/`);
      
      if (response.ok) {
        const data = await response.json();
        return data.map((resource: { id: number }) => resource.id);
      } else {
        console.error('Failed to fetch user likes, status:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user likes:', error);
      return [];
    }
  },

  // Get academic statistics (leverages analytics indexes)
  async getAcademicStatistics(): Promise<any> {
    try {
      const [schemes, subjects, resources] = await Promise.all([
        this.getSchemes({ limit: 1000 }),
        this.getSubjects({ limit: 1000 }),
        this.getResources({ limit: 1000 })
      ]);
      
      return {
        total_schemes: schemes.length,
        total_subjects: subjects.length,
        total_resources: resources.length,
        approved_resources: resources.filter(r => r.is_approved).length,
        by_department: subjects.reduce((acc: any, subject) => {
          acc[subject.department] = (acc[subject.department] || 0) + 1;
          return acc;
        }, {}),
        by_category: resources.reduce((acc: any, resource) => {
          acc[resource.category] = (acc[resource.category] || 0) + 1;
          return acc;
        }, {}),
        by_semester: subjects.reduce((acc: any, subject) => {
          acc[subject.semester] = (acc[subject.semester] || 0) + 1;
          return acc;
        }, {}),
        recent_uploads: resources.filter(r => {
          const uploadDate = new Date(r.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return uploadDate >= sevenDaysAgo;
        }).length
      };
    } catch (error) {
      console.error('Error fetching academic statistics:', error);
      throw error;
    }
  },

  // Get academic analytics for dashboard (leverages upload date analytics)
  async getAcademicAnalytics(period: 'monthly' | 'yearly' = 'monthly'): Promise<any> {
    try {
      const currentDate = new Date();
      let startDate: string;
      
      if (period === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
      }
      
      const endDate = currentDate.toISOString().split('T')[0];
      
      // Get resources for analytics period
      const resources = await this.getResources({
        date_start: startDate,
        date_end: endDate,
        limit: 1000
      });
      
      return {
        total_uploads: resources.length,
        approved_uploads: resources.filter(r => r.is_approved).length,
        upload_distribution: this.analyzeUploadDistribution(resources),
        category_trends: this.analyzeCategoryTrends(resources),
        popular_subjects: this.analyzePopularSubjects(resources),
        engagement_metrics: this.analyzeEngagementMetrics(resources),
        period,
        start_date: startDate,
        end_date: endDate
      };
    } catch (error) {
      console.error('Error fetching academic analytics:', error);
      throw error;
    }
  },

  // Helper method to analyze upload distribution
  analyzeUploadDistribution(resources: AcademicResource[]): any {
    const uploadsByDay: { [key: string]: number } = {};
    
    resources.forEach(resource => {
      const day = new Date(resource.created_at).toISOString().split('T')[0];
      uploadsByDay[day] = (uploadsByDay[day] || 0) + 1;
    });
    
    return uploadsByDay;
  },

  // Helper method to analyze category trends
  analyzeCategoryTrends(resources: AcademicResource[]): any {
    return resources.reduce((acc: any, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1;
      return acc;
    }, {});
  },

  // Helper method to analyze popular subjects
  analyzePopularSubjects(resources: AcademicResource[]): any {
    const subjectStats: { [key: string]: { count: number, likes: number, downloads: number } } = {};
    
    resources.forEach(resource => {
      const subjectName = resource.subject.name;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { count: 0, likes: 0, downloads: 0 };
      }
      subjectStats[subjectName].count++;
      subjectStats[subjectName].likes += resource.like_count;
      subjectStats[subjectName].downloads += resource.download_count;
    });
    
    return Object.entries(subjectStats)
      .map(([subject, stats]) => ({ subject, ...stats }))
      .sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads))
      .slice(0, 10);
  },

  // Helper method to analyze engagement metrics
  analyzeEngagementMetrics(resources: AcademicResource[]): any {
    const totalLikes = resources.reduce((sum, r) => sum + r.like_count, 0);
    const totalDownloads = resources.reduce((sum, r) => sum + r.download_count, 0);
    
    return {
      total_likes: totalLikes,
      total_downloads: totalDownloads,
      average_likes_per_resource: resources.length > 0 ? totalLikes / resources.length : 0,
      average_downloads_per_resource: resources.length > 0 ? totalDownloads / resources.length : 0,
      engagement_rate: resources.length > 0 ? (totalLikes + totalDownloads) / resources.length : 0
    };
  },

  // Batch load all academic data (optimized for academics page)
  async loadAllAcademicData(): Promise<{
    schemes: AcademicScheme[];
    subjects: AcademicSubject[];
    resources: AcademicResource[];
    categories: { value: string; label: string }[];
    departments: { value: string; label: string }[];
  }> {
    try {
      // Use concurrent Promise.all for better performance
      const [schemes, subjects, resources, categories, departments] = await Promise.all([
        this.getSchemes(),
        this.getSubjects(),
        this.getResources({ is_approved: true }),
        this.getCategories(),
        this.getDepartments()
      ]);
      
      return {
        schemes,
        subjects,
        resources,
        categories,
        departments
      };
    } catch (error) {
      console.error('Error loading all academic data:', error);
      throw error;
    }
  }
};

export default academicsService;
