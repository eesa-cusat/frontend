"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Camera,
  ImageIcon,
  Grid3X3,
  List,
  ArrowLeft,
  User,
  Loader2,
} from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { getImageUrl } from "@/utils/api";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Interfaces
interface Album {
  id: number;
  name: string;
  type: string;
  description?: string;
  cover_image?: string;
  created_at: string;
  photo_count: number;
  event_title?: string;
  batch_year?: number;
  batch_info?: {
    year: number;
    batch_name: string;
  };
}

interface Photo {
  id: number;
  image: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: {
    id: number;
    first_name: string;
    last_name: string;
  };
  uploaded_by_name?: string;
}

const GalleryPage: React.FC = () => {
  // Albums state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [albumsError, setAlbumsError] = useState<string | null>(null);
  const [albumsCurrentPage, setAlbumsCurrentPage] = useState(1);
  const [albumsTotalPages, setAlbumsTotalPages] = useState(1);
  const [albumsHasNextPage, setAlbumsHasNextPage] = useState(false);
  const [albumsHasPrevPage, setAlbumsHasPrevPage] = useState(false);
  const [albumsTotalCount, setAlbumsTotalCount] = useState(0);

  // Photos state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [photosCurrentPage, setPhotosCurrentPage] = useState(1);
  const [photosTotalPages, setPhotosTotalPages] = useState(1);
  const [photosHasNextPage, setPhotosHasNextPage] = useState(false);
  const [photosHasPrevPage, setPhotosHasPrevPage] = useState(false);
  const [photosTotalCount, setPhotosTotalCount] = useState(0);

  // UI state
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [viewMode, setViewMode] = useState<"albums" | "photos">("albums");
  const [photoViewMode, setPhotoViewMode] = useState<"grid" | "list">("grid");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbumType, setSelectedAlbumType] = useState<string>("all");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const albumTypes = [
    { value: "all", label: "All Types" },
    { value: "eesa", label: "EESA Programs" },
    { value: "general", label: "General Programs" },
    { value: "alumni", label: "Alumni Batches" },
  ];

  // Debounced search
  const debouncedSearch = useCallback(
    (searchTerm: string, albumType: string, page = 1) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        if (viewMode === "albums") {
          fetchAlbums(searchTerm, albumType, page);
        } else {
          fetchPhotos(selectedAlbum?.id || 0, searchTerm, page);
        }
      }, 500);
      setSearchTimeout(timeout);
    },
    [searchTimeout, viewMode, selectedAlbum]
  );

  // Fetch albums with pagination
  const fetchAlbums = useCallback(
    async (searchTerm = "", albumType = "all", page = 1) => {
      setAlbumsLoading(true);
      setAlbumsError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("page_size", "12");
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }
        if (albumType !== "all") {
          params.append("type", albumType);
        }

        const url = `${API_BASE_URL}/gallery/albums/public/?${params.toString()}`;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const albumsData = data.results || [];

        setAlbums(albumsData);
        setAlbumsTotalCount(data.count || 0);
        setAlbumsTotalPages(Math.ceil((data.count || 0) / 12));
        setAlbumsHasNextPage(!!data.next);
        setAlbumsHasPrevPage(!!data.previous);
        setAlbumsCurrentPage(page);
      } catch (err) {
        console.error("Error fetching albums:", err);
        setAlbumsError("Failed to load albums. Please try again later.");
        setAlbums([]);
      } finally {
        setAlbumsLoading(false);
      }
    },
    []
  );

  // Fetch photos with pagination
  const fetchPhotos = useCallback(
    async (albumId: number, searchTerm = "", page = 1) => {
      if (!albumId) return;

      setPhotosLoading(true);
      setPhotosError(null);
      try {
        const params = new URLSearchParams();
        params.append("album", albumId.toString());
        params.append("page", page.toString());
        params.append("page_size", "24");
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const url = `${API_BASE_URL}/gallery/photos/public/?${params.toString()}`;
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const photosData = data.results || [];

        setPhotos(photosData);
        setPhotosTotalCount(data.count || 0);
        setPhotosTotalPages(Math.ceil((data.count || 0) / 24));
        setPhotosHasNextPage(!!data.next);
        setPhotosHasPrevPage(!!data.previous);
        setPhotosCurrentPage(page);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setPhotosError("Failed to load photos. Please try again later.");
        setPhotos([]);
      } finally {
        setPhotosLoading(false);
      }
    },
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value, selectedAlbumType, 1);
  };

  const handleAlbumTypeChange = (albumType: string) => {
    setSelectedAlbumType(albumType);
    debouncedSearch(searchQuery, albumType, 1);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setViewMode("photos");
    setPhotosCurrentPage(1);
    fetchPhotos(album.id, "", 1);
  };

  const handleBackToAlbums = () => {
    setViewMode("albums");
    setSelectedAlbum(null);
    setPhotos([]);
    setSearchQuery("");
  };

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? Math.max(0, currentPhotoIndex - 1)
        : Math.min(photos.length - 1, currentPhotoIndex + 1);

    if (newIndex !== currentPhotoIndex) {
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      const link = document.createElement("a");
      link.href = getImageUrl(photo.image) || photo.image;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading photo:", error);
    }
  };

  const handleAlbumsPageChange = (page: number) => {
    setAlbumsCurrentPage(page);
    fetchAlbums(searchQuery, selectedAlbumType, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhotosPageChange = (page: number) => {
    setPhotosCurrentPage(page);
    fetchPhotos(selectedAlbum?.id || 0, searchQuery, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getAlbumTypeColor = (type: string) => {
    switch (type) {
      case "eesa":
        return "bg-[#B9FF66] text-[#191A23]";
      case "general":
        return "bg-green-100 text-green-800";
      case "alumni":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlbumTypeBadge = (type: string) => {
    switch (type) {
      case "eesa":
        return "EESA Programs";
      case "general":
        return "General Programs";
      case "alumni":
        return "Alumni Batches";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchAlbums("", "all", 1);
  }, [fetchAlbums]);

  // Photo Modal Component
  const PhotoModal = () => {
    if (!showPhotoModal || !selectedPhoto) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-20 bg-black/50 p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={24} />
          </button>

          {/* Navigation buttons */}
          {currentPhotoIndex > 0 && (
            <button
              onClick={() => navigatePhoto("prev")}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black/50 p-4 rounded-full backdrop-blur-sm transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {currentPhotoIndex < photos.length - 1 && (
            <button
              onClick={() => navigatePhoto("next")}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-20 bg-black/50 p-4 rounded-full backdrop-blur-sm transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Main image */}
          <div className="relative max-w-6xl max-h-full flex items-center justify-center">
            <LazyImage
              src={getImageUrl(selectedPhoto.image) || selectedPhoto.image}
              alt={selectedPhoto.caption || "Photo"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              width={1200}
              height={800}
              priority={true}
            />
          </div>

          {/* Photo info overlay */}
          <div className="absolute bottom-6 left-6 right-6 bg-black/70 text-white p-6 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">
                  {selectedPhoto.caption || `Photo ${selectedPhoto.id}`}
                </h3>
                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(selectedPhoto.uploaded_at)}
                  </span>
                  <span className="flex items-center gap-2">
                    <User size={16} />
                    By{" "}
                    {selectedPhoto.uploaded_by_name ||
                      `${selectedPhoto.uploaded_by.first_name} ${selectedPhoto.uploaded_by.last_name}`}
                  </span>
                  <span className="text-gray-400">
                    Photo {currentPhotoIndex + 1} of {photos.length}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                <button
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading states
  if (albumsLoading && albums.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#191A23] border-t-[#B9FF66] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#191A23] font-medium">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191A23] mb-6">
              {viewMode === "albums" ? (
                <>
                  Photo{" "}
                  <span className="text-[#191A23] px-2 md:px-4 py-1 md:py-2 rounded-xl">
                    Gallery
                  </span>
                </>
              ) : (
                selectedAlbum?.name
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {viewMode === "albums"
                ? "Explore our photo collections from events, programs, and activities"
                : selectedAlbum?.description ||
                  "Browse photos from this album"}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="flex flex-col gap-6">
              {viewMode === "photos" && (
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <button
                    onClick={handleBackToAlbums}
                    className="flex items-center text-[#191A23] hover:text-[#2A2B35] font-medium transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Albums
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPhotoViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        photoViewMode === "grid"
                          ? "bg-[#191A23] text-[#B9FF66]"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setPhotoViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        photoViewMode === "list"
                          ? "bg-[#191A23] text-[#B9FF66]"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={
                      viewMode === "albums"
                        ? "Search albums, events, descriptions..."
                        : "Search photos, captions, photographers..."
                    }
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl bg-gray-50 text-[#191A23] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent focus:bg-white transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#191A23] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {viewMode === "albums" && (
                  <div className="flex gap-2">
                    <select
                      value={selectedAlbumType}
                      onChange={(e) => handleAlbumTypeChange(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all duration-300"
                    >
                      {albumTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results summary */}
          {viewMode === "albums" && albumsTotalCount > 0 && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-bold text-[#191A23]">
                  {albumsTotalCount}
                </span>{" "}
                album{albumsTotalCount !== 1 ? "s" : ""}
                {searchQuery && (
                  <span>
                    {" "}
                    matching &ldquo;
                    <span className="font-medium text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </span>
                )}
                {selectedAlbumType !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-medium">
                      {
                        albumTypes.find((t) => t.value === selectedAlbumType)
                          ?.label
                      }
                    </span>
                  </span>
                )}
              </p>
            </div>
          )}

          {viewMode === "photos" && photosTotalCount > 0 && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-bold text-[#191A23]">
                  {photosTotalCount}
                </span>{" "}
                photo{photosTotalCount !== 1 ? "s" : ""} in this album
                {searchQuery && (
                  <span>
                    {" "}
                    matching &ldquo;
                    <span className="font-medium text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === "albums" ? (
            // Albums Grid
            <>
              {albumsError && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{albumsError}</p>
                  <button
                    onClick={() => fetchAlbums(searchQuery, selectedAlbumType, albumsCurrentPage)}
                    className="bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {albums.length > 0 ? (
                <>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                        onClick={() => handleAlbumClick(album)}
                      >
                        <div className="relative h-64 bg-gray-200 overflow-hidden">
                          {album.cover_image ? (
                            <LazyImage
                              src={getImageUrl(album.cover_image) || ''}
                              alt={`${album.name} cover`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              objectFit="cover"
                              className="transition-transform duration-500 group-hover:scale-110"
                              priority={false}
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#191A23] to-[#2A2B35] text-[#B9FF66]">
                              <div className="text-center">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-70" />
                                <p className="text-sm font-medium">No Cover Image</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 z-10">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAlbumTypeColor(
                                album.type
                              )}`}
                            >
                              {getAlbumTypeBadge(album.type)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-[#191A23] mb-2 line-clamp-1 group-hover:text-[#2A2B35] transition-colors">
                            {album.name}
                          </h3>

                          {album.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {album.description}
                            </p>
                          )}

                          <div className="space-y-3 text-sm text-gray-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                <span>{album.photo_count} photos</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(album.created_at)}</span>
                              </div>
                            </div>

                            {album.event_title && (
                              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                Event: {album.event_title}
                              </div>
                            )}

                            {album.batch_info && (
                              <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                {album.batch_info.batch_name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-[#B9FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
                      </div>
                    ))}
                  </div>

                  {/* Albums Pagination */}
                  {albumsTotalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2">
                      <button
                        onClick={() =>
                          handleAlbumsPageChange(Math.max(1, albumsCurrentPage - 1))
                        }
                        disabled={!albumsHasPrevPage}
                        className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      {Array.from({ length: Math.min(5, albumsTotalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(albumsTotalPages - 4, albumsCurrentPage - 2)) + i;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handleAlbumsPageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              pageNumber === albumsCurrentPage
                                ? "bg-[#191A23] text-[#B9FF66] font-semibold"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          handleAlbumsPageChange(Math.min(albumsTotalPages, albumsCurrentPage + 1))
                        }
                        disabled={!albumsHasNextPage}
                        className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm">
                      Showing page {albumsCurrentPage} of {albumsTotalPages} (
                      {albumsTotalCount} total albums)
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#191A23] mb-4">
                    No albums found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || selectedAlbumType !== "all"
                      ? "Try adjusting your search or filters"
                      : "No photo albums are available at the moment"}
                  </p>
                  {(searchQuery || selectedAlbumType !== "all") && (
                    <div className="flex gap-2 justify-center">
                      {searchQuery && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                      {selectedAlbumType !== "all" && (
                        <button
                          onClick={() => handleAlbumTypeChange("all")}
                          className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Show All Types
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Photos View
            <>
              {photosError && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{photosError}</p>
                  <button
                    onClick={() =>
                      fetchPhotos(selectedAlbum?.id || 0, searchQuery, photosCurrentPage)
                    }
                    className="bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {photosLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin w-8 h-8 text-[#191A23]" />
                </div>
              )}

              {photos.length > 0 ? (
                <>
                  {/* Album info header */}
                  {selectedAlbum && (
                    <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${getAlbumTypeColor(
                              selectedAlbum.type
                            )}`}
                          >
                            {getAlbumTypeBadge(selectedAlbum.type)}
                          </span>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              {selectedAlbum.photo_count} total photos
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(selectedAlbum.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      photoViewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                        : "space-y-4"
                    }
                  >
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={
                          photoViewMode === "grid"
                            ? "cursor-pointer group aspect-square"
                            : "cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-4"
                        }
                        onClick={() => handlePhotoClick(photo, index)}
                      >
                        {photoViewMode === "grid" ? (
                          <div className="relative w-full h-full overflow-hidden rounded-xl bg-gray-200">
                            <LazyImage
                              src={getImageUrl(photo.image) || photo.image}
                              alt={photo.caption || "Photo"}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                              objectFit="cover"
                              className="transition-transform duration-300 group-hover:scale-110"
                              priority={false}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-6 h-6" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                              <LazyImage
                                src={getImageUrl(photo.image) || photo.image}
                                alt={photo.caption || "Photo"}
                                width={96}
                                height={96}
                                objectFit="cover"
                                className="w-full h-full"
                                priority={false}
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-[#191A23] mb-2 line-clamp-1">
                                {photo.caption || `Photo ${photo.id}`}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(photo.uploaded_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {photo.uploaded_by_name ||
                                    `${photo.uploaded_by.first_name} ${photo.uploaded_by.last_name}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhotoClick(photo, index);
                                }}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPhoto(photo);
                                }}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Photos Pagination */}
                  {photosTotalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2">
                      <button
                        onClick={() =>
                          handlePhotosPageChange(Math.max(1, photosCurrentPage - 1))
                        }
                        disabled={!photosHasPrevPage}
                        className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      {Array.from({ length: Math.min(5, photosTotalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(photosTotalPages - 4, photosCurrentPage - 2)) + i;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePhotosPageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              pageNumber === photosCurrentPage
                                ? "bg-[#191A23] text-[#B9FF66] font-semibold"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          handlePhotosPageChange(Math.min(photosTotalPages, photosCurrentPage + 1))
                        }
                        disabled={!photosHasNextPage}
                        className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}

                  <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm">
                      Showing page {photosCurrentPage} of {photosTotalPages} (
                      {photosTotalCount} total photos)
                    </p>
                  </div>
                </>
              ) : !photosLoading ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#191A23] mb-4">
                    No photos found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "This album doesn't have any photos yet"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* Photo Modal */}
      <PhotoModal />
    </div>
  );
};

export default GalleryPage;
