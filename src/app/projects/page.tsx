"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Calendar,
  Users,
  Search,
  X,
  ExternalLink,
  Github,
  ChevronDown,
  Code2,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { getImageUrl } from "@/utils/api";

// Project interface matching updated backend schema
interface Project {
  id: number;
  title: string;
  description: string;
  abstract?: string;
  category: string;
  academic_year?: string; // New: e.g., "2023-2024"
  student_batch?: string; // Legacy field
  created_at: string;
  updated_at?: string;
  github_url?: string;
  demo_url?: string;
  project_report?: string;
  thumbnail?: string | null; // Primary image field
  featured_video?: string;
  is_featured?: boolean;
  created_by?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  team_members?: Array<{
    id: number;
    name: string;
    role?: string;
  }>;
  images?: Array<{
    id: number;
    image: string;
    caption?: string;
    is_featured?: boolean;
    created_at: string;
  }>;
  videos?: Array<{
    id: number;
    video: string;
    caption?: string;
  }>;
  // For frontend display
  batch?: string;
  team_count?: number;
  created_by_name?: string;
  technologies?: string[];
  status?: string;
}

const ProjectsPage: React.FC = () => {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all"); // New: Year filter
  const [availableYears, setAvailableYears] = useState<string[]>([]); // New: Years from API
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false); // New: Year dropdown
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Progressive loading for images
  // Removed progressive loading for simpler image display

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web_development", label: "Web Development" },
    { value: "mobile_app", label: "Mobile App" },
    { value: "machine_learning", label: "Machine Learning" },
    { value: "iot", label: "Internet of Things" },
    { value: "robotics", label: "Robotics" },
    { value: "embedded_systems", label: "Embedded Systems" },
    { value: "data_science", label: "Data Science" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "blockchain", label: "Blockchain" },
    { value: "ai", label: "Artificial Intelligence" },
    { value: "other", label: "Other" },
  ];

  // Fetch available years from the projects list response
  const fetchAvailableYears = useCallback(async () => {
    try {
      // Fetch first page to get available years
      const { api } = await import("@/lib/api");
      const response = await api.projects.list({ page: "1", page_size: "1" });
      const data = response.data;
      
      if (data.available_years && Array.isArray(data.available_years)) {
        setAvailableYears(data.available_years);
      }
    } catch (err) {
      console.error("Error fetching available years:", err);
    }
  }, []);

  // Fetch projects from API - backend handles caching
  const fetchProjects = useCallback(
    async (searchTerm = "", categoryFilter = "all", yearFilter = "all", page = 1) => {
      setLoading(true);
      setError(null);
      
      try {
        // Build params object
        const params: any = {
          page: page.toString(),
          page_size: "12",
        };
        
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        // Only add category parameter if a specific category is selected
        if (categoryFilter !== "all") {
          params.category = categoryFilter;
        }
        // Only add year parameter if a specific year is selected
        if (yearFilter !== "all") {
          params.academic_year = yearFilter;  // Changed from 'year' to 'academic_year'
        }
        
        // Use API client (same as homepage) for consistent data format
        const { api } = await import("@/lib/api");
        const response = await api.projects.list(params);
        const data = response.data;
        const projectsData = data.projects || data.results || [];
        
        console.log('📦 API Response:', { 
          count: projectsData.length, 
          firstProject: projectsData[0] ? {
            id: projectsData[0].id,
            thumbnail: projectsData[0].thumbnail
          } : null
        });
        
        // Extract available years from response (in case they change)
        if (data.available_years && Array.isArray(data.available_years)) {
          setAvailableYears(data.available_years);
        }

        // Update pagination info
        setTotalCount(data.count || projectsData.length);
        setTotalPages(Math.ceil((data.count || projectsData.length) / 12));
        setHasNextPage(!!data.next);
        setHasPrevPage(!!data.previous);

        const transformedProjects = Array.isArray(projectsData)
          ? projectsData.map((project: Project) => ({
              ...project,
              student_batch: project.student_batch || project.academic_year || "2024",
              academic_year: project.academic_year || project.student_batch,
              team_count: project.team_count || 1,
              created_by_name: project.created_by_name,
              status: project.status || "completed",
              technologies: project.technologies || [],
            }))
          : [];

        console.log('🖼️ Projects with thumbnails:', transformedProjects.map(p => ({ 
          id: p.id, 
          title: p.title.substring(0, 30), 
          thumbnail: p.thumbnail ? 'HAS THUMBNAIL' : 'NO THUMBNAIL',
          thumbnailUrl: p.thumbnail 
        })));

        setProjects(transformedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useCallback(
    (searchTerm: string, categoryFilter: string, yearFilter: string, page = 1) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        setCurrentPage(page);
        fetchProjects(searchTerm, categoryFilter, yearFilter, page);
      }, 500);
      setSearchTimeout(timeout);
    },
    [fetchProjects, searchTimeout]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value, selectedCategory, selectedYear, 1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    debouncedSearch(searchQuery, category, selectedYear, 1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    debouncedSearch(searchQuery, selectedCategory, year, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjects(searchQuery, selectedCategory, selectedYear, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectClick = (projectId: number) => {
    window.location.href = `/projects/${projectId}`;
  };

  const openLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Initialize page - fetch projects and years on mount
  useEffect(() => {
    // Fetch available years first
    fetchAvailableYears();
    
    // Fetch projects
    fetchProjects("", "all", "all", 1);
  }, [fetchProjects, fetchAvailableYears]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRetry = () => {
    fetchProjects(searchQuery, selectedCategory, selectedYear, currentPage);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#191A23] border-t-[#B9FF66] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#191A23] font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#191A23] mb-2">
            Error Loading Projects
          </h2>
          <p className="text-[#191A23]/70 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <section className="py-20 bg-gradient-to-b from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191A23] mb-6">
              Student{" "}
              <span className="text-[#191A23] px-2 md:px-4 py-1 md:py-2 rounded-xl">
                Projects
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the complete collection of innovative projects created by
              our talented students across various categories and technologies
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="flex flex-col gap-6">
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects, technologies, or creators..."
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="relative w-full">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-[#191A23] text-[#B9FF66] px-6 py-4 rounded-xl hover:bg-[#2A2B35] transition-colors font-medium shadow-lg"
                  >
                    <span className="flex items-center">
                      <Code2 className="w-5 h-5 mr-2" />
                      {
                        categories.find(
                          (category) => category.value === selectedCategory
                        )?.label
                      }
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="py-2">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            onClick={() => {
                              handleCategoryChange(category.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center ${
                              selectedCategory === category.value
                                ? "bg-[#B9FF66]/10 text-[#191A23] font-medium border-r-4 border-[#B9FF66]"
                                : "text-gray-700"
                            }`}
                          >
                            <Code2 className="w-4 h-4 mr-3 text-gray-400" />
                            {category.label}
                            {selectedCategory === category.value && (
                              <div className="ml-auto w-2 h-2 bg-[#B9FF66] rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year filter removed per request */}
              </div>
            </div>

            {/* Active filters display */}
            {(searchQuery || selectedCategory !== "all" || selectedYear !== "all") && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <div className="flex items-center bg-[#B9FF66]/20 text-[#191A23] px-3 py-1 rounded-full text-sm">
                      <Search className="w-3 h-3 mr-2" />
                      Search: &ldquo;{searchQuery}&rdquo;
                      <button
                        onClick={() => handleSearchChange("")}
                        className="ml-2 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedCategory !== "all" && (
                    <div className="flex items-center bg-[#191A23]/10 text-[#191A23] px-3 py-1 rounded-full text-sm">
                      <Code2 className="w-3 h-3 mr-2" />
                      {
                        categories.find((b) => b.value === selectedCategory)?.label
                      }
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="ml-2 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedYear !== "all" && (
                    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <Calendar className="w-3 h-3 mr-2" />
                      {selectedYear}
                      <button
                        onClick={() => handleYearChange("all")}
                        className="ml-2 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results summary */}
          {(searchQuery || selectedCategory !== "all" || selectedYear !== "all") && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-bold text-[#191A23]">
                  {totalCount}
                </span>{" "}
                project{totalCount !== 1 ? "s" : ""}
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
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-medium">
                      {
                        categories.find((b) => b.value === selectedCategory)
                          ?.label
                      }
                    </span>
                  </span>
                )}
                {selectedYear !== "all" && (
                  <span>
                    {" "}
                    for{" "}
                    <span className="font-medium">
                      {selectedYear}
                    </span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    {/* Image Section - Rebuilt exactly like homepage */}
                    <div className="relative h-64 overflow-hidden">
                      {project.thumbnail ? (
                        <div className="absolute inset-0">
                          <Image
                            src={getImageUrl(project.thumbnail) || project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        </div>
                      ) : (
                        <>
                          {/* Electrical circuit background pattern as fallback */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                          <svg
                            className="absolute inset-0 w-full h-full opacity-10"
                            viewBox="0 0 200 150"
                            fill="none"
                          >
                            <path
                              d="M20 30 L180 30 M20 60 L100 60 L100 90 L180 90 M20 120 L60 120 L60 60"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                            <circle cx="60" cy="30" r="3" fill="#191A23" />
                            <circle cx="100" cy="60" r="3" fill="#191A23" />
                            <circle cx="180" cy="90" r="3" fill="#191A23" />
                            <rect
                              x="140"
                              y="25"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                            <rect
                              x="80"
                              y="85"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                          </svg>
                        </>
                      )}

                      {/* Badges Overlay */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                        {/* Academic Year Badge - Top Priority */}
                        {(project.academic_year || project.student_batch) && (
                          <div className="bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-full flex items-center shadow-lg">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.academic_year || project.student_batch}
                          </div>
                        )}
                        {project.is_featured && (
                          <div className="bg-[#B9FF66] text-[#191A23] px-3 py-1 text-xs font-bold rounded-full flex items-center shadow-lg">
                            <Star className="w-3 h-3 mr-1" />
                            FEATURED
                          </div>
                        )}
                        {project.status && (
                          <div
                            className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                              project.status === "completed"
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            }`}
                          >
                            {project.status === "completed"
                              ? "✓ Complete"
                              : "⏳ In Progress"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative p-8 space-y-4">
                      <h3 className="text-xl md:text-2xl font-bold text-[#191A23] mb-3 line-clamp-2 group-hover:text-[#2A2B35] transition-colors">
                        {project.title}
                      </h3>

                      {/* Shortened description - show first 2 lines of abstract or description */}
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                        {project.abstract || project.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                      </div>

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#B9FF66]/10 text-[#191A23] text-xs font-medium rounded-full border border-[#B9FF66]/20 hover:bg-[#B9FF66]/20 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/projects/${project.id}`;
                          }}
                          className="flex-1 bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Project
                        </button>
                        {project.github_url && (
                          <button
                            onClick={(e) => openLink(project.github_url!, e)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#191A23] px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          >
                            <Github className="w-4 h-4 mr-2" />
                            Source
                          </button>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#B9FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-b-3xl"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={!hasPrevPage}
                    className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          pageNumber === currentPage
                            ? 'bg-[#191A23] text-[#B9FF66] font-semibold'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={!hasNextPage}
                    className="flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}

              {/* Results count */}
              {totalCount > 0 && (
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm">
                    Showing page {currentPage} of {totalPages} ({totalCount} total projects)
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-[#191A23] mb-4">
                {searchQuery || selectedCategory !== "all" || selectedYear !== "all"
                  ? `No projects found${
                      searchQuery ? ` matching "${searchQuery}"` : ""
                    }${
                      selectedCategory !== "all"
                        ? ` in ${
                            categories.find((b) => b.value === selectedCategory)
                              ?.label
                          }`
                        : ""
                    }${
                      selectedYear !== "all"
                        ? ` for ${selectedYear}`
                        : ""
                    }`
                  : "No projects available at the moment"}
              </h3>

              {(searchQuery || selectedCategory !== "all" || selectedYear !== "all") && (
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedCategory !== "all" && (
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Show All Categories
                    </button>
                  )}
                  {selectedYear !== "all" && (
                    <button
                      onClick={() => handleYearChange("all")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Show All Years
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {(isDropdownOpen || isYearDropdownOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsYearDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
