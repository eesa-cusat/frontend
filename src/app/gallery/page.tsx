"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Camera, 
  Image as ImageIcon, 
  Calendar, 
  Users, 
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  MapPin,
  User,
  Tag,
  Eye,
  Heart,
  Download,
  Share2,
  X,
  Loader2
} from "lucide-react";
import { galleryService, GalleryImage, GalleryCategory, GalleryAlbum } from "@/services/galleryService";
import toast from "react-hot-toast";

interface GalleryFilters {
  category?: number;
  category_type?: string;
  search?: string;
  is_featured?: boolean;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GalleryFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageLoading, setImageLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchGalleryData();
  }, [filters]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories, albums, and images in parallel
      const [categoriesData, albumsData, imagesData] = await Promise.all([
        galleryService.getCategories(),
        galleryService.getAlbums(),
        galleryService.getImages(filters)
      ]);

      setCategories(categoriesData);
      setAlbums(albumsData);
      setImages(imagesData);
    } catch (err) {
      console.error("Error fetching gallery data:", err);
      setError("Failed to load gallery data. Please try again later.");
      toast.error("Failed to load gallery data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (imageId: number) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const handleImageError = (imageId: number) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const handleFilterChange = (key: keyof GalleryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const openImageModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const downloadImage = async (image: GalleryImage) => {
    try {
      const response = await fetch(galleryService.getImageUrl(image.image));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title || 'gallery-image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const shareImage = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        });
      } catch (error) {
        // Share cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">Loading Gallery...</h2>
              <p className="text-gray-500 mt-2">Please wait while we load your memories</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchGalleryData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Camera className="w-12 h-12 mr-4 text-black" />
              <h1 className="text-4xl md:text-6xl font-bold text-black">Photo Gallery</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600">
              Capturing moments, preserving memories of our academic journey
            </p>
            <div className="flex items-center justify-center space-x-6 text-lg text-gray-600">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{images.length} Photos</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{albums.length} Albums</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                <span>{categories.length} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search photos..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                  <select
                    value={filters.is_featured?.toString() || ''}
                    onChange={(e) => handleFilterChange('is_featured', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Photos</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Not Featured</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Photos Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {images.map((image) => {
                const imageUrl = galleryService.getImageUrl(image.image);
                const isLoading = imageLoading.has(image.id);

                return (
                  <div
                    key={image.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'}`}>
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                      )}
                      <Image
                        src={imageUrl}
                        alt={image.title || "Gallery image"}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                        unoptimized={true}
                        onLoad={() => handleImageLoad(image.id)}
                        onError={() => handleImageError(image.id)}
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openImageModal(image)}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => downloadImage(image)}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => shareImage(image)}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {image.is_featured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {image.title}
                      </h3>
                      {image.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        {image.album_name && (
                          <p className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {image.album_name}
                          </p>
                        )}
                        {image.category_name && (
                          <p className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {image.category_name}
                          </p>
                        )}
                        {image.photographer && (
                          <p className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {image.photographer}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {image.tag_list && image.tag_list.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {image.tag_list.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {image.tag_list.length > 3 && (
                            <span className="text-gray-400 text-xs">+{image.tag_list.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative h-96 md:h-[70vh]">
              <Image
                src={galleryService.getImageUrl(selectedImage.image)}
                alt={selectedImage.title || "Gallery image"}
                fill
                style={{ objectFit: "contain" }}
                unoptimized={true}
              />
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedImage.title}
              </h2>
              {selectedImage.description && (
                <p className="text-gray-600 mb-4">{selectedImage.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                {selectedImage.album_name && (
                  <div>
                    <span className="font-medium">Album:</span> {selectedImage.album_name}
                  </div>
                )}
                {selectedImage.category_name && (
                  <div>
                    <span className="font-medium">Category:</span> {selectedImage.category_name}
                  </div>
                )}
                {selectedImage.photographer && (
                  <div>
                    <span className="font-medium">Photographer:</span> {selectedImage.photographer}
                  </div>
                )}
                {selectedImage.file_size_mb && (
                  <div>
                    <span className="font-medium">Size:</span> {selectedImage.file_size_mb}MB
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => shareImage(selectedImage)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
