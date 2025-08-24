"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Users,
  Briefcase,
  Award,
  MapPin,
  Linkedin,
  Mail,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Building,
  Globe,
  Star,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import {
  alumniService,
  Alumni,
  AlumniStats,
  AlumniFilters,
} from "@/services/alumniService";
import toast from "react-hot-toast";

const AlumniPage = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlumniFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAlumniData();
  }, [filters]);

  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch alumni and stats in parallel
      const [alumniData, statsData] = await Promise.all([
        alumniService.getAlumni(filters),
        alumniService.getAlumniStats(),
      ]);

      setAlumni(alumniData);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching alumni data:", err);
      setError("Failed to load alumni data. Please try again later.");
      toast.error("Failed to load alumni data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof AlumniFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const openAlumniModal = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
  };

  const closeAlumniModal = () => {
    setSelectedAlumni(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#B9FF66] animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#191A23]">
                Loading Alumni Network...
              </h2>
              <p className="text-gray-600 mt-2">
                Please wait while we connect you with our community
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#191A23] mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAlumniData}
                className="bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-[#B9FF66] text-[#191A23] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-16 h-16 mr-4 text-[#191A23]" />
              <h1 className="text-4xl md:text-6xl font-bold text-[#191A23]">
                Alumni Network
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#191A23]">
              Connecting generations of electrical engineering excellence
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg text-[#191A23]">
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                <Users className="w-5 h-5 mr-2" />
                <span>{stats?.total_alumni || 0}+ Alumni</span>
              </div>
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                <Building className="w-5 h-5 mr-2" />
                <span>{stats?.top_companies?.length || 0}+ Companies</span>
              </div>
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                <Globe className="w-5 h-5 mr-2" />
                <span>Global Network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="p-4">
                  <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <div className="text-3xl font-bold text-[#191A23] mb-2">
                    {stats.total_alumni}+
                  </div>
                  <div className="text-[#191A23] font-medium">
                    Alumni Members
                  </div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <div className="text-3xl font-bold text-[#191A23] mb-2">
                    {stats.employed_count}+
                  </div>
                  <div className="text-[#191A23] font-medium">Employed</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <div className="text-3xl font-bold text-[#191A23] mb-2">
                    {stats.higher_studies_count}+
                  </div>
                  <div className="text-[#191A23] font-medium">
                    Higher Studies
                  </div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <div className="text-3xl font-bold text-[#191A23] mb-2">
                    {stats.top_companies?.length || 0}+
                  </div>
                  <div className="text-[#191A23] font-medium">
                    Top Companies
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Controls */}
      <section className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alumni by name, company, or location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] transition-colors text-[#191A23]"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] rounded-lg transition-colors shadow-md"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-[#B9FF66]/10 rounded-lg border border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Batch Year Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[#191A23] mb-2">
                    Batch Year
                  </label>
                  <select
                    value={filters.year_of_passout || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "year_of_passout",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] bg-white text-[#191A23]"
                  >
                    <option value="">All Years</option>
                    {Array.from(
                      { length: 20 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[#191A23] mb-2">
                    Employment Status
                  </label>
                  <select
                    value={filters.employment_status || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "employment_status",
                        e.target.value || undefined
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] bg-white text-[#191A23]"
                  >
                    <option value="">All Status</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="higher_studies">Higher Studies</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[#191A23] mb-2">
                    Location
                  </label>
                  <select
                    value={filters.current_company || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "current_company",
                        e.target.value || undefined
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] bg-white text-[#191A23]"
                  >
                    <option value="">All Locations</option>
                    <option value="india">India</option>
                    <option value="abroad">Abroad</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Stats for Filtered Results */}
          {alumni.length > 0 &&
            (searchTerm ||
              Object.keys(filters).some(
                (key) => filters[key as keyof AlumniFilters]
              )) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold text-[#191A23] mb-4">
                  Filtered Results Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#191A23]">
                      {
                        alumni.filter(
                          (alum) => alum.employment_status === "employed"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Employed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#191A23]">
                      {
                        alumni.filter(
                          (alum) => alum.employment_status === "higher_studies"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Higher Studies</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#191A23]">
                      {
                        alumni.filter(
                          (alum) => alum.employment_status === "entrepreneur"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Entrepreneurs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#191A23]">
                      {
                        new Set(
                          alumni
                            .map((alum) => alum.current_company)
                            .filter(Boolean)
                        ).size
                      }
                    </div>
                    <div className="text-sm text-gray-600">Companies</div>
                  </div>
                </div>
              </div>
            )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#191A23]">
                Alumni Directory
              </h2>
              {(searchTerm ||
                Object.keys(filters).some(
                  (key) => filters[key as keyof AlumniFilters]
                )) && (
                <p className="text-gray-600 mt-1">
                  {searchTerm && `Searching for "${searchTerm}"`}
                  {searchTerm &&
                    Object.keys(filters).some(
                      (key) => filters[key as keyof AlumniFilters]
                    ) &&
                    " • "}
                  {Object.keys(filters).some(
                    (key) => filters[key as keyof AlumniFilters]
                  ) && "Filters applied"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#191A23] font-semibold bg-[#B9FF66]/20 px-4 py-2 rounded-full">
                {alumni.length} alumni found
              </span>
            </div>
          </div>

          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {alumni.map((alum) => (
                <div
                  key={alum.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#B9FF66]"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {alumniService.getProfileImageUrl(alum) ? (
                          <Image
                            src={alumniService.getProfileImageUrl(alum)}
                            alt={alum.full_name}
                            width={60}
                            height={60}
                            className="rounded-full object-cover border-2 border-[#B9FF66]/30"
                          />
                        ) : (
                          <div className="w-15 h-15 bg-[#B9FF66]/20 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-[#191A23]" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-[#191A23] text-lg">
                            {alum.full_name}
                          </h3>
                          <p className="text-sm text-[#191A23] font-semibold bg-[#B9FF66]/20 px-2 py-1 rounded">
                            Batch {alum.year_of_passout}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openAlumniModal(alum)}
                        className="text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/20 hover:bg-[#B9FF66]/30 p-2 rounded-full transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-[#191A23]">
                        <Briefcase className="w-4 h-4 mr-3 text-gray-600" />
                        <span className="font-medium">
                          {alum.job_title || "Position not specified"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-[#191A23]">
                        <Building className="w-4 h-4 mr-3 text-gray-600" />
                        <span className="font-medium">
                          {alum.current_company || "Company not specified"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-[#191A23]">
                        <MapPin className="w-4 h-4 mr-3 text-gray-600" />
                        <span className="font-medium">
                          {alum.current_location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${alumniService.getEmploymentStatusColor(
                            alum.employment_status
                          )}`}
                        >
                          {alumniService.getEmploymentStatusLabel(
                            alum.employment_status
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        {alumniService.getLinkedInUrl(alum) && (
                          <a
                            href={alumniService.getLinkedInUrl(alum)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {alum.email && (
                          <a
                            href={`mailto:${alum.email}`}
                            className="text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/20 hover:bg-[#B9FF66]/30 p-2 rounded-full transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        Class of {alum.year_of_passout}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-[#191A23] mb-4">
                No alumni found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search criteria or filters."
                  : "No alumni data available at the moment."}
              </p>
              {(searchTerm || Object.keys(filters).length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] rounded-lg transition-colors shadow-md"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#B9FF66]/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#191A23]">
                      {selectedAlumni.full_name}
                    </h2>
                    <p className="text-[#191A23] font-semibold">
                      Class of {selectedAlumni.year_of_passout}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAlumniModal}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {alumniService.getProfileImageUrl(selectedAlumni) ? (
                    <Image
                      src={alumniService.getProfileImageUrl(selectedAlumni)}
                      alt={selectedAlumni.full_name}
                      width={300}
                      height={300}
                      className="rounded-xl object-cover w-full border-4 border-[#B9FF66]/30"
                    />
                  ) : (
                    <div className="w-full h-64 bg-[#B9FF66]/20 rounded-xl flex items-center justify-center border-4 border-[#B9FF66]/30">
                      <Users className="w-20 h-20 text-[#191A23]" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-[#B9FF66]/10 p-4 rounded-lg border border-[#B9FF66]/30">
                    <h3 className="font-bold text-[#191A23] mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Graduation Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-[#191A23]">
                          Batch Year:
                        </span>
                        <span className="ml-2 text-[#191A23]">
                          {selectedAlumni.year_of_passout}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-[#191A23]">
                          Department:
                        </span>
                        <span className="ml-2 text-[#191A23]">
                          Electrical & Electronics Engineering
                        </span>
                      </div>
                      {selectedAlumni.cgpa && (
                        <div className="flex items-center">
                          <span className="font-medium text-[#191A23]">
                            CGPA:
                          </span>
                          <span className="ml-2 text-[#191A23]">
                            {selectedAlumni.cgpa}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <h3 className="font-bold text-[#191A23] mb-3 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Professional Status
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-[#191A23]">
                          Position:
                        </span>
                        <span className="ml-2 text-[#191A23]">
                          {selectedAlumni.job_title || "Position not specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="font-medium text-[#191A23]">
                          Company:
                        </span>
                        <span className="ml-2 text-[#191A23]">
                          {selectedAlumni.current_company ||
                            "Company not specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="font-medium text-[#191A23]">
                          Location:
                        </span>
                        <span className="ml-2 text-[#191A23]">
                          {selectedAlumni.current_location ||
                            "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-[#191A23]">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${alumniService.getEmploymentStatusColor(
                            selectedAlumni.employment_status
                          )}`}
                        >
                          {alumniService.getEmploymentStatusLabel(
                            selectedAlumni.employment_status
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-[#191A23] mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {alumniService.getLinkedInUrl(selectedAlumni) && (
                        <a
                          href={alumniService.getLinkedInUrl(selectedAlumni)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn Profile
                        </a>
                      )}
                      {selectedAlumni.email && (
                        <a
                          href={`mailto:${selectedAlumni.email}`}
                          className="flex items-center text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/20 hover:bg-[#B9FF66]/30 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedAlumni.achievements && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-bold text-[#191A23] mb-3 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Achievements
                      </h3>
                      <p className="text-sm text-[#191A23] leading-relaxed">
                        {selectedAlumni.achievements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniPage;
