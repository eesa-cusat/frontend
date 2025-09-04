import { api } from '@/lib/api';

export interface PlacementCompany {
  id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  company_type?: string;
  location?: string;
  is_active?: boolean;
}

export interface PlacementDrive {
  id: string;
  company: string;
  position: string;
  description?: string;
  requirements?: string;
  package_offered?: number;
  deadline: string;
  drive_date: string;
  is_active?: boolean;
  is_open?: boolean;
}

export interface PlacementStatistics {
  total_companies: number;
  active_drives: number;
  placed_students: number;
  average_package: number;
}

export interface PlacementFilters {
  search?: string;
  company?: string;
  position?: string;
  industry?: string;
  company_type?: string;
  location?: string;
  package_min?: number;
  package_max?: number;
  is_active?: boolean;
  is_open?: boolean;
  drive_date_start?: string;
  drive_date_end?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}

export const placementsService = {
  // Get placement companies with optimized filters
  async getPlacementCompanies(filters?: Partial<PlacementFilters>): Promise<PlacementCompany[]> {
    try {
      const params: any = {};
      
      if (filters?.search) params.search = filters.search;
      if (filters?.industry) params.industry = filters.industry;
      if (filters?.company_type) params.company_type = filters.company_type;
      if (filters?.location) params.location = filters.location;
      if (filters?.is_active !== undefined) params.is_active = filters.is_active;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      params.ordering = filters?.ordering || 'name';

      const response = await api.placements.companies(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching placement companies:', error);
      throw error;
    }
  },

  // Get placement drives with optimized filters (leverages idx_placements_drive_company_active)
  async getPlacementDrives(filters?: PlacementFilters): Promise<PlacementDrive[]> {
    try {
      const params: any = {};
      
      // Optimize search for full-text search
      if (filters?.search) params.search = filters.search;
      if (filters?.company) params.company = filters.company;
      if (filters?.position) params.position = filters.position;
      if (filters?.package_min) params.package_min = filters.package_min;
      if (filters?.package_max) params.package_max = filters.package_max;
      if (filters?.is_active !== undefined) params.is_active = filters.is_active;
      if (filters?.is_open !== undefined) params.is_open = filters.is_open;
      if (filters?.drive_date_start) params.drive_date_start = filters.drive_date_start;
      if (filters?.drive_date_end) params.drive_date_end = filters.drive_date_end;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;
      
      // Leverage idx_placements_drive_date and idx_placements_drive_company_active indexes
      params.ordering = filters?.ordering || '-drive_date';

      const response = await api.placements.drives(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching placement drives:', error);
      throw error;
    }
  },

  // Get active placement drives (leverages idx_placements_drive_company_active)
  async getActivePlacementDrives(limit?: number): Promise<PlacementDrive[]> {
    try {
      return this.getPlacementDrives({ 
        is_active: true, 
        is_open: true,
        ordering: 'drive_date',
        limit 
      });
    } catch (error) {
      console.error('Error fetching active placement drives:', error);
      throw error;
    }
  },

  // Get placement drives by company
  async getPlacementDrivesByCompany(company: string, limit?: number): Promise<PlacementDrive[]> {
    try {
      return this.getPlacementDrives({ 
        company, 
        ordering: '-drive_date',
        limit 
      });
    } catch (error) {
      console.error('Error fetching placement drives by company:', error);
      throw error;
    }
  },

  // Get placement drives by date range (leverages idx_placements_drive_date)
  async getPlacementDrivesInDateRange(startDate: string, endDate: string): Promise<PlacementDrive[]> {
    try {
      return this.getPlacementDrives({
        drive_date_start: startDate,
        drive_date_end: endDate,
        ordering: 'drive_date'
      });
    } catch (error) {
      console.error('Error fetching placement drives in date range:', error);
      throw error;
    }
  },

  // Search placement drives with full-text search
  async searchPlacementDrives(searchTerm: string, filters?: Partial<PlacementFilters>): Promise<PlacementDrive[]> {
    try {
      const searchFilters: PlacementFilters = {
        search: searchTerm,
        is_active: true,
        ordering: '-drive_date',
        ...filters
      };
      
      return this.getPlacementDrives(searchFilters);
    } catch (error) {
      console.error('Error searching placement drives:', error);
      throw error;
    }
  },

  // Get placement statistics (leverages analytics indexes)
  async getPlacementStatistics(): Promise<PlacementStatistics> {
    try {
      const response = await api.placements.statistics();
      return response.data;
    } catch (error) {
      console.error('Error fetching placement statistics:', error);
      // Fallback to calculating from available data
      const [companies, drives] = await Promise.all([
        this.getPlacementCompanies({ limit: 1000 }),
        this.getPlacementDrives({ limit: 1000 })
      ]);
      
      const activeDrives = drives.filter(drive => drive.is_active);
      const packagesOffered = drives
        .filter(drive => drive.package_offered)
        .map(drive => drive.package_offered || 0);
      
      return {
        total_companies: companies.length,
        active_drives: activeDrives.length,
        placed_students: 0, // Would need separate API endpoint
        average_package: packagesOffered.length > 0 
          ? packagesOffered.reduce((sum, pkg) => sum + pkg, 0) / packagesOffered.length 
          : 0
      };
    }
  },

  // Get placement analytics for dashboard
  async getPlacementAnalytics(period: 'monthly' | 'yearly' = 'monthly'): Promise<any> {
    try {
      const currentDate = new Date();
      let startDate: string;
      
      if (period === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
      }
      
      const endDate = currentDate.toISOString().split('T')[0];
      
      // Get placement drives for analytics period
      const drives = await this.getPlacementDrivesInDateRange(startDate, endDate);
      
      return {
        total_drives: drives.length,
        active_drives: drives.filter(d => d.is_active).length,
        companies_participating: new Set(drives.map(d => d.company)).size,
        positions_offered: new Set(drives.map(d => d.position)).size,
        package_distribution: this.analyzePackageDistribution(drives),
        drive_timeline: this.analyzeDriveTimeline(drives),
        period,
        start_date: startDate,
        end_date: endDate
      };
    } catch (error) {
      console.error('Error fetching placement analytics:', error);
      throw error;
    }
  },

  // Helper method to analyze package distribution
  analyzePackageDistribution(drives: PlacementDrive[]): any {
    const packages = drives
      .filter(drive => drive.package_offered)
      .map(drive => drive.package_offered || 0);
    
    if (packages.length === 0) return {};
    
    const ranges = {
      '0-5L': 0,
      '5-10L': 0,
      '10-15L': 0,
      '15L+': 0
    };
    
    packages.forEach(pkg => {
      if (pkg < 500000) ranges['0-5L']++;
      else if (pkg < 1000000) ranges['5-10L']++;
      else if (pkg < 1500000) ranges['10-15L']++;
      else ranges['15L+']++;
    });
    
    return {
      ranges,
      average: packages.reduce((sum, pkg) => sum + pkg, 0) / packages.length,
      median: packages.sort((a, b) => a - b)[Math.floor(packages.length / 2)],
      highest: Math.max(...packages),
      lowest: Math.min(...packages)
    };
  },

  // Helper method to analyze drive timeline
  analyzeDriveTimeline(drives: PlacementDrive[]): any {
    const drivesByMonth: { [key: string]: number } = {};
    
    drives.forEach(drive => {
      const month = new Date(drive.drive_date).toISOString().substring(0, 7); // YYYY-MM
      drivesByMonth[month] = (drivesByMonth[month] || 0) + 1;
    });
    
    return drivesByMonth;
  }
};

export default placementsService;
