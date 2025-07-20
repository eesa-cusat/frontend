"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building,
  MapPin,
  Users,
  Globe,
  Phone,
  Mail,
  Star,
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  description: string;
  website: string;
  logo?: string;
  industry: string;
  location: string;
  company_size: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  created_by: null;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/placements/companies/`
      );
      const data = await response.json();

      // The API returns {companies: [...], count: ...}
      const companiesData = data.companies || [];
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Set empty array on error
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Add safety check to ensure companies is always an array
  const companiesArray = Array.isArray(companies) ? companies : [];

  const filteredCompanies = companiesArray.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "all" || company.industry === selectedIndustry;

    return matchesSearch && matchesIndustry && company.is_active;
  });

  const industries = [
    ...new Set(companiesArray.map((company) => company.industry)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Company Profiles
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Explore companies that recruit from our campus
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Building className="w-8 h-8" />
              <span className="text-lg font-medium">Industry Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search companies by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="lg:w-64">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {company.industry}
                      </p>
                    </div>
                  </div>
                  {company.is_verified && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.location}
                  </div>

                  {company.company_size && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {company.company_size}
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {(company.contact_person ||
                  company.contact_email ||
                  company.contact_phone) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-1">
                      {company.contact_person && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Contact:</span>
                          {company.contact_person}
                        </div>
                      )}
                      {company.contact_email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <a
                            href={`mailto:${company.contact_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {company.contact_email}
                          </a>
                        </div>
                      )}
                      {company.contact_phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <a
                            href={`tel:${company.contact_phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {company.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
