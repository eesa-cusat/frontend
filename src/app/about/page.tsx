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
} from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  email: string;
  linkedin_url: string;
  github_url: string;
  team_type: "eesa" | "tech";
  is_active: boolean;
  order: number;
}

export default function AboutPage() {
  const [eesaTeam, setEesaTeam] = useState<TeamMember[]>([]);
  const [techTeam, setTechTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      // Try to fetch from the API first
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/accounts/team-members/`
      );

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response format
        const allMembers = data.results || data || [];

        // Separate team members by type
        setEesaTeam(
          allMembers
            .filter(
              (member: TeamMember) =>
                member.team_type === "eesa" && member.is_active
            )
            .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
        );
        setTechTeam(
          allMembers
            .filter(
              (member: TeamMember) =>
                member.team_type === "tech" && member.is_active
            )
            .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
        );
      } else {
        // If API fails, show empty state
        setEesaTeam([]);
        setTechTeam([]);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      // On error, show empty state
      setEesaTeam([]);
      setTechTeam([]);
    } finally {
      setLoading(false);
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Users className="w-16 h-16 text-white" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {member.name}
        </h3>
        <p className="text-blue-600 font-medium mb-3">{member.position}</p>
        <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
        <div className="flex gap-3">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {member.github_url && (
            <a
              href={member.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const features = [
    {
      icon: BookOpen,
      title: "Digital Library",
      description:
        "Comprehensive collection of study materials, notes, and academic resources.",
    },
    {
      icon: Calendar,
      title: "Events & Workshops",
      description:
        "Regular technical workshops, seminars, and networking events.",
    },
    {
      icon: Briefcase,
      title: "Career Support",
      description:
        "Job placement assistance, internship opportunities, and career guidance.",
    },
    {
      icon: Code,
      title: "Project Showcase",
      description:
        "Platform to showcase innovative projects and collaborate with peers.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading about us...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About EESA</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Empowering the next generation of electrical and electronics
              engineers through collaboration, innovation, and community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                To create a vibrant community of electrical and electronics
                engineering students, teachers, and alumni that fosters
                learning, innovation, and professional growth through shared
                knowledge, collaborative projects, and meaningful connections.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Heart className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600">
                To be the leading platform that connects and empowers electrical
                engineering professionals worldwide, driving innovation and
                excellence in the field through collaborative learning and
                knowledge sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive resources and opportunities designed to enhance your
              academic and professional journey in electrical engineering.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EESA Team Section */}
      {eesaTeam.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                EESA Executive Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Meet the dedicated team leading the EESA community and driving
                our mission forward.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eesaTeam.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech Team Section */}
      {techTeam.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Technical Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The talented developers and technical experts behind the EESA
                platform.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {techTeam.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions or want to get involved? We&apos;d love to hear from
            you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@eesa.org"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </a>
            <a
              href="/events"
              className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Join Our Events
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
