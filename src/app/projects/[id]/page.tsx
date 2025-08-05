"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Users,
  Star,
  Tag,
  Code2,
  Play,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

// This is the correct directive for client components in Next.js App Router.
// It must be at the very top of the file to work correctly.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

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
  created_by_name?: string;
  team_count?: number;
  technologies?: string[];
  status?: string;
  tags?: string[];
  tech_stack?: string[];
  challenges?: string;
  learnings?: string;
}

const sampleProject: Project = {
  id: 1,
  title: "AI-Powered Student Assistant",
  description:
    "An intelligent chatbot that helps students with academic queries, course recommendations, and campus navigation using natural language processing. This project demonstrates the implementation of modern AI technologies in educational environments, providing students with instant access to information and personalized guidance throughout their academic journey.",
  abstract:
    "This project aims to revolutionize student support services by leveraging cutting-edge artificial intelligence and natural language processing technologies. The AI-powered assistant serves as a comprehensive solution for student inquiries, offering real-time responses to academic questions, personalized course recommendations based on student profiles, and efficient campus navigation assistance.",
  category: "AI/ML",
  student_batch: "2024-2025",
  created_at: "2024-03-15T10:00:00Z",
  updated_at: "2024-03-20T15:30:00Z",
  github_url: "https://github.com/example/ai-assistant",
  demo_url: "https://ai-assistant.example.com",
  project_report: "https://example.com/reports/ai-assistant.pdf",
  is_featured: true,
  created_by_name: "John Doe",
  team_count: 4,
  status: "completed",
  technologies: ["Python", "TensorFlow", "React", "Node.js", "MongoDB"],
  tech_stack: [
    "Python",
    "TensorFlow",
    "React",
    "Node.js",
    "MongoDB",
    "Express.js",
    "Socket.io",
    "JWT",
  ],
  tags: ["AI", "Education", "Chatbot", "NLP", "Machine Learning"],
  team_members: [
    { id: 1, name: "John Doe", role: "Team Lead & AI Developer" },
    { id: 2, name: "Jane Smith", role: "Frontend Developer" },
    { id: 3, name: "Mike Johnson", role: "Backend Developer" },
    { id: 4, name: "Sarah Wilson", role: "UI/UX Designer" },
  ],
  challenges:
    "The main challenges included training the NLP model with educational data, implementing real-time chat functionality, and ensuring the system could handle multiple users simultaneously while maintaining response accuracy. We also faced difficulties in integrating the chatbot with existing campus systems and databases.",
  learnings:
    "This project taught us about machine learning implementation, real-time web technologies, and the importance of user experience design in educational applications. We also learned about scalable backend architecture, API design, and the complexities of natural language processing in educational contexts.",
};

const ProjectDetailPage: React.FC = () => {
  // Hooks like useParams, useRouter, useState, and useEffect are used here.
  // This is only possible because of the "use client" directive at the top.
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformed: Project = {
        ...data,
        created_by_name:
          data.created_by_name ||
          (data.created_by
            ? [data.created_by.first_name, data.created_by.last_name]
                .filter(Boolean)
                .join(" ")
                .trim() || "Unknown"
            : "Unknown"),
        team_count: data.team_count || data.team_members?.length || 1,
        technologies: data.technologies || data.tech_stack || [],
        tech_stack: data.tech_stack || data.technologies || [],
        status: data.status || "completed",
        tags: data.tags || [],
        updated_at: data.updated_at || data.created_at,
      };

      setProject(transformed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");

      // Fallback for demo or local testing
      if (["1", "demo"].includes(projectId)) {
        setProject({ ...sampleProject, id: Number(projectId) || 1 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const openLink = (url: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleBack = () => router.push("/projects");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg rounded-2xl p-8">
          <div className="flex items-center space-x-4">
            <Loader2 className="animate-spin h-8 w-8 text-[#191A23]" />
            <span className="text-[#191A23] font-medium text-lg">
              Loading project details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#191A23] mb-4">
            Project Not Found
          </h1>
          <p className="text-[#191A23]/70 mb-6 leading-relaxed">
            {error ||
              "The project you're looking for doesn't exist or has been removed."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center bg-white border border-[#191A23]/20 hover:bg-gray-50 text-[#191A23] px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Navigation */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-[#191A23] hover:text-[#191A23]/70 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F3F3F3] via-white to-[#F3F3F3]"></div>
          <div className="absolute inset-0 opacity-30">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(185, 255, 102, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(25, 26, 35, 0.05) 0%, transparent 50%)
              `,
              }}
            ></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-xl mx-4 rounded-3xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
              {/* Project Header */}
              <div className="text-center mb-12">
                {project.is_featured && (
                  <div className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-6 py-3 rounded-full font-bold text-sm mb-6 shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    FEATURED PROJECT
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#191A23] mb-6 leading-tight">
                  {project.title}
                </h1>

                <div className="inline-flex items-center bg-[#191A23]/5 backdrop-blur-sm border border-[#191A23]/10 px-6 py-3 rounded-full mb-8">
                  <Tag className="w-5 h-5 text-[#191A23] mr-2" />
                  <span className="text-[#191A23] font-semibold text-lg">
                    {project.category}
                  </span>
                </div>

                {/* Project Status */}
                {project.status && (
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      project.status === "completed"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-orange-100 text-orange-800 border border-orange-200"
                    }`}
                  >
                    {project.status === "completed"
                      ? "✓ Completed"
                      : "⏳ In Progress"}
                  </div>
                )}
              </div>

              {/* Project Meta Info */}
              <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-2xl p-8 mb-12 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="w-7 h-7 text-[#191A23]" />
                    </div>
                    <div className="text-[#191A23] font-medium text-sm mb-1">
                      Created By
                    </div>
                    <div className="text-[#191A23] font-bold text-lg">
                      {project.created_by_name}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="w-7 h-7 text-[#191A23]" />
                    </div>
                    <div className="text-[#191A23] font-medium text-sm mb-1">
                      Team Size
                    </div>
                    <div className="text-[#191A23] font-bold text-lg">
                      {project.team_count}{" "}
                      {project.team_count === 1 ? "Member" : "Members"}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Calendar className="w-7 h-7 text-[#191A23]" />
                    </div>
                    <div className="text-[#191A23] font-medium text-sm mb-1">
                      Created
                    </div>
                    <div className="text-[#191A23] font-bold text-lg">
                      {formatDate(project.created_at)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Clock className="w-7 h-7 text-[#191A23]" />
                    </div>
                    <div className="text-[#191A23] font-medium text-sm mb-1">
                      Updated
                    </div>
                    <div className="text-[#191A23] font-bold text-lg">
                      {formatDate(project.updated_at || project.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {project.demo_url && (
                  <button
                    onClick={() => openLink(project.demo_url!)}
                    className="bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    View Live Demo
                  </button>
                )}
                {project.github_url && (
                  <button
                    onClick={() => openLink(project.github_url!)}
                    className="bg-white/80 hover:bg-white border border-white/80 hover:border-gray-200 text-[#191A23] px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg"
                  >
                    <Github className="w-5 h-5 mr-3" />
                    View Source Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
                <div className="w-8 h-8 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-3">
                  <Eye className="w-4 h-4 text-[#191A23]" />
                </div>
                Project Overview
              </h2>
              <p className="text-[#191A23]/80 text-lg leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Abstract */}
            {project.abstract && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-3">
                    <Code2 className="w-4 h-4 text-[#191A23]" />
                  </div>
                  Abstract
                </h2>
                <p className="text-[#191A23]/80 text-lg leading-relaxed">
                  {project.abstract}
                </p>
              </div>
            )}

            {/* Challenges */}
            {project.challenges && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-3">
                    <Code2 className="w-4 h-4 text-[#191A23]" />
                  </div>
                  Challenges & Solutions
                </h2>
                <p className="text-[#191A23]/80 text-lg leading-relaxed">
                  {project.challenges}
                </p>
              </div>
            )}

            {/* Learnings */}
            {project.learnings && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
                  <div className="w-8 h-8 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-3">
                    <Star className="w-4 h-4 text-[#191A23]" />
                  </div>
                  Key Learnings
                </h2>
                <p className="text-[#191A23]/80 text-lg leading-relaxed">
                  {project.learnings}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#191A23] mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-2">
                    <Code2 className="w-3 h-3 text-[#191A23]" />
                  </div>
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-white/80 border border-white/60 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#191A23] mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-2">
                    <Tag className="w-3 h-3 text-[#191A23]" />
                  </div>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#B9FF66]/20 border border-[#B9FF66]/40 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Student Batch */}
            {project.student_batch && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#191A23] mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-2">
                    <Users className="w-3 h-3 text-[#191A23]" />
                  </div>
                  Student Batch
                </h3>
                <div className="bg-[#191A23]/5 border border-[#191A23]/10 text-[#191A23] px-4 py-3 rounded-xl text-lg font-semibold text-center">
                  {project.student_batch}
                </div>
              </div>
            )}

            {/* Team Members */}
            {project.team_members && project.team_members.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#191A23] mb-4 flex items-center">
                  <div className="w-6 h-6 bg-[#B9FF66] rounded-lg flex items-center justify-center mr-2">
                    <Users className="w-3 h-3 text-[#191A23]" />
                  </div>
                  Team Members
                </h3>
                <div className="space-y-3">
                  {project.team_members.map((member, index) => (
                    <div
                      key={index}
                      className="bg-white/80 border border-white/60 px-4 py-3 rounded-xl"
                    >
                      <div className="font-semibold text-[#191A23]">
                        {member.name}
                      </div>
                      {member.role && (
                        <div className="text-sm text-[#191A23]/70">
                          {member.role}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Actions */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
              <h3 className="text-xl font-bold text-[#191A23] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {project.demo_url && (
                  <button
                    onClick={() => openLink(project.demo_url!)}
                    className="w-full bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Live Demo
                  </button>
                )}
                {project.github_url && (
                  <button
                    onClick={() => openLink(project.github_url!)}
                    className="w-full bg-white/80 hover:bg-white border border-white/80 hover:border-gray-200 text-[#191A23] px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-lg"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Source Code
                  </button>
                )}
                {project.project_report && (
                  <button
                    onClick={() => openLink(project.project_report!)}
                    className="w-full bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Explore More Projects
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailPage;
