import { apiClient } from './index';

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string;
  description: string;
  requirements: string;
  application_deadline?: string;
  salary_range?: string;
  is_remote: boolean;
  is_active: boolean;
  posted_at: string;
  application_url?: string;
}

export interface InternshipOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  internship_type: 'summer' | 'winter' | 'semester' | 'project_based';
  duration_months: number;
  skills: string;
  description: string;
  requirements: string;
  start_date?: string;
  application_deadline?: string;
  stipend_amount?: number;
  is_remote: boolean;
  is_paid: boolean;
  is_active: boolean;
  posted_at: string;
  application_url?: string;
}

export interface CertificateOpportunity {
  id: string;
  title: string;
  provider: string;
  certificate_type: 'professional' | 'academic' | 'skill_based' | 'industry';
  skills_covered: string;
  description: string;
  requirements: string;
  duration_weeks: number;
  validity_till?: string;
  cost_amount?: number;
  is_free: boolean;
  financial_aid_available: boolean;
  is_active: boolean;
  posted_at: string;
  registration_url?: string;
}

export interface CareerFilters {
  search?: string;
  job_type?: string;
  experience_level?: string;
  location?: string;
  is_remote?: boolean;
  company?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

export interface InternshipFilters {
  search?: string;
  internship_type?: string;
  is_remote?: boolean;
  is_paid?: boolean;
  company?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

export interface CertificateFilters {
  search?: string;
  certificate_type?: string;
  provider?: string;
  is_free?: boolean;
  financial_aid_available?: boolean;
  limit?: number;
  offset?: number;
  ordering?: string;
}

class CareersService {
  private baseUrl = '/careers';

  // Job Opportunities
  async getJobs(filters?: CareerFilters): Promise<JobOpportunity[]> {
    try {
      const params = new URLSearchParams();
      
      // Optimize search for full-text search index
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (filters?.job_type) params.append('job_type', filters.job_type);
      if (filters?.experience_level) params.append('experience_level', filters.experience_level);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.is_remote !== undefined) params.append('is_remote', filters.is_remote.toString());
      if (filters?.company) params.append('company', filters.company);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Leverage active index for performance
      if (filters?.ordering) {
        params.append('ordering', filters.ordering);
      } else {
        params.append('ordering', '-posted_at'); // Default: newest first, uses idx_careers_job_active_posted
      }

      const response = await apiClient.get(`${this.baseUrl}/jobs/?${params}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch job opportunities');
    }
  }

  async getJobById(id: string): Promise<JobOpportunity> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw new Error('Failed to fetch job details');
    }
  }

  // Internship Opportunities
  async getInternships(filters?: InternshipFilters): Promise<InternshipOpportunity[]> {
    try {
      const params = new URLSearchParams();
      
      // Optimize search for full-text search index
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (filters?.internship_type) params.append('internship_type', filters.internship_type);
      if (filters?.is_remote !== undefined) params.append('is_remote', filters.is_remote.toString());
      if (filters?.is_paid !== undefined) params.append('is_paid', filters.is_paid.toString());
      if (filters?.company) params.append('company', filters.company);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Leverage active index for performance
      if (filters?.ordering) {
        params.append('ordering', filters.ordering);
      } else {
        params.append('ordering', '-posted_at'); // Uses idx_careers_internship_active
      }

      const response = await apiClient.get(`${this.baseUrl}/internships/?${params}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw new Error('Failed to fetch internship opportunities');
    }
  }

  async getInternshipById(id: string): Promise<InternshipOpportunity> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/internships/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching internship by ID:', error);
      throw new Error('Failed to fetch internship details');
    }
  }

  // Certificate Opportunities
  async getCertificates(filters?: CertificateFilters): Promise<CertificateOpportunity[]> {
    try {
      const params = new URLSearchParams();
      
      // Optimize search for full-text search index
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (filters?.certificate_type) params.append('certificate_type', filters.certificate_type);
      if (filters?.provider) params.append('provider', filters.provider);
      if (filters?.is_free !== undefined) params.append('is_free', filters.is_free.toString());
      if (filters?.financial_aid_available !== undefined) params.append('financial_aid_available', filters.financial_aid_available.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Leverage active index for performance
      if (filters?.ordering) {
        params.append('ordering', filters.ordering);
      } else {
        params.append('ordering', '-posted_at'); // Uses idx_careers_certificate_active
      }

      const response = await apiClient.get(`${this.baseUrl}/certificates/?${params}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw new Error('Failed to fetch certificate opportunities');
    }
  }

  async getCertificateById(id: string): Promise<CertificateOpportunity> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/certificates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate by ID:', error);
      throw new Error('Failed to fetch certificate details');
    }
  }

  // Featured/Recommended items (uses various indexes for performance)
  async getFeaturedJobs(): Promise<JobOpportunity[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/jobs/featured/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw new Error('Failed to fetch featured jobs');
    }
  }

  async getRecentJobs(limit: number = 10): Promise<JobOpportunity[]> {
    try {
      // Uses idx_careers_job_active_posted for optimized performance
      const response = await apiClient.get(`${this.baseUrl}/jobs/?limit=${limit}&ordering=-posted_at`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
      throw new Error('Failed to fetch recent jobs');
    }
  }

  async getJobsWithDeadline(): Promise<JobOpportunity[]> {
    try {
      // Uses idx_careers_job_deadline for optimized performance
      const response = await apiClient.get(`${this.baseUrl}/jobs/with-deadline/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching jobs with deadline:', error);
      throw new Error('Failed to fetch jobs with deadline');
    }
  }

  // Analytics and stats (uses various indexes)
  async getCareerStats(): Promise<{
    total_jobs: number;
    total_internships: number;
    total_certificates: number;
    active_jobs: number;
    remote_jobs: number;
    free_certificates: number;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching career stats:', error);
      throw new Error('Failed to fetch career statistics');
    }
  }

  // Utility functions
  getJobTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
    };
    return typeMap[type] || type;
  }

  getExperienceLevelLabel(level: string): string {
    const levelMap: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior Level',
      executive: 'Executive Level',
    };
    return levelMap[level] || level;
  }

  getCertificateTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      professional: 'Professional',
      academic: 'Academic',
      skill_based: 'Skill-Based',
      industry: 'Industry',
    };
    return typeMap[type] || type;
  }

  getJobTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      full_time: 'bg-green-100 text-green-800',
      part_time: 'bg-blue-100 text-blue-800',
      contract: 'bg-orange-100 text-orange-800',
      internship: 'bg-purple-100 text-purple-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  }

  getExperienceLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      entry: 'bg-green-100 text-green-800',
      mid: 'bg-blue-100 text-blue-800',
      senior: 'bg-purple-100 text-purple-800',
      executive: 'bg-red-100 text-red-800',
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  }
}

export const careersService = new CareersService();
export default careersService;
