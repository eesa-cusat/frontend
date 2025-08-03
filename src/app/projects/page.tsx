"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  ExternalLink,
  Github,
  Calendar,
  User,
  Plus,
  X,
  Download,
  Play,
  Image as ImageIcon,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

import {
  Project,
  ProjectDetail,
  TeamMember,
  ProjectImage,
  ProjectVideo,
} from "@/types/api";
import { projectsService } from "@/services/projectsService";

const getCategoryDisplayName = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    iot: "Internet of Things",
    embedded_systems: "Embedded Systems",
    power_systems: "Power Systems",
    power_electronics: "Power Electronics",
    signal_processing: "Signal Processing",
    web_development: "Web Development",
    mobile_app: "Mobile App",
    machine_learning: "Machine Learning",
    data_science: "Data Science",
    robotics: "Robotics",
    cybersecurity: "Cybersecurity",
    blockchain: "Blockchain",
    ai: "Artificial Intelligence",
    other: "Other",
  };
  return categoryMap[category] || category.replace("_", " ").toUpperCase();
};

export default function ProjectsPage() {
  // For demo purposes, hide create project button
  // In production, this would be controlled by staff login
  const isAuthenticated = false;
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [hasDemo, setHasDemo] = useState("");
  const [hasGithub, setHasGithub] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFilters, setAvailableFilters] = useState<{
    categories: { [key: string]: string };
    creators: any[];
  }>({ categories: {}, creators: [] });

  // Modal state and handlers
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Handler to open modal with project details
  const openProjectModal = async (projectId: number) => {
    setShowProjectModal(true);
    setActiveTab("overview");
    try {
      const detail = await projectsService.getProject(projectId.toString());
      setSelectedProject(detail);
    } catch (err) {
      setSelectedProject(null);
      setShowProjectModal(false);
      // Optionally handle error (e.g., show toast)
    }
  };

  // Handler to close modal
  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";



  // Fetch projects from API with filtering
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCreator) params.append("creator", selectedCreator);
      if (teamSize) params.append("team_size", teamSize);
      if (hasDemo) params.append("has_demo", hasDemo);
      if (hasGithub) params.append("has_github", hasGithub);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `${API_BASE_URL}/projects/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedProjects = data.projects || [];
      setProjects(fetchedProjects);

      // Set available filters from backend
      if (data.filters) {
        setAvailableFilters({
          categories: data.filters.categories || {},
          creators: data.filters.creators || [],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to fetch projects: ${errorMessage}`);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedCreator,
    teamSize,
    hasDemo,
    hasGithub,
    searchTerm,
    API_BASE_URL,
  ]);

  // Fetch projects on component mount and when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Navigate to project details page
  const navigateToProjectDetails = (projectId: number) => {
    window.open(`/projects/${projectId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Student Projects
              </h1>
              <p className="text-lg text-gray-600">
                Explore innovative projects by EESA students and alumni
              </p>
            </div>
            {isAuthenticated && (
              <Link href="/projects/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search projects by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:w-auto w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {isFilterOpen && (
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(availableFilters.categories || {}).map(
                  ([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  )
                )}
              </select>

              {/* Creator Filter */}
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Creators</option>
                {(availableFilters.creators || []).map((creator) => (
                  <option
                    key={creator.created_by__id}
                    value={creator.created_by__username}
                  >
                    {creator.created_by__first_name}{" "}
                    {creator.created_by__last_name}
                  </option>
                ))}
              </select>

              {/* Team Size Filter */}
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Team Size</option>
                <option value="1">Solo (1 person)</option>
                <option value="2">Small Team (2 people)</option>
                <option value="3">Medium Team (3 people)</option>
                <option value="4">Large Team (4+ people)</option>
              </select>

              {/* Demo Filter */}
              <select
                value={hasDemo}
                onChange={(e) => setHasDemo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Demo Status</option>
                <option value="true">Has Demo</option>
                <option value="false">No Demo</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Latest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {projects.length} projects
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0
                ? "No projects have been shared yet."
                : "Try adjusting your search or filter criteria."}
            </p>
            {isAuthenticated && (
              <Link href="/projects/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow block"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {getCategoryDisplayName(project.category)}
                    </span>
                    {project.team_count > 1 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Team ({project.team_count})
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>{project.created_by_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {project.github_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={e => { e.stopPropagation(); window.open(project.github_url!, "_blank"); }}
                      >
                        <Github className="w-4 h-4 mr-1" />
                        Code
                      </Button>
                    )}
                    {project.demo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={e => { e.stopPropagation(); window.open(project.demo_url!, "_blank"); }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {showProjectModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProject.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getCategoryDisplayName(selectedProject.category)}
                    </span>
                    <span className="text-sm text-gray-500">
                      by {selectedProject.created_by.first_name}{" "}
                      {selectedProject.created_by.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedProject.created_at)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeProjectModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Overview
                  </button>
                  {selectedProject.team_members &&
                    selectedProject.team_members.length > 0 && (
                      <button
                        onClick={() => setActiveTab("team")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "team"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Team ({selectedProject.team_members.length + 1})
                      </button>
                    )}
                  {(selectedProject.images.length > 0 ||
                    selectedProject.videos.length > 0) && (
                    <button
                      onClick={() => setActiveTab("media")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "media"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Media (
                      {selectedProject.images.length +
                        selectedProject.videos.length}
                      )
                    </button>
                  )}
                </nav>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Project Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Project Abstract */}
                    {selectedProject.abstract && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Abstract
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {selectedProject.abstract}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Project Links and Files */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Resources
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedProject.github_url && (
                          <a
                            href={selectedProject.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <Github className="w-5 h-5 mr-3" />
                            <div>
                              <div className="font-medium">Source Code</div>
                              <div className="text-sm text-gray-300">
                                View on GitHub
                              </div>
                            </div>
                          </a>
                        )}
                        {selectedProject.demo_url && (
                          <a
                            href={selectedProject.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-5 h-5 mr-3" />
                            <div>
                              <div className="font-medium">Live Demo</div>
                              <div className="text-sm text-blue-100">
                                View Project
                              </div>
                            </div>
                          </a>
                        )}
                        {selectedProject.project_report && (
                          <a
                            href={selectedProject.project_report}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-5 h-5 mr-3" />
                            <div>
                              <div className="font-medium">Project Report</div>
                              <div className="text-sm text-green-100">
                                Download PDF
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Tab */}
                {activeTab === "team" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Project Team
                    </h3>

                    {/* Project Creator */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">
                        Project Creator
                      </h4>
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedProject.created_by.first_name}{" "}
                            {selectedProject.created_by.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Project Creator & Lead
                          </p>
                          <p className="text-xs text-gray-400">
                            {selectedProject.created_by.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    {selectedProject.team_members &&
                      selectedProject.team_members.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-3">
                            Team Members
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedProject.team_members.map(
                              (member: TeamMember) => (
                                <div
                                  key={member.id}
                                  className="flex items-center p-4 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User className="w-6 h-6 text-gray-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {member.name}
                                    </p>
                                    {member.role && (
                                      <p className="text-xs text-gray-500 mb-1">
                                        {member.role}
                                      </p>
                                    )}
                                    {member.linkedin_url && (
                                      <a
                                        href={member.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        LinkedIn
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    {/* Project Images */}
                    {selectedProject.images &&
                      selectedProject.images.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Project Images
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedProject.images.map((image) => (
                              <div key={image.id} className="relative group">
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                                  <Image
                                    src={`${
                                      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                                        "/api",
                                        ""
                                      ) || "http://localhost:8000"
                                    }${image.image}`}
                                    alt={image.caption || selectedProject.title}
                                    width={400}
                                    height={200}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                    unoptimized
                                  />
                                  {image.is_featured && (
                                    <div className="absolute top-2 left-2">
                                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        Featured
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {image.caption && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    {image.caption}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Project Videos */}
                    {selectedProject.videos &&
                      selectedProject.videos.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Project Videos
                          </h3>
                          <div className="space-y-4">
                            {selectedProject.videos.map((video) => (
                              <div
                                key={video.id}
                                className="border rounded-lg p-4 bg-gray-50"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                                      <Play className="w-8 h-8 text-red-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-gray-900">
                                        {video.title || "Project Video"}
                                      </h4>
                                      {video.is_featured && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    {video.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {video.description}
                                      </p>
                                    )}
                                    <a
                                      href={video.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      <Play className="w-4 h-4 mr-1" />
                                      Watch Video
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {selectedProject.images.length === 0 &&
                      selectedProject.videos.length === 0 && (
                        <div className="text-center py-12">
                          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            No media files available for this project.
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
