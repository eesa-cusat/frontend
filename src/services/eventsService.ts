// Events Service - Implementation according to API guide

// Album Interface (for event gallery)
export interface EventAlbum {
  id: number;
  name: string;
  type: string;
  description: string;
  cover_image?: string;
  event: number;
  batch_year?: number;
  event_title: string;
  batch_info?: any;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
  photo_count: number;
  photos?: EventPhoto[];
}

// Photo Interface (for album photos)
export interface EventPhoto {
  id: number;
  image: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
}

// Event Interface
export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  status: 'draft' | 'published' | 'cancelled';
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  location?: string;
  venue?: string;
  address?: string;
  is_online: boolean;
  meeting_link?: string;
  registration_required: boolean;
  max_participants?: number;
  registration_fee?: string;
  payment_required: boolean;
  payment_qr_code?: string;
  payment_upi_id?: string;
  payment_instructions?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  banner_image?: string;
  event_flyer?: string;
  is_active: boolean;
  is_featured: boolean;
  registration_count: number;
  spots_remaining: number;
  is_upcoming: boolean;
  is_past: boolean;
  is_ongoing: boolean;
  is_registration_open: boolean;
  created_at: string;
  gallery_album_id?: number;
  photo_count?: number;
  album?: EventAlbum;  // Full album object when fetched from detail endpoint
  speakers?: EventSpeaker[];
  schedule?: EventSchedule[];
}

// Event Speaker Interface
export interface EventSpeaker {
  id: number;
  order: number;
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  talk_title?: string;
  talk_duration?: number;
  linkedin_url?: string;
  profile_image?: string;
}

// Event Schedule Interface
export interface EventSchedule {
  id: number;
  venue_details: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  speaker?: EventSpeaker;
}

// Event Registration Interface
export interface EventRegistration {
  id: number;
  event: {
    id: number;
    title: string;
    start_date: string;
  };
  name: string;
  email: string;
  mobile_number?: string;
  institution?: string;
  department?: string;
  year_of_study?: string;
  dietary_requirements?: string;
  special_needs?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_amount?: string;
  payment_reference?: string;
  payment_date?: string;
  registered_at: string;
  attended: boolean;
  certificate_issued: boolean;
}

// Notification Interface
export interface EventNotification {
  id: number;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  is_marquee: boolean;
  start_date?: string;
  end_date?: string;
  priority: number;
  target_url?: string;
  view_count: number;
  click_count: number;
  created_at: string;
}

// API Response interface
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

import { api } from '@/lib/api';
class EventsService {

  // Get all events with optional filters
  async getEvents(filters?: {
    event_type?: string;
    status?: string;
    upcoming?: boolean;
    featured?: boolean;
    start_date_after?: string;
    start_date_before?: string;
    registration_open?: boolean;
    search?: string;
  }): Promise<Event[]> {
    try {
      const params: any = {};
      if (filters?.event_type) params.event_type = filters.event_type;
      if (filters?.status) params.status = filters.status;
      if (filters?.upcoming) params.upcoming = filters.upcoming;
      if (filters?.featured) params.featured = filters.featured;
      if (filters?.start_date_after) params.start_date_after = filters.start_date_after;
      if (filters?.start_date_before) params.start_date_before = filters.start_date_before;
      if (filters?.registration_open) params.registration_open = filters.registration_open;
      if (filters?.search) params.search = filters.search;
      const response = await api.events.list(params);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Get single event with full details
  async getEvent(id: number): Promise<Event | null> {
    try {
      const response = await api.events.get(String(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      return null;
    }
  }


  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getEventTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'workshop':
        return 'bg-blue-100 text-blue-800';
      case 'seminar':
        return 'bg-green-100 text-green-800';
      case 'conference':
        return 'bg-purple-100 text-purple-800';
      case 'hackathon':
        return 'bg-orange-100 text-orange-800';
      case 'webinar':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Check if event is full
  isEventFull(event: Event): boolean {
    return event.max_participants ? event.registration_count >= event.max_participants : false;
  }

  // Check if registration is still open
  isRegistrationOpen(event: Event): boolean {
    if (!event.registration_required) return false;
    if (this.isEventFull(event)) return false;
    if (event.registration_deadline) {
      return new Date() < new Date(event.registration_deadline);
    }
    return new Date() < new Date(event.start_date);
  }

  // Register for an event
  async registerForEvent(eventId: number, registrationData: any): Promise<EventRegistration | null> {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration error details:', data);
        throw new Error(data.error || `Registration failed with status ${response.status}`);
      }

      // Check if this is a configuration message
      if (data.suggestion) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  // Get event status (upcoming, ongoing, past)
  getEventStatus(event: Event): 'upcoming' | 'ongoing' | 'past' {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'past';
  }

  // Calculate days until event
  getDaysUntilEvent(event: Event): number {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const diffTime = startDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

}

export const eventsService = new EventsService();
export default eventsService;