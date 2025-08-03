"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Twitter, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Carousel state
  const [eventsCurrentIndex, setEventsCurrentIndex] = useState(0);
  const [projectsCurrentIndex, setProjectsCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // Auto-advance carousels
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (featuredEvents.length > 3) {
        setEventsCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
      }
      if (featuredProjects.length > 3) {
        setProjectsCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredEvents.length, featuredProjects.length]);

  // Carousel navigation functions
  const nextEventsSlide = () => {
    setEventsCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevEventsSlide = () => {
    setEventsCurrentIndex((prev) => 
      (prev - 1 + featuredEvents.length) % featuredEvents.length
    );
  };

  const goToEventsSlide = (index: number) => {
    setEventsCurrentIndex(index);
  };

  const nextProjectsSlide = () => {
    setProjectsCurrentIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const prevProjectsSlide = () => {
    setProjectsCurrentIndex((prev) => 
      (prev - 1 + featuredProjects.length) % featuredProjects.length
    );
  };

  const goToProjectsSlide = (index: number) => {
    setProjectsCurrentIndex(index);
  };

  // Get visible items for current slide - always show 3 cards with conveyor belt effect
  const getVisibleEvents = () => {
    if (featuredEvents.length === 0) return [];
    if (featuredEvents.length <= 3) return featuredEvents;
    
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (eventsCurrentIndex + i) % featuredEvents.length;
      result.push(featuredEvents[index]);
    }
    return result;
  };

  const getVisibleProjects = () => {
    if (featuredProjects.length === 0) return [];
    if (featuredProjects.length <= 3) return featuredProjects;
    
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (projectsCurrentIndex + i) % featuredProjects.length;
      result.push(featuredProjects[index]);
    }
    return result;
  };

  // Create extended arrays for mobile infinite scrolling
  const getExtendedEvents = () => {
    if (featuredEvents.length === 0) return [];
    if (featuredEvents.length <= 3) return featuredEvents;
    
    // Create an array with duplicated items for seamless infinite scroll
    const extended = [];
    const totalNeeded = Math.max(featuredEvents.length * 2, 6); // At least double the original
    for (let i = 0; i < totalNeeded; i++) {
      extended.push(featuredEvents[i % featuredEvents.length]);
    }
    return extended;
  };

  const getExtendedProjects = () => {
    if (featuredProjects.length === 0) return [];
    if (featuredProjects.length <= 3) return featuredProjects;
    
    // Create an array with duplicated items for seamless infinite scroll
    const extended = [];
    const totalNeeded = Math.max(featuredProjects.length * 2, 6); // At least double the original
    for (let i = 0; i < totalNeeded; i++) {
      extended.push(featuredProjects[i % featuredProjects.length]);
    }
    return extended;
  };

  const eventsTotalSlides = featuredEvents.length > 3 ? featuredEvents.length : 1;
  const projectsTotalSlides = featuredProjects.length > 3 ? featuredProjects.length : 1;

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

          {/* Events Container - Carousel */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-gray-500">Loading featured events...</div>
              </div>
            ) : featuredEvents.length > 0 ? (
              <div 
                className="relative"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Mobile: Single card view */}
                <div className="block sm:hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${eventsCurrentIndex * 100}%)` }}
                  >
                    {getExtendedEvents().map((event, index) => (
                      <div
                        key={`${event.id}-${index}`}
                        onClick={() => {
                          window.open(`/events/${event.id}`, "_blank");
                        }}
                        className="w-full flex-shrink-0 px-2"
                      >
                        <div className="w-full h-48 bg-gray-900 rounded-3xl border border-gray-200 p-6 flex flex-col justify-between overflow-hidden relative hover:bg-gray-800 transition-colors cursor-pointer">
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: 3-card view */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
                    {getVisibleEvents().map((event) => (
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
                </div>

                {/* Navigation arrows - only show if more than 3 events */}
                {eventsTotalSlides > 1 && (
                  <>
                    <button
                      onClick={prevEventsSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={nextEventsSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Dots Navigation - only show if more than 1 slide */}
                {eventsTotalSlides > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: eventsTotalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToEventsSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === eventsCurrentIndex
                            ? "bg-gray-800 scale-110"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
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

          {/* Projects Container - Carousel */}
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
              <div 
                className="relative"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Mobile: Single card view */}
                <div className="block sm:hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${projectsCurrentIndex * 100}%)` }}
                  >
                    {getExtendedProjects().map((project, index) => (
                      <div
                        key={`${project.id}-${index}`}
                        onClick={() => {
                          window.open(`/projects/${project.id}`, "_blank");
                        }}
                        className="w-full flex-shrink-0 px-2"
                      >
                        <div className="w-full h-48 bg-gray-900 rounded-3xl border-2 border-gray-900 p-6 flex flex-col justify-between text-white relative overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors">
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: 3-card view */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
                    {getVisibleProjects().map((project) => (
                      <div
                        key={project.id}
                        onClick={() => {
                          window.open(`/projects/${project.id}`, "_blank");
                        }}
                        className="w-full h-48 bg-gray-900 rounded-3xl border-2 border-gray-900 p-6 flex flex-col justify-between text-white relative overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
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
                </div>

                {/* Navigation arrows - only show if more than 3 projects */}
                {projectsTotalSlides > 1 && (
                  <>
                    <button
                      onClick={prevProjectsSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={nextProjectsSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Dots Navigation - only show if more than 1 slide */}
                {projectsTotalSlides > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: projectsTotalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToProjectsSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === projectsCurrentIndex
                            ? "bg-gray-800 scale-110"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
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
