import { authService, axiosWithCredentials } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Admin API service with proper authentication
export class AdminAPIService {
  
  // EVENTS API
  async getEvents() {
    try {
      const response = await axiosWithCredentials.get('/api/events/events/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createEvent(eventData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/events/events/', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: number, eventData: any) {
    try {
      const response = await axiosWithCredentials.put(`/api/events/events/${eventId}/`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: number) {
    try {
      await axiosWithCredentials.delete(`/api/events/events/${eventId}/`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // ACADEMICS API
  async getSchemes() {
    try {
      const response = await axiosWithCredentials.get('/api/academics/schemes/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw error;
    }
  }

  async createScheme(schemeData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/academics/schemes/', schemeData);
      return response.data;
    } catch (error) {
      console.error('Error creating scheme:', error);
      throw error;
    }
  }

  async getSubjects(filters?: any) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params.append(key, filters[key]);
          }
        });
      }
      const response = await axiosWithCredentials.get(`/api/academics/subjects/?${params}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async createSubject(subjectData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/academics/subjects/', subjectData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async getResources() {
    try {
      const response = await axiosWithCredentials.get('/api/academics/resources/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  async uploadResource(formData: FormData) {
    try {
      const response = await axiosWithCredentials.post('/api/academics/resources/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading resource:', error);
      throw error;
    }
  }

  // PEOPLE API
  async getTeamMembers() {
    try {
      const response = await axiosWithCredentials.get('/api/team/');
      return response.data.team || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async createTeamMember(memberData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/team/', memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  async getAlumni() {
    try {
      const response = await axiosWithCredentials.get('/api/alumni/alumni/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching alumni:', error);
      throw error;
    }
  }

  async createAlumni(alumniData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/alumni/alumni/', alumniData);
      return response.data;
    } catch (error) {
      console.error('Error creating alumni:', error);
      throw error;
    }
  }

  // CAREERS API
  async getCareers() {
    try {
      const response = await axiosWithCredentials.get('/api/careers/opportunities/');
      return response.data.opportunities || [];
    } catch (error) {
      console.error('Error fetching careers:', error);
      throw error;
    }
  }

  async createCareer(careerData: any) {
    try {
      const response = await axiosWithCredentials.post('/api/careers/opportunities/', careerData);
      return response.data;
    } catch (error) {
      console.error('Error creating career:', error);
      throw error;
    }
  }

  // CATEGORIES API
  async getCategories() {
    try {
      const response = await axiosWithCredentials.get('/api/academics/categories/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export const adminAPI = new AdminAPIService();
