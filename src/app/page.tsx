"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Twitter } from "lucide-react";
import MarqueeNotifications from "@/components/ui/MarqueeNotifications";
import AutoScrollCarousel from "@/components/ui/AutoScrollCarousel";
import { EventCard, ProjectCard } from "@/components/ui/CarouselCards";

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
    const fetchFeaturedData = async () => {
      setLoading(true);

      // --- Fetch Events ---
      try {
        const eventsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/events/`
        );

        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          const featured =
            data.results?.filter(
              (event: { is_featured: boolean }) => event.is_featured
            ) || [];
          setFeaturedEvents(featured);
        } else {
          setFeaturedEvents([]);
        }
      } catch (error) {
        console.error("Error fetching featured events:", error);
        setFeaturedEvents([]);
      }

      // --- Fetch Projects ---
      try {
        const projectsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`;
        const projectsResponse = await fetch(projectsUrl);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          const featured = projectsData.projects?.slice(0, 6) || [];
          setFeaturedProjects(featured);
        } else {
          setFeaturedProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch featured projects:", error);
        setFeaturedProjects([]);
      }

      setLoading(false);
    };

    fetchFeaturedData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20 min-h-screen flex items-center relative overflow-hidden">
        {/* Background Electrical Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            {/* Main circuit lines */}
            <path
              d="M0 200 L400 200 L400 400 L800 400 L800 200 L1200 200"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path d="M200 0 L200 800" stroke="currentColor" strokeWidth="2" />
            <path d="M600 0 L600 800" stroke="currentColor" strokeWidth="2" />
            <path d="M1000 0 L1000 800" stroke="currentColor" strokeWidth="2" />

            {/* Cross connections */}
            <path
              d="M0 400 L200 200 M400 600 L600 400 M800 600 L1000 400"
              stroke="currentColor"
              strokeWidth="1"
            />

            {/* Electronic components */}
            <circle cx="200" cy="200" r="12" fill="currentColor" />
            <circle cx="600" cy="400" r="12" fill="currentColor" />
            <circle cx="1000" cy="200" r="12" fill="currentColor" />

            {/* Resistor symbols */}
            <path
              d="M350 200 L360 180 L380 220 L400 180 L420 220 L440 200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M750 400 L760 380 L780 420 L800 380 L820 420 L840 400"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />

            {/* Capacitor symbols */}
            <path
              d="M190 180 L190 220 M210 180 L210 220"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M590 380 L590 420 M610 380 L610 420"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Floating electrical icons */}
        <div className="absolute top-20 left-10 opacity-10 animate-pulse">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
          </svg>
        </div>
        <div
          className="absolute top-40 right-20 opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        >
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="m3 12 3-3m6 6 3-3m-3-6-3 3" />
          </svg>
        </div>
        <div
          className="absolute bottom-20 left-20 opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        >
          <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
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

            {/* Right Graphic - Enhanced Electrical Tower */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              <div className="relative">
                {/* Background electrical glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 to-yellow-300/20 rounded-full blur-3xl transform scale-150"></div>

                {/* Electrical tower or custom SVG */}
                <div className="relative z-10 w-64 h-80 lg:w-80 lg:h-96 flex items-center justify-center">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 300 400"
                    fill="none"
                  >
                    {/* Power transmission tower */}
                    <path
                      d="M150 50 L130 100 L170 100 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M120 100 L180 100 L160 150 L140 150 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M110 150 L190 150 L170 200 L130 200 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M100 200 L200 200 L180 250 L120 250 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M90 250 L210 250 L190 300 L110 300 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M80 300 L220 300 L200 350 L100 350 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    {/* Power lines */}
                    <path
                      d="M50 120 L250 120"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M50 170 L250 170"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      d="M50 220 L250 220"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    {/* Support cables */}
                    <path
                      d="M130 100 L50 120 M170 100 L250 120"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M140 150 L50 170 M160 150 L250 170"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M130 200 L50 220 M170 200 L250 220"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    {/* Lightning bolts for effect */}
                    <path
                      d="M80 80 L85 90 L75 95 L90 110"
                      stroke="#facc15"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M220 80 L215 90 L225 95 L210 110"
                      stroke="#facc15"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Floating electrical particles */}
                <div className="absolute top-10 -left-5 w-3 h-3 bg-lime-400 rounded-full opacity-60 animate-bounce"></div>
                <div
                  className="absolute top-20 -right-5 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute bottom-20 left-5 w-2 h-2 bg-lime-400 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute bottom-10 -right-3 w-3 h-3 bg-yellow-400 rounded-full opacity-60 animate-bounce"
                  style={{ animationDelay: "1.5s" }}
                ></div>
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

          {/* Events Container - Carousel */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-gray-500">Loading featured events...</div>
              </div>
            ) : featuredEvents.length > 0 ? (
              <AutoScrollCarousel autoplayDelay={5000} spaceBetween={20}>
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </AutoScrollCarousel>
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

          {/* Projects Container - Carousel */}
          <div className="relative">
            {loading ? (
              <AutoScrollCarousel autoplayDelay={0} spaceBetween={20}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl border-2 border-gray-300 animate-pulse"
                  >
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-6 bg-gray-300 rounded-full w-16 animate-pulse"></div>
                        <div className="h-6 bg-gray-300 rounded-full w-20 animate-pulse"></div>
                        <div className="h-6 bg-gray-300 rounded-full w-14 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </AutoScrollCarousel>
            ) : featuredProjects.length > 0 ? (
              <AutoScrollCarousel autoplayDelay={5000} spaceBetween={20}>
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </AutoScrollCarousel>
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
