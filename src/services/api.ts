import { axiosWithCredentials } from './auth';
import type { 
  Subject, 
  Scheme, 
  Event, 
  CareerOpportunity,
  TeamMember,
  Project,
  EventCreate,
  CareerCreate,
  ProjectCreate
} from '@/types/api';

// Academics API
export const academicsAPI = {
  getSubjects: async () => {
    const response = await axiosWithCredentials.get('/api/academics/subjects/');
    return response.data;
  },

  createSubject: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/academics/subjects/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateSubject: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/academics/subjects/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteSubject: async (id: number) => {
    await axiosWithCredentials.delete(`/api/academics/subjects/${id}/`);
  },

  getSchemes: async () => {
    const response = await axiosWithCredentials.get('/api/academics/schemes/');
    return response.data;
  },

  createScheme: async (data: Partial<Scheme>) => {
    const response = await axiosWithCredentials.post('/api/academics/schemes/', data);
    return response.data;
  },

  updateScheme: async (id: number, data: Partial<Scheme>) => {
    const response = await axiosWithCredentials.put(`/api/academics/schemes/${id}/`, data);
    return response.data;
  },

  deleteScheme: async (id: number) => {
    await axiosWithCredentials.delete(`/api/academics/schemes/${id}/`);
  },

  getResources: async () => {
    const response = await axiosWithCredentials.get('/api/academics/resources/');
    return response.data;
  },

  createResource: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/academics/resources/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResource: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/academics/resources/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResource: async (id: number) => {
    await axiosWithCredentials.delete(`/api/academics/resources/${id}/`);
  },
};

// Events API
export const eventsAPI = {
  getEvents: async () => {
    const response = await axiosWithCredentials.get('/api/events/');
    return response.data;
  },

  createEvent: async (data: EventCreate) => {
    const response = await axiosWithCredentials.post('/api/events/', data);
    return response.data;
  },

  updateEvent: async (id: number, data: Partial<Event>) => {
    const response = await axiosWithCredentials.put(`/api/events/${id}/`, data);
    return response.data;
  },

  deleteEvent: async (id: number) => {
    await axiosWithCredentials.delete(`/api/events/${id}/`);
  },
};

// Careers API
export const careersAPI = {
  getCareers: async () => {
    const response = await axiosWithCredentials.get('/api/careers/');
    return response.data;
  },

  createCareer: async (data: CareerCreate) => {
    const response = await axiosWithCredentials.post('/api/careers/', data);
    return response.data;
  },

  updateCareer: async (id: number, data: Partial<CareerOpportunity>) => {
    const response = await axiosWithCredentials.put(`/api/careers/${id}/`, data);
    return response.data;
  },

  deleteCareer: async (id: number) => {
    await axiosWithCredentials.delete(`/api/careers/${id}/`);
  },
};

// People API (Team Members)
export const peopleAPI = {
  getTeamMembers: async () => {
    const response = await axiosWithCredentials.get('/api/team-members/');
    return response.data;
  },

  createTeamMember: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/team-members/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTeamMember: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/team-members/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTeamMember: async (id: number) => {
    await axiosWithCredentials.delete(`/api/team-members/${id}/`);
  },
};

// Projects API
export const projectsAPI = {
  getProjects: async () => {
    const response = await axiosWithCredentials.get('/api/projects/');
    return response.data;
  },

  createProject: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/projects/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProject: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/projects/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProject: async (id: number) => {
    await axiosWithCredentials.delete(`/api/projects/${id}/`);
  },
};

// Gallery API
export const galleryAPI = {
  getGalleryItems: async () => {
    const response = await axiosWithCredentials.get('/api/gallery/');
    return response.data;
  },

  createGalleryItem: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/gallery/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateGalleryItem: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/gallery/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteGalleryItem: async (id: number) => {
    await axiosWithCredentials.delete(`/api/gallery/${id}/`);
  },
};

// Alumni API
export const alumniAPI = {
  getAlumni: async () => {
    const response = await axiosWithCredentials.get('/api/alumni/');
    return response.data;
  },

  createAlumni: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/alumni/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateAlumni: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/alumni/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAlumni: async (id: number) => {
    await axiosWithCredentials.delete(`/api/alumni/${id}/`);
  },
};

// Placements API
export const placementsAPI = {
  getPlacements: async () => {
    const response = await axiosWithCredentials.get('/api/placements/');
    return response.data;
  },

  createPlacement: async (data: FormData) => {
    const response = await axiosWithCredentials.post('/api/placements/', data);
    return response.data;
  },

  updatePlacement: async (id: number, data: FormData) => {
    const response = await axiosWithCredentials.put(`/api/placements/${id}/`, data);
    return response.data;
  },

  deletePlacement: async (id: number) => {
    await axiosWithCredentials.delete(`/api/placements/${id}/`);
  },
};
