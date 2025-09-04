import { api } from '@/lib/api';

// Centralized API service with optimized caching and request management
class OptimizedAPIService {
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private ongoingRequests = new Map<string, Promise<any>>();

  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.requestCache.get(cacheKey);
    return cached ? Date.now() - cached.timestamp < cached.ttl : false;
  }

  private getCachedData<T>(cacheKey: string): T | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && this.isCacheValid(cacheKey)) {
      return cached.data as T;
    }
    this.requestCache.delete(cacheKey);
    return null;
  }

  private setCachedData(cacheKey: string, data: any, ttlMinutes: number = 5): void {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    requestFn: () => Promise<{ data: T }>,
    ttlMinutes: number = 5
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint);

    // Return cached data if valid
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check if request is already ongoing
    if (this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey)!;
    }

    // Make new request
    const requestPromise = requestFn()
      .then(response => {
        this.setCachedData(cacheKey, response.data, ttlMinutes);
        this.ongoingRequests.delete(cacheKey);
        return response.data;
      })
      .catch(error => {
        this.ongoingRequests.delete(cacheKey);
        throw error;
      });

    this.ongoingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // Events API
  async getEvents(params?: any): Promise<any[]> {
    return this.makeRequest(
      `events${params ? JSON.stringify(params) : ''}`,
      () => api.events.list(params),
      3 // Cache for 3 minutes
    );
  }

  async getUpcomingEvents(): Promise<any[]> {
    return this.makeRequest(
      'events/upcoming',
      () => api.events.upcoming(),
      5 // Cache for 5 minutes
    );
  }

  async getFeaturedEvents(): Promise<any[]> {
    return this.makeRequest(
      'events/featured',
      () => api.events.featured(),
      10 // Cache for 10 minutes
    );
  }

  async getEvent(id: string): Promise<any> {
    return this.makeRequest(
      `events/${id}`,
      () => api.events.get(id),
      15 // Cache individual events longer
    );
  }

  // Projects API
  async getProjects(params?: any): Promise<any[]> {
    return this.makeRequest(
      `projects${params ? JSON.stringify(params) : ''}`,
      () => api.projects.list(params),
      10 // Cache for 10 minutes
    );
  }

  async getFeaturedProjects(): Promise<any[]> {
    return this.makeRequest(
      'projects/featured',
      () => api.projects.featured(),
      15 // Cache for 15 minutes
    );
  }

  async getProject(id: string): Promise<any> {
    return this.makeRequest(
      `projects/${id}`,
      () => api.projects.get(id),
      20 // Cache individual projects longer
    );
  }

  // Academics API
  async getAcademicSchemes(): Promise<any[]> {
    return this.makeRequest(
      'academics/schemes',
      () => api.academics.schemes(),
      30 // Cache schemes for 30 minutes (rarely change)
    );
  }

  async getAcademicSubjects(params?: any): Promise<any[]> {
    return this.makeRequest(
      `academics/subjects${params ? JSON.stringify(params) : ''}`,
      () => api.academics.subjects(params),
      20 // Cache for 20 minutes
    );
  }

  async getAcademicResources(params?: any): Promise<any[]> {
    return this.makeRequest(
      `academics/resources${params ? JSON.stringify(params) : ''}`,
      () => api.academics.resources(params),
      10 // Cache for 10 minutes
    );
  }

  async getAcademicDepartments(): Promise<any[]> {
    return this.makeRequest(
      'academics/departments',
      () => api.academics.departments(),
      60 // Cache departments for 1 hour (rarely change)
    );
  }

  // Alumni API
  async getAlumni(): Promise<any[]> {
    return this.makeRequest(
      'alumni',
      () => api.alumni.list(),
      15 // Cache for 15 minutes
    );
  }

  // Placements API
  async getPlacementCompanies(): Promise<any[]> {
    return this.makeRequest(
      'placements/companies',
      () => api.placements.companies(),
      30 // Cache for 30 minutes
    );
  }

  async getPlacementStatistics(): Promise<any> {
    return this.makeRequest(
      'placements/statistics',
      () => api.placements.statistics(),
      15 // Cache for 15 minutes
    );
  }

  // Gallery API
  async getGallery(): Promise<any[]> {
    return this.makeRequest(
      'gallery',
      () => api.gallery.list(),
      20 // Cache for 20 minutes
    );
  }

  // Careers API
  async getCareers(): Promise<any[]> {
    return this.makeRequest(
      'careers',
      () => api.careers.list(),
      10 // Cache for 10 minutes
    );
  }

  // Cache management
  clearCache(): void {
    this.requestCache.clear();
    this.ongoingRequests.clear();
  }

  clearCacheByPattern(pattern: string): void {
    for (const key of this.requestCache.keys()) {
      if (key.includes(pattern)) {
        this.requestCache.delete(key);
      }
    }
  }

  // Pre-fetch commonly used data
  async preloadCommonData(): Promise<void> {
    try {
      // Pre-load data that's commonly used across pages
      await Promise.all([
        this.getFeaturedEvents().catch(() => null),
        this.getFeaturedProjects().catch(() => null),
        this.getAcademicSchemes().catch(() => null),
        this.getAcademicDepartments().catch(() => null),
      ]);
    } catch (error) {
      console.warn('Failed to preload some common data:', error);
    }
  }
}

// Export singleton instance
export const optimizedAPI = new OptimizedAPIService();

// Export individual methods for convenience
export const {
  getEvents,
  getUpcomingEvents,
  getFeaturedEvents,
  getEvent,
  getProjects,
  getFeaturedProjects,
  getProject,
  getAcademicSchemes,
  getAcademicSubjects,
  getAcademicResources,
  getAcademicDepartments,
  getAlumni,
  getPlacementCompanies,
  getPlacementStatistics,
  getGallery,
  getCareers,
  clearCache,
  clearCacheByPattern,
  preloadCommonData,
} = optimizedAPI;
