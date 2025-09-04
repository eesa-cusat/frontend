import { api } from '@/lib/api';

export interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  image: string;
  thumbnail?: string;
  category: number;
  album?: number;
  is_featured: boolean;
  created_at: string;
  photographer?: string;
  camera_details?: string;
  location?: string;
  tags?: string[];
  view_count: number;
  download_count: number;
}

export interface GalleryCategory {
  id: number;
  name: string;
  category_type: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  album_count?: number;
}

export interface GalleryAlbum {
  id: number;
  title: string;
  description?: string;
  category: number;
  cover_image?: string;
  event_date?: string;
  location?: string;
  photographer?: string;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  image_count?: number;
}

class GalleryService {
  async getCategories(): Promise<GalleryCategory[]> {
    try {
      const response = await api.gallery.list({ endpoint: 'categories' });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching gallery categories:', error);
      return [];
    }
  }

  async getAlbums(categoryId?: number): Promise<GalleryAlbum[]> {
    try {
      const params = categoryId ? { category: categoryId } : {};
      const response = await api.gallery.list({ endpoint: 'albums', ...params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching gallery albums:', error);
      return [];
    }
  }

  async getImages(filters?: any): Promise<GalleryImage[]> {
    try {
      const response = await api.gallery.list({ endpoint: 'images', ...filters });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      return [];
    }
  }

  async getBatchData(filters?: any): Promise<{
    categories: GalleryCategory[];
    albums: GalleryAlbum[];
    images: GalleryImage[];
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gallery/batch-data/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        categories: data.categories || [],
        albums: data.albums || [],
        images: data.images || [],
      };
    } catch (error) {
      console.error('Error fetching gallery batch data:', error);
      return {
        categories: [],
        albums: [],
        images: [],
      };
    }
  }

  async getImage(id: number): Promise<GalleryImage | null> {
    try {
      const response = await api.gallery.get(id.toString());
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery image:', error);
      return null;
    }
  }

  async getAlbum(id: number): Promise<GalleryAlbum | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gallery/albums/${id}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gallery album:', error);
      return null;
    }
  }

  async getCategory(id: number): Promise<GalleryCategory | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gallery/categories/${id}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gallery category:', error);
      return null;
    }
  }
}

export const galleryService = new GalleryService();