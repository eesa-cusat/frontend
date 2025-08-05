"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Globe,
  Award,
  Lightbulb,
  Zap,
  Rocket,
  Building,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Network,
  Brain,
  Shield,
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

export default function AboutPage() {
  const [eesaTeam, setEesaTeam] = useState<TeamMember[]>([]);
  const [techTeam, setTechTeam] = useState<TeamMember[]>([]);
  const [alumniStats, setAlumniStats] = useState<AlumniStats | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [recentPlacements, setRecentPlacements] = useState<PlacementRecord[]>([]);
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
        placementsResponse
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/accounts/team/`),
        fetch(`${API_BASE_URL}/alumni/stats/`),
        fetch(`${API_BASE_URL}/projects/?is_featured=true`),
        fetch(`${API_BASE_URL}/placements/placed-students/`)
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

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="group relative bg-white rounded-3xl border-2 border-[#B9FF66]/20 shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-3 hover:border-[#B9FF66]">
      {/* Profile Image */}
      <div className="relative h-64 bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5 overflow-hidden">
        {/* Decorative SVG Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="#B9FF66" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 relative z-10"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div className="w-24 h-24 bg-[#B9FF66] rounded-3xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
              <Users className="w-12 h-12 text-[#191A23]" />
            </div>
          </div>
        )}
        
        {/* Social Links Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center text-[#191A23] hover:bg-white hover:text-[#B9FF66] transition-all duration-300 shadow-lg transform hover:scale-110"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center text-[#191A23] hover:bg-white hover:text-[#B9FF66] transition-all duration-300 shadow-lg transform hover:scale-110"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {member.github_url && (
            <a
              href={member.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center text-[#191A23] hover:bg-white hover:text-[#B9FF66] transition-all duration-300 shadow-lg transform hover:scale-110"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8 space-y-4">
        <h3 className="text-2xl font-bold text-[#191A23] mb-3 group-hover:text-[#B9FF66] transition-colors">
          {member.name}
        </h3>
        <div className="inline-flex items-center bg-[#B9FF66]/20 text-[#191A23] px-4 py-2 rounded-full text-sm font-bold border border-[#B9FF66]/30">
          <Sparkles className="w-3 h-3 mr-2" />
          {member.position}
        </div>
        <p className="text-gray-600 leading-relaxed line-clamp-3">
          {member.bio}
        </p>
        
        {/* Hover Effect */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#B9FF66]/10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color, bgColor }: { 
    icon: React.ComponentType<any>; 
    label: string; 
    value: string | number; 
    color: string;
    bgColor: string;
  }) => (
    <div className={`${bgColor} border-2 border-white/50 shadow-lg rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}>
      <div className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="text-4xl font-bold text-[#191A23] mb-3">{value}</div>
      <div className="text-gray-600 font-semibold text-lg">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="bg-white border-2 border-[#B9FF66]/30 shadow-xl rounded-3xl p-12">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 border-4 border-[#B9FF66] border-t-[#191A23] rounded-full animate-spin"></div>
            <span className="text-[#191A23] font-bold text-2xl">
              Loading about us...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Hero Section - Bright and Clean */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-white via-[#F3F3F3] to-[#B9FF66]/10">
        {/* Decorative SVG Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="circle1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#B9FF66" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#B9FF66" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="circle2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#191A23" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="#191A23" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="200" cy="150" r="100" fill="url(#circle1)"/>
            <circle cx="1000" cy="200" r="150" fill="url(#circle2)"/>
            <circle cx="600" cy="400" r="80" fill="url(#circle1)"/>
            <circle cx="100" cy="600" r="120" fill="url(#circle2)"/>
            <circle cx="1100" cy="600" r="90" fill="url(#circle1)"/>
          </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-[#B9FF66] rounded-2xl rotate-45 opacity-30 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-[#191A23] rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-[#B9FF66] rounded-full opacity-40 animate-ping"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-8 py-4 rounded-full font-bold text-lg mb-8 shadow-xl hover:shadow-2xl transition-shadow">
              <Building className="w-6 h-6 mr-3" />
              ABOUT EESA
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight text-[#191A23]">
              Electrical & Electronics <br />
              <span className="text-[#B9FF66] relative">
                Engineering Alliance
                <svg className="absolute -bottom-4 left-0 w-full h-6" viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 15 Q 100 5 200 15 T 400 15" stroke="#B9FF66" strokeWidth="4" fill="none" opacity="0.7"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl lg:text-4xl max-w-5xl mx-auto text-gray-700 leading-relaxed mb-12">
              Empowering the next generation of electrical and electronics engineers through 
              <span className="text-[#B9FF66] font-bold bg-[#191A23] px-2 py-1 rounded-lg mx-2"> collaboration</span>, 
              <span className="text-[#B9FF66] font-bold bg-[#191A23] px-2 py-1 rounded-lg mx-2"> innovation</span>, and 
              <span className="text-[#B9FF66] font-bold bg-[#191A23] px-2 py-1 rounded-lg mx-2"> community</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/projects"
                className="inline-flex items-center bg-[#191A23] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-[#2A2B35] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Explore Projects
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
              
              <Link
                href="/events"
                className="inline-flex items-center border-3 border-[#B9FF66] text-[#191A23] px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#B9FF66] hover:text-[#191A23] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
              >
                <Calendar className="w-6 h-6 mr-3" />
                Join Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {alumniStats && (
        <section className="py-20 bg-gradient-to-br from-[#B9FF66]/5 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-6">
                Our <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Impact</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                Numbers that speak to our community&apos;s success and growth
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                icon={GraduationCap} 
                label="Total Alumni" 
                value={alumniStats.total_alumni.toLocaleString()} 
                color="bg-[#191A23]"
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard 
                icon={Briefcase} 
                label="Employed" 
                value={alumniStats.employed_count.toLocaleString()} 
                color="bg-green-500"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard 
                icon={BookOpen} 
                label="Higher Studies" 
                value={alumniStats.higher_studies_count.toLocaleString()} 
                color="bg-blue-500"
                bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <StatCard 
                icon={Rocket} 
                label="Entrepreneurs" 
                value={alumniStats.entrepreneurship_count.toLocaleString()} 
                color="bg-purple-500"
                bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
              />
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Mission */}
            <div className="bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5 border-2 border-[#B9FF66]/30 shadow-xl rounded-3xl p-10 lg:p-12 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B9FF66]/20 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#191A23]/10 rounded-full transform -translate-x-12 translate-y-12"></div>
              
              <div className="flex items-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-[#B9FF66] rounded-3xl flex items-center justify-center mr-6 shadow-lg">
                  <Target className="w-8 h-8 text-[#191A23]" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#191A23]">Our Mission</h2>
              </div>
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 relative z-10">
                To create a vibrant community of electrical and electronics engineering students, 
                faculty, and alumni that fosters learning, innovation, and professional growth 
                through shared knowledge, collaborative projects, and meaningful connections.
              </p>
              <div className="flex flex-wrap gap-4 relative z-10">
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-4 py-2 rounded-full text-lg font-bold">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Innovation
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-4 py-2 rounded-full text-lg font-bold">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-4 py-2 rounded-full text-lg font-bold">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Growth
                </span>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-[#191A23] to-[#2A2B35] border-2 border-[#191A23] shadow-xl rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-28 h-28 bg-[#B9FF66]/20 rounded-full transform -translate-x-14 -translate-y-14"></div>
              <div className="absolute bottom-0 right-0 w-36 h-36 bg-[#B9FF66]/10 rounded-full transform translate-x-18 translate-y-18"></div>
              
              <div className="flex items-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-[#B9FF66] rounded-3xl flex items-center justify-center mr-6 shadow-lg">
                  <Heart className="w-8 h-8 text-[#191A23]" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold">Our Vision</h2>
              </div>
              <p className="text-xl lg:text-2xl opacity-90 leading-relaxed mb-8 relative z-10">
                To be the leading platform that connects and empowers electrical engineering 
                professionals worldwide, driving innovation and excellence in the field through 
                collaborative learning and knowledge sharing.
              </p>
              <div className="flex flex-wrap gap-4 relative z-10">
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#B9FF66] px-4 py-2 rounded-full text-lg font-bold">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Impact
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#B9FF66] px-4 py-2 rounded-full text-lg font-bold">
                  <Award className="w-4 h-4 mr-2" />
                  Excellence
                </span>
                <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#B9FF66] px-4 py-2 rounded-full text-lg font-bold">
                  <Zap className="w-4 h-4 mr-2" />
                  Innovation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 bg-gradient-to-br from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-8">
              What We <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Offer</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive resources and opportunities designed to enhance your academic and professional journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: BookOpen,
                title: "Digital Library",
                description: "Comprehensive collection of study materials, notes, and academic resources.",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100"
              },
              {
                icon: Calendar,
                title: "Events & Workshops",
                description: "Regular technical workshops, seminars, and networking events.",
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100"
              },
              {
                icon: Briefcase,
                title: "Career Support",
                description: "Job placement assistance, internship opportunities, and career guidance.",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100"
              },
              {
                icon: Code,
                title: "Project Showcase",
                description: "Platform to showcase innovative projects and collaborate with peers.",
                color: "from-orange-500 to-orange-600",
                bgColor: "from-orange-50 to-orange-100"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${feature.bgColor} border-2 border-white shadow-lg rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4`}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#191A23] mb-6 group-hover:text-[#B9FF66] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      {featuredProjects.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-6">
                Featured <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Projects</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-8">
                Innovative projects by our talented community members
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProjects.map((project) => (
                <div key={project.id} className="group bg-gradient-to-br from-white to-gray-50 border-2 border-[#B9FF66]/30 shadow-lg rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center bg-[#B9FF66]/20 text-[#191A23] px-4 py-2 rounded-full text-lg font-bold">
                      <Star className="w-4 h-4 mr-2" />
                      {project.category}
                    </span>
                    <div className="flex gap-3">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#191A23] transition-colors">
                          <Github className="w-6 h-6" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#191A23] transition-colors">
                          <Eye className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#191A23] mb-4 group-hover:text-[#B9FF66] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Sections */}
      <section className="py-24 bg-gradient-to-br from-[#F3F3F3] to-[#B9FF66]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* EESA Team */}
          {eesaTeam.length > 0 && (
            <div>
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-6">
                  EESA <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Team</span>
                </h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                  Meet the dedicated leaders driving our organization forward
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {eesaTeam.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Tech Team */}
          {techTeam.length > 0 && (
            <div>
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-6">
                  Tech <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Team</span>
                </h2>
                <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                  The technical minds behind our digital infrastructure
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {techTeam.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback if no team data */}
          {eesaTeam.length === 0 && techTeam.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Users className="w-16 h-16 text-[#191A23]" />
              </div>
              <h3 className="text-3xl font-bold text-[#191A23] mb-4">Team Information Coming Soon</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We&apos;re working on updating our team information. Check back soon to meet our amazing team members!
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Recent Placements */}
      {recentPlacements.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-6">
                Recent <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Placements</span>
              </h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                Celebrating our alumni&apos;s career achievements
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentPlacements.map((placement) => (
                <div key={placement.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-lg rounded-3xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-[#B9FF66] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Trophy className="w-8 h-8 text-[#191A23]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#191A23] mb-3">
                    {placement.student_name}
                  </h3>
                  <p className="text-gray-600 font-semibold mb-3 text-lg">
                    {placement.company_name}
                  </p>
                  <div className="text-sm text-gray-500 mb-2">
                    Class of {placement.placement_year}
                  </div>
                  {placement.package_amount && (
                    <div className="text-lg text-[#B9FF66] font-bold bg-[#191A23] px-3 py-1 rounded-full">
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
      <section className="py-24 bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-[#B9FF66]/30 shadow-xl rounded-3xl p-12 lg:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#191A23] mb-8">
              Let&apos;s <span className="text-[#B9FF66] bg-[#191A23] px-3 py-2 rounded-2xl">Connect</span>
            </h2>
            <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              Join our community and be part of the future of electrical engineering
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <a
                href="mailto:contact@eesa.org"
                className="inline-flex items-center bg-[#191A23] text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-xl hover:bg-[#2A2B35] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <Mail className="w-6 h-6 mr-4" />
                Get in Touch
              </a>
              
              <Link
                href="/events"
                className="inline-flex items-center border-3 border-[#B9FF66] text-[#191A23] px-12 py-6 rounded-2xl font-bold text-xl hover:bg-[#B9FF66] hover:text-[#191A23] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
              >
                <Calendar className="w-6 h-6 mr-4" />
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
