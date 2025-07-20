"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  Star,
  Briefcase,
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
  description: string;
  requirements: string;
  is_registration_open: boolean;
  is_featured: boolean;
  created_at: string;
}

const DriveDetailsPage = () => {
  const params = useParams();
  const driveId = params.id as string;

  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriveDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/placements/drives/${driveId}/`
      );

      if (!response.ok) {
        throw new Error("Drive not found");
      }

      const data = await response.json();
      setDrive(data);
    } catch (error) {
      console.error("Error fetching drive details:", error);
      setError("Failed to load drive details");
    } finally {
      setLoading(false);
    }
  }, [driveId]);

  useEffect(() => {
    if (driveId) {
      fetchDriveDetails();
    }
  }, [driveId, fetchDriveDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getJobTypeColor = (jobType: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drive details...</p>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Drive Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The placement drive you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/placements"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Placements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/placements"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Placements
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                {/* Company Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {drive.company_logo ? (
                      <Image
                        src={drive.company_logo}
                        alt={drive.company_name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {drive.company_name}
                      </h1>
                      <p className="text-xl text-gray-600">{drive.title}</p>
                    </div>
                  </div>
                  {drive.is_featured && (
                    <Star className="w-8 h-8 text-yellow-500 fill-current" />
                  )}
                </div>

                {/* Job Type and Package */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getJobTypeColor(
                      drive.job_type
                    )}`}
                  >
                    {drive.job_type.replace("_", " ").toUpperCase()}
                  </span>
                  {drive.package_lpa && (
                    <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                      <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {drive.package_lpa} LPA
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    About this Drive
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {drive.description ||
                        "No description available for this placement drive."}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Requirements
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {drive.requirements ||
                        "No specific requirements mentioned."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                {drive.is_registration_open ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 mr-3" />
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  Registration Status
                </h3>
              </div>
              <p
                className={`text-sm font-medium ${
                  drive.is_registration_open ? "text-green-600" : "text-red-600"
                }`}
              >
                {drive.is_registration_open
                  ? "Open for Registration"
                  : "Registration Closed"}
              </p>
              {drive.is_registration_open && (
                <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Register Now
                </button>
              )}
            </div>

            {/* Drive Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Drive Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">Drive Date</p>
                    <p>{formatDate(drive.drive_date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">Registration Ends</p>
                    <p>{formatDate(drive.registration_end)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{drive.location || "TBD"}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-3" />
                  <div>
                    <p className="font-medium">Job Type</p>
                    <p>{drive.job_type.replace("_", " ").toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                For questions about this placement drive, contact the Placement
                Cell.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  placement@example.com
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> +91-1234567890
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetailsPage;
