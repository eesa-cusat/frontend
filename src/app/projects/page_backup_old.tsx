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
} from "lucide-react";

// Project interface for API response
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  batch?: string;
  year?: string;
  created_at: string;
  updated_at?: string;
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  thumbnail_image?: string;
  is_featured?: boolean;
  team_count?: number;
  created_by_name?: string;
  technologies?: string[];
  status?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);

  // Available batches
  const availableBatches = [
    { value: "all", label: "All Batches" },
    { value: "2024", label: "Batch 2024" },
    { value: "2023", label: "Batch 2023" },
    { value: "2022", label: "Batch 2022" },
    { value: "2021", label: "Batch 2021" },
    { value: "2020", label: "Batch 2020" },
  ];

  // Mock data for fallback
  const mockProjects: Project[] = [
    {
      id: 1,
      title: "Smart IoT Energy Management System",
      description:
        "An intelligent energy management system using IoT sensors to monitor and optimize power consumption in residential and commercial buildings.",
      category: "IoT",
      batch: "2024",
      created_at: "2024-03-15T10:00:00Z",
      github_url: "https://github.com/example/energy-system",
      demo_url: "https://energy-demo.example.com",
      is_featured: true,
      team_count: 4,
      created_by_name: "John Doe",
      technologies: ["Arduino", "React", "Node.js", "MongoDB"],
      status: "completed",
    },
    {
      id: 2,
      title: "AI-Powered Medical Diagnosis Assistant",
      description:
        "Machine learning application that assists doctors in diagnosing diseases from medical imaging and patient symptoms.",
      category: "AI/ML",
      batch: "2023",
      created_at: "2023-11-20T14:30:00Z",
      github_url: "https://github.com/example/medical-ai",
      is_featured: false,
      team_count: 3,
      created_by_name: "Jane Smith",
      technologies: ["Python", "TensorFlow", "Flask", "OpenCV"],
      status: "completed",
    },
    {
      id: 3,
      title: "Blockchain-Based Supply Chain Tracker",
      description:
        "Transparent supply chain management system using blockchain technology to track products from manufacturing to delivery.",
      category: "Blockchain",
      batch: "2024",
      created_at: "2024-01-10T09:15:00Z",
      github_url: "https://github.com/example/supply-chain",
      team_count: 5,
      created_by_name: "Alex Johnson",
      technologies: ["Solidity", "Web3.js", "React", "Ethereum"],
      status: "in_progress",
    },
    {
      id: 4,
      title: "Mobile Health Tracking App",
      description:
        "Cross-platform mobile application for tracking health metrics, workout routines, and nutrition goals with social features.",
      category: "Mobile Development",
      batch: "2023",
      created_at: "2023-09-05T12:00:00Z",
      github_url: "https://github.com/example/health-tracker",
      demo_url: "https://health-app.example.com",
      is_featured: true,
      team_count: 2,
      created_by_name: "Sarah Wilson",
      technologies: ["React Native", "Firebase", "Node.js", "Express"],
      status: "completed",
    },
    {
      id: 5,
      title: "E-Learning Platform with Virtual Labs",
      description:
        "Interactive e-learning platform featuring virtual laboratory simulations for science and engineering courses.",
      category: "Education Technology",
      batch: "2022",
      created_at: "2022-12-18T16:30:00Z",
      github_url: "https://github.com/example/elearning-platform",
      demo_url: "https://virtuallab.example.com",
      is_featured: false,
      team_count: 6,
      created_by_name: "Michael Chen",
      technologies: ["Vue.js", "Three.js", "Django", "PostgreSQL"],
      status: "completed",
    },
    {
      id: 6,
      title: "Smart Agriculture Monitoring System",
      description:
        "IoT-based system for monitoring soil conditions, weather patterns, and crop health using sensor networks and machine learning.",
      category: "Agriculture Tech",
      batch: "2024",
      created_at: "2024-02-20T08:45:00Z",
      github_url: "https://github.com/example/smart-agriculture",
      team_count: 4,
      created_by_name: "Emily Rodriguez",
      technologies: ["Python", "Raspberry Pi", "AWS IoT", "React Dashboard"],
      status: "in_progress",
    },
  ];

  // Fetch projects from API or use mock data
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual API endpoint
      // const response = await fetch(`${API_BASE_URL}/projects/`);
      // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      // const data = await response.json();
      // setProjects(data.results || data || []);

      // For demo purposes, use mock data with simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProjects(mockProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again later.");
      setProjects(mockProjects); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects based on search and batch
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.created_by_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false) ||
      (project.technologies?.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      ) ??
        false);

    const matchesBatch =
      selectedBatch === "all" ||
      project.batch === selectedBatch ||
      project.year === selectedBatch;

    return matchesSearch && matchesBatch;
  });

  // Get featured project for hero section
  const featuredProject =
    projects.find((project) => project.is_featured) || projects[0];

  const handleProjectClick = (projectId: number) => {
    // In a real app, you'd use Next.js router or React Router
    console.log(`Navigate to project ${projectId}`);
    // router.push(`/projects/${projectId}`);
  };

  const Button = ({ children, onClick, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );

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

  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#191A23] mb-2">
            Error Loading Projects
          </h2>
          <p className="text-[#191A23]/70 mb-4">{error}</p>
          <Button
            onClick={fetchProjects}
            className="bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F3F3F3]">
        {/* Hero Section with Featured Project */}
        {featuredProject && (
          <section className="relative overflow-hidden min-h-[70vh]">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[#F3F3F3]"></div>
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10">
              <div className="backdrop-blur-xl bg-[#F3F3F3]/60 border border-white/40 shadow-lg mx-4 my-8 rounded-2xl overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-16">
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Project Image at Top */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/80 border border-white/60 relative overflow-hidden w-48 aspect-[3/4] rounded-lg">
                        {featuredProject.thumbnail_image ? (
                          <img
                            src={featuredProject.thumbnail_image}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-4 flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-[#191A23] flex items-center justify-center mx-auto mb-4 rounded-lg">
                                <Code2 className="w-8 h-8 text-[#B9FF66]" />
                              </div>
                              <h3 className="text-lg font-bold text-[#191A23] mb-2">
                                PROJECT
                              </h3>
                              <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                                {featuredProject.category || "Development"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Category Overlay */}
                        <div className="absolute top-2 left-2 bg-[#191A23]/90 text-[#B9FF66] px-2 py-1 text-xs font-medium rounded">
                          {featuredProject.category || "Project"}
                        </div>
                        {/* Featured Badge */}
                        {featuredProject.is_featured && (
                          <div className="absolute top-2 right-2 bg-[#B9FF66] text-[#191A23] px-2 py-1 text-xs font-bold rounded">
                            FEATURED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="text-center">
                      <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium mb-4 rounded-lg">
                        {featuredProject.batch &&
                          `Batch ${featuredProject.batch}`}
                        {featuredProject.year &&
                          !featuredProject.batch &&
                          `Year ${featuredProject.year}`}
                        {!featuredProject.batch &&
                          !featuredProject.year &&
                          "Latest Project"}
                      </div>

                      <h1 className="text-2xl font-bold text-[#191A23] leading-tight mb-4">
                        {featuredProject.title}
                      </h1>

                      <p className="text-[#191A23]/80 leading-relaxed mb-4">
                        {featuredProject.description}
                      </p>

                      {featuredProject.technologies &&
                        featuredProject.technologies.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {featuredProject.technologies
                              .slice(0, 3)
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white/40 text-[#191A23] text-xs rounded-full border border-white/40"
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        )}

                      <div className="flex gap-3">
                        {featuredProject.demo_url && (
                          <Button
                            onClick={() =>
                              window.open(featuredProject.demo_url, "_blank")
                            }
                            className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg"
                          >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            View Demo
                          </Button>
                        )}
                        {featuredProject.github_url && (
                          <Button
                            onClick={() =>
                              window.open(featuredProject.github_url, "_blank")
                            }
                            className="flex-1 bg-white/40 border border-white/60 text-[#191A23] hover:bg-white/60 px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg"
                          >
                            <Github className="w-5 h-5 mr-2" />
                            Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex gap-8 lg:gap-12 items-start">
                    {/* Left Column: Project Image */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/80 border border-white/60 relative overflow-hidden w-48 lg:w-64 aspect-[3/4] rounded-lg mb-4">
                        {featuredProject.thumbnail_image ? (
                          <img
                            src={featuredProject.thumbnail_image}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="p-4 lg:p-6 flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#191A23] flex items-center justify-center mx-auto mb-4 lg:mb-6 rounded-lg">
                                <Code2 className="w-8 h-8 lg:w-10 lg:h-10 text-[#B9FF66]" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-bold text-[#191A23] mb-2">
                                PROJECT
                              </h3>
                              <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                                {featuredProject.category || "Development"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Overlays */}
                        <div className="absolute top-2 left-2 bg-[#191A23]/90 text-[#B9FF66] px-2 py-1 text-xs font-medium rounded">
                          {featuredProject.category || "Project"}
                        </div>
                        {featuredProject.is_featured && (
                          <div className="absolute top-2 right-2 bg-[#B9FF66] text-[#191A23] px-2 py-1 text-xs font-bold rounded">
                            FEATURED
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {featuredProject.demo_url && (
                          <Button
                            onClick={() =>
                              window.open(featuredProject.demo_url, "_blank")
                            }
                            className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-4 text-base font-medium transition-all duration-300 rounded-lg"
                          >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Demo
                          </Button>
                        )}
                        {featuredProject.github_url && (
                          <Button
                            onClick={() =>
                              window.open(featuredProject.github_url, "_blank")
                            }
                            className="flex-1 bg-white/40 border border-white/60 text-[#191A23] hover:bg-white/60 px-6 py-4 text-base font-medium transition-all duration-300 rounded-lg"
                          >
                            <Github className="w-5 h-5 mr-2" />
                            Code
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Project Details */}
                    <div className="flex-1">
                      <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium mb-6 rounded-lg">
                        {featuredProject.batch &&
                          `Batch ${featuredProject.batch}`}
                        {featuredProject.year &&
                          !featuredProject.batch &&
                          `Year ${featuredProject.year}`}
                        {!featuredProject.batch &&
                          !featuredProject.year &&
                          "Latest Project"}
                      </div>

                      <h1 className="text-3xl lg:text-4xl font-bold text-[#191A23] leading-tight mb-6">
                        {featuredProject.title}
                      </h1>

                      <p className="text-[#191A23]/80 text-lg leading-relaxed mb-6">
                        {featuredProject.description}
                      </p>

                      <div className="grid gap-4 mb-6">
                        {featuredProject.created_by_name && (
                          <div className="flex items-center text-[#191A23]/80 bg-white/40 p-4 border border-white/40 rounded-lg">
                            <Users className="w-6 h-6 mr-4 text-[#191A23] flex-shrink-0" />
                            <span className="text-lg">
                              Created by {featuredProject.created_by_name}
                              {featuredProject.team_count &&
                                featuredProject.team_count > 1 && (
                                  <span className="ml-2 text-sm opacity-75">
                                    (Team of {featuredProject.team_count})
                                  </span>
                                )}
                            </span>
                          </div>
                        )}

                        {featuredProject.technologies &&
                          featuredProject.technologies.length > 0 && (
                            <div className="bg-white/40 p-4 border border-white/40 rounded-lg">
                              <h4 className="text-[#191A23] font-medium mb-2">
                                Technologies Used:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {featuredProject.technologies.map(
                                  (tech, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-[#191A23] text-[#B9FF66] text-sm rounded-full"
                                    >
                                      {tech}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Projects List Section */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#191A23] mb-4">
                Student Projects
              </h2>
              <p className="text-[#191A23]/70 text-lg max-w-2xl mx-auto">
                Explore innovative projects created by our talented students
                across different batches and technologies
              </p>
            </div>

            {/* Error Banner */}
            {error && projects.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects, technologies, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#191A23]/20 rounded-lg bg-white/80 text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
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

              {/* Batch Filter */}
              <div className="relative">
                <button
                  onClick={() => setBatchDropdownOpen(!batchDropdownOpen)}
                  className="flex items-center justify-between bg-[#191A23] text-[#B9FF66] px-6 py-3 rounded-lg border border-[#191A23] hover:bg-[#191A23]/90 transition-all duration-300 min-w-[160px]"
                >
                  <span className="font-medium">
                    {availableBatches.find(
                      (batch) => batch.value === selectedBatch
                    )?.label || "Select Batch"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                      batchDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {batchDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#191A23] border border-[#191A23] rounded-lg shadow-lg z-10 overflow-hidden">
                    {availableBatches.map((batch) => (
                      <button
                        key={batch.value}
                        onClick={() => {
                          setSelectedBatch(batch.value);
                          setBatchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
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

            {/* Results Count */}
            {(searchQuery || selectedBatch !== "all") && (
              <div className="mb-6">
                <p className="text-[#191A23]/70 text-sm">
                  Found {filteredProjects.length} project
                  {filteredProjects.length !== 1 ? "s" : ""}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedBatch !== "all" &&
                    ` in ${
                      availableBatches.find((b) => b.value === selectedBatch)
                        ?.label
                    }`}
                </p>
              </div>
            )}

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white/80 border border-white/60 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm cursor-pointer group"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    {/* Project Image */}
                    <div className="relative h-48 bg-[#F3F3F3] overflow-hidden">
                      {project.thumbnail_image ? (
                        <img
                          src={project.thumbnail_image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-[#191A23] flex items-center justify-center mx-auto mb-2 rounded-lg group-hover:bg-[#B9FF66] transition-colors duration-300">
                              <Code2 className="w-6 h-6 text-[#B9FF66] group-hover:text-[#191A23] transition-colors duration-300" />
                            </div>
                            <p className="text-[#191A23]/60 text-sm">
                              {project.category || "Project"}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-[#191A23]/90 text-[#B9FF66] px-3 py-1 text-xs font-medium rounded backdrop-blur-sm">
                        {project.category || "Project"}
                      </div>
                      {/* Featured Badge */}
                      {project.is_featured && (
                        <div className="absolute top-3 right-3 bg-[#B9FF66] text-[#191A23] px-3 py-1 text-xs font-bold rounded">
                          FEATURED
                        </div>
                      )}
                      {/* Batch Badge */}
                      {(project.batch || project.year) && (
                        <div className="absolute bottom-3 left-3 bg-white/90 text-[#191A23] px-2 py-1 text-xs font-medium rounded backdrop-blur-sm">
                          {project.batch
                            ? `Batch ${project.batch}`
                            : `Year ${project.year}`}
                        </div>
                      )}
                      {/* Status Badge */}
                      {project.status && (
                        <div
                          className={`absolute bottom-3 right-3 px-2 py-1 text-xs font-medium rounded backdrop-blur-sm ${
                            project.status === "completed"
                              ? "bg-green-500/90 text-white"
                              : "bg-orange-500/90 text-white"
                          }`}
                        >
                          {project.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </div>
                      )}
                    </div>

                    {/* Project Content */}
                    <div className="p-6">
                      <div className="flex items-center text-[#191A23]/60 text-sm mb-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(project.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {project.team_count && project.team_count > 1 && (
                          <>
                            <Users className="w-4 h-4 ml-4 mr-2" />
                            <span>Team of {project.team_count}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[#191A23] mb-3 overflow-hidden">
                        <span className="line-clamp-2">{project.title}</span>
                      </h3>

                      <p className="text-[#191A23]/70 mb-4 overflow-hidden">
                        <span className="line-clamp-3">
                          {project.description}
                        </span>
                      </p>

                      {project.created_by_name && (
                        <div className="flex items-center text-[#191A23]/60 mb-4">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {project.created_by_name}
                          </span>
                        </div>
                      )}

                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, index) => (
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

                      <div className="flex gap-2">
                        {project.demo_url && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(project.demo_url, "_blank");
                            }}
                            className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] transition-all duration-300"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Demo
                          </Button>
                        )}
                        {project.github_url && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(project.github_url, "_blank");
                            }}
                            className="flex-1 bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10 transition-all duration-300"
                          >
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#191A23]/10 flex items-center justify-center mx-auto mb-4 rounded-full">
                  <Code2 className="w-8 h-8 text-[#191A23]/50" />
                </div>
                <h3 className="text-xl font-semibold text-[#191A23] mb-2">
                  No Projects Found
                </h3>
                <p className="text-[#191A23]/60">
                  {searchQuery
                    ? `No projects match "${searchQuery}"${
                        selectedBatch !== "all"
                          ? ` in ${
                              availableBatches.find(
                                (b) => b.value === selectedBatch
                              )?.label
                            }`
                          : ""
                      }`
                    : selectedBatch !== "all"
                    ? `No projects found in ${
                        availableBatches.find((b) => b.value === selectedBatch)
                          ?.label
                      }`
                    : "No projects available at the moment"}
                </p>
                {(searchQuery || selectedBatch !== "all") && (
                  <div className="flex gap-2 justify-center mt-4">
                    {searchQuery && (
                      <Button
                        onClick={() => setSearchQuery("")}
                        className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10"
                      >
                        Clear Search
                      </Button>
                    )}
                    {selectedBatch !== "all" && (
                      <Button
                        onClick={() => setSelectedBatch("all")}
                        className="bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10"
                      >
                        Show All Batches
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Click outside to close batch dropdown */}
      {batchDropdownOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setBatchDropdownOpen(false)}
        />
      )}
    </>
  );
}
