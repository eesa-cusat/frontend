"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Users, Building, Award, IndianRupee } from "lucide-react";

interface PlacementStats {
  academic_year: string;
  batch_year: number;
  branch: string;
  total_students: number;
  total_placed: number;
  placement_percentage: number;
  highest_package: string | number;
  average_package: string | number;
  median_package: string | number;
  total_companies_visited: number;
  total_offers: number;
}

interface PlacedStudent {
  id: number;
  student_name: string;
  branch: string;
  batch_year: number;
  company_name: string;
  job_title: string;
  package_lpa: string | number;
  work_location: string;
  offer_date: string;
}

const PlacementStatisticsPage = () => {
  const [stats, setStats] = useState<PlacementStats[]>([]);
  const [recentPlacements, setRecentPlacements] = useState<PlacedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log("Fetching statistics...");

      const [statsResponse, placedResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/placements/statistics/`),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/placements/placed-students/`
        ),
      ]);

      console.log("Stats response:", statsResponse.status);
      console.log("Placed response:", placedResponse.status);

      if (!statsResponse.ok || !placedResponse.ok) {
        throw new Error(
          `Failed to fetch data: ${statsResponse.status}, ${placedResponse.status}`
        );
      }

      const statsData = await statsResponse.json();
      const placedData = await placedResponse.json();

      console.log("Stats data:", statsData);
      console.log("Placed data:", placedData);

      // Handle statistics data
      let statsArray: PlacementStats[] = [];
      if (Array.isArray(statsData)) {
        statsArray = statsData;
      } else if (statsData && Array.isArray(statsData.results)) {
        statsArray = statsData.results;
      } else if (
        statsData &&
        statsData.statistics &&
        Array.isArray(statsData.statistics)
      ) {
        statsArray = statsData.statistics;
      }

      // Handle placed students data
      let placedArray: PlacedStudent[] = [];
      if (Array.isArray(placedData)) {
        placedArray = placedData;
      } else if (placedData && Array.isArray(placedData.results)) {
        placedArray = placedData.results;
      } else if (
        placedData &&
        placedData.placed_students &&
        Array.isArray(placedData.placed_students)
      ) {
        placedArray = placedData.placed_students;
      }

      console.log("Processed stats array:", statsArray);
      console.log("Processed placed array:", placedArray);

      setStats(statsArray);
      setRecentPlacements(placedArray.slice(0, 10));

      // Auto-select the first available year if not already selected
      if (statsArray.length > 0 && !selectedYear) {
        const availableYears = [
          ...new Set(statsArray.map((stat) => stat.academic_year)),
        ]
          .sort()
          .reverse();
        if (availableYears.length > 0) {
          setSelectedYear(availableYears[0]);
          console.log("Auto-selected year:", availableYears[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to load placement statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentYearStats = () => {
    if (!Array.isArray(stats) || stats.length === 0) return null;
    const yearToUse =
      selectedYear || (stats.length > 0 ? stats[0].academic_year : "");
    return (
      stats.find((stat) => stat.academic_year === yearToUse) || stats[0] || null
    );
  };

  const getAvailableYears = () => {
    if (!Array.isArray(stats) || stats.length === 0) return [];
    return [...new Set(stats.map((stat) => stat.academic_year))]
      .sort()
      .reverse();
  };

  const currentStats = getCurrentYearStats();
  const availableYears = getAvailableYears();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading placement statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
              <p className="font-medium">Error Loading Data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchStatistics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Placement Statistics
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              EEE Department Placement Success and Career Outcomes
            </p>
            <div className="flex items-center justify-center space-x-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-lg font-medium">Success Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Year Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {availableYears.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <div className="flex space-x-2">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedYear === year
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Stats count: {stats.length} | Selected year:{" "}
            {selectedYear || "None"} | Available years:{" "}
            {availableYears.join(", ") || "None"} | Current stats:{" "}
            {currentStats ? "Found" : "Not found"}
          </p>
        </div>

        {/* Stats Cards */}
        {currentStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Total Students
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {currentStats.total_students || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Placed
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {currentStats.total_placed || 0}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {(currentStats.placement_percentage || 0).toFixed(1)}% placement
                rate
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Highest Package
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ₹
                {parseFloat(String(currentStats.highest_package || 0)).toFixed(
                  2
                )}{" "}
                LPA
              </div>
              <div className="text-sm text-gray-600">
                Average: ₹
                {parseFloat(String(currentStats.average_package || 0)).toFixed(
                  2
                )}{" "}
                LPA
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Companies
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {currentStats.total_companies_visited || 0}
              </div>
              <div className="text-sm text-gray-600">
                {currentStats.total_offers || 0} offers received
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <div className="text-gray-400 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Placement Statistics Available
            </h3>
            <p className="text-gray-600">
              {availableYears.length > 0
                ? `No statistics found for ${
                    selectedYear || "the selected year"
                  }`
                : "No placement statistics have been created yet"}
            </p>
          </div>
        )}

        {/* Recent Placements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Placements
          </h2>
          {recentPlacements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Branch
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Position
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Package
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlacements.map((student, index) => (
                    <tr
                      key={student.id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {student.student_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Batch {student.batch_year}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {student.branch}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {student.company_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {student.job_title}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        ₹{parseFloat(String(student.package_lpa)).toFixed(2)}{" "}
                        LPA
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {student.work_location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recent Placements
              </h3>
              <p className="text-gray-600">
                No recent placement data available to display.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementStatisticsPage;
