"use client";

import React, { useState, useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import LikeButton from "@/components/ui/LikeButton";

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
  is_featured: boolean;
  created_at: string;
  exam_type?: string;
  exam_year?: number;
}

interface Scheme {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  semester: number;
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

const AcademicsPage = () => {
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  
  // Data from APIs
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    setBackendError(false);
    
    try {
      // Fetch schemes
      const schemesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/schemes/`;
      const schemesResponse = await fetch(schemesUrl);
      if (!schemesResponse.ok) {
        throw new Error(`Schemes API returned ${schemesResponse.status}`);
      }
      const schemesData = await schemesResponse.json();
      setSchemes(Array.isArray(schemesData) ? schemesData : []);

      // Fetch categories  
      const categoriesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/categories/`;
      const categoriesResponse = await fetch(categoriesUrl);
      if (!categoriesResponse.ok) {
        throw new Error(`Categories API returned ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Fetch resources to get available departments
      const resourcesUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/resources/`;
      const resourcesResponse = await fetch(resourcesUrl);
      if (!resourcesResponse.ok) {
        throw new Error(`Resources API returned ${resourcesResponse.status}`);
      }
      const resourcesData = await resourcesResponse.json();
      
      // Extract unique departments from resources
      const uniqueDepartments = new Set<string>();
      const results = resourcesData.results || resourcesData || [];
      if (Array.isArray(results)) {
        results.forEach((resource: AcademicResource) => {
          if (resource.subject && resource.subject.department) {
            uniqueDepartments.add(resource.subject.department);
          }
        });
      }
      const departmentsList = Array.from(uniqueDepartments).sort();
      setDepartments(departmentsList);
      
    } catch (error) {
      console.error("Error in fetchInitialData:", error);
      setBackendError(true);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch subjects when scheme, semester, or department changes
  const fetchSubjects = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/subjects/?scheme=${filters.scheme_id}&semester=${filters.semester}`;
      
      // Add department filter if selected
      if (filters.department) {
        url += `&department=${filters.department}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Subjects API returned ${response.status}`);
      }
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    if (filters.scheme_id && filters.semester) {
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.scheme_id, filters.semester, filters.department]);

  // Filter options
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const modules = ["1", "2", "3", "4", "5"];

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // Reset dependent fields
    if (field === 'department') {
      setFilters(prev => ({ ...prev, scheme_id: "", semester: "", subject_id: "" }));
      setSubjects([]);
    }
    if (field === 'scheme_id') {
      setFilters(prev => ({ ...prev, semester: "", subject_id: "" }));
      setSubjects([]);
    }
    if (field === 'semester') {
      setFilters(prev => ({ ...prev, subject_id: "" }));
    }
  };

  const validateMandatoryFilters = () => {
    const isValid = filters.department && filters.scheme_id && filters.semester && filters.subject_id && filters.category;
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateMandatoryFilters()) {
      alert("Please fill all mandatory fields (Department, Scheme, Semester, Subject, Category)");
      return;
    }
    
    setLoading(true);
    try {
      // Build query parameters as per the filtering guide
      const queryParams = new URLSearchParams();
      
      // Add all available filter parameters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.scheme_id) queryParams.append('scheme', filters.scheme_id);
      if (filters.subject_id) queryParams.append('subject', filters.subject_id);
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.module) queryParams.append('module_number', filters.module);
      
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/academics/resources/?${queryParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats (results array or direct array)
      const resourcesArray = data.results || data || [];
      setResources(Array.isArray(resourcesArray) ? resourcesArray : []);
      setShowFilters(false);
      
    } catch (error) {
      console.error("Error fetching resources:", error);
      alert("Failed to fetch academic resources. Please check your backend connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedScheme = () => {
    return schemes.find(s => s.id.toString() === filters.scheme_id);
  };

  const getSelectedSubject = () => {
    return subjects.find(s => s.id.toString() === filters.subject_id);
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.id === filters.category);
  };

  const FilterInput = ({ 
    label, 
    field, 
    options, 
    required = false,
    disabled = false 
  }: { 
    label: string; 
    field: keyof FilterState; 
    options: Array<{value: string, label: string}>; 
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
        className="w-full p-4 border-3 border-black rounded-xl bg-white text-black font-medium text-base focus:outline-none focus:ring-0 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with illustration */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-64 h-48 bg-lime-400 rounded-3xl flex items-center justify-center">
                  <FileText className="w-24 h-24 text-black" />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full ml-1"></div>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 border-4 border-black rounded-full bg-white"></div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">
              Academic <span className="text-lime-400">Resources</span>
            </h1>
            <p className="text-black text-lg max-w-2xl mx-auto">
              Access comprehensive study materials, notes, and resources organized by department, semester, and subject.
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                Select filters in order: Department → Scheme → Semester → Subject → Category
              </span>
            </p>
          </div>

          {/* Loading state or Filter Form */}
          {initialLoading ? (
            <div className="bg-gray-50 rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Loading academic data...</p>
              </div>
            </div>
          ) : backendError ? (
            <div className="bg-gray-50 rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend Not Available</h3>
                <p className="text-gray-600 mb-4">
                  Unable to connect to the academic data backend. Please check if the backend server is running.
                </p>
                <button
                  onClick={fetchInitialData}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-8 space-y-6 min-h-[500px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FilterInput 
                  label="Department" 
                  field="department" 
                  options={departments.map(d => ({ value: d, label: d }))} 
                  required 
                />
                <FilterInput 
                  label="Scheme" 
                  field="scheme_id" 
                  options={schemes.map(s => ({ value: s.id.toString(), label: s.name }))} 
                  required 
                />
                <FilterInput 
                  label="Semester" 
                  field="semester" 
                  options={semesters.map(s => ({ value: s, label: `Semester ${s}` }))} 
                  required 
                />
                <FilterInput 
                  label="Subject" 
                  field="subject_id" 
                  options={subjects.map(s => ({ value: s.id.toString(), label: `${s.name} (${s.code})` }))} 
                  required
                  disabled={!filters.department || !filters.scheme_id || !filters.semester}
                />
                <FilterInput 
                  label="Category" 
                  field="category" 
                  options={categories.map(c => ({ value: c.id, label: c.name }))} 
                  required 
                />
                <FilterInput 
                  label="Module" 
                  field="module" 
                  options={modules.map(m => ({ value: m, label: `Module ${m}` }))}
                />
              </div>

              <div className="flex justify-center pt-6">
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

  // Resources Display Page
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => setShowFilters(true)}
              className="text-black hover:text-gray-600 font-medium mb-4"
            >
              ← Back to Filters
            </button>
            <h1 className="text-3xl font-bold text-black">
              Academic Resources
            </h1>
            <p className="text-gray-600 mt-2">
              {filters.department} • {getSelectedScheme()?.name} • Semester {filters.semester} • {getSelectedSubject()?.name} • {getSelectedCategory()?.name}
              {filters.module && ` • Module ${filters.module}`}
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your filters to find more resources.</p>
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="bg-white border-2 border-black rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                {/* Like Button positioned in top-right corner */}
                <div className="absolute top-4 right-4">
                  <LikeButton
                    resourceId={resource.id}
                    initialCount={resource.likes_count || 0}
                    onLikeChange={(newCount) => {
                      // Update the resource's like count in the resources list
                      setResources(prev => prev.map(res => 
                        res.id === resource.id 
                          ? { ...res, likes_count: newCount }
                          : res
                      ));
                    }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 pr-16">
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
                          {resource.subject.name} • Module {resource.module_number}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        {resource.download_count} downloads
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors w-full sm:w-auto"
                      onClick={() => window.open(resource.file, '_blank')}
                    >
                      <FileText className="w-4 h-4" />
                      Download ({resource.download_count || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;
