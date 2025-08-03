"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Target,
  Trophy,
  Lightbulb,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event, GuestRegistrationData } from "@/types/api";
import Link from "next/link";
import Image from "next/image";

// Helper function to get random icon and color for each event
const getEventIcon = (eventId: number) => {
  const icons = [
    { Icon: Star, color: "bg-orange-500" },
    { Icon: Zap, color: "bg-lime-400" },
    { Icon: Target, color: "bg-blue-500" },
    { Icon: Trophy, color: "bg-yellow-500" },
    { Icon: Lightbulb, color: "bg-purple-500" },
    { Icon: Rocket, color: "bg-red-500" },
  ];
  return icons[eventId % icons.length];
};

// Events Carousel Component
interface EventsCarouselProps {
  events: Event[];
  onRegister: (event: Event) => void;
  registering: boolean;
}

const EventsCarousel: React.FC<EventsCarouselProps> = ({ events, onRegister, registering }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const totalSlides = Math.ceil(events.length / 3);
  const visibleEvents = events.slice(currentIndex * 3, (currentIndex + 1) * 3);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No events found
        </h3>
        <p className="text-gray-600">
          There are no upcoming events at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Mobile: Single card view with horizontal scrolling */}
      <div className="block md:hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {events.map((event) => (
            <div key={event.id} className="w-full flex-shrink-0 px-2">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>
                    {event.registration_required && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Registration Required
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {formatDate(event.start_date)}
                        {event.start_date !== event.end_date &&
                          ` - ${formatDate(event.end_date)}`}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {formatTime(event.start_date)} -{" "}
                        {formatTime(event.end_date)}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>

                    {event.max_participants && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {event.registration_count || 0} /{" "}
                          {event.max_participants} participants
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {event.registration_required && (
                      <Button
                        onClick={() => onRegister(event)}
                        disabled={
                          registering ||
                          (event.max_participants &&
                            (event.registration_count || 0) >=
                              event.max_participants) ||
                          new Date(event.end_date) < new Date()
                        }
                        className="flex-1"
                        variant={
                          event.max_participants &&
                          (event.registration_count || 0) >=
                            event.max_participants
                            ? "secondary"
                            : "default"
                        }
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {event.max_participants &&
                        (event.registration_count || 0) >= event.max_participants
                          ? "Full"
                          : new Date(event.end_date) < new Date()
                          ? "Event Ended"
                          : registering
                          ? "Registering..."
                          : "Register"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3-card view */}
      <div className="hidden md:block">
        <div 
          className="grid grid-cols-3 gap-6 transition-all duration-500 ease-in-out"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {visibleEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  {event.registration_required && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Registration Required
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(event.start_date)}
                      {event.start_date !== event.end_date &&
                        ` - ${formatDate(event.end_date)}`}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {formatTime(event.start_date)} -{" "}
                      {formatTime(event.end_date)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>

                  {event.max_participants && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {event.registration_count || 0} /{" "}
                        {event.max_participants} participants
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {event.registration_required && (
                    <Button
                      onClick={() => onRegister(event)}
                      disabled={
                        registering ||
                        (event.max_participants &&
                          (event.registration_count || 0) >=
                            event.max_participants) ||
                        new Date(event.end_date) < new Date()
                      }
                      className="flex-1"
                      variant={
                        event.max_participants &&
                        (event.registration_count || 0) >=
                          event.max_participants
                          ? "secondary"
                          : "default"
                      }
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {event.max_participants &&
                      (event.registration_count || 0) >= event.max_participants
                        ? "Full"
                        : new Date(event.end_date) < new Date()
                        ? "Event Ended"
                        : registering
                        ? "Registering..."
                        : "Register"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - only show if more than 1 slide */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}

      {/* Dots Navigation - only show if more than 1 slide */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gray-800 scale-110"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function EventsPage() {
  // Remove authentication - now public access only
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationModal, setRegistrationModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });
  const [guestFormData, setGuestFormData] = useState<GuestRegistrationData>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_semester: undefined,
    guest_department: undefined,
  });
  const [registering, setRegistering] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // For demo purposes, we'll hide the create event button
  // In production, this would be controlled by staff login
  const canCreateEvents = false; // Always false for public access

  // Get featured events for hero section rotation (upcoming events only)
  const featuredEvents = filteredEvents.filter(event => 
    !showPastEvents && new Date(event.end_date) >= new Date()
  );
  
  // Get current featured event
  const featuredEvent = featuredEvents[currentFeaturedIndex] || filteredEvents[0];

  // Use environment variable for API base URL (no hardcoded localhost)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/events/events/`);
        if (response.ok) {
          const data = await response.json();
          // Handle both paginated and non-paginated responses
          const eventsArray = data.results || data.events || data || [];
          console.log('Events data:', eventsArray.slice(0, 2)); // Debug first 2 events
          setEvents(Array.isArray(eventsArray) ? eventsArray : []);
        } else {
          setError("Failed to load events");
          setEvents([]);
        }
      } catch {
        setError("Failed to connect to server");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [API_BASE_URL]);

  // Filter events based on search term and past events toggle
  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by past events
    const now = new Date();
    if (!showPastEvents) {
      filtered = filtered.filter((event) => new Date(event.end_date) >= now);
    }

    // Sort by date (upcoming first)
    filtered.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    setFilteredEvents(filtered);
  }, [events, searchTerm, showPastEvents]);

  // Auto-rotate featured events every 5 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  // Reset featured index when events change
  useEffect(() => {
    setCurrentFeaturedIndex(0);
  }, [featuredEvents.length]);

  const handleRegister = async (event: Event) => {
    if (!event.registration_required) return;

    // For public access, always show guest registration modal
    setRegistrationModal({ isOpen: true, event });
  };

  const handleGuestRegistration = async () => {
    if (!registrationModal.event) return;

    try {
      setRegistering(true);

      // Convert guest form data to the format expected by backend
      const registrationData = {
        name: guestFormData.guest_name,
        email: guestFormData.guest_email,
        mobile_number: guestFormData.guest_phone || "",
        department: guestFormData.guest_department || "",
        year_of_study: guestFormData.guest_semester
          ? guestFormData.guest_semester.toString()
          : "",
      };

      const response = await fetch(
        `${API_BASE_URL}/events/events/${registrationModal.event.id}/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (response.ok) {
        alert("Registration successful!");
        setRegistrationModal({ isOpen: false, event: null });
        setGuestFormData({
          guest_name: "",
          guest_email: "",
          guest_phone: "",
          guest_semester: undefined,
          guest_department: undefined,
        });
        // Refresh events
        const eventsResponse = await fetch(`${API_BASE_URL}/events/events/`);
        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          const eventsArray = data.results || data.events || data || [];
          setEvents(Array.isArray(eventsArray) ? eventsArray : []);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Registration failed");
      }
    } catch {
      alert("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        {featuredEvent && !showPastEvents && (
          <section className="relative overflow-hidden min-h-[70vh]">
            {/* Glass Background Layer */}
            <div className="absolute inset-0">
              {/* Base gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
              
              {/* Animated glass orbs */}
              <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-r from-green-200/25 to-blue-200/25 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl opacity-35 animate-pulse delay-500"></div>
              
              {/* Glass overlay with heavy blur */}
              <div className="absolute inset-0 backdrop-blur-md bg-white/40 border-t border-white/20"></div>
              
              {/* Background electrical pattern with glass effect */}
              <div className="absolute inset-0 opacity-3">
                <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none">
                  <defs>
                    <pattern id="hero-circuit-glass" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M0 30 L60 30 M30 0 L30 60" stroke="url(#glassgradient)" strokeWidth="0.5"/>
                      <circle cx="30" cy="30" r="3" fill="url(#glassgradient)"/>
                      <rect x="25" y="10" width="10" height="5" fill="none" stroke="url(#glassgradient)" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="glassgradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
                      <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4"/>
                    </linearGradient>
                    <filter id="glass-blur">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/>
                      <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/>
                    </filter>
                  </defs>
                  <rect width="1200" height="600" fill="url(#hero-circuit-glass)" filter="url(#glass-blur)"/>
                  
                  {/* Main circuit lines with glass effect */}
                  <g filter="url(#glass-blur)">
                    <path d="M0 150 L400 150 L400 300 L800 300 L800 150 L1200 150" stroke="url(#glassgradient)" strokeWidth="2"/>
                    <path d="M200 0 L200 600" stroke="url(#glassgradient)" strokeWidth="1"/>
                    <path d="M400 0 L400 600" stroke="url(#glassgradient)" strokeWidth="1"/>
                    <path d="M600 0 L600 600" stroke="url(#glassgradient)" strokeWidth="1"/>
                    <path d="M800 0 L800 600" stroke="url(#glassgradient)" strokeWidth="1"/>
                    <path d="M1000 0 L1000 600" stroke="url(#glassgradient)" strokeWidth="1"/>
                    
                    {/* Electronic components */}
                    <circle cx="200" cy="150" r="8" fill="url(#glassgradient)"/>
                    <circle cx="600" cy="300" r="8" fill="url(#glassgradient)"/>
                    <circle cx="1000" cy="150" r="8" fill="url(#glassgradient)"/>
                  </g>
                </svg>
              </div>
            </div>

            {/* Glass Content Container */}
            <div className="relative z-10">
              {/* Glass card wrapper */}
              <div className="backdrop-blur-xl bg-white/30 border border-white/20 shadow-2xl shadow-black/10 mx-4 my-8 rounded-3xl overflow-hidden">
                {/* Inner glass effect */}
                <div className="backdrop-blur-sm bg-gradient-to-br from-white/50 to-white/30 border-t border-white/30">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-16">
                    {/* Clean horizontal layout - poster left, content right */}
                    <div className="flex gap-6 md:gap-8 lg:gap-12 items-start">
                      {/* Left Column: Poster and Register Button */}
                      <div className="flex-shrink-0 flex flex-col">
                        {/* Event Poster */}
                        <div className="relative transform hover:rotate-1 transition-all duration-500 hover:scale-105 mb-4">
                          {/* Main poster container */}
                          <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-2xl shadow-black/20 p-3 md:p-4 lg:p-6 aspect-[3/4] flex items-center justify-center relative overflow-hidden w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64">
                            {/* Glass reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/30 to-transparent"></div>
                            
                            {/* Event poster image */}
                            {(featuredEvent.banner_image) ? (
                              <div className="absolute inset-2 md:inset-3 lg:inset-4 overflow-hidden shadow-lg">
                                <Image 
                                  src={featuredEvent.banner_image || ''} 
                                  alt={`${featuredEvent.title} poster`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              /* Default electrical poster design */
                              <div className="text-center relative z-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 backdrop-blur-md bg-black/80 border border-white/30 flex items-center justify-center mx-auto mb-3 md:mb-4 lg:mb-6 relative shadow-xl">
                                  <svg className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                                  </svg>
                                  <svg className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
                                  </svg>
                                </div>
                                <h3 className="text-sm md:text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2 drop-shadow-sm">EVENT</h3>
                                <p className="text-gray-600 text-xs md:text-sm backdrop-blur-sm bg-white/40 px-2 md:px-3 py-1">Electrical Engineering</p>
                              </div>
                            )}
                            
                            {/* Subtle electrical overlay for poster images */}
                            {(featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image) && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 300 375" fill="none">
                                  <defs>
                                    <pattern id="subtle-circuit" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                      <path d="M0 15 L30 15 M15 0 L15 30" stroke="currentColor" strokeWidth="0.3"/>
                                      <circle cx="15" cy="15" r="0.8" fill="currentColor"/>
                                    </pattern>
                                  </defs>
                                  <rect width="300" height="375" fill="url(#subtle-circuit)"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Floating glass elements on poster */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 backdrop-blur-md bg-lime-400/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-3 h-3 md:w-4 md:h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                            </svg>
                          </div>
                          <div className="absolute -bottom-2 -left-2 w-5 h-5 md:w-6 md:h-6 backdrop-blur-md bg-black/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Register Button - Left aligned below poster */}
                        {featuredEvent.registration_required && (
                          <div className="w-full">
                            <Button
                              onClick={() => handleRegister(featuredEvent)}
                              className="w-full backdrop-blur-md bg-black/80 hover:bg-black/90 border border-white/20 text-white px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                              <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Register Now
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Right Column: Event Details */}
                      <div className="flex-1 min-w-0">
                        {/* Date badge - clean glass effect */}
                        <div className="inline-block backdrop-blur-md bg-black/80 border border-white/20 text-white px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium mb-4 md:mb-6 shadow-xl">
                          {new Date(featuredEvent.start_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric' 
                          })} • {new Date(featuredEvent.start_date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                        
                        {/* Title - clean no background */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6 transition-all duration-500 drop-shadow-sm">
                          {featuredEvent.title}
                        </h1>
                        
                        {/* Description - clean no background */}
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4 md:mb-6 transition-all duration-500">
                          {featuredEvent.description}
                        </p>
                        
                        {/* Location - clean glass effect */}
                        {featuredEvent.location && (
                          <div className="flex items-center text-base md:text-lg text-gray-700 backdrop-blur-sm bg-white/30 p-3 md:p-4 border border-white/20 mb-4 md:mb-6">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 mr-3 text-blue-600 flex-shrink-0" />
                            <span>{featuredEvent.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Centered Event Navigation Dots */}
            {featuredEvents.length > 1 && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg">
                  <div className="flex gap-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`w-3 h-3 transition-all duration-300 ${
                          index === currentFeaturedIndex 
                            ? 'bg-blue-600 scale-125 shadow-lg' 
                            : 'bg-white/60 backdrop-blur-sm hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
                        <div className="relative transform hover:rotate-1 transition-all duration-500 hover:scale-105">
                          {/* Main poster container - responsive sizing */}
                          <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-2xl shadow-black/20 p-2 sm:p-3 md:p-4 lg:p-6 aspect-[3/4] flex items-center justify-center relative overflow-hidden w-24 sm:w-32 md:w-48 lg:w-64 xl:w-72">
                            {/* Glass reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/30 to-transparent"></div>
                            
                            {/* Event poster image */}
                            {(featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image) ? (
                              <div className="absolute inset-1 sm:inset-2 md:inset-3 lg:inset-4 overflow-hidden shadow-lg">
                                <Image 
                                  src={featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image || ''} 
                                  alt={`${featuredEvent.title} poster`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Hide image if it fails to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              /* Default electrical poster design */
                              <div className="text-center relative z-10">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 backdrop-blur-md bg-black/80 border border-white/30 flex items-center justify-center mx-auto mb-1 sm:mb-2 md:mb-4 lg:mb-6 relative shadow-xl">
                                  <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                                  </svg>
                                  <svg className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
                                  </svg>
                                </div>
                                <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2 drop-shadow-sm">EVENT</h3>
                                <p className="text-gray-600 text-xs md:text-sm backdrop-blur-sm bg-white/40 px-1 sm:px-2 md:px-3 py-0.5 md:py-1 hidden sm:block">Electrical Engineering</p>
                              </div>
                            )}
                            
                            {/* Subtle electrical overlay for poster images */}
                            {(featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image) && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 300 375" fill="none">
                                  <defs>
                                    <pattern id="subtle-circuit" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                      <path d="M0 15 L30 15 M15 0 L15 30" stroke="currentColor" strokeWidth="0.3"/>
                                      <circle cx="15" cy="15" r="0.8" fill="currentColor"/>
                                    </pattern>
                                  </defs>
                                  <rect width="300" height="375" fill="url(#subtle-circuit)"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Floating glass elements - minimal on mobile */}
                          <div className="absolute -top-1 sm:-top-2 md:-top-3 -right-1 sm:-right-2 md:-right-3 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 backdrop-blur-md bg-lime-400/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                            </svg>
                          </div>
                          <div className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 -left-1 sm:-left-2 md:-left-3 w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 backdrop-blur-md bg-black/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                        {/* Date badge with glass effect */}
                        <div className="inline-block backdrop-blur-md bg-black/80 border border-white/20 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium mb-3 md:mb-6 shadow-xl">
                          {new Date(featuredEvent.start_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric' 
                          })} • {new Date(featuredEvent.start_date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                        
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-3 md:mb-4 lg:mb-6 transition-all duration-500 drop-shadow-sm">
                          {featuredEvent.title}
                        </h1>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4 lg:mb-6 transition-all duration-500 backdrop-blur-sm bg-white/20 p-2 md:p-3 lg:p-4 border border-white/20">
                          {featuredEvent.description}
                        </p>
                        
                        {/* Location */}
                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 lg:mb-8">
                          {featuredEvent.location && (
                            <div className="flex items-center text-xs sm:text-sm md:text-base text-gray-700 backdrop-blur-sm bg-white/30 p-2 md:p-3 border border-white/20">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{featuredEvent.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {featuredEvent.registration_required && (
                          <Button
                            onClick={() => handleRegister(featuredEvent)}
                            className="backdrop-blur-md bg-black/80 hover:bg-black/90 border border-white/20 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                          >
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                            Register Now
                          </Button>
                        )}
                      </div>
                      
                      {/* Mobile: Poster first, Desktop: Poster second */}
                      <div className="relative flex justify-center order-1 lg:order-2">
                        {/* Event Poster with enhanced glass effect */}
                        <div className="relative transform hover:rotate-1 transition-all duration-500 hover:scale-105">
                          {/* Main poster container */}
                          <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-2xl shadow-black/20 p-3 sm:p-4 md:p-6 aspect-[3/4] sm:aspect-[4/5] flex items-center justify-center relative overflow-hidden w-40 sm:w-48 md:w-56 lg:w-72 mx-auto">
                            {/* Glass reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-white/30 to-transparent"></div>
                            
                            {/* Event poster image */}
                            {(featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image) ? (
                              <div className="absolute inset-2 sm:inset-3 md:inset-4 overflow-hidden shadow-lg">
                                <Image 
                                  src={featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image || ''} 
                                  alt={`${featuredEvent.title} poster`}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Hide image if it fails to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              /* Default electrical poster design */
                              <div className="text-center relative z-10">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 backdrop-blur-md bg-black/80 border border-white/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 relative shadow-xl">
                                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                                  </svg>
                                  <svg className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
                                  </svg>
                                </div>
                                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2 drop-shadow-sm">EVENT</h3>
                                <p className="text-gray-600 text-xs md:text-sm backdrop-blur-sm bg-white/40 px-2 md:px-3 py-1">Electrical Engineering</p>
                              </div>
                            )}
                            
                            {/* Subtle electrical overlay for poster images */}
                            {(featuredEvent.poster_image || featuredEvent.banner_image || featuredEvent.image) && (
                              <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <svg className="w-full h-full" viewBox="0 0 300 375" fill="none">
                                  <defs>
                                    <pattern id="subtle-circuit" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                                      <path d="M0 15 L30 15 M15 0 L15 30" stroke="currentColor" strokeWidth="0.3"/>
                                      <circle cx="15" cy="15" r="0.8" fill="currentColor"/>
                                    </pattern>
                                  </defs>
                                  <rect width="300" height="375" fill="url(#subtle-circuit)"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Floating glass elements - smaller and less prominent on mobile */}
                          <div className="absolute -top-1.5 sm:-top-2 md:-top-3 -right-1.5 sm:-right-2 md:-right-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 backdrop-blur-md bg-lime-400/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z"/>
                            </svg>
                          </div>
                          <div className="absolute -bottom-1.5 sm:-bottom-2 md:-bottom-3 -left-1.5 sm:-left-2 md:-left-3 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 backdrop-blur-md bg-black/60 border border-white/30 opacity-90 flex items-center justify-center shadow-xl">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Background floating elements for decoration - hidden on mobile for clean layout */}
                        <div className="hidden lg:block absolute top-2 -left-4 opacity-10">
                          <div className="w-12 h-12 backdrop-blur-lg bg-lime-400/30 border border-white/20 flex items-center justify-center rotate-12">
                            <svg className="w-6 h-6 text-lime-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="hidden lg:block absolute bottom-2 -right-4 opacity-10">
                          <div className="w-10 h-10 backdrop-blur-lg bg-blue-400/30 border border-white/20 flex items-center justify-center -rotate-12">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Centered Event Navigation Dots */}
            {featuredEvents.length > 1 && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg">
                  <div className="flex gap-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`w-3 h-3 transition-all duration-300 ${
                          index === currentFeaturedIndex 
                            ? 'bg-blue-600 scale-125 shadow-lg' 
                            : 'bg-white/60 backdrop-blur-sm hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  {showPastEvents ? 'Past Events' : 'Upcoming Events'}
                </h2>
                <p className="mt-2 text-gray-600">
                  Discover and participate in our events
                </p>
              </div>
              {canCreateEvents && (
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setShowPastEvents(false)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      !showPastEvents
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Upcoming Events
                  </button>
                  <button
                    onClick={() => setShowPastEvents(true)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showPastEvents
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Past Events
                  </button>
                </nav>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white shadow-sm p-12 text-center border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">
                  No events found
                </h3>
                <p className="text-gray-600">
                  {showPastEvents 
                    ? "No past events available"
                    : "No upcoming events at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const { Icon, color } = getEventIcon(event.id);
                  return (
                    <div key={event.id} className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer border border-gray-100 aspect-square flex flex-col"
                         onClick={() => window.open(`/events/${event.id}`, "_blank")}>
                      {/* Header with Date Badge and Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-black text-white px-2 py-1 text-center min-w-[50px]">
                            <div className="text-xs font-medium">
                              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-sm font-bold">
                              {new Date(event.start_date).getDate()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Squared Icon Box */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className={`${color} p-2 shadow-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        {/* Event Background - Square with SVG Pattern */}
                        <div className="h-24 bg-white relative overflow-hidden border-b border-gray-100">
                          {/* Dense Electrical Circuit Pattern */}
                          <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 96" fill="none">
                            {/* Main circuit grid */}
                            <defs>
                              <pattern id="circuit-grid" x="0" y="0" width="32" height="24" patternUnits="userSpaceOnUse">
                                <path d="M0 12 L32 12 M16 0 L16 24" stroke="currentColor" strokeWidth="0.5"/>
                                <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                              </pattern>
                            </defs>
                            <rect width="200" height="96" fill="url(#circuit-grid)"/>
                            
                            {/* Complex circuit traces */}
                            <path d="M10 15 L60 15 L60 30 L110 30 L110 45 L160 45 L160 60 L190 60" 
                                  stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            <path d="M10 30 L40 30 L40 60 L80 60 L80 75 L120 75 L120 45 L150 45 L150 15 L190 15" 
                                  stroke="currentColor" strokeWidth="1" fill="none"/>
                            
                            {/* Electronic components */}
                            <circle cx="60" cy="30" r="3" fill="currentColor"/>
                            <circle cx="110" cy="45" r="3" fill="currentColor"/>
                            <circle cx="160" cy="60" r="3" fill="currentColor"/>
                            
                            {/* Resistors */}
                            <rect x="55" y="13" width="10" height="4" fill="none" stroke="currentColor" strokeWidth="1"/>
                            <rect x="105" y="28" width="10" height="4" fill="none" stroke="currentColor" strokeWidth="1"/>
                            <rect x="155" y="43" width="10" height="4" fill="none" stroke="currentColor" strokeWidth="1"/>
                            
                            {/* Capacitors */}
                            <path d="M35 28 L35 32 M40 28 L40 32" stroke="currentColor" strokeWidth="2"/>
                            <path d="M75 58 L75 62 M80 58 L80 62" stroke="currentColor" strokeWidth="2"/>
                            
                            {/* Connection points */}
                            <circle cx="20" cy="15" r="1" fill="currentColor"/>
                            <circle cx="80" cy="30" r="1" fill="currentColor"/>
                            <circle cx="140" cy="45" r="1" fill="currentColor"/>
                            <circle cx="180" cy="60" r="1" fill="currentColor"/>
                          </svg>
                          
                          {/* Subtle electrical icons */}
                          <div className="absolute top-2 right-8 opacity-15">
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="absolute bottom-2 left-8 opacity-12">
                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="mb-2">
                            <h3 className="text-base font-semibold text-black line-clamp-2 group-hover:text-gray-700 transition-colors">
                              {event.title}
                            </h3>
                          </div>

                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-xs text-gray-600">
                              <Clock className="w-3 h-3 mr-1 text-gray-400" />
                              <span>
                                {new Date(event.start_date).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>

                            {event.location && (
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Event Type Badge */}
                          {event.event_type && (
                            <div className="mb-2">
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-lime-400 text-black">
                                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                              </span>
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-gray-600 text-xs line-clamp-3 mb-3">
                            {event.description}
                          </p>
                        </div>

                        {/* Bottom section */}
                        <div className="mt-auto">
                          {/* Action Button */}
                          <div className="flex items-center justify-between mb-2">
                            {event.registration_required ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegister(event);
                                }}
                                disabled={registering}
                                className="w-full bg-black hover:bg-gray-800 text-white text-xs py-2"
                              >
                                {registering ? (
                                  <>
                                    Registering...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-3 h-3 mr-1" />
                                    Register
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="w-full text-center py-1.5 text-xs text-gray-500 border border-gray-200">
                                No Registration Required
                              </div>
                            )}
                          </div>

                          {/* Participants Info */}
                          {event.max_participants && (
                            <div className="flex items-center text-xs text-gray-500 justify-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>
                                {event.registration_count || 0} / {event.max_participants}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Guest Registration Modal */}
        {registrationModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                Register for {registrationModal.event?.title}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={guestFormData.guest_name}
                    onChange={(e) =>
                      setGuestFormData({
                        ...guestFormData,
                        guest_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={guestFormData.guest_email}
                    onChange={(e) =>
                      setGuestFormData({
                        ...guestFormData,
                        guest_email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={guestFormData.guest_phone}
                    onChange={(e) =>
                      setGuestFormData({
                        ...guestFormData,
                        guest_phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={guestFormData.guest_semester || ""}
                    onChange={(e) =>
                      setGuestFormData({
                        ...guestFormData,
                        guest_semester: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={guestFormData.guest_department || ""}
                    onChange={(e) =>
                      setGuestFormData({
                        ...guestFormData,
                        guest_department: e.target.value
                          ? (e.target.value as
                              | "electrical"
                              | "electronics"
                              | "computer"
                              | "mechanical"
                              | "civil"
                              | "other")
                          : undefined,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Department</option>
                    <option value="electrical">Electrical</option>
                    <option value="electronics">Electronics</option>
                    <option value="computer">Computer</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="civil">Civil</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    setRegistrationModal({ isOpen: false, event: null })
                  }
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGuestRegistration}
                  disabled={
                    registering ||
                    !guestFormData.guest_name ||
                    !guestFormData.guest_email
                  }
                  className="flex-1"
                >
                  {registering ? "Registering..." : "Register"}
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
