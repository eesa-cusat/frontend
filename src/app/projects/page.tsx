"use client";

import React, { useState, useEffect } from "react";
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

// Simple Project interface
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  batch?: string;
  created_at: string;
  github_url?: string;
  demo_url?: string;
  thumbnail_image?: string;
  is_featured?: boolean;
  team_count?: number;
  created_by_name?: string;
  technologies?: string[];
  status?: string;
}

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Student Assistant",
    description: "An intelligent chatbot that helps students with academic queries, course recommendations, and campus navigation using natural language processing.",
    category: "AI/ML",
    batch: "2024",
    created_at: "2024-03-15T10:00:00Z",
    github_url: "https://github.com/example/ai-assistant",
    demo_url: "https://ai-assistant.example.com",
    is_featured: true,
    team_count: 4,
    created_by_name: "John Doe",
    technologies: ["Python", "TensorFlow", "React", "Node.js"],
    status: "completed",
  },
  {
    id: 2,
    title: "Smart Campus IoT System",
    description: "IoT-based system for monitoring classroom occupancy, energy consumption, and environmental conditions across the campus.",
    category: "IoT",
    batch: "2024",
    created_at: "2024-02-20T14:30:00Z",
    github_url: "https://github.com/example/smart-campus",
    team_count: 5,
    created_by_name: "Jane Smith",
    technologies: ["Arduino", "React", "Node.js", "MongoDB"],
    status: "in_progress",
  },
  {
    id: 3,
    title: "Blockchain Voting System",
    description: "Secure and transparent voting system using blockchain technology for student elections and surveys.",
    category: "Blockchain",
    batch: "2023",
    created_at: "2023-11-10T09:15:00Z",
    github_url: "https://github.com/example/blockchain-voting",
    demo_url: "https://voting.example.com",
    team_count: 3,
    created_by_name: "Alex Johnson",
    technologies: ["Solidity", "Web3.js", "React", "Ethereum"],
    status: "completed",
  },
  {
    id: 4,
    title: "E-Learning Platform",
    description: "Interactive learning platform with video lectures, quizzes, and progress tracking for engineering courses.",
    category: "Education",
    batch: "2023",
    created_at: "2023-09-05T12:00:00Z",
    github_url: "https://github.com/example/elearning",
    demo_url: "https://learn.example.com",
    team_count: 6,
    created_by_name: "Sarah Wilson",
    technologies: ["React", "Django", "PostgreSQL", "AWS"],
    status: "completed",
  },
  {
    id: 5,
    title: "Mobile Health Tracker",
    description: "Cross-platform mobile app for tracking health metrics, diet, and exercise routines with social features.",
    category: "Mobile",
    batch: "2022",
    created_at: "2022-12-18T16:30:00Z",
    github_url: "https://github.com/example/health-tracker",
    team_count: 2,
    created_by_name: "Michael Chen",
    technologies: ["React Native", "Firebase", "Node.js"],
    status: "completed",
  },
  {
    id: 6,
    title: "Data Analytics Dashboard",
    description: "Real-time analytics dashboard for visualizing student performance, attendance, and engagement metrics.",
    category: "Data Science",
    batch: "2022",
    created_at: "2022-10-25T08:45:00Z",
    github_url: "https://github.com/example/analytics-dashboard",
    demo_url: "https://analytics.example.com",
    team_count: 4,
    created_by_name: "Emily Rodriguez",
    technologies: ["Python", "D3.js", "Flask", "Pandas"],
    status: "completed",
  },
];

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Available batches for filtering
  const batches = [
    { value: "all", label: "All Batches" },
    { value: "2024", label: "Batch 2024" },
    { value: "2023", label: "Batch 2023" },
    { value: "2022", label: "Batch 2022" },
    { value: "2021", label: "Batch 2021" },
  ];

  // Load projects data
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(sampleProjects);
      } catch {
        setError("Failed to load projects");
        setProjects(sampleProjects); // Fallback to sample data
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filter projects based on search and batch
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies?.some(tech => 
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesBatch = 
      selectedBatch === "all" || project.batch === selectedBatch;

    return matchesSearch && matchesBatch;
  });

  // Get featured project
  const featuredProject = projects.find(p => p.is_featured) || projects[0];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle external links
  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Loading state
  if (loading) {
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
            onClick={() => window.location.reload()}
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
      {/* Hero Section with Featured Project */}
      {featuredProject && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F3F3F3] to-[#E8E8E8]"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 lg:p-12 shadow-lg">
              
              {/* Mobile Layout */}
              <div className="block lg:hidden">
                {/* Project Image */}
                <div className="text-center mb-8">
                  <div className="w-48 h-64 bg-white border border-white/60 rounded-lg mx-auto mb-6 overflow-hidden relative">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#191A23] rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Code2 className="w-8 h-8 text-[#B9FF66]" />
                        </div>
                        <p className="text-[#191A23]/60 text-sm font-medium">
                          {featuredProject.category}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 bg-[#191A23]/90 text-[#B9FF66] px-2 py-1 text-xs font-medium rounded">
                      {featuredProject.category}
                    </div>
                    {featuredProject.is_featured && (
                      <div className="absolute top-2 right-2 bg-[#B9FF66] text-[#191A23] px-2 py-1 text-xs font-bold rounded flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Batch Badge */}
                  {featuredProject.batch && (
                    <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium rounded-lg mb-4">
                      Batch {featuredProject.batch}
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-[#191A23] mb-4 leading-tight">
                    {featuredProject.title}
                  </h1>
                  <p className="text-[#191A23]/80 mb-6 leading-relaxed">
                    {featuredProject.description}
                  </p>

                  {/* Technologies */}
                  {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {featuredProject.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/60 text-[#191A23] text-sm rounded-full border border-white/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {featuredProject.demo_url && (
                      <button
                        onClick={() => openLink(featuredProject.demo_url!)}
                        className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        View Demo
                      </button>
                    )}
                    {featuredProject.github_url && (
                      <button
                        onClick={() => openLink(featuredProject.github_url!)}
                        className="flex-1 bg-white/60 border border-white/80 text-[#191A23] hover:bg-white/80 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Code
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex gap-12 items-start">
                {/* Left: Project Image */}
                <div className="flex-shrink-0">
                  <div className="w-64 h-80 bg-white border border-white/60 rounded-lg overflow-hidden relative mb-6">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-[#191A23] rounded-lg flex items-center justify-center mx-auto mb-6">
                          <Code2 className="w-10 h-10 text-[#B9FF66]" />
                        </div>
                        <p className="text-[#191A23]/60 font-medium">
                          {featuredProject.category}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 bg-[#191A23]/90 text-[#B9FF66] px-3 py-1 text-sm font-medium rounded">
                      {featuredProject.category}
                    </div>
                    {featuredProject.is_featured && (
                      <div className="absolute top-3 right-3 bg-[#B9FF66] text-[#191A23] px-3 py-1 text-sm font-bold rounded flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {featuredProject.demo_url && (
                      <button
                        onClick={() => openLink(featuredProject.demo_url!)}
                        className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Demo
                      </button>
                    )}
                    {featuredProject.github_url && (
                      <button
                        onClick={() => openLink(featuredProject.github_url!)}
                        className="flex-1 bg-white/60 border border-white/80 text-[#191A23] hover:bg-white/80 px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Code
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Project Details */}
                <div className="flex-1">
                  {/* Batch Badge */}
                  {featuredProject.batch && (
                    <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium rounded-lg mb-6">
                      Batch {featuredProject.batch}
                    </div>
                  )}

                  <h1 className="text-4xl font-bold text-[#191A23] mb-6 leading-tight">
                    {featuredProject.title}
                  </h1>

                  <p className="text-[#191A23]/80 text-lg mb-8 leading-relaxed">
                    {featuredProject.description}
                  </p>

                  {/* Project Details */}
                  <div className="space-y-4 mb-8">
                    {featuredProject.created_by_name && (
                      <div className="flex items-center bg-white/60 p-4 rounded-lg border border-white/60">
                        <Users className="w-6 h-6 text-[#191A23] mr-4" />
                        <div>
                          <span className="text-[#191A23] font-medium">
                            Created by {featuredProject.created_by_name}
                          </span>
                          {featuredProject.team_count && featuredProject.team_count > 1 && (
                            <span className="text-[#191A23]/70 ml-2">
                              (Team of {featuredProject.team_count})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                      <div className="bg-white/60 p-4 rounded-lg border border-white/60">
                        <h4 className="text-[#191A23] font-medium mb-3">Technologies Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {featuredProject.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#191A23] text-[#B9FF66] text-sm rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Projects List Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#191A23] mb-4">
              Student Projects
            </h2>
            <p className="text-[#191A23]/70 text-lg max-w-2xl mx-auto">
              Explore innovative projects created by our talented students across different batches and technologies
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, technologies, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-[#191A23]/20 rounded-lg bg-white/80 text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 hover:text-[#191A23]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Batch Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between bg-[#191A23] text-[#B9FF66] px-6 py-3 rounded-lg hover:bg-[#191A23]/90 transition-colors min-w-[180px] font-medium"
              >
                <span>
                  {batches.find(batch => batch.value === selectedBatch)?.label}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 ml-2 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#191A23] border border-[#191A23] rounded-lg shadow-lg z-20 overflow-hidden">
                  {batches.map((batch) => (
                    <button
                      key={batch.value}
                      onClick={() => {
                        setSelectedBatch(batch.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        selectedBatch === batch.value
                          ? "bg-[#B9FF66] text-[#191A23] font-medium"
                          : "text-[#B9FF66] hover:bg-[#191A23]/80"
                      }`}
                    >
                      {batch.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Info */}
          {(searchQuery || selectedBatch !== "all") && (
            <div className="mb-6">
              <p className="text-[#191A23]/70 text-sm">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedBatch !== "all" && 
                  ` in ${batches.find(b => b.value === selectedBatch)?.label}`
                }
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/80 border border-white/60 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-[#F3F3F3] overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#191A23] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#B9FF66] transition-colors duration-300">
                          <Code2 className="w-6 h-6 text-[#B9FF66] group-hover:text-[#191A23] transition-colors duration-300" />
                        </div>
                        <p className="text-[#191A23]/60 text-sm">{project.category}</p>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-[#191A23]/90 text-[#B9FF66] px-3 py-1 text-xs font-medium rounded backdrop-blur-sm">
                      {project.category}
                    </div>
                    
                    {/* Featured Badge */}
                    {project.is_featured && (
                      <div className="absolute top-3 right-3 bg-[#B9FF66] text-[#191A23] px-3 py-1 text-xs font-bold rounded">
                        FEATURED
                      </div>
                    )}
                    
                    {/* Batch Badge */}
                    {project.batch && (
                      <div className="absolute bottom-3 left-3 bg-white/90 text-[#191A23] px-2 py-1 text-xs font-medium rounded backdrop-blur-sm">
                        Batch {project.batch}
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    {project.status && (
                      <div className={`absolute bottom-3 right-3 px-2 py-1 text-xs font-medium rounded backdrop-blur-sm ${
                        project.status === "completed" 
                          ? "bg-green-500/90 text-white" 
                          : "bg-orange-500/90 text-white"
                      }`}>
                        {project.status === "completed" ? "Completed" : "In Progress"}
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    {/* Date and Team Info */}
                    <div className="flex items-center text-[#191A23]/60 text-sm mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(project.created_at)}</span>
                      {project.team_count && project.team_count > 1 && (
                        <>
                          <Users className="w-4 h-4 ml-4 mr-2" />
                          <span>Team of {project.team_count}</span>
                        </>
                      )}
                    </div>

                    {/* Project Title */}
                    <h3 className="text-xl font-bold text-[#191A23] mb-3">
                      {project.title}
                    </h3>

                    {/* Project Description */}
                    <p className="text-[#191A23]/70 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Creator */}
                    {project.created_by_name && (
                      <div className="flex items-center text-[#191A23]/60 mb-4">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">{project.created_by_name}</span>
                      </div>
                    )}

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#B9FF66]/20 text-[#191A23] text-xs rounded border border-[#B9FF66]/40"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 bg-[#191A23]/10 text-[#191A23] text-xs rounded">
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {project.demo_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLink(project.demo_url!);
                          }}
                          className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </button>
                      )}
                      {project.github_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLink(project.github_url!);
                          }}
                          className="flex-1 bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#191A23]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="w-8 h-8 text-[#191A23]/50" />
              </div>
              <h3 className="text-xl font-semibold text-[#191A23] mb-2">
                No Projects Found
              </h3>
              <p className="text-[#191A23]/60 mb-6">
                {searchQuery
                  ? `No projects match "${searchQuery}"${
                      selectedBatch !== "all"
                        ? ` in ${batches.find(b => b.value === selectedBatch)?.label}`
                        : ""
                    }`
                  : selectedBatch !== "all"
                  ? `No projects found in ${batches.find(b => b.value === selectedBatch)?.label}`
                  : "No projects available at the moment"}
              </p>
              
              {/* Clear Filters Buttons */}
              {(searchQuery || selectedBatch !== "all") && (
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  {selectedBatch !== "all" && (
                    <button
                      onClick={() => setSelectedBatch("all")}
                      className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Show All Batches
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
