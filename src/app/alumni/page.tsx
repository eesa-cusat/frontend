"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Alumni {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  batch: {
    id: number;
    batch_year_range: string;
    batch_name: string;
    graduation_year: number;
  };
  job_title?: string;
  current_company?: string;
  current_location?: string;
  linkedin_profile?: string;
  employment_status: string;
  achievements?: string;
  willing_to_mentor: boolean;
  is_verified: boolean;
}

interface AlumniBatch {
  id: number;
  batch_year_range: string;
  batch_name: string;
  batch_description?: string;
  total_alumni: number;
  verified_alumni: number;
  batch_group_photo?: string;
  graduation_year: number;
  joining_year: number;
  alumni_count: number;
  employment_stats?: {
    total: number;
    employed: number;
    self_employed: number;
    entrepreneur: number;
    higher_studies: number;
    unemployed: number;
    employment_rate: number;
  };
}

interface Stats {
  total_alumni: number;
  employed_count: number;
  employment_rate: number;
}

interface BatchStatsData {
  total_batches: number;
  batches: AlumniBatch[];
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [batches, setBatches] = useState<AlumniBatch[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [batchStats, setBatchStats] = useState<BatchStatsData | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"alumni" | "batches">("alumni");

  useEffect(() => {
    fetchData();
  }, [selectedBatch, selectedStatus, searchTerm, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alumniRes, batchesRes, statsRes, batchStatsRes] = await Promise.all([
        api.alumni.list({
          page: currentPage,
          page_size: 12,
          ...(selectedBatch !== "all" && { batch: selectedBatch }),
          ...(selectedStatus !== "all" && { employment_status: selectedStatus }),
          ...(searchTerm && { search: searchTerm }),
        }),
        api.alumni.batches(),
        api.alumni.stats(),
        api.alumni.batchStats(),
      ]);

      setAlumni(alumniRes.data.results || alumniRes.data);
      setBatches(batchesRes.data);
      setStats(statsRes.data);
      setBatchStats(batchStatsRes.data);
    } catch (error) {
      console.error("Error fetching alumni data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      employed: "bg-green-100 text-green-800",
      self_employed: "bg-blue-100 text-blue-800",
      entrepreneur: "bg-purple-100 text-purple-800",
      higher_studies: "bg-yellow-100 text-yellow-800",
      unemployed: "bg-gray-100 text-gray-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      employed: "Employed",
      self_employed: "Self Employed",
      entrepreneur: "Entrepreneur",
      higher_studies: "Higher Studies",
      unemployed: "Unemployed",
      other: "Other",
    };
    return labels[status] || status;
  };

  if (loading && !alumni.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EESA Alumni Network
          </h1>
          <p className="text-lg text-gray-600">
            Connect with our accomplished alumni community
          </p>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-gray-500 text-sm font-medium">Total Alumni</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total_alumni}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-gray-500 text-sm font-medium">Employed</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.employed_count}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-gray-500 text-sm font-medium">
                Employment Rate
              </h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.employment_rate}%
              </p>
            </motion.div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView("alumni")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                view === "alumni"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Alumni Directory
            </button>
            <button
              onClick={() => setView("batches")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                view === "batches"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Batch Statistics
            </button>
          </div>
        </div>

        {view === "alumni" ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="higher_studies">Higher Studies</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map((alumnus, index) => (
                <motion.div
                  key={alumnus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {alumnus.full_name}
                        {alumnus.is_verified && (
                          <span className="ml-2 text-blue-500">✓</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {alumnus.batch.batch_name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        alumnus.employment_status
                      )}`}
                    >
                      {getStatusLabel(alumnus.employment_status)}
                    </span>
                  </div>

                  {alumnus.job_title && (
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {alumnus.job_title}
                    </p>
                  )}
                  {alumnus.current_company && (
                    <p className="text-sm text-gray-600 mb-1">
                      {alumnus.current_company}
                    </p>
                  )}
                  {alumnus.current_location && (
                    <p className="text-sm text-gray-500 mb-3">
                      📍 {alumnus.current_location}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    {alumnus.linkedin_profile && (
                      <a
                        href={alumnus.linkedin_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {alumnus.willing_to_mentor && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Open to Mentor
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* Batch Statistics View */
          <div className="space-y-6">
            {batchStats?.batches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {batch.batch_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {batch.batch_year_range}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {batch.total_alumni}
                    </p>
                    <p className="text-xs text-gray-500">Alumni</p>
                  </div>
                </div>

                {batch.batch_description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {batch.batch_description}
                  </p>
                )}

                {batch.employment_stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {batch.employment_stats.employed}
                      </p>
                      <p className="text-xs text-gray-500">Employed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">
                        {batch.employment_stats.entrepreneur}
                      </p>
                      <p className="text-xs text-gray-500">Entrepreneurs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-yellow-600">
                        {batch.employment_stats.higher_studies}
                      </p>
                      <p className="text-xs text-gray-500">Higher Studies</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">
                        {batch.employment_stats.employment_rate}%
                      </p>
                      <p className="text-xs text-gray-500">Employment Rate</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
