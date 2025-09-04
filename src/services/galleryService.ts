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
  /**
   * Get gallery categories
   */
  async getCategories(): Promise<GalleryCategory[]> {
    try {
      const response = await api.gallery.categories();
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.results)) {
        return data.results;
      } else if (data && Array.isArray(data.categories)) {
        return data.categories;
      }
      
      console.warn('Unexpected gallery categories response format:', data);
      return [];
    } catch (error) {
      console.error('Error fetching gallery categories:', error);
      return [];
    }
  }

  /**
   * Get gallery albums
   */
  async getAlbums(categoryId?: number): Promise<GalleryAlbum[]> {
    try {
      const params = categoryId ? { category: categoryId } : {};
      const response = await api.gallery.albums(params);
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.results)) {
        return data.results;
      } else if (data && Array.isArray(data.albums)) {
        return data.albums;
      }
      
      console.warn('Unexpected gallery albums response format:', data);
      return [];
    } catch (error) {
      console.error('Error fetching gallery albums:', error);
      return [];
    }
  }

  /**
   * Get gallery images
   */
  async getImages(filters?: any): Promise<GalleryImage[]> {
    try {
      const response = await api.gallery.images(filters);
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.results)) {
        return data.results;
      } else if (data && Array.isArray(data.images)) {
        return data.images;
      }
      
      console.warn('Unexpected gallery images response format:', data);
      return [];
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      return [];
    }
  }

  /**
   * Get image URL with proper base URL handling
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Build the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Get batch data safely with better error handling
   */
  async getBatchData(filters?: any): Promise<{
    categories: GalleryCategory[];
    albums: GalleryAlbum[];
    images: GalleryImage[];
  }> {
    try {
      // Use the API client instead of direct fetch to leverage error handling
      const response = await api.gallery.batchData(filters);
      const data = response.data;
      
      return {
        categories: Array.isArray(data.categories) ? data.categories : [],
        albums: Array.isArray(data.albums) ? data.albums : [],
        images: Array.isArray(data.images) ? data.images : [],
      };
    } catch (error) {
      console.error('Error fetching gallery batch data:', error);
      
      // Fallback: try to fetch each separately
      try {
        const [categories, albums, images] = await Promise.allSettled([
          this.getCategories(),
          this.getAlbums(),
          this.getImages(filters)
        ]);
        
        return {
          categories: categories.status === 'fulfilled' ? categories.value : [],
          albums: albums.status === 'fulfilled' ? albums.value : [],
          images: images.status === 'fulfilled' ? images.value : [],
        };
      } catch (fallbackError) {
        console.error('Fallback gallery data fetch failed:', fallbackError);
        return {
          categories: [],
          albums: [],
          images: [],
        };
      }
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
      // Use the API client instead of direct fetch
      const response = await api.gallery.get(`albums/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery album:', error);
      return null;
    }
  }

  async getCategory(id: number): Promise<GalleryCategory | null> {
    try {
      // Use the API client instead of direct fetch
      const response = await api.gallery.get(`categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery category:', error);
      return null;
    }
  }
}

export const galleryService = new GalleryService();