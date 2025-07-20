"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

interface PlacementOverview {
  overview: {
    active_drives: number;
    open_registrations: number;
    companies_visited: number;
    current_year: number;
  };
}

interface PlacedStudent {
  id: number;
  student_name: string;
  branch: string;
  batch_year: number;
  cgpa: number;
  company_name: string;
  company_logo?: string;
  job_title: string;
  package_lpa: number;
  work_location: string;
  job_type: string;
  offer_date: string;
  is_verified: boolean;
  created_at: string;
}

const PlacementsPage = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [placedStudents, setPlacedStudents] = useState<PlacedStudent[]>([]);
  const [overview, setOverview] = useState<
    PlacementOverview["overview"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drives" | "placed">("drives");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        const [drivesResponse, placedResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/placements/drives/`),
          fetch(`${apiBaseUrl}/placements/placed-students/`),
        ]);

        // Check if responses are valid JSON
        const drivesText = await drivesResponse.text();
        const placedText = await placedResponse.text();
        
        let drivesData, placedData;
        
        try {
          drivesData = JSON.parse(drivesText);
        } catch {
          console.error("Invalid JSON in drives response:", drivesText);
          throw new Error("Invalid response from drives API");
        }
        
        try {
          placedData = JSON.parse(placedText);
        } catch {
          console.error("Invalid JSON in placed students response:", placedText);
          throw new Error("Invalid response from placed students API");
        }

        // Handle backend response format - backend returns 'drives' and 'placed_students' keys
        const drives = drivesData.drives || drivesData.results || drivesData || [];
        const placedStudents = placedData.placed_students || placedData.results || placedData || [];

        console.log("Drives data:", drives); // Debug log
        console.log("Placed students data:", placedStudents); // Debug log
        
        // Validate and transform data to prevent null access errors
        const validDrives = drives.filter((drive: PlacementDrive) => drive && drive.id);
        const validPlacedStudents = placedStudents.filter((student: PlacedStudent) => student && student.id);

        setDrives(validDrives);
        setPlacedStudents(validPlacedStudents);

        // Calculate companies visited from unique companies in both drives and placed students
        const driveCompanies = validDrives.map((d: PlacementDrive) => d.company_name);
        const placedCompanies = validPlacedStudents.map((p: PlacedStudent) => p.company_name);
        const allCompanies = [...driveCompanies, ...placedCompanies];
        const uniqueCompanies = new Set(allCompanies.filter(Boolean));

        // Set overview data
        setOverview({
          active_drives: validDrives.length,
          open_registrations: validDrives.filter(
            (d: PlacementDrive) => d.is_registration_open
          ).length,
          companies_visited: uniqueCompanies.size,
          current_year: new Date().getFullYear(),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Failed to load placement data");
        // Fallback to mock data
        setDrives([]);
        setPlacedStudents([]);
        setOverview({
          active_drives: 0,
          open_registrations: 0,
          companies_visited: 0,
          current_year: new Date().getFullYear(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Career Placements
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your gateway to exciting career opportunities and industry
              connections
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Briefcase className="w-8 h-8" />
              <span className="text-lg font-medium">Building Futures</span>
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

      {/* Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveTab("drives")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "drives"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Placement Drives
            </button>
            <button
              onClick={() => setActiveTab("placed")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "placed"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Placed Students
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading placement data...</p>
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
                                  <Image
                                    src={drive.company_logo}
                                    alt={drive.company_name || "Company"}
                                    width={40}
                                    height={40}
                                    className="rounded-lg"
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
                  ) : (
                    <div className="text-center py-20">
                      <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                        No active placement drives
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Check back later for new placement opportunities. We&apos;re
                        constantly adding new companies and drives.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "placed" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recently Placed Students
                    </h2>
                    <Link
                      href="/placements/statistics"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Statistics →
                    </Link>
                  </div>
                  {placedStudents.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {placedStudents.slice(0, 9).map((student) => (
                        <div
                          key={student.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                {student.company_logo ? (
                                  <Image
                                    src={student.company_logo}
                                    alt={student.company_name || "Company"}
                                    width={40}
                                    height={40}
                                    className="rounded-lg"
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
                                {student.job_type?.replace("_", " ").toUpperCase() || "N/A"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(student.offer_date)}
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
                        No placed students data
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Placement data will be updated as students get placed
                        through our placement drives.
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
};

export default PlacementsPage;
