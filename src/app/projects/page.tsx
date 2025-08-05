"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image"; // Use Next.js Image for performance
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
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

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
  thumbnail_image?: string | null; // Direct image URL from API
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
  // Initialize with an empty array; no more sample data
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

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

  const fetchProjects = useCallback(
    async (searchTerm = "", categoryFilter = "all") => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }
        if (categoryFilter !== "all") {
          params.append("category", categoryFilter);
        }
        const queryString = params.toString();
        // Use the API endpoint you provided
        const url = `${API_BASE_URL}/projects/${
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
        const projectsData = data.projects || data.results || data;

        const transformedProjects = Array.isArray(projectsData)
          ? projectsData.map((project: Project) => ({
              ...project,
              student_batch: project.student_batch || "2024",
              team_count: project.team_members?.length || 1,
              created_by_name: project.created_by_name,
              // Use thumbnail_image directly from the API response
              thumbnail_image: project.thumbnail_image || null,
              status: project.status || "completed",
              technologies: project.technologies || [],
            }))
          : [];

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
    (searchTerm: string, categoryFilter: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      const timeout = setTimeout(() => {
        fetchProjects(searchTerm, categoryFilter);
      }, 500);
      setSearchTimeout(timeout);
    },
    [fetchProjects, searchTimeout]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    debouncedSearch(searchQuery, category);
  };

  const handleProjectClick = (projectId: number) => {
    window.location.href = `/projects/${projectId}`;
  };

  const openLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    fetchProjects("", "all");
  }, [fetchProjects]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRetry = () => {
    fetchProjects(searchQuery, selectedCategory);
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

              <div className="relative w-full max-w-md mx-auto lg:mx-0">
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
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
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
            </div>

            {(searchQuery || selectedCategory !== "all") && (
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
                        categories.find((b) => b.value === selectedCategory)
                          ?.label
                      }
                      <button
                        onClick={() => handleCategoryChange("all")}
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

          {(searchQuery || selectedCategory !== "all") && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Found{" "}
                <span className="font-bold text-[#191A23]">
                  {projects.length}
                </span>{" "}
                project{projects.length !== 1 ? "s" : ""}
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
              </p>
            </div>
          )}

          {projects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {project.thumbnail_image ? (
                      <Image
                        src={`http://localhost:8000${project.thumbnail_image}`}
                        alt={`${project.title} cover image`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-500 group-hover:scale-110"
                        priority={false}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full relative z-10 bg-gradient-to-br from-[#191A23] to-[#2A2B35]">
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
                        <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                          <div className="w-20 h-20 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <Code2 className="w-10 h-10 text-[#191A23]" />
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm text-[#B9FF66] px-4 py-2 rounded-full text-sm font-medium">
                            {project.category}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
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

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

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

                    {project.student_batch && (
                      <div className="flex items-center bg-gray-50 px-4 py-3 rounded-xl mb-4">
                        <div className="w-8 h-8 bg-[#191A23] rounded-full flex items-center justify-center mr-3">
                          <Calendar className="w-4 h-4 text-[#B9FF66]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#191A23]">
                            {project.student_batch}
                          </p>
                          <p className="text-xs text-gray-500">Student Batch</p>
                        </div>
                      </div>
                    )}

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

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {project.demo_url && (
                        <button
                          onClick={(e) => openLink(project.demo_url!, e)}
                          className="flex-1 bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </button>
                      )}
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
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-[#191A23] mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? `No projects found${
                      searchQuery ? ` matching "${searchQuery}"` : ""
                    }${
                      selectedCategory !== "all"
                        ? ` in ${
                            categories.find((b) => b.value === selectedCategory)
                              ?.label
                          }`
                        : ""
                    }`
                  : selectedCategory !== "all"
                  ? `No projects found in ${
                      categories.find((b) => b.value === selectedCategory)
                        ?.label
                    }`
                  : "No projects available at the moment"}
              </h3>

              {(searchQuery || selectedCategory !== "all") && (
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
                </div>
              )}
            </div>
          )}
        </div>
      </section>

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
