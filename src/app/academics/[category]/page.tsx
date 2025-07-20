"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import ResourceCard from "@/components/ui/ResourceCard";
import {
  BookOpen,
  Search,
  FileText,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

interface AcademicResource {
  id: number;
  title: string;
  description: string;
  file: string;
  module: string;
  exam_type: string;
  year: number;
  semester: number;
  scheme: string;
  uploaded_by: string;
  uploaded_at: string;
  download_count: number;
  is_featured: boolean;
  is_approved: boolean;
  file_size: number;
}

interface ApiAcademicResource {
  id: number;
  title: string;
  description: string;
  file: string;
  module_display?: string;
  module?: string;
  exam_type_display?: string;
  exam_type?: string;
  exam_year?: number;
  subject_details?: { semester: number };
  semester?: number;
  scheme_name?: string;
  scheme?: string;
  uploaded_by_name?: string;
  uploaded_by?: string;
  created_at?: string;
  download_count: number;
  is_featured: boolean;
  is_approved: boolean;
  file_size_mb?: number;
}

interface AcademicCategory {
  id: number;
  name: string;
  description: string;
  category_type: string;
  icon: string;
  slug: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<AcademicCategory | null>(null);
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");

  // Get category type from slug
  const getCategoryType = (slug: string) => {
    if (slug === "notes") return "notes";
    if (slug === "textbook" || slug === "textbooks") return "textbook";
    if (slug === "pyq") return "pyq";
    return slug;
  };

  const getCategoryInfo = (type: string) => {
    const categoryTypes = {
      notes: {
        name: "Notes",
        description: "Comprehensive study notes and materials",
        icon: BookOpen,
        color: "from-blue-500 to-cyan-500",
      },
      textbook: {
        name: "Textbooks",
        description: "Reference books and study materials",
        icon: BookOpen,
        color: "from-green-500 to-emerald-500",
      },
      pyq: {
        name: "Previous Year Questions",
        description: "Past examination papers and model questions",
        icon: FileText,
        color: "from-purple-500 to-violet-500",
      },
    };
    return categoryTypes[type as keyof typeof categoryTypes];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoryType = getCategoryType(categorySlug);

        // Set category info from slug (fallback approach)
        const categoryInfo = getCategoryInfo(categoryType);
        const mockCategory = {
          id: 1,
          name: categoryInfo?.name || "Academic Resources",
          description: categoryInfo?.description || "",
          category_type: categoryType,
          icon: "book",
          slug: categorySlug,
        };
        setCategory(mockCategory);

        // Try to fetch category info from API (optional)
        try {
          const categoryData = await apiRequest(
            "GET",
            `/academics/categories/${categoryType}/`
          );
          if (categoryData && (categoryData as { category: AcademicCategory }).category) {
            const apiCategory = (categoryData as { category: AcademicCategory }).category;
            setCategory({
              id: apiCategory.id,
              name: apiCategory.name,
              description: apiCategory.description,
              category_type: apiCategory.category_type,
              icon: apiCategory.icon,
              slug: apiCategory.slug || categoryType,
            });
          }
        } catch {
          console.log("Category API not available, using fallback");
        }

        // Fetch resources for this category type
        try {
          const resourcesData = await apiRequest(
            "GET",
            `/academics/resources/?category_type=${categoryType}`
          );

          if (Array.isArray(resourcesData)) {
            // Transform API data to match our interface
            const transformedResources = resourcesData.map((resource: ApiAcademicResource) => ({
              id: resource.id,
              title: resource.title || "Untitled Resource",
              description: resource.description || "",
              file: resource.file || "",
              module: resource.module_display || resource.module || "General",
              exam_type: resource.exam_type_display || resource.exam_type || "N/A",
              year: resource.exam_year || new Date().getFullYear(),
              semester: resource.subject_details?.semester || resource.semester || 0,
              scheme: resource.scheme_name || resource.scheme || "Unknown",
              uploaded_by: resource.uploaded_by_name || resource.uploaded_by || "Unknown",
              uploaded_at: resource.created_at || new Date().toISOString(),
              download_count: resource.download_count || 0,
              is_featured: resource.is_featured || false,
              is_approved: resource.is_approved || true,
              file_size: Math.round((resource.file_size_mb || 0) * 1024 * 1024), // Convert MB to bytes
            }));

            setResources(transformedResources);
          } else {
            setResources([]);
          }
        } catch (resourceError) {
          console.error("Error fetching resources:", resourceError);
          setError("Unable to load resources at this time. Please try again later.");
          setResources([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Something went wrong. Please try again later.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = !selectedModule || resource.module === selectedModule;
    const matchesSemester =
      !selectedSemester || resource.semester.toString() === selectedSemester;
    const matchesScheme = !selectedScheme || resource.scheme === selectedScheme;
    const matchesExamType =
      !selectedExamType || resource.exam_type === selectedExamType;

    return (
      matchesSearch &&
      matchesModule &&
      matchesSemester &&
      matchesScheme &&
      matchesExamType
    );
  });

  const categoryInfo = category
    ? getCategoryInfo(category.category_type)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Unable to Load Resources
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <Link
              href="/academics"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Academic Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/academics"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Academic Resources
          </Link>
          
          {category && categoryInfo && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <categoryInfo.icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{category.name}</h1>
                  <p className="text-blue-100">{category.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Modules</option>
                {Array.from(new Set(resources.map(r => r.module))).map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
              
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                {Array.from(new Set(resources.map(r => r.semester))).sort().map(semester => (
                  <option key={semester} value={semester.toString()}>Semester {semester}</option>
                ))}
              </select>
              
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Schemes</option>
                {Array.from(new Set(resources.map(r => r.scheme))).map(scheme => (
                  <option key={scheme} value={scheme}>{scheme}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category?.name} Resources
            </h2>
            <span className="text-gray-600">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} categoryType={category?.category_type || ""} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                No resources found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || selectedModule || selectedSemester || selectedScheme
                  ? "Try adjusting your search criteria or filters."
                  : "No resources available in this category yet. Check back later!"}
              </p>
              {searchTerm || selectedModule || selectedSemester || selectedScheme ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedModule("");
                    setSelectedSemester("");
                    setSelectedScheme("");
                    setSelectedExamType("");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/academics"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Other Categories
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
