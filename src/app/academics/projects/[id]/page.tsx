"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Github, ExternalLink, Download, Users, User } from "lucide-react";

const PdfViewer = dynamic(() => import("@/components/ui/PdfViewer"), { ssr: false });

export default function AcademicProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiBaseUrl}/academics/projects/${id}/`);
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
          <Link href="/academics/projects" className="text-blue-600 hover:underline">Back to Projects</Link>
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
            by {project.created_by}
          </span>
          <span className="text-sm text-gray-500">
            {project.created_at}
          </span>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{project.description}</p>
        </div>
        {/* Project Document/PDF */}
        {project.document_file && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Project Document</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <PdfViewer fileUrl={project.document_file} fileName={project.title + " Document"} isOpen={true} onClose={() => {}} />
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
                  {project.created_by}
                </span>
              </div>
              <p className="text-sm text-gray-600">Project Creator</p>
            </div>
            {/* Add more team members if available */}
          </div>
        </div>
      </div>
    </div>
  );
} 