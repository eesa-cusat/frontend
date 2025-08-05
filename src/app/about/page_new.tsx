"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Target,
  Heart,
  BookOpen,
  Calendar,
  Briefcase,
  Code,
  Mail,
  Linkedin,
  Github,
  Trophy,
  GraduationCap,
  TrendingUp,
  Star,
  Eye,
  ChevronRight,
  MapPin,
  Phone,
  Globe,
  Award,
  Lightbulb,
  Zap,
  Shield,
  Rocket,
  Building,
} from "lucide-react";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image?: string;
  email?: string;
  linkedin_url?: string;
  github_url?: string;
  team_type: "eesa" | "tech";
  is_active: boolean;
  order: number;
}

interface AlumniStats {
  total_alumni: number;
  employed_count: number;
  higher_studies_count: number;
  entrepreneurship_count: number;
}

interface FeaturedProject {
  id: number;
  title: string;
  description: string;
  category: string;
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
}

interface PlacementRecord {
  id: number;
  student_name: string;
  company_name: string;
  package_amount?: number;
  placement_year: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  event_type: string;
}

export default function AboutPage() {
  const [eesaTeam, setEesaTeam] = useState<TeamMember[]>([]);
  const [techTeam, setTechTeam] = useState<TeamMember[]>([]);
  const [alumniStats, setAlumniStats] = useState<AlumniStats | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [recentPlacements, setRecentPlacements] = useState<PlacementRecord[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        teamResponse,
        alumniResponse,
        projectsResponse,
        placementsResponse,
        eventsResponse
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/accounts/team/`),
        fetch(`${API_BASE_URL}/alumni/stats/`),
        fetch(`${API_BASE_URL}/projects/?is_featured=true`),
        fetch(`${API_BASE_URL}/placements/placed-students/`),
        fetch(`${API_BASE_URL}/api/events/?upcoming=true`)
      ]);

      // Process team data
      if (teamResponse.status === 'fulfilled' && teamResponse.value.ok) {
        const teamData = await teamResponse.value.json();
        const allMembers = teamData.results || teamData || [];
        
        setEesaTeam(
          allMembers
            .filter((member: TeamMember) => member.team_type === "eesa" && member.is_active)
            .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
        );
        setTechTeam(
          allMembers
            .filter((member: TeamMember) => member.team_type === "tech" && member.is_active)
            .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
        );
      }

      // Process alumni stats
      if (alumniResponse.status === 'fulfilled' && alumniResponse.value.ok) {
        const stats = await alumniResponse.value.json();
        setAlumniStats(stats);
      }

      // Process featured projects
      if (projectsResponse.status === 'fulfilled' && projectsResponse.value.ok) {
        const projectsData = await projectsResponse.value.json();
        const projects = projectsData.results || projectsData || [];
        setFeaturedProjects(projects.slice(0, 3)); // Show top 3
      }

      // Process placements
      if (placementsResponse.status === 'fulfilled' && placementsResponse.value.ok) {
        const placementsData = await placementsResponse.value.json();
        const placements = placementsData.results || placementsData || [];
        setRecentPlacements(placements.slice(0, 4)); // Show recent 4
      }

      // Process events
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
        const eventsData = await eventsResponse.value.json();
        const events = eventsData.results || eventsData || [];
        setUpcomingEvents(events.slice(0, 3)); // Show next 3
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Profile Image */}
      <div className="relative h-64 bg-gradient-to-br from-[#191A23] to-[#2A2B35] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(185, 255, 102, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(185, 255, 102, 0.2) 0%, transparent 50%)
            `
          }}></div>
        </div>
        
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div className="w-20 h-20 bg-[#B9FF66] rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-[#191A23]" />
            </div>
          </div>
        )}
        
        {/* Social Links Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#191A23] hover:bg-[#B9FF66] transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#191A23] hover:bg-[#B9FF66] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.github_url && (
            <a
              href={member.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#191A23] hover:bg-[#B9FF66] transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8 space-y-4">
        <h3 className="text-2xl font-bold text-[#191A23] mb-2 group-hover:text-[#2A2B35] transition-colors">
          {member.name}
        </h3>
        <div className="inline-flex items-center bg-[#B9FF66]/10 text-[#191A23] px-3 py-1 rounded-full text-sm font-semibold">
          {member.position}
        </div>
        <p className="text-gray-600 leading-relaxed line-clamp-3">
          {member.bio}
        </p>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#B9FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-b-3xl"></div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    color: string;
  }) => (
    <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-3xl font-bold text-[#191A23] mb-2">{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg rounded-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-[#191A23] border-t-[#B9FF66] rounded-full animate-spin"></div>
            <span className="text-[#191A23] font-medium text-lg">
              Loading about us...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#191A23] via-[#2A2B35] to-[#191A23]"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(185, 255, 102, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(185, 255, 102, 0.2) 0%, transparent 50%),
                linear-gradient(45deg, rgba(185, 255, 102, 0.1) 0%, transparent 100%)
              `
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl mx-4 rounded-3xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
              <div className="text-center text-white">
                <div className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-6 py-3 rounded-full font-bold text-sm mb-6 shadow-lg">
                  <Building className="w-4 h-4 mr-2" />
                  ABOUT EESA
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight">
                  Electrical & Electronics <br />
                  <span className="text-[#B9FF66]">Engineering Alliance</span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto opacity-90 leading-relaxed">
                  Empowering the next generation of electrical and electronics engineers through 
                  <span className="text-[#B9FF66] font-semibold"> collaboration</span>, 
                  <span className="text-[#B9FF66] font-semibold"> innovation</span>, and 
                  <span className="text-[#B9FF66] font-semibold"> community</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {alumniStats && (
        <section className="py-16 bg-gradient-to-b from-[#F3F3F3] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
                Our <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Impact</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Numbers that speak to our community's success and growth
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                icon={GraduationCap} 
                label="Total Alumni" 
                value={alumniStats.total_alumni.toLocaleString()} 
                color="bg-[#191A23]"
              />
              <StatCard 
                icon={Briefcase} 
                label="Employed" 
                value={alumniStats.employed_count.toLocaleString()} 
                color="bg-green-500"
              />
              <StatCard 
                icon={BookOpen} 
                label="Higher Studies" 
                value={alumniStats.higher_studies_count.toLocaleString()} 
                color="bg-blue-500"
              />
              <StatCard 
                icon={Rocket} 
                label="Entrepreneurs" 
                value={alumniStats.entrepreneurship_count.toLocaleString()} 
                color="bg-purple-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-[#F3F3F3] to-white border border-gray-100 shadow-xl rounded-3xl p-8 lg:p-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B9FF66] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Target className="w-6 h-6 text-[#191A23]" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#191A23]">Our Mission</h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
                To create a vibrant community of electrical and electronics engineering students, 
                faculty, and alumni that fosters learning, innovation, and professional growth 
                through shared knowledge, collaborative projects, and meaningful connections.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center bg-[#B9FF66]/10 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium">
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Innovation
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/10 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium">
                  <Users className="w-3 h-3 mr-2" />
                  Community
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/10 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingUp className="w-3 h-3 mr-2" />
                  Growth
                </span>
              </div>
            </div>

            {/* Vision */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-[#191A23] to-[#2A2B35] border border-[#191A23]/20 shadow-xl rounded-3xl p-8 lg:p-12 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#B9FF66] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Heart className="w-6 h-6 text-[#191A23]" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold">Our Vision</h2>
              </div>
              <p className="text-lg lg:text-xl opacity-90 leading-relaxed mb-6">
                To be the leading platform that connects and empowers electrical engineering 
                professionals worldwide, driving innovation and excellence in the field through 
                collaborative learning and knowledge sharing.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center bg-[#B9FF66]/20 text-[#B9FF66] px-3 py-1 rounded-full text-sm font-medium">
                  <Globe className="w-3 h-3 mr-2" />
                  Global Impact
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/20 text-[#B9FF66] px-3 py-1 rounded-full text-sm font-medium">
                  <Award className="w-3 h-3 mr-2" />
                  Excellence
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/20 text-[#B9FF66] px-3 py-1 rounded-full text-sm font-medium">
                  <Zap className="w-3 h-3 mr-2" />
                  Innovation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F3F3F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-6">
              What We <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive resources and opportunities designed to enhance your academic and professional journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Digital Library",
                description: "Comprehensive collection of study materials, notes, and academic resources.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Calendar,
                title: "Events & Workshops",
                description: "Regular technical workshops, seminars, and networking events.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Briefcase,
                title: "Career Support",
                description: "Job placement assistance, internship opportunities, and career guidance.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Code,
                title: "Project Showcase",
                description: "Platform to showcase innovative projects and collaborate with peers.",
                color: "from-orange-500 to-orange-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#191A23] mb-4 group-hover:text-[#2A2B35] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
                Featured <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Projects</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Innovative projects by our talented community members
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div key={project.id} className="group backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center bg-[#B9FF66]/10 text-[#191A23] px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="w-3 h-3 mr-2" />
                      {project.category}
                    </span>
                    <div className="flex gap-2">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#191A23] transition-colors">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#191A23] transition-colors">
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#191A23] mb-3 group-hover:text-[#2A2B35] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Sections */}
      <section className="py-20 bg-gradient-to-b from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* EESA Team */}
          {eesaTeam.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
                  EESA <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Team</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Meet the dedicated leaders driving our organization forward
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {eesaTeam.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Tech Team */}
          {techTeam.length > 0 && (
            <div>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
                  Tech <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Team</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The technical minds behind our digital infrastructure
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {techTeam.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Recent Placements */}
      {recentPlacements.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
                Recent <span className="text-[#B9FF66] bg-[#191A23] px-2 py-1 rounded-xl">Placements</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Celebrating our alumni's career achievements
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentPlacements.map((placement) => (
                <div key={placement.id} className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-[#B9FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Trophy className="w-6 h-6 text-[#191A23]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#191A23] mb-2">
                    {placement.student_name}
                  </h3>
                  <p className="text-gray-600 font-medium mb-2">
                    {placement.company_name}
                  </p>
                  <div className="text-sm text-gray-500">
                    Class of {placement.placement_year}
                  </div>
                  {placement.package_amount && (
                    <div className="text-sm text-[#B9FF66] font-semibold mt-2">
                      ₹{placement.package_amount.toLocaleString()} LPA
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-[#191A23] to-[#2A2B35] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl p-8 lg:p-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Let's <span className="text-[#B9FF66]">Connect</span>
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                Join our community and be part of the future of electrical engineering
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="mailto:contact@eesa.org"
                  className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#A8EE55] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Get in Touch
                </a>
                
                <a
                  href="/events"
                  className="inline-flex items-center border border-[#B9FF66] text-[#B9FF66] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#B9FF66] hover:text-[#191A23] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  View Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
