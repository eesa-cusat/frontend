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
  Phone,
  ExternalLink
} from "lucide-react";
import { alumniService, Alumni, AlumniStats, AlumniFilters } from "@/services/alumniService";
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
        alumniService.getAlumniStats()
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
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof AlumniFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">Loading Alumni Network...</h2>
              <p className="text-gray-500 mt-2">Please wait while we connect you with our community</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchAlumniData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">Alumni Network</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Connecting generations of electrical engineering excellence
            </p>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{stats?.total_alumni || 0}+ Alumni</span>
              </div>
              <div className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                <span>{stats?.top_companies?.length || 0}+ Companies</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Global Network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="bg-white py-16 -mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="p-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.total_alumni}+
                  </div>
                  <div className="text-gray-600">Alumni Members</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.employed_count}+
                  </div>
                  <div className="text-gray-600">Employed</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.higher_studies_count}+
                  </div>
                  <div className="text-gray-600">Higher Studies</div>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.top_companies?.length || 0}+
                  </div>
                  <div className="text-gray-600">Top Companies</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Controls */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alumni by name, company, or location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Batch Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                  <select
                    value={filters.year_of_passout || ''}
                    onChange={(e) => handleFilterChange('year_of_passout', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Employment Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                  <select
                    value={filters.employment_status || ''}
                    onChange={(e) => handleFilterChange('employment_status', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="higher_studies">Higher Studies</option>
                    <option value="entrepreneur">Entrepreneur</option>
                  </select>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={filters.current_company || ''}
                    onChange={(e) => handleFilterChange('current_company', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    <option value="india">India</option>
                    <option value="abroad">Abroad</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Alumni Directory
            </h2>
            <span className="text-gray-600">
              {alumni.length} alumni found
            </span>
          </div>

          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((alum) => (
                <div
                  key={alum.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {alumniService.getProfileImageUrl(alum) ? (
                          <Image
                            src={alumniService.getProfileImageUrl(alum)}
                            alt={alum.full_name}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{alum.full_name}</h3>
                          <p className="text-sm text-gray-600">{alum.year_of_passout}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openAlumniModal(alum)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <span>{alum.job_title || "Position not specified"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{alum.current_company || "Company not specified"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{alum.current_location || "Location not specified"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {alumniService.getLinkedInUrl(alum) && (
                          <a
                            href={alumniService.getLinkedInUrl(alum)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {alum.email && (
                          <a
                            href={`mailto:${alum.email}`}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {alum.year_of_passout}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
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
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAlumni.full_name}</h2>
                <button
                  onClick={closeAlumniModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {alumniService.getProfileImageUrl(selectedAlumni) ? (
                    <Image
                      src={alumniService.getProfileImageUrl(selectedAlumni)}
                      alt={selectedAlumni.full_name}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover w-full"
                    />
                  ) : (
                    <div className="w-full h-48 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-emerald-600" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Batch: {selectedAlumni.year_of_passout}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Graduated: {selectedAlumni.year_of_passout}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{selectedAlumni.job_title || "Position not specified"}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{selectedAlumni.current_company || "Company not specified"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{selectedAlumni.current_location || "Location not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="flex space-x-4">
                      {alumniService.getLinkedInUrl(selectedAlumni) && (
                        <a
                          href={alumniService.getLinkedInUrl(selectedAlumni)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Linkedin className="w-4 h-4 mr-1" />
                          LinkedIn
                        </a>
                      )}
                      {selectedAlumni.email && (
                        <a
                          href={`mailto:${selectedAlumni.email}`}
                          className="flex items-center text-gray-600 hover:text-gray-700"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedAlumni.achievements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Achievements</h3>
                      <p className="text-sm text-gray-600">{selectedAlumni.achievements}</p>
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
