"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, FileText, HelpCircle, Search } from "lucide-react";

interface AcademicResource {
  id: number;
  title: string;
  description: string;
  category: string;
  subject_name: string;
  module_number: number;
  exam_type: string;
  exam_year: number;
  file_size_mb: number;
  download_count: number;
  is_featured: boolean;
  uploaded_by_name: string;
  created_at: string;
  file?: string;
}

const AcademicsPage = () => {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "notes" | "textbook" | "pyq"
  >("all");
  const [featuredResources, setFeaturedResources] = useState<
    AcademicResource[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryStats, setCategoryStats] = useState({
    notes: 0,
    textbook: 0,
    pyq: 0,
  });

  const academicCategories = [
    {
      type: "notes" as const,
      title: "Notes",
      description: "Module-wise notes and study materials for all subjects",
      icon: BookOpen,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      count: categoryStats.notes,
    },
    {
      type: "textbook" as const,
      title: "Textbooks",
      description: "Reference books and textbooks for comprehensive learning",
      icon: FileText,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      count: categoryStats.textbook,
    },
    {
      type: "pyq" as const,
      title: "Previous Year Questions",
      description: "Previous year question papers for exam preparation",
      icon: HelpCircle,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      count: categoryStats.pyq,
    },
  ];

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/resources/`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        return;
      }

      // Filter featured resources
      const featured = data.filter(
        (resource: AcademicResource) => resource.is_featured
      );
      setFeaturedResources(featured);

      // Calculate category counts
      const notesCount = data.filter(
        (resource: AcademicResource) => resource.category === "notes"
      ).length;
      const textbookCount = data.filter(
        (resource: AcademicResource) => resource.category === "textbook"
      ).length;
      const pyqCount = data.filter(
        (resource: AcademicResource) => resource.category === "pyq"
      ).length;

      console.log("Category counts:", { notesCount, textbookCount, pyqCount });

      setCategoryStats({
        notes: notesCount,
        textbook: textbookCount,
        pyq: pyqCount,
      });
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = academicCategories.filter(
    (category) =>
      category && (activeCategory === "all" || category.type === activeCategory)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading academic resources...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">
            Academic Resources
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Access notes, textbooks, and previous year questions organized by
            subjects and modules. Contribute to the community by uploading your
            own study materials.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources, subjects, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Upload button shown only for admin/faculty/superadmin in actual implementation */}
            {/* This would be hidden in production since no public authentication */}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Categories" },
              { id: "notes", label: "Notes" },
              { id: "textbook", label: "Textbooks" },
              { id: "pyq", label: "Previous Year Questions" },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setActiveCategory(
                    category.id as "all" | "notes" | "textbook" | "pyq"
                  )
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map((category) => {
            if (!category) return null;

            const IconComponent = category.icon;
            return (
              <Link
                key={category.type}
                href={`/academics/${category.type}`}
                className="group"
              >
                <div
                  className={`${category.color} ${category.hoverColor} rounded-xl p-6 text-white transition-all duration-300 transform group-hover:scale-105 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-8 h-8" />
                    <span className="text-2xl font-bold">
                      {category.count || 0}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {category.description}
                  </p>
                  <div className="mt-4 text-sm font-medium">
                    Explore {category.title.toLowerCase()} →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {resource.description}
                    </p>
                    <p className="text-blue-600 text-sm font-medium">
                      {resource.subject_name}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Featured
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {resource.uploaded_by_name}</span>
                  <span>{resource.file_size_mb} MB</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{resource.download_count} downloads</span>
                    <span>
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {resource.file && (
                    <button
                      onClick={async () => {
                        try {
                          // Use the download API endpoint
                          const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/resources/${resource.id}/download/`;

                          // Try to fetch the file and trigger download
                          const response = await fetch(downloadUrl, {
                            method: "GET",
                            headers: {
                              Accept: "application/octet-stream",
                            },
                          });

                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;

                            // Extract filename from Content-Disposition header or use title
                            const contentDisposition = response.headers.get(
                              "Content-Disposition"
                            );
                            let filename = resource.title || "download";

                            if (contentDisposition) {
                              const matches =
                                contentDisposition.match(/filename="([^"]+)"/);
                              if (matches) {
                                filename = matches[1];
                              }
                            }

                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } else {
                            throw new Error(
                              `Download failed: ${response.status}`
                            );
                          }
                        } catch (error) {
                          console.error("Download failed:", error);
                          // Fallback to direct link
                          const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/resources/${resource.id}/download/`;
                          window.open(downloadUrl, "_blank");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AcademicsPage;
