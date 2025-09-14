// Alumni Service - Implementation according to API guide

// Alumni Interface
export interface Alumni {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  batch: {
    id: number;
    batch_group_photo?: string;
  };
  job_title?: string;
  current_company?: string;
  current_location?: string;
  linkedin_profile?: string;
  employment_status: 'employed' | 'unemployed' | 'self_employed' | 'entrepreneur' | 'higher_studies';
  achievements?: string;
  feedback?: string;
  willing_to_mentor: boolean;
  allow_contact_from_juniors: boolean;
  newsletter_subscription: boolean;
  years_since_graduation: number;
  batch_name: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// Batch Interface
export interface AlumniBatch {
  id: number;
  batch_year_range: string;
  batch_name: string;
  batch_description?: string;
  total_alumni: number;
  verified_alumni: number;
  graduation_year: number;
  joining_year: number;
  batch_group_photo?: string;
  employment_stats: {
    total: number;
    employment_rate: number;
  };
  alumni_members?: Alumni[];
  top_companies?: Array<{
    company: string;
    count: number;
  }>;
  created_at: string;
}

// Statistics Interface
export interface BatchStatistics {
  employment_distribution: Record<string, number>;
  location_distribution: Record<string, number>;
  company_distribution: Record<string, number>;
  mentorship_availability: {
    willing_to_mentor: number;
    percentage: number;
  };
  avg_years_experience: number;
  career_progression: Record<string, number>;
}

// API Response interface
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

class AlumniService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Helper method for API calls with proxy
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`/api/proxy?endpoint=alumni/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all alumni with optional filters
  async getAlumni(filters?: {
    batch?: number;
    employment_status?: string;
    current_company?: string;
    current_location?: string;
    willing_to_mentor?: boolean;
    recent_graduates?: boolean;
    search?: string;
  }): Promise<Alumni[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.batch) params.append('batch', filters.batch.toString());
      if (filters?.employment_status) params.append('employment_status', filters.employment_status);
      if (filters?.current_company) params.append('current_company', filters.current_company);
      if (filters?.current_location) params.append('current_location', filters.current_location);
      if (filters?.willing_to_mentor !== undefined) params.append('willing_to_mentor', filters.willing_to_mentor.toString());
      if (filters?.recent_graduates) params.append('recent_graduates', 'true');
      if (filters?.search) params.append('search', filters.search);

      const endpoint = `alumni/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.apiCall<ApiResponse<Alumni>>(endpoint);
      
      return response.results || [];
    } catch (error) {
      console.error('Error fetching alumni:', error);
      return [];
    }
  }

  // Get single alumni
  async getAlumniById(id: number): Promise<Alumni | null> {
    try {
      const alumni = await this.apiCall<Alumni>(`alumni/${id}/`);
      return alumni;
    } catch (error) {
      console.error(`Error fetching alumni ${id}:`, error);
      return null;
    }
  }

  // Get all batches
  async getBatches(): Promise<AlumniBatch[]> {
    try {
      const response = await this.apiCall<ApiResponse<AlumniBatch>>('batches/');
      return response.results || [];
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  }

  // Get single batch with alumni
  async getBatch(id: number): Promise<AlumniBatch | null> {
    try {
      const batch = await this.apiCall<AlumniBatch>(`batches/${id}/`);
      return batch;
    } catch (error) {
      console.error(`Error fetching batch ${id}:`, error);
      return null;
    }
  }

  // Get batch statistics
  async getBatchStatistics(id: number): Promise<BatchStatistics | null> {
    try {
      const stats = await this.apiCall<BatchStatistics>(`batches/${id}/statistics/`);
      return stats;
    } catch (error) {
      console.error(`Error fetching batch statistics ${id}:`, error);
      return null;
    }
  }

  // Get mentors
  async getMentors(): Promise<Alumni[]> {
    try {
      const response = await this.apiCall<ApiResponse<Alumni>>('mentors/');
      return response.results || [];
    } catch (error) {
      console.error('Error fetching mentors:', error);
      return [];
    }
  }

  // Get alumni by company
  async getAlumniByCompany(): Promise<Array<{ company: string; count: number; alumni: Alumni[] }>> {
    try {
      const response = await this.apiCall<{ companies: Array<{ company: string; count: number; alumni: Alumni[] }> }>('companies/');
      return response.companies || [];
    } catch (error) {
      console.error('Error fetching alumni by company:', error);
      return [];
    }
  }

  // Get alumni by location
  async getAlumniByLocation(): Promise<Array<{ location: string; count: number; alumni: Alumni[] }>> {
    try {
      const response = await this.apiCall<{ locations: Array<{ location: string; count: number; alumni: Alumni[] }> }>('locations/');
      return response.locations || [];
    } catch (error) {
      console.error('Error fetching alumni by location:', error);
      return [];
    }
  }

  // Admin functionality moved to separate admin dashboard

  // Get employment status color
  getEmploymentStatusColor(status: string): string {
    switch (status) {
      case 'employed':
        return 'bg-green-100 text-green-800';
      case 'self_employed':
        return 'bg-blue-100 text-blue-800';
      case 'entrepreneur':
        return 'bg-yellow-100 text-yellow-800';
      case 'higher_studies':
        return 'bg-purple-100 text-purple-800';
      case 'unemployed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Format employment status display
  formatEmploymentStatus(status: string): string {
    switch (status) {
      case 'employed':
        return 'Employed';
      case 'self_employed':
        return 'Self Employed';
      case 'entrepreneur':
        return 'Entrepreneur';
      case 'higher_studies':
        return 'Higher Studies';
      case 'unemployed':
        return 'Unemployed';
      default:
        return 'Unknown';
    }
  }

  // Get alumni avatar initials
  getAlumniInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Format years since graduation
  formatYearsSinceGraduation(years: number): string {
    if (years === 0) return 'Recent Graduate';
    if (years === 1) return '1 year';
    return `${years} years`;
  }

  // Search alumni and batches
  async search(query: string): Promise<{
    alumni: Alumni[];
    batches: AlumniBatch[];
  }> {
    try {
      const [alumni, batches] = await Promise.all([
        this.getAlumni({ search: query }),
        this.getBatches(),
      ]);

      // Filter batches by query
      const filteredBatches = batches.filter(batch => 
        batch.batch_name.toLowerCase().includes(query.toLowerCase()) ||
        batch.batch_description?.toLowerCase().includes(query.toLowerCase())
      );

      return { alumni, batches: filteredBatches };
    } catch (error) {
      console.error('Error searching alumni:', error);
      return { alumni: [], batches: [] };
    }
  }

  // Calculate employment rate
  calculateEmploymentRate(alumni: Alumni[]): number {
    if (alumni.length === 0) return 0;
    const employed = alumni.filter(a => 
      a.employment_status === 'employed' || 
      a.employment_status === 'self_employed' || 
      a.employment_status === 'entrepreneur'
    ).length;
    return Math.round((employed / alumni.length) * 100);
  }

  // Get top companies from alumni list
  getTopCompanies(alumni: Alumni[], limit: number = 5): Array<{ company: string; count: number }> {
    const companyCounts: Record<string, number> = {};
    
    alumni.forEach(alum => {
      if (alum.current_company) {
        companyCounts[alum.current_company] = (companyCounts[alum.current_company] || 0) + 1;
      }
    });

    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Get location distribution
  getLocationDistribution(alumni: Alumni[]): Record<string, number> {
    const locationCounts: Record<string, number> = {};
    
    alumni.forEach(alum => {
      if (alum.current_location) {
        locationCounts[alum.current_location] = (locationCounts[alum.current_location] || 0) + 1;
      }
    });

    return locationCounts;
  }
}

export const alumniService = new AlumniService();