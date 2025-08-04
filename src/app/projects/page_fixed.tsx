"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Simple Project interface matching backend response
interface Project {
  id: number;
  title: string;
  description: string;
  abstract?: string;
  category: string;
  student_batch?: string;
  created_at: string;
  updated_at?: string;
  github_url?: string;
  demo_url?: string;
  project_report?: string;
  featured_image?: string;
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
  }>;
  videos?: Array<{
    id: number;
    video: string;
    caption?: string;
  }>;
  // For compatibility with frontend display
  batch?: string;
  team_count?: number;
  created_by_name?: string;
  technologies?: string[];
  status?: string;
  thumbnail_image?: string;
}

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Student Assistant",
    description:
      "An intelligent chatbot that helps students with academic queries, course recommendations, and campus navigation using natural language processing.",
    category: "AI/ML",
    batch: "2024-2025",
    created_at: "2024-03-15T10:00:00Z",
    github_url: "https://github.com/example/ai-assistant",
    demo_url: "https://ai-assistant.example.com",
    is_featured: true,
    team_count: 4,
    created_by_name: "John Doe",
    status: "completed",
    technologies: ["Python", "TensorFlow", "React", "Node.js"],
  },
  {
    id: 2,
    title: "Smart Campus Management System",
    description:
      "A comprehensive web application for managing campus resources, student attendance, and academic schedules with real-time notifications.",
    category: "Web Development",
    batch: "2024-2025",
    created_at: "2024-02-20T14:30:00Z",
    github_url: "https://github.com/example/campus-management",
    demo_url: "https://campus-management.example.com",
    team_count: 3,
    created_by_name: "Jane Smith",
    status: "completed",
    technologies: ["React", "Node.js", "MongoDB"],
  },
];

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Available categories for filtering (using category instead of batch since API provides this)
  const batches = [
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

  // Fetch projects from API
  const fetchProjects = useCallback(
    async (searchTerm = "", batchFilter = "all") => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        if (batchFilter !== "all") {
          params.append("category", batchFilter);
        }

        const queryString = params.toString();
        const url = `${API_BASE_URL}/api/projects/${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle the actual API response structure: {projects: [...], count: number, filters: {...}}
        const projectsData = data.projects || data.results || data;

        // Transform API data to match frontend interface if needed
        const transformedProjects = Array.isArray(projectsData)
          ? projectsData.map((project: Project) => ({
              ...project,
              // Use category as batch for now since student_batch is not in API
              batch: project.category || "Unknown",
              // API already provides these fields
              created_by_name: project.created_by_name,
              team_count: project.team_count || 1,
              thumbnail_image: project.featured_image,
              // Default status if not provided
              status: project.status || "completed",
              // You can add technologies parsing here if stored in description or other field
              technologies: project.technologies || [],
            }))
          : [];

        setProjects(transformedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
        // Fallback to sample data on error
        setProjects(sampleProjects);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchTerm: string, batchFilter: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        fetchProjects(searchTerm, batchFilter);
      }, 500);

      setSearchTimeout(timeout);
    },
    [fetchProjects, searchTimeout]
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value, selectedBatch);
  };

  // Handle batch filter change
  const handleBatchChange = (batch: string) => {
    setSelectedBatch(batch);
    debouncedSearch(searchQuery, batch);
  };

  // Handle project click
  const handleProjectClick = (projectId: number) => {
    window.location.href = `/projects/${projectId}`;
  };

  // Handle external link opening
  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Initial load
  useEffect(() => {
    fetchProjects("", "all");
  }, [fetchProjects]);

  // Get featured project for hero section
  const featuredProject = projects.find((p) => p.is_featured) || projects[0];

  // Use projects directly since filtering is done server-side
  const filteredProjects = projects;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle retry
  const handleRetry = () => {
    fetchProjects(searchQuery, selectedBatch);
  };

  // Loading state
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

  // Error state
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
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#191A23] via-[#2A2B35] to-[#191A23] min-h-[90vh]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#B9FF66]/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#B9FF66]/20 rounded-full blur-lg animate-bounce delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-[#B9FF66]/5 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-[#B9FF66]/15 rounded-full blur-xl animate-bounce delay-2000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(185, 255, 102, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(185, 255, 102, 0.2) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex items-center min-h-[90vh]">
          <div className="w-full">
            {/* Hero Content - Top Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-[#B9FF66]/10 border border-[#B9FF66]/30 rounded-full px-6 py-3 mb-8">
                <Code2 className="w-5 h-5 text-[#B9FF66] mr-2" />
                <span className="text-[#B9FF66] font-medium">
                  Student Innovation Hub
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Student <span className="text-[#B9FF66]">Projects</span>
                <br />
                <span className="text-[#B9FF66]">Showcase</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Discover innovative solutions, creative applications, and
                cutting-edge technology built by our talented students
              </p>

              {/* Stats */}
              <div className="flex justify-center items-center gap-8 md:gap-12 mb-12">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#B9FF66] mb-2">
                    {projects.length}+
                  </div>
                  <div className="text-gray-400 text-sm">Projects</div>
                </div>
                <div className="w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#B9FF66] mb-2">
                    12+
                  </div>
                  <div className="text-gray-400 text-sm">Categories</div>
                </div>
                <div className="w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#B9FF66] mb-2">
                    50+
                  </div>
                  <div className="text-gray-400 text-sm">Students</div>
                </div>
              </div>
            </div>

            {/* Featured Project Spotlight */}
            {featuredProject && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 lg:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-4 py-2 rounded-full font-bold text-sm mb-4">
                    <Star className="w-4 h-4 mr-2" />
                    FEATURED PROJECT
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Project Visual */}
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#B9FF66]/20 to-[#B9FF66]/5 rounded-2xl border border-[#B9FF66]/20 flex items-center justify-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div
                          className="h-full w-full"
                          style={{
                            backgroundImage: `
                            linear-gradient(45deg, rgba(185, 255, 102, 0.3) 25%, transparent 25%),
                            linear-gradient(-45deg, rgba(185, 255, 102, 0.3) 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, rgba(185, 255, 102, 0.3) 75%),
                            linear-gradient(-45deg, transparent 75%, rgba(185, 255, 102, 0.3) 75%)
                          `,
                            backgroundSize: "20px 20px",
                            backgroundPosition:
                              "0 0, 0 10px, 10px -10px, -10px 0px",
                          }}
                        ></div>
                      </div>

                      {/* Project Icon */}
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <Code2 className="w-12 h-12 text-[#191A23]" />
                        </div>
                        <div className="bg-[#191A23]/80 backdrop-blur-sm text-[#B9FF66] px-4 py-2 rounded-full text-sm font-medium">
                          {featuredProject.category}
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute top-4 left-4 w-3 h-3 bg-[#B9FF66] rounded-full animate-ping"></div>
                      <div className="absolute bottom-6 right-6 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute top-1/3 right-8 w-4 h-4 border-2 border-[#B9FF66] rounded-full animate-bounce"></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                      {featuredProject.title}
                    </h2>

                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {featuredProject.description}
                    </p>

                    {/* Project Meta */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                      {featuredProject.created_by_name && (
                        <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Users className="w-4 h-4 text-[#B9FF66] mr-2" />
                          <span className="text-white text-sm">
                            {featuredProject.created_by_name}
                          </span>
                        </div>
                      )}
                      {featuredProject.team_count &&
                        featuredProject.team_count > 1 && (
                          <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <Users className="w-4 h-4 text-[#B9FF66] mr-2" />
                            <span className="text-white text-sm">
                              Team of {featuredProject.team_count}
                            </span>
                          </div>
                        )}
                      <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4 text-[#B9FF66] mr-2" />
                        <span className="text-white text-sm">
                          {formatDate(featuredProject.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      {featuredProject.demo_url && (
                        <button
                          onClick={() => openLink(featuredProject.demo_url!)}
                          className="bg-[#B9FF66] hover:bg-[#B9FF66]/90 text-[#191A23] px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          View Live Demo
                        </button>
                      )}
                      {featuredProject.github_url && (
                        <button
                          onClick={() => openLink(featuredProject.github_url!)}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          <Github className="w-5 h-5 mr-2" />
                          Source Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Projects List Section */}
      <section className="py-20 bg-gradient-to-b from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-[#191A23]/5 border border-[#191A23]/10 rounded-full px-6 py-3 mb-6">
              <Code2 className="w-5 h-5 text-[#191A23] mr-2" />
              <span className="text-[#191A23] font-medium">
                Browse Projects
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#191A23] mb-6">
              All Student{" "}
              <span className="text-[#B9FF66] bg-[#191A23] px-4 py-2 rounded-xl">
                Projects
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the complete collection of innovative projects created by
              our talented students across various categories and technologies
            </p>
          </div>

          {/* Enhanced Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Input */}
              <div className="relative flex-1">
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

              {/* Category Filter Dropdown */}
              <div className="relative lg:w-64">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#191A23] text-[#B9FF66] px-6 py-4 rounded-xl hover:bg-[#2A2B35] transition-colors font-medium shadow-lg"
                >
                  <span className="flex items-center">
                    <Code2 className="w-5 h-5 mr-2" />
                    {
                      batches.find((batch) => batch.value === selectedBatch)
                        ?.label
                    }
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Enhanced Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="py-2">
                      {batches.map((batch) => (
                        <button
                          key={batch.value}
                          onClick={() => {
                            handleBatchChange(batch.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center ${
                            selectedBatch === batch.value
                              ? "bg-[#B9FF66]/10 text-[#191A23] font-medium border-r-4 border-[#B9FF66]"
                              : "text-gray-700"
                          }`}
                        >
                          <Code2 className="w-4 h-4 mr-3 text-gray-400" />
                          {batch.label}
                          {selectedBatch === batch.value && (
                            <div className="ml-auto w-2 h-2 bg-[#B9FF66] rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || selectedBatch !== "all") && (
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
                  {selectedBatch !== "all" && (
                    <div className="flex items-center bg-[#191A23]/10 text-[#191A23] px-3 py-1 rounded-full text-sm">
                      <Code2 className="w-3 h-3 mr-2" />
                      {batches.find((b) => b.value === selectedBatch)?.label}
                      <button
                        onClick={() => handleBatchChange("all")}
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

          {/* Results Summary */}
          {(searchQuery || selectedBatch !== "all") && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-bold text-[#191A23]">
                  {filteredProjects.length}
                </span>{" "}
                project{filteredProjects.length !== 1 ? "s" : ""}
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
                {selectedBatch !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-medium">
                      {batches.find((b) => b.value === selectedBatch)?.label}
                    </span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Enhanced Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Project Visual Section */}
                  <div className="relative h-64 bg-gradient-to-br from-[#191A23] to-[#2A2B35] overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage: `
                          radial-gradient(circle at 25% 25%, rgba(185, 255, 102, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(185, 255, 102, 0.2) 0%, transparent 50%)
                        `,
                        }}
                      ></div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-[#B9FF66] rounded-full animate-pulse"></div>
                    <div className="absolute top-8 right-8 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute bottom-6 left-6 w-4 h-4 border border-[#B9FF66]/50 rounded-full animate-bounce"></div>

                    {/* Project Icon */}
                    <div className="flex items-center justify-center h-full relative z-10">
                      <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                        <div className="w-20 h-20 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                          <Code2 className="w-10 h-10 text-[#191A23]" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm text-[#B9FF66] px-4 py-2 rounded-full text-sm font-medium">
                          {project.category}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
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

                  {/* Project Content */}
                  <div className="relative p-8 space-y-4">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-[#191A23] mb-3 line-clamp-2 group-hover:text-[#2A2B35] transition-colors">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Project Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                      {project.team_count && project.team_count > 1 && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Team of {project.team_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Creator */}
                    {project.created_by_name && (
                      <div className="flex items-center bg-gray-50 px-4 py-3 rounded-xl mb-4">
                        <div className="w-8 h-8 bg-[#191A23] rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-[#B9FF66]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#191A23]">
                            {project.created_by_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Project Creator
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Technologies */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies
                            .slice(0, 3)
                            .map((tech, index) => (
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {project.demo_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLink(project.demo_url!);
                          }}
                          className="flex-1 bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </button>
                      )}
                      {project.github_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLink(project.github_url!);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#191A23] px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Source
                        </button>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#B9FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-b-3xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-[#191A23] mb-4">
                {searchQuery || selectedBatch !== "all"
                  ? `No projects found${
                      searchQuery ? ` matching "${searchQuery}"` : ""
                    }${
                      selectedBatch !== "all"
                        ? ` in ${
                            batches.find((b) => b.value === selectedBatch)
                              ?.label
                          }`
                        : ""
                    }`
                  : selectedBatch !== "all"
                  ? `No projects found in ${
                      batches.find((b) => b.value === selectedBatch)?.label
                    }`
                  : "No projects available at the moment"}
              </h3>

              {/* Clear Filters Buttons */}
              {(searchQuery || selectedBatch !== "all") && (
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedBatch !== "all" && (
                    <button
                      onClick={() => handleBatchChange("all")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
