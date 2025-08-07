"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Career {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_range: string;
  is_active: boolean;
  application_deadline: string;
  created_at: string;
  job_type: string;
  experience_level: string;
  requirements: string[];
  skills: string[];
  application_url: string;
}

export default function CareersPanel() {
  const { hasGroupAccess } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newCareer, setNewCareer] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salary_range: "",
    application_deadline: "",
    job_type: "full_time",
    experience_level: "entry",
    requirements: "",
    skills: "",
    application_url: "",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  // Load careers data
  const loadCareers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/careers/opportunities/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCareers(data.opportunities || []);
        console.log('Loaded careers:', data.opportunities?.length || 0);
      } else {
        console.error('Failed to fetch careers:', response.status);
        toast.error('Failed to load careers');
      }
    } catch (error) {
      console.error('Error loading careers:', error);
      toast.error('Failed to load careers');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/careers/opportunities/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCareers(data.opportunities || []);
          console.log('Loaded careers:', data.opportunities?.length || 0);
        } else {
          console.error('Failed to fetch careers:', response.status);
          toast.error('Failed to load careers');
        }
      } catch (error) {
        console.error('Error loading careers:', error);
        toast.error('Failed to load careers');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [API_BASE_URL]);

  // Check access - temporarily allow all for testing
  if (false) { // Temporarily disabled: !hasGroupAccess("careers_team")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the careers panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/eesa">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreate = async () => {
    console.log('handleCreate function called with data:', newCareer);
    
    if (!newCareer.title.trim() || !newCareer.company.trim()) {
      toast.error("Please enter job title and company");
      return;
    }

    try {
      setIsCreating(true);
      
      // Get CSRF token first
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      
      // Prepare data - API expects string format, not arrays
      const careerData = {
        ...newCareer,
        requirements: newCareer.requirements.trim(),
        skills: newCareer.skills.trim(),
        application_deadline: newCareer.application_deadline ? new Date(newCareer.application_deadline).toISOString() : null,
      };
      
      console.log('Sending career data:', careerData);
      
      // API call to create career - use the create endpoint
      const response = await fetch(`${API_BASE_URL}/careers/opportunities/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(careerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      toast.success("Career opportunity created successfully");
      setNewCareer({
        title: "",
        company: "",
        description: "",
        location: "",
        salary_range: "",
        application_deadline: "",
        job_type: "full_time",
        experience_level: "entry",
        requirements: "",
        skills: "",
        application_url: "",
      });
      setIsCreating(false);
      loadCareers(); // Refresh careers list
    } catch (error) {
      console.error('Error creating career:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create career opportunity");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/eesa">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Careers Panel</h1>
                <p className="text-sm text-gray-600">
                  Manage job opportunities and career resources
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Career
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Career Opportunity</CardTitle>
              <CardDescription>Create a new job listing or career opportunity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={newCareer.title}
                    onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })}
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newCareer.company}
                    onChange={(e) => setNewCareer({ ...newCareer, company: e.target.value })}
                    placeholder="e.g., TechCorp Inc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newCareer.location}
                    onChange={(e) => setNewCareer({ ...newCareer, location: e.target.value })}
                    placeholder="Job location"
                  />
                </div>
                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <select
                    id="job_type"
                    className="w-full p-2 border rounded-md"
                    value={newCareer.job_type}
                    onChange={(e) => setNewCareer({ ...newCareer, job_type: e.target.value })}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <select
                    id="experience_level"
                    className="w-full p-2 border rounded-md"
                    value={newCareer.experience_level}
                    onChange={(e) => setNewCareer({ ...newCareer, experience_level: e.target.value })}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Job Description</Label>
                <textarea
                  id="description"
                  value={newCareer.description}
                  onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
                  placeholder="Enter job description, requirements, and benefits"
                  className="w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <textarea
                    id="requirements"
                    value={newCareer.requirements}
                    onChange={(e) => setNewCareer({ ...newCareer, requirements: e.target.value })}
                    placeholder="Bachelor's degree in Computer Science, 2+ years experience"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <textarea
                    id="skills"
                    value={newCareer.skills}
                    onChange={(e) => setNewCareer({ ...newCareer, skills: e.target.value })}
                    placeholder="React, JavaScript, Node.js, MongoDB"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <Input
                    id="salary_range"
                    value={newCareer.salary_range}
                    onChange={(e) => setNewCareer({ ...newCareer, salary_range: e.target.value })}
                    placeholder="e.g., $60,000 - $80,000"
                  />
                </div>
                <div>
                  <Label htmlFor="application_url">Application URL</Label>
                  <Input
                    id="application_url"
                    type="url"
                    value={newCareer.application_url}
                    onChange={(e) => setNewCareer({ ...newCareer, application_url: e.target.value })}
                    placeholder="https://company.com/careers"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={newCareer.application_deadline}
                  onChange={(e) => setNewCareer({ ...newCareer, application_deadline: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => {
                  console.log('Create Career button clicked!');
                  handleCreate();
                }}>Create Opportunity</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Careers List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Career Opportunities</h2>
            <div className="text-sm text-gray-600">
              {careers.length} opportunities loaded
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading opportunities...</div>
            </div>
          ) : careers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No career opportunities posted yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  Add Your First Opportunity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {careers.map((career) => (
                <Card key={career.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{career.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            career.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {career.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{career.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {career.company}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {career.location}
                          </div>
                          {career.salary_range && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {career.salary_range}
                            </div>
                          )}
                        </div>
                        
                        {career.requirements && career.requirements.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 font-medium">Requirements:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {career.requirements.map((req, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                >
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {career.skills && career.skills.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 font-medium">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {career.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {career.application_deadline && (
                          <p className="text-sm text-red-600 mt-2">
                            Deadline: {new Date(career.application_deadline).toLocaleDateString()}
                          </p>
                        )}
                        
                        {career.application_url && (
                          <a 
                            href={career.application_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                          >
                            Apply Now →
                          </a>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
