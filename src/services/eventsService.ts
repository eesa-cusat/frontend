// Events Service - Implementation according to API guide

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

class EventsService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Helper method for API calls with proxy
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`/api/proxy?endpoint=events/${endpoint}`, {
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
      const params = new URLSearchParams();
      
      if (filters?.event_type) params.append('event_type', filters.event_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.upcoming) params.append('upcoming', 'true');
      if (filters?.featured) params.append('featured', 'true');
      if (filters?.start_date_after) params.append('start_date_after', filters.start_date_after);
      if (filters?.start_date_before) params.append('start_date_before', filters.start_date_before);
      if (filters?.registration_open) params.append('registration_open', 'true');
      if (filters?.search) params.append('search', filters.search);

      const endpoint = `events/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.apiCall<ApiResponse<Event>>(endpoint);
      
      return response.results || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Get single event with full details
  async getEvent(id: number): Promise<Event | null> {
    try {
      const event = await this.apiCall<Event>(`events/${id}/`);
      return event;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      return null;
    }
  }

  // Create new event (Admin only)
  async createEvent(eventData: {
    title: string;
    description: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location?: string;
    venue?: string;
    registration_required?: boolean;
    max_participants?: number;
    registration_fee?: string;
    payment_required?: boolean;
    contact_email?: string;
  }): Promise<Event | null> {
    try {
      const event = await this.apiCall<Event>('events/', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  // Update event
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | null> {
    try {
      const event = await this.apiCall<Event>(`events/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(eventData),
      });
      return event;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      return null;
    }
  }

  // Delete event
  async deleteEvent(id: number): Promise<boolean> {
    try {
      await this.apiCall(`events/${id}/`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      return false;
    }
  }

  // Register for event
  async registerForEvent(eventId: number, registrationData: {
    name: string;
    email: string;
    mobile_number?: string;
    institution?: string;
    department?: string;
    year_of_study?: string;
    dietary_requirements?: string;
    special_needs?: string;
  }): Promise<EventRegistration | null> {
    try {
      const registration = await this.apiCall<EventRegistration>(`events/${eventId}/register/`, {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
      return registration;
    } catch (error) {
      console.error(`Error registering for event ${eventId}:`, error);
      return null;
    }
  }

  // Get my registrations
  async getMyRegistrations(): Promise<EventRegistration[]> {
    try {
      const response = await this.apiCall<ApiResponse<EventRegistration>>('my-registrations/');
      return response.results || [];
    } catch (error) {
      console.error('Error fetching my registrations:', error);
      return [];
    }
  }

  // Get event registrations (Admin only)
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    try {
      const response = await this.apiCall<ApiResponse<EventRegistration>>(`events/${eventId}/registrations/`);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching registrations for event ${eventId}:`, error);
      return [];
    }
  }

  // Update payment status (Admin only)
  async updatePaymentStatus(registrationId: number, paymentData: {
    payment_status: 'pending' | 'paid' | 'failed';
    payment_reference?: string;
    payment_date?: string;
  }): Promise<EventRegistration | null> {
    try {
      const registration = await this.apiCall<EventRegistration>(`registrations/${registrationId}/`, {
        method: 'PATCH',
        body: JSON.stringify(paymentData),
      });
      return registration;
    } catch (error) {
      console.error(`Error updating payment status for registration ${registrationId}:`, error);
      return null;
    }
  }

  // Get event speakers
  async getEventSpeakers(eventId: number): Promise<EventSpeaker[]> {
    try {
      const response = await this.apiCall<ApiResponse<EventSpeaker>>(`events/${eventId}/speakers/`);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching speakers for event ${eventId}:`, error);
      return [];
    }
  }

  // Get all speakers
  async getAllSpeakers(): Promise<EventSpeaker[]> {
    try {
      const response = await this.apiCall<ApiResponse<EventSpeaker>>('speakers/');
      return response.results || [];
    } catch (error) {
      console.error('Error fetching all speakers:', error);
      return [];
    }
  }

  // Add speaker to event (Admin only)
  async addSpeakerToEvent(eventId: number, speakerData: {
    name: string;
    title?: string;
    organization?: string;
    bio?: string;
    talk_title?: string;
    talk_duration?: number;
    linkedin_url?: string;
  }): Promise<EventSpeaker | null> {
    try {
      const speaker = await this.apiCall<EventSpeaker>(`events/${eventId}/speakers/`, {
        method: 'POST',
        body: JSON.stringify(speakerData),
      });
      return speaker;
    } catch (error) {
      console.error(`Error adding speaker to event ${eventId}:`, error);
      return null;
    }
  }

  // Get active notifications
  async getNotifications(): Promise<EventNotification[]> {
    try {
      const response = await this.apiCall<ApiResponse<EventNotification>>('notifications/');
      return response.results || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Increment notification views
  async incrementNotificationViews(notificationId: number): Promise<boolean> {
    try {
      await this.apiCall(`notifications/${notificationId}/view/`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error(`Error incrementing views for notification ${notificationId}:`, error);
      return false;
    }
  }

  // Increment notification clicks
  async incrementNotificationClicks(notificationId: number): Promise<boolean> {
    try {
      await this.apiCall(`notifications/${notificationId}/click/`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error(`Error incrementing clicks for notification ${notificationId}:`, error);
      return false;
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

  // Search events and speakers
  async search(query: string): Promise<{
    events: Event[];
    speakers: EventSpeaker[];
  }> {
    try {
      const [events, speakers] = await Promise.all([
        this.getEvents({ search: query }),
        this.getAllSpeakers(),
      ]);

      // Filter speakers by query
      const filteredSpeakers = speakers.filter(speaker => 
        speaker.name.toLowerCase().includes(query.toLowerCase()) ||
        speaker.organization?.toLowerCase().includes(query.toLowerCase()) ||
        speaker.talk_title?.toLowerCase().includes(query.toLowerCase())
      );

      return { events, speakers: filteredSpeakers };
    } catch (error) {
      console.error('Error searching events:', error);
      return { events: [], speakers: [] };
    }
  }
}

export const eventsService = new EventsService();
export default eventsService;