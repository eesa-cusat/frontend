import { api } from '@/lib/api';
import { Event } from '@/types/api';
import { ApiResponse } from '@/types/common';

export interface EventRegistrationData {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_semester?: number;
  guest_department?: string;
}

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

export const eventsService = {
  // Get all events with optimized filters for database indexes
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      
      // Optimize search for full-text search index (idx_events_event_search)
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (filters?.event_type) params.append('event_type', filters.event_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.is_upcoming !== undefined) params.append('is_upcoming', filters.is_upcoming.toString());
      if (filters?.is_past !== undefined) params.append('is_past', filters.is_past.toString());
      if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.registration_required !== undefined) params.append('registration_required', filters.registration_required.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      // Leverage idx_events_event_status_featured and idx_events_event_dates indexes
      if (filters?.ordering) {
        params.append('ordering', filters.ordering);
      } else {
        params.append('ordering', '-start_date'); // Default: newest events first
      }

      const response = await api.events.list(Object.fromEntries(params));
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get upcoming events (leverages idx_events_event_dates)
  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    try {
      // Use the specific upcoming endpoint
      const response = await api.events.upcoming();
      let events = response.data.results || response.data;
      
      // Apply limit if specified
      if (limit && Array.isArray(events)) {
        events = events.slice(0, limit);
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      // Fallback to general list with filters
      return this.getEvents({ is_upcoming: true, ordering: 'start_date', limit });
    }
  },

  // Get featured events (leverages idx_events_event_status_featured)
  async getFeaturedEvents(limit?: number): Promise<Event[]> {
    try {
      // Use the specific featured endpoint
      const response = await api.events.featured();
      let events = response.data.results || response.data;
      
      // Apply limit if specified
      if (limit && Array.isArray(events)) {
        events = events.slice(0, limit);
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      // Fallback to general list with filters
      return this.getEvents({ is_featured: true, status: 'published', ordering: '-start_date', limit });
    }
  },

  // Get events with registration (leverages idx_events_event_registration)
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

  // Get events by type (leverages idx_events_event_type_status)
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

  // Get events for date range (leverages idx_events_event_dates)
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

  // Search events with full-text search (leverages idx_events_event_search)
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

  // Get event statistics (leverages analytics indexes)
  async getEventStatistics(): Promise<any> {
    try {
      const response = await api.events.stats();
      return response.data;
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      throw error;
    }
  },

  // Get event analytics for dashboard (leverages monthly/yearly analytics indexes)
  async getEventAnalytics(period: 'monthly' | 'yearly' = 'monthly'): Promise<any> {
    try {
      const currentDate = new Date();
      let startDate: string;
      
      if (period === 'monthly') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
      }
      
      const endDate = currentDate.toISOString().split('T')[0];
      
      // Get events for analytics period
      const events = await this.getEventsInDateRange(startDate, endDate);
      
      // Calculate analytics
      return {
        total_events: events.length,
        upcoming_events: events.filter(e => new Date(e.start_date) > new Date()).length,
        past_events: events.filter(e => new Date(e.start_date) <= new Date()).length,
        featured_events: events.filter(e => e.is_featured).length,
        events_by_type: events.reduce((acc: any, event) => {
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

  // Get a single event by ID
  async getEvent(id: string): Promise<Event> {
    try {
      const response = await api.events.get(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Register for an event (guest registration)
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

  // Get event statistics
  async getEventStats(): Promise<any> {
    try {
      const response = await api.events.stats();
      return response.data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  },
};