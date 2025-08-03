"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Twitter, Calendar, MapPin } from "lucide-react";
import MarqueeNotifications from "@/components/ui/MarqueeNotifications";

interface FeaturedEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location?: string;
  venue?: string;
  event_type?: string;
  is_featured: boolean;
  image?: string;
  poster?: string;
}

interface FeaturedProject {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  is_featured: boolean;
  image?: string;
  github_url?: string;
  project_report?: string;
  demo_url?: string;
}

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get featured events using the main events endpoint
    const getFeaturedEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/events/?is_featured=true`
        );
        const data = await response.json();
        return data.results || data; // Handle paginated or direct response
      } catch (error) {
        console.error("Error fetching featured events:", error);
        return [];
      }
    };

    // Get featured upcoming events
    const getFeaturedUpcomingEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/events/?is_featured=true&upcoming=true`
        );
        const data = await response.json();
        return data.results || data;
      } catch (error) {
        console.error("Error fetching featured upcoming events:", error);
        return [];
      }
    };

    const fetchFeaturedData = async () => {
      try {
        // Fetch featured upcoming events (prioritize upcoming events)
        const upcomingEvents = await getFeaturedUpcomingEvents();

        // If no upcoming featured events, fall back to all featured events
        if (upcomingEvents.length === 0) {
          const allFeaturedEvents = await getFeaturedEvents();
          setFeaturedEvents(allFeaturedEvents);
        } else {
          setFeaturedEvents(upcomingEvents);
        }

        // Fetch featured projects
        try {
          const projectsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/featured/`;
          const projectsResponse = await fetch(projectsUrl);
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setFeaturedProjects(
              projectsData.featured_projects ||
                projectsData.results ||
                projectsData ||
                []
            );
          }
        } catch (error) {
          console.error("Failed to fetch featured projects:", error);
        }
      } catch (error) {
        console.error("Error fetching featured data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedData();
  }, []);
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-black leading-tight">
                Electrical Engineering Students Association, CUSAT
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-black leading-relaxed">
                EESA is a vibrant student-led body under the Department of
                Electrical Engineering, CUSAT, that fosters innovation,
                leadership, and technical excellence through dynamic academic
                and co-curricular initiatives.
              </p>

              <div className="pt-4">
                <Link href="/events">
                  <Button className="bg-black text-white hover:bg-gray-800 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium rounded-xl transition-colors">
                    Explore Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Graphic - Electrical Tower */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <Image
                  src="/electrical-tower.svg"
                  alt="Electrical Tower"
                  width={300}
                  height={400}
                  className="w-64 h-80 lg:w-80 lg:h-96"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Notifications */}
      <MarqueeNotifications />

      {/* Events Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block bg-lime-400 text-black px-6 py-2 rounded-full text-lg font-medium mb-6">
              Events
            </div>

            {/* Events Description Text */}
            <div className="max-w-4xl mx-auto text-balance space-y-4 mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Stay updated with our latest events, workshops, and tech fests
                hosted by EESA. Explore what’s happening, what’s coming, and how
                you can be part of it.
              </p>
            </div>
          </div>

          {/* Events Container - API Driven */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-gray-500">Loading featured events...</div>
              </div>
            ) : featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      window.open(`/events/${event.id}`, "_blank");
                    }}
                    className="w-full h-48 bg-gray-900 rounded-3xl border border-gray-200 p-6 flex flex-col justify-between overflow-hidden relative hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <h3 className="text-white text-lg font-medium mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {event.description}
                      </p>
                      {event.event_type && (
                        <span className="inline-block bg-lime-400 text-black px-2 py-1 rounded-full text-xs font-medium mb-2">
                          {event.event_type.charAt(0).toUpperCase() +
                            event.event_type.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      {(event.venue || event.location) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {event.venue || event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 bg-gray-50 rounded-3xl">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    No upcoming featured events
                  </p>
                  <p className="text-gray-400 text-sm">
                    Check back soon for exciting upcoming events!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-block bg-lime-400 text-black px-6 py-2 rounded-full text-lg font-medium mb-6">
              Projects
            </div>

            {/* Projects Description Text */}
            <div className="max-w-4xl mx-auto text-left space-y-4 mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover innovative projects by EEE students—spanning hardware,
                software, and interdisciplinary ideas. Get inspired, get
                building.
              </p>
            </div>
          </div>

          {/* Projects Container - 3 Fixed Cards */}
          <div className="relative">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-full h-48 bg-gray-200 rounded-3xl border-2 border-gray-900 animate-pulse ${
                      index > 1 ? "hidden sm:block" : ""
                    }`}
                  />
                ))}
              </div>
            ) : featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {featuredProjects.slice(0, 3).map((project, index) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      window.open(`/projects/${project.id}`, "_blank");
                    }}
                    className={`w-full h-48 bg-gray-900 rounded-3xl border-2 border-gray-900 p-6 flex flex-col justify-between text-white relative overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors ${
                      index > 0 ? "hidden sm:flex" : "flex"
                    }`}
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                    {project.image && (
                      <div className="absolute inset-0 bg-black/20 rounded-3xl" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 bg-gray-50 rounded-3xl">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    No featured projects available
                  </p>
                  <p className="text-gray-400 text-sm">
                    Check back soon for new projects!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Logo and Contact */}
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/eesa-logo.svg"
                  alt="EESA Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 filter invert"
                />
                <span className="ml-3 text-xl font-bold">EESA</span>
              </div>

              <div className="space-y-4">
                <div className="inline-block bg-lime-400 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Contact us:
                </div>
                <p className="text-gray-300">Email: eesacusatweb@gmail.com</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center justify-center space-x-4">
              <a
                href="#"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © EESA CUSAT All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
