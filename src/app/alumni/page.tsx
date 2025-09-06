'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { alumniService, Alumni, AlumniBatch, BatchStatistics } from '@/services/alumniService';
import { 
  Search, 
  Users, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Linkedin,
  Github,
  Award,
  TrendingUp,
  Building,
  Star,
  Grid,
  List,
  UserCheck,
  Loader2
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type EmploymentFilter = 'all' | 'employed' | 'unemployed' | 'self_employed' | 'entrepreneur' | 'higher_studies';

const AlumniPage = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [statistics, setStatistics] = useState<BatchStatistics[]>([]);
  const [batches, setBatches] = useState<AlumniBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMentorsOnly, setShowMentorsOnly] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alumniData, batchesData] = await Promise.all([
        alumniService.getAlumni(),
        alumniService.getBatches()
      ]);
      
      setAlumni(alumniData);
      setBatches(batchesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique batch names for filter
  const availableBatches = [...new Set(alumni.map(member => member.batch_name))].sort();

  // Filter alumni based on search and filters
  const filteredAlumni = alumni.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch = selectedBatch === 'all' || member.batch_name === selectedBatch;
    
    const matchesEmployment = 
      employmentFilter === 'all' || 
      member.employment_status === employmentFilter;
    
    const matchesMentor = !showMentorsOnly || member.willing_to_mentor;
    
    return matchesSearch && matchesBatch && matchesEmployment && matchesMentor;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status) {
      case 'employed': return 'bg-green-100 text-green-800';
      case 'unemployed': return 'bg-red-100 text-red-800';
      case 'self_employed': return 'bg-blue-100 text-blue-800';
      case 'entrepreneur': return 'bg-purple-100 text-purple-800';
      case 'higher_studies': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentStatusIcon = (status: string) => {
    switch (status) {
      case 'employed': return <Briefcase size={14} />;
      case 'unemployed': return <Search size={14} />;
      case 'self_employed': return <Briefcase size={14} />;
      case 'entrepreneur': return <TrendingUp size={14} />;
      case 'higher_studies': return <GraduationCap size={14} />;
      default: return <Users size={14} />;
    }
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {batches.map((batch) => (
        <Card key={batch.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{batch.batch_name}</span>
              <GraduationCap className="text-blue-600" size={20} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Alumni</span>
                <span className="font-semibold">{batch.total_alumni}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="font-semibold text-green-600">{batch.verified_alumni}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employment Rate</span>
                <span className="font-semibold text-blue-600">{batch.employment_stats.employment_rate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Graduation Year</span>
                <span className="font-semibold text-purple-600">{batch.graduation_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Year Range</span>
                <span className="font-semibold text-orange-600">{batch.batch_year_range}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading alumni directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading alumni data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Alumni Directory</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with EESA graduates who are making their mark in the industry. 
              Explore our alumni network, find mentors, and discover career opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Batch Statistics</h2>
          <StatisticsCards />
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pt-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search alumni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Batch Filter */}
              <div className="flex-1">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Batches</option>
                  {availableBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Employment Filter */}
              <div className="flex-1">
                <select
                  value={employmentFilter}
                  onChange={(e) => setEmploymentFilter(e.target.value as EmploymentFilter)}
                  className="h-12 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Employment Status</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="higher_studies">Higher Studies</option>
                </select>
              </div>

              {/* Mentor Filter */}
              <div className="flex items-center justify-center gap-3 h-12 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  id="mentors-only"
                  checked={showMentorsOnly}
                  onChange={(e) => setShowMentorsOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="mentors-only" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                  Mentors Only
                </label>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredAlumni.length} of {alumni.length} alumni
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alumni Grid/List */}
        {filteredAlumni.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredAlumni.map((member) => (
              <Card key={member.id} className={`hover:shadow-lg transition-shadow duration-200 ${viewMode === 'grid' ? 'h-full min-h-[320px]' : ''}`}>
                {viewMode === 'grid' ? (
                  // Grid Card Layout
                  <div className="h-full flex flex-col">
                    <CardHeader className="text-center pb-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold leading-tight mb-2">
                        {member.full_name}
                      </CardTitle>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <GraduationCap size={12} />
                        <span className="font-medium">{member.batch_name}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 flex-1">
                        {/* Employment Status */}
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEmploymentStatusColor(member.employment_status)}`}>
                            {getEmploymentStatusIcon(member.employment_status)}
                            <span className="truncate max-w-24">
                              {member.employment_status.charAt(0).toUpperCase() + member.employment_status.slice(1).replace('_', ' ')}
                            </span>
                          </span>
                        </div>

                        {/* Current Position & Company */}
                        {member.job_title && (
                          <div className="text-center space-y-1">
                            <div className="font-medium text-gray-900 text-sm leading-tight">{member.job_title}</div>
                            {member.current_company && (
                              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Building size={10} />
                                <span className="truncate">{member.current_company}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Location */}
                        {member.current_location && (
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                            <MapPin size={12} />
                            <span className="truncate">{member.current_location}</span>
                          </div>
                        )}

                        {/* Years since graduation */}
                        <div className="text-center text-xs text-gray-500">
                          {member.years_since_graduation} years since graduation
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {/* Mentorship */}
                        {member.willing_to_mentor && (
                          <div className="flex justify-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                              <UserCheck size={10} />
                              <span className="text-xs">Mentor</span>
                            </span>
                          </div>
                        )}

                        {/* Contact Actions */}
                        <div className="flex justify-center gap-1">
                          {member.email && (
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                              <a href={`mailto:${member.email}`} title="Email">
                                <Mail size={12} />
                              </a>
                            </Button>
                          )}
                          {member.linkedin_profile && (
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                              <a href={member.linkedin_profile} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <Linkedin size={12} />
                              </a>
                            </Button>
                          )}
                          {member.phone_number && (
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild>
                              <a href={`tel:${member.phone_number}`} title="Phone">
                                <Phone size={12} />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                ) : (
                  // List Layout
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {member.full_name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <GraduationCap size={12} />
                                <span className="font-medium">{member.batch_name}</span>
                              </span>
                              {member.current_location && (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                  <MapPin size={12} />
                                  <span className="truncate max-w-32">{member.current_location}</span>
                                </span>
                              )}
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {member.years_since_graduation} years since graduation
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEmploymentStatusColor(member.employment_status)}`}>
                              {getEmploymentStatusIcon(member.employment_status)}
                              <span className="hidden sm:inline">
                                {member.employment_status.charAt(0).toUpperCase() + member.employment_status.slice(1).replace('_', ' ')}
                              </span>
                            </span>
                            {member.willing_to_mentor && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium whitespace-nowrap">
                                <UserCheck size={10} />
                                <span className="hidden sm:inline">Mentor</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Position & Company */}
                        {member.job_title && (
                          <div className="mb-3">
                            <div className="font-medium text-gray-900 text-sm">{member.job_title}</div>
                            {member.current_company && (
                              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Building size={10} />
                                <span className="truncate">{member.current_company}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Achievements */}
                        {member.achievements && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-700">Achievements:</span> 
                              <span className="line-clamp-2 ml-1">{member.achievements}</span>
                            </div>
                          </div>
                        )}

                        {/* Contact Actions */}
                        <div className="flex gap-2 flex-wrap">
                          {member.email && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <a href={`mailto:${member.email}`}>
                                <Mail size={12} className="mr-1" />
                                <span className="hidden sm:inline">Email</span>
                              </a>
                            </Button>
                          )}
                          {member.linkedin_profile && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <a href={member.linkedin_profile} target="_blank" rel="noopener noreferrer">
                                <Linkedin size={12} className="mr-1" />
                                <span className="hidden sm:inline">LinkedIn</span>
                              </a>
                            </Button>
                          )}
                          {member.phone_number && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <a href={`tel:${member.phone_number}`}>
                                <Phone size={12} className="mr-1" />
                                <span className="hidden sm:inline">Call</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniPage;
