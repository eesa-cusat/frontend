"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Building,
  DollarSign,
  Award,
  Calendar,
  GraduationCap,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import {
  JobOpportunity,
  InternshipOpportunity,
  CertificateOpportunity,
} from "@/types/api";

type TabType = "jobs" | "internships" | "certificates";

export default function CareersPage() {
  // For demo purposes, hide admin buttons
  // In production, this would be controlled by staff login
  const isAuthenticated = false;
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API base URL from environment variable
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // Data states
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [internships, setInternships] = useState<InternshipOpportunity[]>([]);
  const [certificates, setCertificates] = useState<CertificateOpportunity[]>(
    []
  );

  // Fetch data based on active tab
  const fetchData = useCallback(
    async (tab: TabType) => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "";
        switch (tab) {
          case "jobs":
            endpoint = `${API_BASE_URL}/careers/opportunities/`;
            break;
          case "internships":
            endpoint = `${API_BASE_URL}/careers/internships/`;
            break;
          case "certificates":
            endpoint = `${API_BASE_URL}/careers/certificates/`;
            break;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        switch (tab) {
          case "jobs":
            setJobs(data.opportunities || []);
            break;
          case "internships":
            setInternships(data.internships || []);
            break;
          case "certificates":
            setCertificates(data.certificates || []);
            break;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch ${tab}: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  // Filter data based on search term
  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();

    switch (activeTab) {
      case "jobs":
        return jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchLower) ||
            job.company.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower)
        );
      case "internships":
        return internships.filter(
          (internship) =>
            internship.title.toLowerCase().includes(searchLower) ||
            internship.company.toLowerCase().includes(searchLower) ||
            internship.location.toLowerCase().includes(searchLower)
        );
      case "certificates":
        return certificates.filter(
          (cert) =>
            cert.title.toLowerCase().includes(searchLower) ||
            cert.provider.toLowerCase().includes(searchLower)
        );
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading careers data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Career Opportunities
              </h1>
              <p className="text-lg text-gray-600">
                Discover jobs, internships, and certification opportunities
              </p>
            </div>
            {isAuthenticated && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "jobs", label: "Jobs", icon: Briefcase },
                {
                  id: "internships",
                  label: "Internships",
                  icon: GraduationCap,
                },
                { id: "certificates", label: "Certificates", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full max-w-md"
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredData.length} {activeTab}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => fetchData(activeTab)}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Content */}
        {filteredData.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              {activeTab === "jobs" && (
                <Briefcase className="w-8 h-8 text-gray-400" />
              )}
              {activeTab === "internships" && (
                <GraduationCap className="w-8 h-8 text-gray-400" />
              )}
              {activeTab === "certificates" && (
                <Award className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria."
                : `No ${activeTab} available at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "jobs" &&
              (filteredData as JobOpportunity[]).map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(job.posted_at)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          window.open(job.application_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === "internships" &&
              (filteredData as InternshipOpportunity[]).map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {internship.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{internship.company}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{internship.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {internship.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(internship.posted_at)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          window.open(internship.application_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === "certificates" &&
              (filteredData as CertificateOpportunity[]).map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {certificate.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{certificate.duration}</span>
                    </div>
                    {certificate.percentage_offer && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-green-700 text-sm font-medium">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {certificate.percentage_offer}% OFF
                        </div>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-4">
                      {certificate.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(certificate.posted_at)}</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          window.open(certificate.enrollment_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Enroll
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
