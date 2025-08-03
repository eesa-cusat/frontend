"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FileText, Github, ExternalLink, Download, Users, User, Image as ImageIcon, Play } from "lucide-react";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/components/ui/PdfViewer"), { ssr: false });
import { formatDate } from "@/lib/utils";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const res = await fetch(`${apiBaseUrl}/projects/${id}/`);
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Project not found"}</p>
          <Link href="/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {project.category?.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-sm text-gray-500">
            by {project.created_by?.first_name} {project.created_by?.last_name}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(project.created_at)}
          </span>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{project.description}</p>
        </div>
        {project.abstract && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Abstract</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{project.abstract}</p>
            </div>
          </div>
        )}
        {/* Project Resources */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Resources</h2>
          <div className="flex flex-wrap gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5 mr-2" />
                Source Code
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Live Demo
              </a>
            )}
            {project.project_report && (
              <a
                href={project.project_report}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </a>
            )}
          </div>
        </div>
        {/* Embedded PDF Viewer for Project Report */}
        {project.project_report && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Project Report</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <PdfViewer fileUrl={project.project_report} fileName={project.title + " Report"} isOpen={true} onClose={() => {}} />
            </div>
          </div>
        )}
        {/* Team Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">
                  {project.created_by?.first_name} {project.created_by?.last_name}
                </span>
              </div>
              <p className="text-sm text-gray-600">Project Creator</p>
              <p className="text-sm text-gray-600">{project.created_by?.email}</p>
            </div>
            {project.team_members?.map((member: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">{member.name}</span>
                </div>
                <p className="text-sm text-gray-600">{member.role || "Team Member"}</p>
                {member.email && <p className="text-sm text-gray-600">{member.email}</p>}
              </div>
            ))}
          </div>
        </div>
        {/* Media Section */}
        {(project.images?.length > 0 || project.videos?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Media</h2>
            {/* Images */}
            {project.images?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-900 mb-2">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.images.map((image: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={image.url}
                        alt={image.caption || `Project image ${idx + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                          <p className="text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Videos */}
            {project.videos?.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.videos.map((video: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <video
                        src={video.url}
                        controls
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {video.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                          <p className="text-sm">{video.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 