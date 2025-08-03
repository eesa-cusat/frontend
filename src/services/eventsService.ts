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
  limit?: number;
  offset?: number;
}

export const eventsService = {
  // Get all events with optional filters
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await api.events.list(filters);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const response = await api.events.upcoming();
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Get featured events
  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const response = await api.events.featured();
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
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