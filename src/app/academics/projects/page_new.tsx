"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Download,
  Search,
  User,
  ChevronLeft,
  Star,
  ExternalLink,
  Github,
  Tag,
} from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  domain: string;
  tech_stack: string[];
  project_type: string;
  year: number;
  semester: number;
  team_size: number;
  github_link: string;
  demo_link: string;
  document_file: string;
  created_by: string;
  created_at: string;
  download_count: number;
  is_featured: boolean;
  is_approved: boolean;
  file_size: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Mock projects data
        const mockProjects: Project[] = [
          {
            id: 1,
            title: "E-Commerce Website with React & Node.js",
            description:
              "Full-stack e-commerce application with user authentication, payment gateway, and admin panel",
            category: "Web Development",
            domain: "Full Stack",
            tech_stack: ["React", "Node.js", "MongoDB", "Express.js"],
            project_type: "Major Project",
            year: 2024,
            semester: 6,
            team_size: 4,
            github_link: "https://github.com/student/ecommerce-app",
            demo_link: "https://ecommerce-demo.vercel.app",
            document_file: "/projects/ecommerce-doc.pdf",
            created_by: "John Doe",
            created_at: "2024-01-15T10:30:00Z",
            download_count: 45,
            is_featured: true,
            is_approved: true,
            file_size: 5120000,
          },
          {
            id: 2,
            title: "Machine Learning Stock Predictor",
            description:
              "Python-based stock price prediction system using LSTM neural networks",
            category: "Machine Learning",
            domain: "Data Science",
            tech_stack: ["Python", "TensorFlow", "Pandas", "NumPy"],
            project_type: "Mini Project",
            year: 2024,
            semester: 5,
            team_size: 2,
            github_link: "https://github.com/student/stock-predictor",
            demo_link: "",
            document_file: "/projects/ml-stock-doc.pdf",
            created_by: "Jane Smith",
            created_at: "2024-02-10T14:20:00Z",
            download_count: 32,
            is_featured: false,
            is_approved: true,
            file_size: 2048000,
          },
          {
            id: 3,
            title: "IoT Home Automation System",
            description:
              "Arduino-based smart home system with mobile app control and sensor monitoring",
            category: "IoT",
            domain: "Embedded Systems",
            tech_stack: ["Arduino", "ESP32", "React Native", "Firebase"],
            project_type: "Major Project",
            year: 2024,
            semester: 7,
            team_size: 3,
            github_link: "https://github.com/student/iot-home",
            demo_link: "",
            document_file: "/projects/iot-home-doc.pdf",
            created_by: "Alex Johnson",
            created_at: "2024-03-05T09:15:00Z",
            download_count: 28,
            is_featured: true,
            is_approved: true,
            file_size: 3072000,
          },
        ];

        setProjects(mockProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tech_stack.some((tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDomain = !selectedDomain || project.domain === selectedDomain;
    const matchesType = !selectedType || project.project_type === selectedType;

    return matchesSearch && matchesDomain && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/academics"
              className="text-white/80 hover:text-white flex items-center gap-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Academics
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Lightbulb className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Projects</h1>
              <p className="text-white/90 mt-2">
                Innovative projects and solutions by our students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Domains</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile">Mobile</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Embedded Systems">Embedded Systems</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Major Project">Major Project</option>
              <option value="Mini Project">Mini Project</option>
              <option value="Research">Research</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {project.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {project.project_type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{project.year}</span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2 leading-tight">
                  {project.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tech_stack.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{project.tech_stack.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {project.created_by}
                    </span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {project.github_link && (
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Github className="h-4 w-4" />
                      Code
                    </a>
                  )}

                  {project.demo_link && (
                    <a
                      href={project.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </a>
                  )}

                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                    <Download className="h-4 w-4" />
                    Doc
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
