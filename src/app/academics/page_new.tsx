"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Upload,
  Search,
  Filter,
} from "lucide-react";

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

  const academicCategories = [
    {
      type: "notes" as const,
      title: "Notes",
      description: "Module-wise notes and study materials for all subjects",
      icon: BookOpen,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      count: 145,
    },
    {
      type: "textbook" as const,
      title: "Textbooks",
      description: "Reference books and textbooks for comprehensive learning",
      icon: FileText,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      count: 67,
    },
    {
      type: "pyq" as const,
      title: "Previous Year Questions",
      description: "Previous year question papers for exam preparation",
      icon: HelpCircle,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      count: 89,
    },
  ];

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      // For now using dummy data
      const dummyFeaturedResources: AcademicResource[] = [
        {
          id: 1,
          title: "Data Structures and Algorithms - Module 1",
          description:
            "Complete notes covering arrays, linked lists, and basic algorithms",
          category: "Notes",
          subject_name: "Data Structures (CS301)",
          module_number: 1,
          exam_type: "",
          exam_year: 0,
          file_size_mb: 2.5,
          download_count: 156,
          is_featured: true,
          uploaded_by_name: "John Doe",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: 2,
          title: "Database Management Systems - 2023 SEE",
          description: "Previous year question paper with solutions",
          category: "PYQ",
          subject_name: "DBMS (CS401)",
          module_number: 0,
          exam_type: "see",
          exam_year: 2023,
          file_size_mb: 1.2,
          download_count: 89,
          is_featured: true,
          uploaded_by_name: "Jane Smith",
          created_at: "2024-02-10T14:00:00Z",
        },
      ];

      setFeaturedResources(dummyFeaturedResources);
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = academicCategories.filter(
    (category) => activeCategory === "all" || category.type === activeCategory
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
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
            <Link href="/academics/upload">
              <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-5 h-5" />
                Upload Resource
              </button>
            </Link>
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
                    <span className="text-2xl font-bold">{category.count}</span>
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
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/academics/library"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Digital Library
              </span>
            </Link>
            <Link
              href="/academics/projects"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Student Projects
              </span>
            </Link>
            <Link
              href="/academics/upload"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Upload Resource
              </span>
            </Link>
            <Link
              href="/academics/browse"
              className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Browse All
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;
