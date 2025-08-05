"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AutoScrollCarousel from "@/components/ui/AutoScrollCarousel";
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
  GraduationCap,
  TrendingUp,
  Globe,
  Award,
  Lightbulb,
  Zap,
  Rocket,
  Building,
  ArrowRight,
  X,
} from "lucide-react";

// Interfaces for data from the API
interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image?: string | null;
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
  self_employed_count: number; // This represents self-employed alumni (different from entrepreneurs)
  unemployment_rate: number;
  top_companies: Array<{
    current_company: string;
    count: number;
  }>;
}

interface EntrepreneurshipStats {
  total_alumni: number;
  total_entrepreneurs: number;
  entrepreneurship_rate: number;
  recent_entrepreneurs_count: number;
  startup_sectors: Array<{
    job_title: string;
    count: number;
  }>;
  entrepreneurship_by_year: Array<{
    year_of_passout: number;
    count: number;
  }>;
  success_stories_count: number;
}

// Reusable Team Member Card component
const TeamMemberCard = ({
  member,
  index,
  onClick,
}: {
  member: TeamMember;
  index: number;
  onClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    onClick={onClick}
    className="group bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 w-full cursor-pointer"
  >
    <div className="relative h-48 bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5 overflow-hidden">
      {member.image ? (
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="320px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 bg-[#B9FF66] rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-[#191A23]" />
          </div>
        </div>
      )}
    </div>
    <div className="p-6 space-y-3">
      <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-[#B9FF66] transition-colors">
        {member.name}
      </h3>
      <div className="inline-block bg-lime-400 text-black px-3 py-1 rounded-full text-sm font-medium">
        {member.position}
      </div>
      <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm">
        {member.bio}
      </p>
      <div className="flex gap-2 pt-2">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#B9FF66] hover:text-black transition-all duration-300"
            title={`Email ${member.name}`}
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#B9FF66] hover:text-black transition-all duration-300"
            title={`${member.name} on LinkedIn`}
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {member.github_url && (
          <a
            href={member.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#B9FF66] hover:text-black transition-all duration-300"
            title={`${member.name} on GitHub`}
          >
            <Github className="w-4 h-4" />
          </a>
        )}
        {!member.email && !member.linkedin_url && !member.github_url && (
          <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-50 rounded">
            Contact details coming soon
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

// Reusable Stat Card component
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) => (
  <div
    className={`${bgColor} border-2 border-white/50 shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
  >
    <div
      className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 shadow-lg`}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
    </div>
    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#191A23] mb-1 sm:mb-2 lg:mb-3">
      {value}
    </div>
    <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 font-semibold">
      {label}
    </div>
  </div>
);

// Reusable component for team sections
const TeamSection = ({
  title,
  description,
  teamMembers,
  autoplayDelay,
  setSelectedMember,
}: {
  title: string;
  description: string;
  teamMembers: TeamMember[];
  autoplayDelay: number;
  setSelectedMember: (member: TeamMember) => void;
}) => (
  <div>
    <div className="text-center mb-10 sm:mb-12 lg:mb-16">
      <h2 className="text-3xl md:text-4xl font-medium text-black mb-4 sm:mb-6">
        {title}
      </h2>
      <p className="text-lg text-gray-600 max-w-4xl mx-auto">{description}</p>
    </div>
    <div className="px-2 sm:px-0">
      <AutoScrollCarousel
        autoplayDelay={autoplayDelay}
        spaceBetween={16}
        slidesPerView={{
          mobile: 1.1,
          tablet: 1.8,
          desktop: 3,
          large: 3.5,
        }}
      >
        {teamMembers.map((member, index) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            index={index}
            onClick={() => setSelectedMember(member)}
          />
        ))}
      </AutoScrollCarousel>
    </div>
  </div>
);

export default function AboutPage() {
  const [eesaTeam, setEesaTeam] = useState<TeamMember[]>([]);
  const [techTeam, setTechTeam] = useState<TeamMember[]>([]);
  const [alumniStats, setAlumniStats] = useState<AlumniStats | null>(null);
  const [entrepreneurshipStats, setEntrepreneurshipStats] = useState<EntrepreneurshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Set the API base URL from the environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Consolidated API call for team members, alumni stats, and entrepreneurship stats
        const [teamResponse, statsResponse, entrepreneurshipResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/accounts/team-members/`),
          fetch(`${API_BASE_URL}/alumni/alumni/stats/`),
          fetch(`${API_BASE_URL}/alumni/entrepreneurship-stats/`),
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          const allMembers = teamData.results || [];
          const eesaTeamFiltered = allMembers.filter(
            (member: { team_type: string }) => member.team_type === "eesa"
          );
          const techTeamFiltered = allMembers.filter(
            (member: { team_type: string }) => member.team_type === "tech"
          );
          setEesaTeam(eesaTeamFiltered);
          setTechTeam(techTeamFiltered);
        } else {
          throw new Error("Failed to fetch team data.");
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAlumniStats(statsData);
        } else {
          throw new Error("Failed to fetch alumni statistics.");
        }

        if (entrepreneurshipResponse.ok) {
          const entrepreneurshipData = await entrepreneurshipResponse.json();
          setEntrepreneurshipStats(entrepreneurshipData);
        } else {
          console.warn("Failed to fetch entrepreneurship statistics.");
          setEntrepreneurshipStats(null);
        }
      } catch (e: unknown) {
        console.error("Error fetching about page data:", e);
        setError(
          "Failed to load content. Please check your network or try again later."
        );
        // Ensure state is cleared on error
        setEesaTeam([]);
        setTechTeam([]);
        setAlumniStats(null);
        setEntrepreneurshipStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#191A23] border-t-[#B9FF66] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#191A23] font-medium">Loading about us...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-8 text-center">
        <div className="bg-white border-2 border-red-500/30 shadow-xl rounded-3xl p-12">
          <span className="text-red-500 font-bold text-2xl">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Mission & Vision - Glass Design */}
      <section className="relative overflow-hidden min-h-screen flex items-center py-12 sm:py-16 lg:py-24 bg-[#F3F3F3]">
        <div className="relative z-10 w-full">
          <div className="backdrop-blur-xl bg-white/50 border border-white/80 shadow-xl rounded-3xl mx-auto max-w-6xl overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
              <div className="text-center text-[#191A23] mb-12 sm:mb-16 lg:mb-20">
                <div className="inline-flex items-center bg-[#B9FF66] text-[#191A23] px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base mb-6 sm:mb-8 shadow-lg">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  ABOUT EESA
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-black leading-tight mb-4 sm:mb-6">
                  Electrical & Electronics <br className="hidden sm:block" />
                  Engineering Alliance
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-black max-w-4xl mx-auto opacity-90 leading-relaxed">
                  Empowering the next generation of electrical and electronics
                  engineers through collaboration, innovation, and community.
                </p>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
                <div className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#B9FF66]/20 rounded-full transform translate-x-10 -translate-y-10"></div>
                  <div className="flex items-center mb-6 sm:mb-8 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#B9FF66] rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#191A23]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-medium text-black">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8 relative z-10">
                    To create a vibrant community of electrical and electronics
                    engineering students, faculty, and alumni that fosters
                    learning, innovation, and professional growth through shared
                    knowledge, collaborative projects, and meaningful
                    connections.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <Lightbulb className="w-3 h-3 mr-1 sm:mr-2" />
                      Innovation
                    </span>
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <Users className="w-3 h-3 mr-1 sm:mr-2" />
                      Community
                    </span>
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <TrendingUp className="w-3 h-3 mr-1 sm:mr-2" />
                      Growth
                    </span>
                  </div>
                </div>
                <div className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B9FF66]/20 rounded-full transform -translate-x-12 translate-y-12"></div>
                  <div className="flex items-center mb-6 sm:mb-8 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#B9FF66] rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#191A23]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-medium text-black">
                      Our Vision
                    </h2>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8 relative z-10">
                    To be the leading platform that connects and empowers
                    electrical engineering professionals worldwide, driving
                    innovation and excellence in the field through collaborative
                    learning and knowledge sharing.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <Globe className="w-3 h-3 mr-1 sm:mr-2" />
                      Global Impact
                    </span>
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <Award className="w-3 h-3 mr-1 sm:mr-2" />
                      Excellence
                    </span>
                    <span className="inline-flex items-center bg-[#B9FF66]/30 text-[#191A23] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      <Zap className="w-3 h-3 mr-1 sm:mr-2" />
                      Innovation
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-12 sm:mt-16">
                <Link
                  href="/projects"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#B9FF66] text-[#191A23] px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base shadow-xl hover:bg-[#A8EE55] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Explore Projects
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
                </Link>
                <Link
                  href="/events"
                  className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-[#B9FF66] text-[#191A23] px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base hover:bg-[#B9FF66] hover:text-[#191A23] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Join Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {alumniStats && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#B9FF66]/5 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black mb-3 sm:mb-4">
                Our Impact
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                Numbers that speak to our community&apos;s success and growth
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <StatCard
                icon={GraduationCap}
                label="Total Alumni"
                value={alumniStats.total_alumni?.toLocaleString() || "N/A"}
                color="bg-[#191A23]"
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                icon={Briefcase}
                label="Employed"
                value={alumniStats.employed_count?.toLocaleString() || "N/A"}
                color="bg-green-500"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                icon={BookOpen}
                label="Higher Studies"
                value={
                  alumniStats.higher_studies_count?.toLocaleString() || "N/A"
                }
                color="bg-blue-500"
                bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <StatCard
                icon={Rocket}
                label="Entrepreneurs"
                value={
                  entrepreneurshipStats?.total_entrepreneurs?.toLocaleString() || 
                  "N/A"
                }
                color="bg-purple-500"
                bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
              />
            </div>
          </div>
        </section>
      )}

      {/* What We Offer */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#F3F3F3] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-black mb-4 sm:mb-6">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Comprehensive resources and opportunities designed to enhance your
              academic and professional journey
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                icon: BookOpen,
                title: "Digital Library",
                description:
                  "Comprehensive collection of study materials, notes, and academic resources.",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
              },
              {
                icon: Calendar,
                title: "Events & Workshops",
                description:
                  "Regular technical workshops, seminars, and networking events.",
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100",
              },
              {
                icon: Briefcase,
                title: "Career Support",
                description:
                  "Job placement assistance, internship opportunities, and career guidance.",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
              },
              {
                icon: Code,
                title: "Project Showcase",
                description:
                  "Platform to showcase innovative projects and collaborate with peers.",
                color: "from-orange-500 to-orange-600",
                bgColor: "from-orange-50 to-orange-100",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${feature.bgColor} border-2 border-white shadow-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#191A23] mb-4 sm:mb-6 group-hover:text-[#B9FF66] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#F3F3F3] to-[#B9FF66]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 lg:space-y-24">
          {eesaTeam.length > 0 && (
            <TeamSection
              title="EESA Team"
              description="Meet the dedicated leaders driving our organization forward"
              teamMembers={eesaTeam}
              autoplayDelay={3000}
              setSelectedMember={setSelectedMember}
            />
          )}
          {techTeam.length > 0 && (
            <TeamSection
              title="Tech Team"
              description="The technical minds behind our digital infrastructure"
              teamMembers={techTeam}
              autoplayDelay={3500}
              setSelectedMember={setSelectedMember}
            />
          )}
          {eesaTeam.length === 0 && techTeam.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#B9FF66]/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#191A23]" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#191A23] mb-3 sm:mb-4">
                Team Information Coming Soon
              </h3>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto">
                We&apos;re working on updating our team information. Check back
                soon to meet our amazing team members!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Team Member Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-md w-full relative shadow-2xl overflow-hidden"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setSelectedMember(null)}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative h-48 bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5">
              {selectedMember.image ? (
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#B9FF66] rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-10 h-10 text-[#191A23]" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-black">
                {selectedMember.name}
              </h3>
              <div className="inline-block bg-lime-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                {selectedMember.position}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {selectedMember.bio}
              </p>
              <div className="flex gap-3 pt-2">
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-[#B9FF66] text-gray-600 hover:text-black px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </a>
                )}
                {selectedMember.linkedin_url && (
                  <a
                    href={selectedMember.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-[#B9FF66] text-gray-600 hover:text-black px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}
                {selectedMember.github_url && (
                  <a
                    href={selectedMember.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-[#B9FF66] text-gray-600 hover:text-black px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                )}
                {!selectedMember.email && !selectedMember.linkedin_url && !selectedMember.github_url && (
                  <div className="text-sm text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <span className="block font-medium text-gray-500 mb-1">Contact Information</span>
                    Contact details will be updated soon. Please check back later or contact the team directly.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#B9FF66]/10 to-[#B9FF66]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-[#B9FF66]/30 shadow-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-black mb-6 sm:mb-8">
              Let&apos;s Connect
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto">
              Join our community and be part of the future of electrical
              engineering
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
              <a
                href="mailto:contact@eesa.org"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#191A23] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-base hover:bg-[#2A2B35] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Get in Touch
              </a>
              <Link
                href="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-[#B9FF66] text-[#191A23] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-base hover:bg-[#B9FF66] hover:text-[#191A23] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
