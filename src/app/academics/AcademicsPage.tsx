"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FileText, Calendar } from "lucide-react";
import LikeButton from "@/components/ui/LikeButton";
import DownloadButton from "@/components/ui/DownloadButton";
import { api } from "@/lib/api";

interface AcademicResource {
  id: number;
  title: string;
  description: string;
  category: string;
  subject: {
    id: number;
    name: string;
    code: string;
    semester: number;
    department: string;
    credits: number;
    scheme: {
      id: number;
      name: string;
    };
  };
  file: string;
  module_number: number;
  uploaded_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_approved: boolean;
  download_count: number;
  view_count: number;
  likes_count: number;
  is_liked: boolean;
  is_featured: boolean;
  created_at: string;
  exam_type?: string;
  exam_year?: number;
}

interface Scheme {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  semester: number;
  department: string;
  scheme_name: string;
}

interface Category {
  id: string;
  name: string;
  category_type: string;
}

interface FilterState {
  department: string;
  scheme_id: string;
  semester: string;
  subject_id: string;
  category: string;
  module: string;
}

interface AcademicData {
  schemes: Scheme[];
  categories: Category[];
  departments: string[];
  subjects: {
    [schemeId: number]: {
      [semester: number]: {
        [department: string]: Subject[];
      };
    };
  };
}

// Cache keys for localStorage
const CACHE_KEYS = {
  FILTERS: "academics_filters_v2",
  RESOURCES: "academics_resources_v2",
  TIMESTAMP: "academics_timestamp_v2",
  VIEW_STATE: "academics_view_state_v2",
  ACADEMIC_DATA: "academic_data_v2",
};

export default function AcademicsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    scheme_id: "",
    semester: "",
    subject_id: "",
    category: "",
    module: "",
  });
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  // Academic data state
  const [academicData, setAcademicData] = useState<AcademicData>({
    schemes: [],
    categories: [],
    departments: [],
    subjects: {},
  });

  // Memoized filtered subjects based on current filters
  const availableSubjects = useMemo(() => {
    if (!filters.scheme_id || !filters.semester || !filters.department) {
      return [];
    }

    const schemeId = parseInt(filters.scheme_id);
    const semester = parseInt(filters.semester);

    return (
      academicData.subjects[schemeId]?.[semester]?.[filters.department] || []
    );
  }, [
    academicData.subjects,
    filters.scheme_id,
    filters.semester,
    filters.department,
  ]);

  useEffect(() => {
    fetchOptimizedData();
  }, []);

  // Load initial data after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchOptimizedData = async () => {
    setInitialLoading(true);
    setBackendError(false);

    try {
      // Use the new optimized endpoint that fetches all data in one call
      const response = await api.academics.data();
      const data = response.data;

      const optimizedData: AcademicData = {
        schemes: data.schemes || [],
        categories: data.categories || [],
        departments: data.departments || [],
        subjects: data.subjects || {},
      };

      setAcademicData(optimizedData);
    } catch (error) {
      console.error("Error in fetchOptimizedData:", error);
      setBackendError(true);
    } finally {
      setInitialLoading(false);
    }
  };

  // Filter options
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const modules = ["1", "2", "3", "4", "5"];

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);

    // Reset dependent fields
    if (field === "department") {
      const resetFilters = {
        ...updatedFilters,
        scheme_id: "",
        semester: "",
        subject_id: "",
      };
      setFilters(resetFilters);
    }
    if (field === "scheme_id") {
      const resetFilters = {
        ...updatedFilters,
        semester: "",
        subject_id: "",
      };
      setFilters(resetFilters);
    }
    if (field === "semester") {
      const resetFilters = {
        ...updatedFilters,
        subject_id: "",
      };
      setFilters(resetFilters);
    }
  };

  const validateMandatoryFilters = () => {
    const isValid =
      filters.department &&
      filters.scheme_id &&
      filters.semester &&
      filters.subject_id &&
      filters.category;
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateMandatoryFilters()) {
      alert(
        "Please fill all mandatory fields (Department, Scheme, Semester, Subject, Category)"
      );
      return;
    }

    setLoading(true);
    try {
      // Build query parameters as per the filtering guide
      const queryParams = new URLSearchParams();

      // Add all available filter parameters
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.scheme_id) queryParams.append("scheme", filters.scheme_id);
      if (filters.subject_id) queryParams.append("subject", filters.subject_id);
      if (filters.semester) queryParams.append("semester", filters.semester);
      if (filters.department)
        queryParams.append("department", filters.department);
      if (filters.module) queryParams.append("module_number", filters.module);

      // Use the optimized API call
      const response = await api.academics.resources({
        category: filters.category,
        scheme: filters.scheme_id,
        subject: filters.subject_id,
        semester: filters.semester,
        department: filters.department,
        ...(filters.module && { module_number: filters.module }),
      });

      // Handle different response formats (results array or direct array)
      const resourcesArray = response.data.results || response.data || [];
      const transformedResources = Array.isArray(resourcesArray)
        ? resourcesArray
        : [];

      setResources(transformedResources);

      setShowFilters(false);
    } catch (error) {
      console.error("Error fetching resources:", error);
      alert(
        "Failed to fetch academic resources. Please check your backend connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFilters = () => {
    setShowFilters(true);
  };

  const handleNewSearch = () => {
    // Clear all cache and reset state
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    });
    setShowFilters(true);
    setFilters({
      department: "",
      scheme_id: "",
      semester: "",
      subject_id: "",
      category: "",
      module: "",
    });
    setResources([]);
  };

  const getSelectedScheme = () => {
    return academicData.schemes.find(
      (s) => s.id.toString() === filters.scheme_id
    );
  };

  const getSelectedSubject = () => {
    return availableSubjects.find(
      (s) => s.id.toString() === filters.subject_id
    );
  };

  const getSelectedCategory = () => {
    return academicData.categories.find((c) => c.id === filters.category);
  };

  const FilterInput = ({
    label,
    field,
    options,
    required = false,
    disabled = false,
  }: {
    label: string;
    field: keyof FilterState;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-black text-lg font-medium">
        {label} {required && <span className="text-black">*</span>}
      </label>
      <select
        value={filters[field]}
        onChange={(e) => handleFilterChange(field, e.target.value)}
        disabled={disabled}
        className="w-full p-4 border-3 border-black bg-white text-black font-medium text-base focus:outline-none focus:ring-0 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (showFilters) {
    return (
      <div className="min-h-screen bg-white pt-20 relative overflow-hidden">
        {/* Background electrical pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            {/* Main circuit lines */}
            <path
              d="M0 200 L400 200 L400 400 L800 400 L800 200 L1200 200"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M200 0 L200 800" stroke="currentColor" strokeWidth="1" />
            <path d="M600 0 L600 800" stroke="currentColor" strokeWidth="1" />
            <path d="M1000 0 L1000 800" stroke="currentColor" strokeWidth="1" />

            {/* Electronic components */}
            <circle cx="200" cy="200" r="8" fill="currentColor" />
            <circle cx="600" cy="400" r="8" fill="currentColor" />
            <circle cx="1000" cy="200" r="8" fill="currentColor" />

            {/* Resistor symbols */}
            <path
              d="M350 200 L360 180 L380 220 L400 180 L420 220 L440 200"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M750 400 L760 380 L780 420 L800 380 L820 420 L840 400"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Header with enhanced illustration */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-64 h-48 bg-lime-400 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <FileText className="w-24 h-24 text-black relative z-10" />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">
              Academic <span className="text-lime-400">Resources</span>
            </h1>
            <p className="text-black text-lg max-w-2xl mx-auto">
              Access comprehensive study materials, notes, and resources
              organized by department, semester, and subject.
            </p>
          </div>

          {/* Loading state or Filter Form */}
          {initialLoading ? (
            <div className="bg-gray-50 rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Loading academic data (optimized)...
                </p>
              </div>
            </div>
          ) : backendError ? (
            <div className="bg-gray-50 rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Backend Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Unable to connect to the academic data backend.
                </p>
                <button
                  onClick={fetchOptimizedData}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-8 space-y-6 min-h-[500px] relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <FilterInput
                  label="Department"
                  field="department"
                  options={academicData.departments.map((d) => ({
                    value: d,
                    label: d,
                  }))}
                  required
                />
                <FilterInput
                  label="Scheme"
                  field="scheme_id"
                  options={academicData.schemes.map((s) => ({
                    value: s.id.toString(),
                    label: s.name,
                  }))}
                  required
                />
                <FilterInput
                  label="Semester"
                  field="semester"
                  options={semesters.map((s) => ({
                    value: s,
                    label: `Semester ${s}`,
                  }))}
                  required
                />
                <FilterInput
                  label="Subject"
                  field="subject_id"
                  options={availableSubjects.map((s) => ({
                    value: s.id.toString(),
                    label: `${s.name} (${s.code})`,
                  }))}
                  required
                  disabled={
                    !filters.department ||
                    !filters.scheme_id ||
                    !filters.semester
                  }
                />
                <FilterInput
                  label="Category"
                  field="category"
                  options={academicData.categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  required
                />
                <FilterInput
                  label="Module"
                  field="module"
                  options={modules.map((m) => ({
                    value: m,
                    label: `Module ${m}`,
                  }))}
                />
              </div>

              <div className="flex justify-center pt-6 relative z-10">
                <button
                  onClick={handleContinue}
                  disabled={!validateMandatoryFilters() || loading}
                  className="bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Resources Display Page - same as original
  return (
    <div className="min-h-screen bg-white pt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBackToFilters}
                className="text-black hover:text-gray-600 font-medium"
              >
                ← Back to Filters
              </button>
              <button
                onClick={handleNewSearch}
                className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                New Search
              </button>
            </div>
            <h1 className="text-3xl font-bold text-black">
              Academic Resources
            </h1>
            <p className="text-gray-600 mt-2">
              {filters.department} • {getSelectedScheme()?.name} • Semester{" "}
              {filters.semester} • {getSelectedSubject()?.name} •{" "}
              {getSelectedCategory()?.name}
              {filters.module && ` • Module ${filters.module}`}
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters to find more resources.
              </p>
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-lime-400 rounded-lg">
                        <FileText className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {resource.subject.name} • Module{" "}
                          {resource.module_number}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{resource.description}</p>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                      <div>{resource.download_count} downloads</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <DownloadButton
                      resourceId={resource.id}
                      resourceTitle={resource.title}
                      resourceFile={resource.file}
                      initialCount={resource.download_count}
                      onDownloadChange={(newCount) => {
                        setResources((prev) =>
                          prev.map((res) =>
                            res.id === resource.id
                              ? { ...res, download_count: newCount }
                              : res
                          )
                        );
                      }}
                    />

                    <LikeButton
                      resourceId={resource.id}
                      initialCount={resource.likes_count}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
