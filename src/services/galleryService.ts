import { apiClient } from './index';

export interface GalleryCategory {
    id: number;
    name: string;
    category_type: string;
    description: string;
    slug: string;
    icon: string;
    is_active: boolean;
    display_order: number;
    album_count: number;
    total_images: number;
    created_at: string;
    updated_at: string;
}

export interface GalleryAlbum {
    id: number;
    name: string;
    description: string;
    slug: string;
    category: number;
    category_name: string;
    cover_image: number | null;
    event_date: string | null;
    location: string;
    is_active: boolean;
    is_public: boolean;
    is_featured: boolean;
    display_order: number;
    image_count: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface GalleryImage {
    id: number;
    title: string;
    description: string;
    image: string;
    thumbnail: string | null;
    album: number;
    album_name: string;
    category_name: string;
    category_type: string;
    tags: string;
    tag_list: string[];
    photographer: string;
    camera_info: string;
    is_featured: boolean;
    is_public: boolean;
    display_order: number;
    uploaded_by: number | null;
    file_size: number | null;
    file_size_mb: number;
    image_width: number | null;
    image_height: number | null;
    created_at: string;
    updated_at: string;
}

export interface GalleryFilters {
    category?: number;
    category_type?: string;
    album?: number;
    event_date?: string;
    event_date_range?: {
        after?: string;
        before?: string;
    };
    is_featured?: boolean;
    is_public?: boolean;
    photographer?: string;
    tags?: string;
    search?: string;
}

class GalleryService {
    private baseUrl = '/gallery';

    // Categories
    async getCategories(): Promise<GalleryCategory[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/categories/`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching gallery categories:', error);
            throw new Error('Failed to fetch gallery categories');
        }
    }

    async getCategory(id: number): Promise<GalleryCategory> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/categories/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching gallery category:', error);
            throw new Error('Failed to fetch gallery category');
        }
    }

    async getCategoryAlbums(categoryId: number): Promise<GalleryAlbum[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/categories/${categoryId}/albums/`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching category albums:', error);
            throw new Error('Failed to fetch category albums');
        }
    }

    // Albums
    async getAlbums(filters?: Partial<GalleryFilters>): Promise<GalleryAlbum[]> {
        try {
            const params = new URLSearchParams();
            if (filters?.category) params.append('category', filters.category.toString());
            if (filters?.is_public !== undefined) params.append('is_public', filters.is_public.toString());
            if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
            if (filters?.search) params.append('search', filters.search);

            const response = await apiClient.get(`${this.baseUrl}/albums/?${params}`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching gallery albums:', error);
            throw new Error('Failed to fetch gallery albums');
        }
    }

    async getAlbum(id: number): Promise<GalleryAlbum> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/albums/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching gallery album:', error);
            throw new Error('Failed to fetch gallery album');
        }
    }

    async getAlbumImages(albumId: number): Promise<GalleryImage[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/albums/${albumId}/images/`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching album images:', error);
            throw new Error('Failed to fetch album images');
        }
    }

    // Images
    async getImages(filters?: GalleryFilters): Promise<GalleryImage[]> {
        try {
            const params = new URLSearchParams();

            if (filters?.category) params.append('category', filters.category.toString());
            if (filters?.category_type) params.append('category_type', filters.category_type);
            if (filters?.album) params.append('album', filters.album.toString());
            if (filters?.event_date) params.append('event_date', filters.event_date);
            if (filters?.event_date_range?.after) params.append('event_date_range_after', filters.event_date_range.after);
            if (filters?.event_date_range?.before) params.append('event_date_range_before', filters.event_date_range.before);
            if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
            if (filters?.is_public !== undefined) params.append('is_public', filters.is_public.toString());
            if (filters?.photographer) params.append('photographer', filters.photographer);
            if (filters?.tags) params.append('tags', filters.tags);
            if (filters?.search) params.append('search', filters.search);

            const response = await apiClient.get(`${this.baseUrl}/images/?${params}`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            throw new Error('Failed to fetch gallery images');
        }
    }

    async getImage(id: number): Promise<GalleryImage> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/images/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching gallery image:', error);
            throw new Error('Failed to fetch gallery image');
        }
    }

    async getFeaturedImages(): Promise<GalleryImage[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/images/featured/`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching featured images:', error);
            throw new Error('Failed to fetch featured images');
        }
    }

    async getRecentImages(): Promise<GalleryImage[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/images/recent/`);
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching recent images:', error);
            throw new Error('Failed to fetch recent images');
        }
    }

    async getImagesByCategory(): Promise<Array<{ category: GalleryCategory; images: GalleryImage[] }>> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/images/by_category/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching images by category:', error);
            throw new Error('Failed to fetch images by category');
        }
    }

    // Utility functions
    getImageUrl(imagePath: string): string {
        if (!imagePath) return '/placeholder-image.jpg';

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
        const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

        return `${cleanBaseUrl}${cleanImagePath}`;
    }

    getThumbnailUrl(image: GalleryImage): string {
        if (image.thumbnail) {
            return this.getImageUrl(image.thumbnail);
        }
        return this.getImageUrl(image.image);
    }
}

export const galleryService = new GalleryService();
export default galleryService;
