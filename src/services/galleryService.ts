// Gallery Service - New implementation according to API guide

// Album Interface - Three types: EESA Programs, General Programs, Alumni Batches
export interface Album {
  id: number;
  name: string;
  type: 'eesa' | 'general' | 'alumni';
  description: string;
  cover_image?: string;
  event?: {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    location?: string;
  };
  batch_year?: number;
  photo_count: number;
  photos?: Photo[];
  created_at: string;
  created_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

// Photo Interface
export interface Photo {
  id: number;
  album: number;
  image: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

// API Response interfaces
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

class GalleryService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Helper method for API calls with proxy
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`/api/proxy?endpoint=gallery/${endpoint}`, {
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

  // Get all albums with optional filters
  async getAlbums(filters?: {
    type?: 'eesa' | 'general' | 'alumni';
    search?: string;
    created_after?: string;
    created_before?: string;
  }): Promise<Album[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.created_after) params.append('created_after', filters.created_after);
      if (filters?.created_before) params.append('created_before', filters.created_before);

      const endpoint = `albums/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.apiCall<ApiResponse<Album>>(endpoint);
      
      return response.results || [];
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    }
  }

  // Get single album with photos
  async getAlbum(id: number): Promise<Album | null> {
    try {
      const album = await this.apiCall<Album>(`albums/${id}/`);
      return album;
    } catch (error) {
      console.error(`Error fetching album ${id}:`, error);
      return null;
    }
  }

  // Get photos for a specific album
  async getAlbumPhotos(albumId: number, search?: string): Promise<Photo[]> {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const endpoint = `albums/${albumId}/photos/${params}`;
      const response = await this.apiCall<ApiResponse<Photo>>(endpoint);
      
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching photos for album ${albumId}:`, error);
      return [];
    }
  }

  // Get all photos across albums
  async getAllPhotos(search?: string): Promise<Photo[]> {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const endpoint = `photos/${params}`;
      const response = await this.apiCall<ApiResponse<Photo>>(endpoint);
      
      return response.results || [];
    } catch (error) {
      console.error('Error fetching all photos:', error);
      return [];
    }
  }

  // Get single photo
  async getPhoto(id: number): Promise<Photo | null> {
    try {
      const photo = await this.apiCall<Photo>(`photos/${id}/`);
      return photo;
    } catch (error) {
      console.error(`Error fetching photo ${id}:`, error);
      return null;
    }
  }

  // Create new album
  async createAlbum(albumData: {
    name: string;
    type: 'eesa' | 'general' | 'alumni';
    description: string;
    cover_image?: string;
    event_id?: number;
    batch_year?: number;
  }): Promise<Album | null> {
    try {
      const album = await this.apiCall<Album>('albums/', {
        method: 'POST',
        body: JSON.stringify(albumData),
      });
      return album;
    } catch (error) {
      console.error('Error creating album:', error);
      return null;
    }
  }

  // Upload photo to album
  async uploadPhoto(albumId: number, photoData: FormData): Promise<Photo | null> {
    try {
      const response = await fetch(`/api/proxy?endpoint=gallery/albums/${albumId}/photos/`, {
        method: 'POST',
        body: photoData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error uploading photo to album ${albumId}:`, error);
      return null;
    }
  }

  // Update album
  async updateAlbum(id: number, albumData: Partial<Album>): Promise<Album | null> {
    try {
      const album = await this.apiCall<Album>(`albums/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(albumData),
      });
      return album;
    } catch (error) {
      console.error(`Error updating album ${id}:`, error);
      return null;
    }
  }

  // Update photo
  async updatePhoto(id: number, photoData: { caption?: string }): Promise<Photo | null> {
    try {
      const photo = await this.apiCall<Photo>(`photos/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(photoData),
      });
      return photo;
    } catch (error) {
      console.error(`Error updating photo ${id}:`, error);
      return null;
    }
  }

  // Delete album
  async deleteAlbum(id: number): Promise<boolean> {
    try {
      await this.apiCall(`albums/${id}/`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting album ${id}:`, error);
      return false;
    }
  }

  // Delete photo
  async deletePhoto(id: number): Promise<boolean> {
    try {
      await this.apiCall(`photos/${id}/`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting photo ${id}:`, error);
      return false;
    }
  }

  // Get image URL (for Cloudinary or other CDN)
  getImageUrl(imagePath?: string): string {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle Cloudinary URLs
    if (imagePath.includes('cloudinary')) {
      return imagePath;
    }
    
    // For local development or relative paths
    return `${this.baseUrl}/media/${imagePath}`;
  }

  // Get album type color
  getAlbumTypeColor(type: string): string {
    switch (type) {
      case 'eesa':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'alumni':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get album type gradient
  getAlbumTypeGradient(type: string): string {
    switch (type) {
      case 'eesa':
        return 'from-purple-500 to-indigo-600';
      case 'general':
        return 'from-blue-500 to-cyan-600';
      case 'alumni':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  }

  // Format date helper
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Search across albums and photos
  async search(query: string): Promise<{
    albums: Album[];
    photos: Photo[];
  }> {
    try {
      const [albums, photos] = await Promise.all([
        this.getAlbums({ search: query }),
        this.getAllPhotos(query),
      ]);

      return { albums, photos };
    } catch (error) {
      console.error('Error searching:', error);
      return { albums: [], photos: [] };
    }
  }
}

export const galleryService = new GalleryService();