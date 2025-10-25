"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import LazyImage from "@/components/ui/LazyImage";
import {
  Briefcase,
  Building,
  TrendingUp,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  ArrowRight,
  Star,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PlacementDrive {
  id: number;
  title: string;
  company_name: string;
  company_logo?: string;
  job_type: string;
  package_lpa?: number;
  registration_end: string;
  drive_date: string;
  location: string;
  is_registration_open: boolean;
  is_featured: boolean;
}

interface PlacedStudent {
  id: number;
  student_name: string;
  batch_year: number;
  cgpa: number;
  company_name: string;
  company_logo?: string;
  job_title: string;
  package_lpa: number;
  work_location: string;
  job_type: string;
  job_type_display: string;
  category: string;
  category_display: string;
  offer_date: string;
  is_verified: boolean;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

interface PlacementOverview {
  overview: {
    active_drives: number;
    open_registrations: number;
    companies_visited: number;
    current_year: number;
  };
}

export default function PlacementsPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [placedStudents, setPlacedStudents] = useState<PlacedStudent[]>([]);
  const [overview, setOverview] = useState<PlacementOverview["overview"] | null>(null);
  
  // Pagination states
  const [drivesPage, setDrivesPage] = useState(1);
  const [placedPage, setPlacedPage] = useState(1);
  const [drivesTotalPages, setDrivesTotalPages] = useState(1);
  const [placedTotalPages, setPlacedTotalPages] = useState(1);
  const [drivesTotal, setDrivesTotal] = useState(0);
  const [placedTotal, setPlacedTotal] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [batchYearFilter, setBatchYearFilter] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drives" | "placed">("drives");
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  const fetchDrives = useCallback(async (page: number = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (jobTypeFilter) params.append('job_type', jobTypeFilter);
      
      const response = await fetch(`${apiBaseUrl}/placements/drives/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.results || [];
      
      setDrives(results);
      setDrivesTotalPages(Math.ceil(data.count / 12));
      setDrivesTotal(data.count);
    } catch (error) {
      console.error("Error fetching drives:", error);
      setError("Failed to load placement drives");
    }
  }, [searchTerm, jobTypeFilter, apiBaseUrl]);

  const fetchPlacedStudents = useCallback(async (page: number = 1) => {
    try {

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (batchYearFilter) params.append('batch_year', batchYearFilter);
      
      const response = await fetch(`${apiBaseUrl}/placements/placed-students/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.results || [];
      
      setPlacedStudents(results);
      setPlacedTotalPages(Math.ceil(data.count / 12));
      setPlacedTotal(data.count);
    } catch (error) {
      console.error("Error fetching placed students:", error);
      setError("Failed to load placed students");
    }
  }, [searchTerm, categoryFilter, batchYearFilter, apiBaseUrl]);

  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/placements/overview/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setOverview(data.overview);
    } catch (error) {
      console.error("Error fetching overview:", error);
      // Set fallback overview
      setOverview({
        active_drives: 0,
        open_registrations: 0,
        companies_visited: 0,
        current_year: new Date().getFullYear(),
      });
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchOverview(),
        fetchDrives(1),
        fetchPlacedStudents(1)
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, [fetchOverview, fetchDrives, fetchPlacedStudents]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'drives') {
        setDrivesPage(1);
        fetchDrives(1);
      } else {
        setPlacedPage(1);
        fetchPlacedStudents(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, jobTypeFilter, categoryFilter, batchYearFilter, activeTab, fetchDrives, fetchPlacedStudents]);

  // Pagination handlers
  const handleDrivesPageChange = (page: number) => {
    setDrivesPage(page);
    fetchDrives(page);
  };

  const handlePlacedPageChange = (page: number) => {
    setPlacedPage(page);
    fetchPlacedStudents(page);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getJobTypeColor = (jobType: string) => {
    if (!jobType) return "bg-gray-100 text-gray-800";
    
    switch (jobType) {
      case "full_time":
        return "bg-green-100 text-green-800";
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "part_time":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
  }) => {
    const startItem = (currentPage - 1) * 12 + 1;
    const endItem = Math.min(currentPage * 12, totalItems);

    return (
      <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white border-t border-gray-200 rounded-lg">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              const distance = Math.abs(page - currentPage);
              return distance <= 2 || page === 1 || page === totalPages;
            })
            .map((page, index, array) => {
              const prevPage = array[index - 1];
              return (
                <React.Fragment key={page}>
                  {prevPage && page - prevPage > 1 && (
                    <span className="px-3 py-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Placement Data</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
              Career Placements
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600">
              Your gateway to exciting career opportunities and industry connections
            </p>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <Briefcase className="w-8 h-8" />
              <span className="text-lg font-medium">Building Futures • Optimized Loading</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {overview && (
        <section className="bg-white py-16 -mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {overview.active_drives}
                  </div>
                  <div className="text-gray-600">Active Drives</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {overview.open_registrations}
                  </div>
                  <div className="text-gray-600">Open Registrations</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {overview.companies_visited}
                  </div>
                  <div className="text-gray-600">Companies Visited</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {overview.current_year}
                  </div>
                  <div className="text-gray-600">Current Year</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs and Filters */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab("drives")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "drives"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Placement Drives ({drivesTotal})
            </button>
            <button
              onClick={() => setActiveTab("placed")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "placed"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Placed Students ({placedTotal})
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {activeTab === "drives" ? (
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Job Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="internship">Internship</option>
                  <option value="part_time">Part Time</option>
                </select>
              ) : (
                <>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="core">Core</option>
                    <option value="tech">Tech</option>
                    <option value="general">General</option>
                  </select>
                  <select
                    value={batchYearFilter}
                    onChange={(e) => setBatchYearFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Batches</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading placement data (optimized)...</p>
            </div>
          ) : (
            <>
              {activeTab === "drives" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Active Placement Drives
                    </h2>
                    <Link
                      href="/placements/companies"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Companies →
                    </Link>
                  </div>
                  
                  {drives.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drives.map((drive) => (
                          <div
                            key={drive.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  {drive.company_logo ? (
                                    <LazyImage
                                      src={drive.company_logo}
                                      alt={drive.company_name || "Company"}
                                      width={40}
                                      height={40}
                                      className="rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Building className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {drive.company_name || "Company"}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {drive.title}
                                    </p>
                                  </div>
                                </div>
                                {drive.is_featured && (
                                  <Star className="w-5 h-5 text-yellow-500" />
                                )}
                              </div>

                              <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{drive.location || "Location TBD"}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{formatDate(drive.drive_date)}</span>
                                </div>
                                {drive.package_lpa && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <IndianRupee className="w-4 h-4 mr-2" />
                                    <span>{drive.package_lpa} LPA</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                                    drive.job_type
                                  )}`}
                                >
                                  {drive.job_type?.replace("_", " ").toUpperCase() || "N/A"}
                                </span>
                                <Link
                                  href={`/placements/drives/${drive.id}`}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <PaginationControls
                        currentPage={drivesPage}
                        totalPages={drivesTotalPages}
                        onPageChange={handleDrivesPageChange}
                        totalItems={drivesTotal}
                      />
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                        No placement drives found
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "placed" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Placed Students
                    </h2>
                    <Link
                      href="/placements/statistics"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Statistics →
                    </Link>
                  </div>
                  
                  {placedStudents.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {placedStudents.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  {student.company_logo ? (
                                    <LazyImage
                                      src={student.company_logo}
                                      alt={student.company_name || "Company"}
                                      width={40}
                                      height={40}
                                      className="rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Building className="w-5 h-5 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {student.student_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {student.company_name || "Company"}
                                    </p>
                                  </div>
                                </div>
                                {student.is_verified && (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Position:</span>{" "}
                                  {student.job_title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Package:</span>{" "}
                                  {student.package_lpa} LPA
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Location:</span>{" "}
                                  {student.work_location || "TBD"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Batch:</span>{" "}
                                  {student.batch_year}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                                    student.job_type
                                  )}`}
                                >
                                  {student.job_type_display || student.job_type?.replace("_", " ").toUpperCase() || "N/A"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(student.offer_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <PaginationControls
                        currentPage={placedPage}
                        totalPages={placedTotalPages}
                        onPageChange={handlePlacedPageChange}
                        totalItems={placedTotal}
                      />
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                        No placed students found
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
