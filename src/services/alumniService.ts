/**
 * @fileoverview Alumni Management Service
 * @description Production-ready service for managing alumni data with optimized database queries
 * @author EESA Frontend Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';

// ===== TYPE DEFINITIONS =====

/** Alumni profile interface */
export interface AlumniProfile {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  graduation_year: number;
  department: string;
  current_position?: string;
  current_company?: string;
  linkedin_url?: string;
  location?: string;
  bio?: string;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

/** Alumni filter interface for optimized queries */
export interface AlumniFilters {
  search?: string;
  department?: string;
  graduation_year?: number;
  graduation_year_start?: number;
  graduation_year_end?: number;
  current_company?: string;
  location?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
  ordering?: string;
}

/** Alumni statistics interface */
export interface AlumniStatistics {
  total_alumni: number;
  featured_alumni: number;
  verified_alumni: number;
  by_department: Record<string, number>;
  by_graduation_year: Record<number, number>;
  by_location: Record<string, number>;
  recent_additions: number;
}

// ===== MAIN SERVICE =====

/**
 * Alumni Service
 * Provides optimized methods for alumni management with database index utilization
 */
export const alumniService = {
  
  // ===== CORE ALUMNI RETRIEVAL =====
  
  /**
   * Retrieves alumni with comprehensive filtering
   * @description Leverages database indexes: idx_alumni_search, idx_alumni_dept_year, idx_alumni_featured
   * @param filters Optional filter parameters
   * @returns Promise<AlumniProfile[]> Filtered array of alumni
   */
  async getAlumni(filters?: AlumniFilters): Promise<AlumniProfile[]> {
    try {
      const params = new URLSearchParams();
      
      // Full-text search optimization (idx_alumni_search)
      if (filters?.search) params.append('search', filters.search);
      
      // Department and year filtering (idx_alumni_dept_year)
      if (filters?.department) params.append('department', filters.department);
      if (filters?.graduation_year) params.append('graduation_year', filters.graduation_year.toString());
      if (filters?.graduation_year_start) params.append('graduation_year_start', filters.graduation_year_start.toString());
      if (filters?.graduation_year_end) params.append('graduation_year_end', filters.graduation_year_end.toString());
      
      // Company and location filtering
      if (filters?.current_company) params.append('current_company', filters.current_company);
      if (filters?.location) params.append('location', filters.location);
      
      // Status filtering (idx_alumni_featured, idx_alumni_verified)
      if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
      if (filters?.is_verified !== undefined) params.append('is_verified', filters.is_verified.toString());
      
      // Pagination
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Optimized ordering
      const ordering = filters?.ordering || '-graduation_year';
      params.append('ordering', ordering);

      const response = await api.alumni.list(Object.fromEntries(params));
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching alumni:', error);
      throw error;
    }
  },

  /**
   * Retrieves featured alumni
   * @description Filters alumni using is_featured flag
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of featured alumni
   */
  async getFeaturedAlumni(limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        is_featured: true, 
        is_verified: true,
        ordering: '-graduation_year', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching featured alumni:', error);
      throw error;
    }
  },

  /**
   * Retrieves verified alumni
   * @description Leverages idx_alumni_verified for optimal filtering
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of verified alumni
   */
  async getVerifiedAlumni(limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        is_verified: true, 
        ordering: '-graduation_year', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching verified alumni:', error);
      throw error;
    }
  },

  // ===== SPECIALIZED QUERIES =====

  /**
   * Retrieves alumni by department
   * @description Leverages idx_alumni_dept_year for optimal filtering
   * @param department Department name
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of alumni by department
   */
  async getAlumniByDepartment(department: string, limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        department, 
        is_verified: true,
        ordering: '-graduation_year', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching alumni by department:', error);
      throw error;
    }
  },

  /**
   * Retrieves alumni by graduation year
   * @description Leverages idx_alumni_dept_year for optimal year filtering
   * @param year Graduation year
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of alumni by year
   */
  async getAlumniByYear(year: number, limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        graduation_year: year, 
        is_verified: true,
        ordering: 'name', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching alumni by year:', error);
      throw error;
    }
  },

  /**
   * Retrieves alumni by year range
   * @description Leverages idx_alumni_dept_year for optimal year range filtering
   * @param startYear Start year
   * @param endYear End year
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of alumni in year range
   */
  async getAlumniByYearRange(startYear: number, endYear: number, limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        graduation_year_start: startYear,
        graduation_year_end: endYear,
        is_verified: true,
        ordering: '-graduation_year', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching alumni by year range:', error);
      throw error;
    }
  },

  /**
   * Retrieves alumni by company
   * @description Leverages idx_alumni_company for optimal company filtering
   * @param company Company name
   * @param limit Optional limit for number of alumni
   * @returns Promise<AlumniProfile[]> Array of alumni by company
   */
  async getAlumniByCompany(company: string, limit?: number): Promise<AlumniProfile[]> {
    try {
      return this.getAlumni({ 
        current_company: company, 
        is_verified: true,
        ordering: '-graduation_year', 
        limit 
      });
    } catch (error) {
      console.error('Error fetching alumni by company:', error);
      throw error;
    }
  },

  /**
   * Searches alumni with full-text search
   * @description Leverages idx_alumni_search for optimal text search
   * @param searchTerm Search term for alumni
   * @param filters Additional filter parameters
   * @returns Promise<AlumniProfile[]> Array of matching alumni
   */
  async searchAlumni(searchTerm: string, filters?: Partial<AlumniFilters>): Promise<AlumniProfile[]> {
    try {
      const searchFilters: AlumniFilters = {
        search: searchTerm,
        is_verified: true,
        ordering: '-graduation_year',
        ...filters
      };
      
      return this.getAlumni(searchFilters);
    } catch (error) {
      console.error('Error searching alumni:', error);
      throw error;
    }
  },

  // ===== SINGLE ALUMNI OPERATIONS =====

  /**
   * Retrieves a single alumni profile by ID
   * @description Uses primary key index for optimal performance
   * @param id Alumni identifier
   * @returns Promise<AlumniProfile> Alumni profile details
   */
  async getAlumniById(id: number): Promise<AlumniProfile> {
    try {
      const response = await api.alumni.get(id.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching alumni by ID:', error);
      throw error;
    }
  },

  // ===== UTILITY METHODS =====

  /**
   * Retrieves available departments
   * @description Extracts unique departments from alumni data
   * @returns Promise<string[]> Array of department names
   */
  async getDepartments(): Promise<string[]> {
    try {
      const alumni = await this.getAlumni({ limit: 1000 });
      const departments = [...new Set(alumni.map(a => a.department))];
      return departments.sort();
    } catch (error) {
      console.error('Error fetching alumni departments:', error);
      throw error;
    }
  },

  /**
   * Retrieves available graduation years
   * @description Extracts unique graduation years from alumni data
   * @returns Promise<number[]> Array of graduation years
   */
  async getGraduationYears(): Promise<number[]> {
    try {
      const alumni = await this.getAlumni({ limit: 1000 });
      const years = [...new Set(alumni.map(a => a.graduation_year))];
      return years.sort((a, b) => b - a); // Newest first
    } catch (error) {
      console.error('Error fetching graduation years:', error);
      throw error;
    }
  },

  /**
   * Retrieves popular companies
   * @description Analyzes companies with most alumni
   * @returns Promise<Array<{company: string, count: number}>> Company statistics
   */
  async getPopularCompanies(): Promise<Array<{company: string, count: number}>> {
    try {
      const alumni = await this.getAlumni({ limit: 1000 });
      const companyCount: Record<string, number> = {};
      
      alumni.forEach(alumnus => {
        if (alumnus.current_company) {
          companyCount[alumnus.current_company] = (companyCount[alumnus.current_company] || 0) + 1;
        }
      });
      
      return Object.entries(companyCount)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 companies
    } catch (error) {
      console.error('Error fetching popular companies:', error);
      throw error;
    }
  },

  // ===== STATISTICS & ANALYTICS =====

  /**
   * Retrieves comprehensive alumni statistics
   * @description Calculates statistics from alumni data
   * @returns Promise<AlumniStatistics> Alumni statistics summary
   */
  async getAlumniStatistics(): Promise<AlumniStatistics> {
    try {
      const alumni = await this.getAlumni({ limit: 1000 });
      
      return {
        total_alumni: alumni.length,
        featured_alumni: alumni.filter(a => a.is_featured).length,
        verified_alumni: alumni.filter(a => a.is_verified).length,
        by_department: alumni.reduce((acc: Record<string, number>, alumnus) => {
          acc[alumnus.department] = (acc[alumnus.department] || 0) + 1;
          return acc;
        }, {}),
        by_graduation_year: alumni.reduce((acc: Record<number, number>, alumnus) => {
          acc[alumnus.graduation_year] = (acc[alumnus.graduation_year] || 0) + 1;
          return acc;
        }, {}),
        by_location: alumni.reduce((acc: Record<string, number>, alumnus) => {
          if (alumnus.location) {
            acc[alumnus.location] = (acc[alumnus.location] || 0) + 1;
          }
          return acc;
        }, {}),
        recent_additions: alumni.filter(a => {
          const createdDate = new Date(a.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }).length
      };
    } catch (error) {
      console.error('Error fetching alumni statistics:', error);
      throw error;
    }
  },

  /**
   * Retrieves alumni analytics for specified period
   * @description Calculates analytics using optimized queries
   * @param period Analysis period - 'monthly' or 'yearly'
   * @returns Promise<object> Analytics data
   */
  async getAlumniAnalytics(period: 'monthly' | 'yearly' = 'yearly'): Promise<object> {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      let yearRange: { start: number; end: number };
      
      if (period === 'monthly') {
        // Last 12 months of graduates
        yearRange = { start: currentYear - 1, end: currentYear };
      } else {
        // Last 10 years of graduates
        yearRange = { start: currentYear - 10, end: currentYear };
      }
      
      const alumni = await this.getAlumniByYearRange(yearRange.start, yearRange.end, 1000);
      
      return {
        total_alumni: alumni.length,
        period_range: `${yearRange.start}-${yearRange.end}`,
        graduation_trends: alumni.reduce((acc: Record<number, number>, alumnus) => {
          acc[alumnus.graduation_year] = (acc[alumnus.graduation_year] || 0) + 1;
          return acc;
        }, {}),
        department_distribution: alumni.reduce((acc: Record<string, number>, alumnus) => {
          acc[alumnus.department] = (acc[alumnus.department] || 0) + 1;
          return acc;
        }, {}),
        career_progression: alumni
          .filter(a => a.current_company && a.current_position)
          .reduce((acc: Record<string, number>, alumnus) => {
            const key = `${alumnus.current_company} - ${alumnus.current_position}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {}),
        period,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching alumni analytics:', error);
      throw error;
    }
  }
};

// ===== EXPORT =====

/** Default export for backward compatibility */
export default alumniService;