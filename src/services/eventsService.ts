/**
 * @fileoverview Events Management Service
 * @description Production-ready service for managing events with optimized database queries
 * @author EESA Frontend Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';
import { Event } from '@/types/api';

// ===== TYPE DEFINITIONS =====

/** Event registration data interface */
export interface EventRegistrationData {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_semester?: number;
  guest_department?: string;
}

/** Event filter interface for optimized database queries */
export interface EventFilters {
  search?: string;
  event_type?: string;
  status?: string;
  is_upcoming?: boolean;
  is_past?: boolean;
  is_featured?: boolean;
  start_date?: string;
  end_date?: string;
  location?: string;
  registration_required?: boolean;
  limit?: number;
  offset?: number;
  ordering?: string;
}

/** Event statistics interface */
export interface EventStatistics {
  total_events: number;
  upcoming_events: number;
  past_events: number;
  featured_events: number;
  events_by_type: Record<string, number>;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
}

// ===== MAIN SERVICE =====

/**
 * Events Service
 * Provides optimized methods for event management with database index utilization
 */
export const eventsService = {
  
  // ===== CORE EVENT RETRIEVAL =====
  
  /**
   * Retrieves events with comprehensive filtering
   * @description Leverages database indexes: idx_events_event_search, idx_events_event_status_featured, idx_events_event_dates
   * @param filters Optional filter parameters
   * @returns Promise<Event[]> Filtered array of events
   */
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      
      // Full-text search optimization (idx_events_event_search)
      if (filters?.search) params.append('search', filters.search);
      
      // Status and feature filtering (idx_events_event_status_featured)
      if (filters?.event_type) params.append('event_type', filters.event_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.is_upcoming !== undefined) params.append('is_upcoming', filters.is_upcoming.toString());
      if (filters?.is_past !== undefined) params.append('is_past', filters.is_past.toString());
      if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
      
      // Date range filtering (idx_events_event_dates)
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      
      // Additional filters
      if (filters?.location) params.append('location', filters.location);
      if (filters?.registration_required !== undefined) params.append('registration_required', filters.registration_required.toString());
      
      // Pagination
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Optimized ordering (leverages date indexes)
      const ordering = filters?.ordering || '-start_date';
      params.append('ordering', ordering);

      const response = await api.events.list(Object.fromEntries(params));
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Retrieves upcoming events
   * @description Leverages idx_events_event_dates for optimal date filtering
   * @param limit Optional limit for number of events
   * @returns Promise<Event[]> Array of upcoming events
   */
  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    try {
      const response = await api.events.upcoming();
      let events = response.data.results || response.data;
      
      if (limit && Array.isArray(events)) {
        events = events.slice(0, limit);
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      // Fallback with optimized filters
      return this.getEvents({ 
        is_upcoming: true, 
        ordering: 'start_date', 
        limit,
        status: 'published'
      });
    }
  },

  /**
   * Retrieves featured events
   * @description Leverages idx_events_event_status_featured for optimal filtering
   * @param limit Optional limit for number of events
   * @returns Promise<Event[]> Array of featured events
   */
  async getFeaturedEvents(limit?: number): Promise<Event[]> {
    try {
      const response = await api.events.featured();
      let events = response.data.results || response.data;
      
      if (limit && Array.isArray(events)) {
        events = events.slice(0, limit);
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      // Fallback with optimized filters
      return this.getEvents({ 
        is_featured: true, 
        status: 'published', 
        ordering: '-start_date', 
        limit 
      });
    }
  },

  /**
   * Retrieves events requiring registration
   * @description Leverages idx_events_event_registration for optimal filtering
   * @returns Promise<Event[]> Array of events with registration
   */
  async getEventsWithRegistration(): Promise<Event[]> {
    try {
      const response = await api.events.list({
        registration_required: true,
        status: 'published',
        ordering: 'registration_deadline'
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events with registration:', error);
      throw error;
    }
  },

  // ===== SPECIALIZED QUERIES =====

  /**
   * Retrieves events by type
   * @description Leverages idx_events_event_type_status for optimal filtering
   * @param eventType Type of events to retrieve
   * @param limit Optional limit for number of events
   * @returns Promise<Event[]> Array of events by type
   */
  async getEventsByType(eventType: string, limit?: number): Promise<Event[]> {
    try {
      const params: any = { 
        event_type: eventType, 
        status: 'published',
        ordering: '-start_date'
      };
      if (limit) params.limit = limit;
      
      const response = await api.events.list(params);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events by type:', error);
      throw error;
    }
  },

  /**
   * Retrieves events within a date range
   * @description Leverages idx_events_event_dates for optimal date filtering
   * @param startDate Start date (YYYY-MM-DD format)
   * @param endDate End date (YYYY-MM-DD format)
   * @returns Promise<Event[]> Array of events in date range
   */
  async getEventsInDateRange(startDate: string, endDate: string): Promise<Event[]> {
    try {
      const response = await api.events.list({
        start_date: startDate,
        end_date: endDate,
        ordering: 'start_date'
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events in date range:', error);
      throw error;
    }
  },

  /**
   * Searches events with full-text search
   * @description Leverages idx_events_event_search for optimal text search
   * @param searchTerm Search term for events
   * @param filters Additional filter parameters
   * @returns Promise<Event[]> Array of matching events
   */
  async searchEvents(searchTerm: string, filters?: Partial<EventFilters>): Promise<Event[]> {
    try {
      const searchFilters: EventFilters = {
        search: searchTerm,
        status: 'published',
        ordering: '-start_date',
        ...filters
      };
      
      return this.getEvents(searchFilters);
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },

  // ===== SINGLE EVENT OPERATIONS =====

  /**
   * Retrieves a single event by ID
   * @description Uses primary key index for optimal performance
   * @param id Event identifier
   * @returns Promise<Event> Event details
   */
  async getEvent(id: string): Promise<Event> {
    try {
      const response = await api.events.get(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Registers a guest for an event
   * @description Creates event registration with atomic operations
   * @param eventId Event identifier
   * @param registrationData Guest registration information
   * @returns Promise<any> Registration confirmation
   */
  async registerForEvent(eventId: number, registrationData: EventRegistrationData): Promise<any> {
    try {
      const response = await api.events.register({
        event: eventId,
        ...registrationData,
      });
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  // ===== ANALYTICS & STATISTICS =====

  /**
   * Retrieves comprehensive event statistics
   * @description Leverages analytics indexes for aggregated data
   * @returns Promise<any> Event statistics summary
   */
  async getEventStatistics(): Promise<any> {
    try {
      const response = await api.events.stats();
      return response.data;
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      throw error;
    }
  },

  /**
   * Retrieves event analytics for specified period
   * @description Calculates analytics using optimized date range queries
   * @param period Analysis period - 'monthly' or 'yearly'
   * @returns Promise<EventStatistics> Analytics data
   */
  async getEventAnalytics(period: 'monthly' | 'yearly' = 'monthly'): Promise<EventStatistics> {
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
      
      // Fetch events for analytics period
      const events = await this.getEventsInDateRange(startDate, endDate);
      
      // Calculate comprehensive analytics
      return {
        total_events: events.length,
        upcoming_events: events.filter(e => new Date(e.start_date) > new Date()).length,
        past_events: events.filter(e => new Date(e.start_date) <= new Date()).length,
        featured_events: events.filter(e => e.is_featured).length,
        events_by_type: events.reduce((acc: Record<string, number>, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {}),
        period,
        start_date: startDate,
        end_date: endDate
      };
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      throw error;
    }
  },

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getEventStatistics() instead
   */
  async getEventStats(): Promise<any> {
    console.warn('getEventStats() is deprecated. Use getEventStatistics() instead.');
    return this.getEventStatistics();
  }
};

// ===== EXPORT =====

/** Default export for backward compatibility */
export default eventsService;