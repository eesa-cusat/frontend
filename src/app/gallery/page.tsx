'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { galleryService, GalleryAlbum } from '@/services/galleryService';
import { getImageUrl } from '@/utils/api';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Calendar, 
  Camera, 
  Users, 
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Loader2,
  Grid3X3,
  List,
  Tag,
  User
} from 'lucide-react';
import Image from 'next/image';

// Define interfaces for gallery components
interface Album {
  id: number;
  name: string;
  type: string;
  description?: string;
  cover_image?: string;
  created_at: string;
  photo_count: number;
  event?: {
    title: string;
  };
  batch_year?: number;
}

interface Photo {
  id: number;
  image: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: {
    first_name: string;
    last_name: string;
  };
}

interface GalleryPageProps {}

const GalleryPage: React.FC<GalleryPageProps> = () => {
  const searchParams = useSearchParams();
  
  // State management
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [albumTypeFilter, setAlbumTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'albums' | 'photos'>('albums');
  const [photoViewMode, setPhotoViewMode] = useState<'grid' | 'list'>('grid');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadAlbums();
  }, [albumTypeFilter, searchTerm]);

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  // Handle album URL parameter (for direct links from events)
  useEffect(() => {
    const albumParam = searchParams.get('album');
    if (albumParam && albums.length > 0) {
      const albumId = parseInt(albumParam);
      const targetAlbum = albums.find(album => album.id === albumId);
      if (targetAlbum && !selectedAlbum) {
        setSelectedAlbum(targetAlbum);
        setViewMode('photos');
      }
    }
  }, [searchParams, albums, selectedAlbum]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      
      // Fetch albums from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/gallery/albums/`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const albumsArray = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      
      // Transform albums to match our interface
      const transformedAlbums: Album[] = albumsArray.map((album: any) => ({
        id: album.id,
        name: album.name || album.title,
        type: album.type,
        description: album.description,
        cover_image: album.cover_image,
        created_at: album.created_at,
        photo_count: album.photo_count || 0,
        event: album.event,
        batch_year: album.batch_year
      }));
      
      // Apply filters
      let filteredAlbums = transformedAlbums;
      
      if (albumTypeFilter !== 'all') {
        filteredAlbums = filteredAlbums.filter(album => album.type === albumTypeFilter.toLowerCase());
      }
      
      if (searchTerm) {
        filteredAlbums = filteredAlbums.filter(album => 
          album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (album.description && album.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setAlbums(filteredAlbums);
    } catch (error) {
      console.error('Error loading albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (albumId: number) => {
    try {
      setPhotosLoading(true);
      
      // Fetch photos from gallery photos API endpoint with album query parameter
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/gallery/photos/?album=${albumId}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const photosArray = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      
      // Transform photos to match our interface
      const transformedPhotos: Photo[] = photosArray.map((photo: any) => ({
        id: photo.id,
        image: photo.image,
        caption: photo.caption,
        uploaded_at: photo.uploaded_at,
        uploaded_by: photo.uploaded_by || { first_name: '', last_name: '' }
      }));
      
      setPhotos(transformedPhotos);
      
      // Debug: Log image URLs to understand the issue
      console.log('Gallery Debug - Album photos:', transformedPhotos.map(p => ({
        id: p.id,
        original: p.image,
        processed: getImageUrl(p.image)
      })));
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleSearch = () => {
    loadAlbums();
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setViewMode('photos');
  };

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
  };



  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      // Trigger download
      const link = document.createElement('a');
      link.href = getImageUrl(photo.image) || photo.image;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPhotoIndex > 0) {
      const newIndex = currentPhotoIndex - 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    } else if (direction === 'next' && currentPhotoIndex < photos.length - 1) {
      const newIndex = currentPhotoIndex + 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const getAlbumTypeColor = (type: string) => {
    switch (type) {
      case 'eesa':
        return 'bg-blue-100 text-blue-800';
      case 'general':
        return 'bg-green-100 text-green-800';
      case 'alumni':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlbumTypeBadge = (type: string) => {
    switch (type) {
      case 'eesa':
        return 'EESA Programs';
      case 'general':
        return 'General Programs';
      case 'alumni':
        return 'Alumni Batches';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Photo Modal Component
  const PhotoModal = () => {
    if (!showPhotoModal || !selectedPhoto) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          {/* Navigation buttons */}
          {currentPhotoIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft size={48} />
            </button>
          )}
          
          {currentPhotoIndex < photos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight size={48} />
            </button>
          )}

          {/* Main image */}
          <div className="relative max-w-4xl max-h-full flex items-center justify-center">
            <img
              src={getImageUrl(selectedPhoto.image) || selectedPhoto.image || '/placeholder-image.jpg'}
              alt={selectedPhoto.caption || 'Photo'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                console.error('Modal image failed to load:', selectedPhoto.image);
                e.currentTarget.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Photo info overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{selectedPhoto.caption || `Photo ${selectedPhoto.id}`}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(selectedPhoto.uploaded_at)}
                  </span>
                  <span className="text-gray-400">
                    By {selectedPhoto.uploaded_by.first_name} {selectedPhoto.uploaded_by.last_name}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {viewMode === 'albums' ? 'Photo Gallery' : selectedAlbum?.name}
                </h1>
                <p className="text-gray-600 mt-2">
                  {viewMode === 'albums' 
                    ? 'Explore our photo collections from events, programs, and activities'
                    : selectedAlbum?.description || 'Browse photos from this album'
                  }
                </p>
              </div>
              {viewMode === 'photos' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewMode('albums');
                    setSelectedAlbum(null);
                    setPhotos([]);
                  }}
                >
                  Back to Albums
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder={viewMode === 'albums' ? "Search albums..." : "Search photos..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              {viewMode === 'albums' && (
                <div className="flex flex-wrap gap-2">
                  <select
                    value={albumTypeFilter}
                    onChange={(e) => setAlbumTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="eesa">EESA Programs</option>
                    <option value="general">General Programs</option>
                    <option value="alumni">Alumni Batches</option>
                  </select>
                  <Button onClick={handleSearch} size="sm">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              )}
              {viewMode === 'photos' && (
                <div className="flex gap-2">
                  <Button
                    variant={photoViewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoViewMode('grid')}
                  >
                    <Grid3X3 size={16} />
                  </Button>
                  <Button
                    variant={photoViewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'albums' ? (
          // Albums View
          <>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No albums found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {albums.map((album) => (
                  <Card
                    key={album.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <div className="relative h-48 w-full">
                      {album.cover_image ? (
                        <Image
                          src={album.cover_image}
                          alt={album.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlbumTypeColor(album.type)}`}>
                          {getAlbumTypeBadge(album.type)}
                        </span>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{album.name}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      {album.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {album.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Camera size={14} />
                            <span>{album.photo_count} photos</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(album.created_at)}</span>
                        </div>
                        {album.event && (
                          <div className="text-xs text-blue-600">
                            Event: {album.event.title}
                          </div>
                        )}
                        {album.batch_year && (
                          <div className="text-xs text-purple-600">
                            Batch: {album.batch_year}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          // Photos View
          <>
            {photosLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No photos found in this album</p>
              </div>
            ) : (
              <>
                {/* Album info */}
                {selectedAlbum && (
                  <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlbumTypeColor(selectedAlbum.type)}`}>
                            {getAlbumTypeBadge(selectedAlbum.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Camera size={14} />
                            {selectedAlbum.photo_count} photos
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(selectedAlbum.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={photoViewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
                  : "space-y-4"
                }>
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={photoViewMode === 'grid' 
                        ? "cursor-pointer group" 
                        : "cursor-pointer"
                      }
                      onClick={() => handlePhotoClick(photo, index)}
                    >
                      {photoViewMode === 'grid' ? (
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
                          <img
                            src={getImageUrl(photo.image) || photo.image || '/placeholder-image.jpg'}
                            alt={photo.caption || 'Photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              console.error('Image failed to load:', photo.image);
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                          </div>
                        </div>
                      ) : (
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                                  <img
                                    src={getImageUrl(photo.image) || photo.image || '/placeholder-image.jpg'}
                                    alt={photo.caption || 'Photo'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error('List view image failed to load:', photo.image);
                                      e.currentTarget.src = '/placeholder-image.jpg';
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {photo.caption || 'Untitled Photo'}
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(photo.uploaded_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {photo.uploaded_by.first_name} {photo.uploaded_by.last_name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPhoto(photo);
                                  }}
                                >
                                  <ZoomIn size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPhoto(photo);
                                  }}
                                >
                                  <Download size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Photo Modal */}
      <PhotoModal />
    </div>
  );
};

export default GalleryPage;
