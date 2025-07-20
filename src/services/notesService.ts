import axios from 'axios';
import { Note, NoteUpload } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create a simple axios instance for public endpoints
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notesService = {
  // Get all notes (public access for approved notes)
  getAllNotes: async (): Promise<Note[]> => {
    const response = await publicApiClient.get('/api/academics/notes/');
    return response.data.notes || [];
  },

  // Get user's own notes (requires authentication)
  getMyNotes: async (): Promise<Note[]> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Note[]>('GET', '/academics/notes/my/');
  },

  // Get pending notes for approval (admin/technical head only)
  getPendingNotes: async (): Promise<Note[]> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Note[]>('GET', '/academics/notes/pending/');
  },

  // Upload a new note (requires authentication)
  uploadNote: async (noteData: NoteUpload): Promise<Note> => {
    const { apiRequest } = await import('@/lib/api');
    const formData = new FormData();
    formData.append('title', noteData.title);
    formData.append('description', noteData.description);
    formData.append('subject', noteData.subject);
    formData.append('semester', noteData.semester.toString());
    formData.append('file', noteData.file);
    formData.append('tags', JSON.stringify(noteData.tags));

    return await apiRequest<Note>('POST', '/academics/notes/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Approve a note (admin/technical head only)
  approveNote: async (noteId: string): Promise<Note> => {
    const { apiRequest } = await import('@/lib/api');
    return await apiRequest<Note>('POST', '/academics/notes/approve/', {
      note_id: noteId,
    });
  },

  // Delete a note (requires authentication)
  deleteNote: async (noteId: string): Promise<void> => {
    const { apiRequest } = await import('@/lib/api');
    await apiRequest<void>('DELETE', `/academics/notes/${noteId}/delete/`);
  },
};
