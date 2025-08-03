"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  Star,
  Zap,
  Target,
  Trophy,
  Lightbulb,
  Rocket,
  Search,
  X,
} from "lucide-react";

// Types for the API responses
interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_type?: string;
  max_participants?: number;
  registration_count?: number;
  registration_required: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EventRegistrationData {
  name: string;
  email: string;
  mobile_number?: string;
  institution?: string;
  department?: string;
  year_of_study?: number;
}

// API Service for events
const eventsService = {
  async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch("/api/events", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  async registerForEvent(
    eventId: number,
    registrationData: EventRegistrationData
  ): Promise<void> {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.detail ||
            errorData.message ||
            `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  },

  async getEventDetails(eventId: number): Promise<Event> {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching event details:", error);
      throw error;
    }
  },
};

// Toast notification system (simple implementation)
const toast = {
  success: (message: string) => {
    console.log("Success:", message);
    // You can replace this with your preferred toast library
    alert(`Success: ${message}`);
  },
  error: (message: string) => {
    console.error("Error:", message);
    // You can replace this with your preferred toast library
    alert(`Error: ${message}`);
  },
};

// Helper function to get random icon and color for each event
const getEventIcon = (eventId: number) => {
  const icons = [
    { Icon: Star, color: "bg-[#191A23]" },
    { Icon: Zap, color: "bg-[#B9FF66]" },
    { Icon: Target, color: "bg-[#191A23]" },
    { Icon: Trophy, color: "bg-[#B9FF66]" },
    { Icon: Lightbulb, color: "bg-[#191A23]" },
    { Icon: Rocket, color: "bg-[#B9FF66]" },
  ];
  return icons[eventId % icons.length];
};

// Enhanced Button Component
const Button = ({
  children,
  variant = "default",
  className = "",
  disabled = false,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  [key: string]: unknown;
}) => {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
  const variants = {
    default:
      "bg-[#191A23] text-[#B9FF66] hover:bg-[#191A23]/90 disabled:bg-[#191A23]/40",
    outline:
      "border border-[#191A23]/20 bg-white text-[#191A23] hover:bg-[#B9FF66]/10 disabled:bg-gray-100",
    secondary:
      "bg-[#F3F3F3] text-[#191A23] hover:bg-[#B9FF66]/20 disabled:bg-gray-100",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Input Component
const Input = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] ${className}`}
      {...props}
    />
  );
};

// Event Card Component
const EventCard = ({
  event,
  onRegister,
  registering,
}: {
  event: Event;
  onRegister: (eventId: number) => void;
  registering: boolean;
}) => {
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

  const isEventFull =
    event.max_participants &&
    (event.registration_count || 0) >= event.max_participants;
  const isEventEnded = new Date(event.end_date) < new Date();

  return (
    <div className="w-full flex-shrink-0 px-2 md:px-0">
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
                {formatTime(event.start_date)} - {formatTime(event.end_date)}
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
                  {event.registration_count || 0} / {event.max_participants}{" "}
                  participants
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // You can implement event details modal or navigation here
                console.log("View details for event:", event.id);
              }}
            >
              View Details
            </Button>
            {event.registration_required && (
              <Button
                onClick={() => onRegister(event.id)}
                disabled={registering || isEventFull || isEventEnded}
                className="flex-1"
                variant={isEventFull ? "secondary" : "default"}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isEventFull
                  ? "Full"
                  : isEventEnded
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
  );
};

// Main Events Page Component
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationModal, setRegistrationModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({
    isOpen: false,
    event: null,
  });
  const [guestFormData, setGuestFormData] = useState<EventRegistrationData>({
    name: "",
    email: "",
    mobile_number: "",
    department: undefined,
    year_of_study: undefined,
  });
  const [registering, setRegistering] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsService.getEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Failed to load events. Please try again later.");
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Get featured events for hero section
  const featuredEvents = (filteredEvents || []).filter(
    (event) => !showPastEvents && new Date(event.end_date) >= new Date()
  );

  const featuredEvent =
    featuredEvents[currentFeaturedIndex] || (filteredEvents || [])[0];

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
    } else {
      filtered = filtered.filter((event) => new Date(event.end_date) < now);
    }

    // Sort by date
    filtered.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    setFilteredEvents(filtered);
  }, [events, searchTerm, showPastEvents]);

  // Auto-rotate featured events
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

  const handleRegister = useCallback(
    (eventId: number) => {
      const event = events.find((e) => e.id === eventId);
      if (!event || !event.registration_required) return;
      setRegistrationModal({ isOpen: true, event });
    },
    [events]
  );

  const handleGuestRegistration = async () => {
    if (!registrationModal.event) return;

    try {
      setRegistering(true);

      await eventsService.registerForEvent(
        registrationModal.event.id,
        guestFormData
      );

      toast.success("Registration successful!");
      setRegistrationModal({ isOpen: false, event: null });
      setGuestFormData({
        name: "",
        email: "",
        mobile_number: "",
        department: undefined,
        year_of_study: undefined,
      });

      // Update registration count in local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === registrationModal.event!.id
            ? {
                ...event,
                registration_count: (event.registration_count || 0) + 1,
              }
            : event
        )
      );
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const closeModal = () => {
    setRegistrationModal({ isOpen: false, event: null });
    setGuestFormData({
      name: "",
      email: "",
      mobile_number: "",
      department: undefined,
      year_of_study: undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191A23]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-[#191A23] text-[#B9FF66] px-4 py-2 rounded-lg hover:bg-[#191A23]/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F3F3F3]">
        {/* Glass Hero Section */}
        {featuredEvent && !showPastEvents && featuredEvents.length > 0 && (
          <section className="relative overflow-hidden min-h-[70vh]">
            {/* Hero Background - Clean with brand colors */}
            <div className="absolute inset-0">
              {/* Light gradient background using brand colors */}
              <div className="absolute inset-0 bg-[#F3F3F3]"></div>

              {/* Glass overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>

              {/* Background electrical pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1200 600"
                  fill="none"
                >
                  <defs>
                    <pattern
                      id="hero-circuit-glass"
                      x="0"
                      y="0"
                      width="60"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M0 30 L60 30 M30 0 L30 60"
                        stroke="url(#glassgradient)"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="3"
                        fill="url(#glassgradient)"
                      />
                      <rect
                        x="25"
                        y="10"
                        width="10"
                        height="5"
                        fill="none"
                        stroke="url(#glassgradient)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                    <linearGradient
                      id="glassgradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#191A23" stopOpacity="0.3" />
                      <stop
                        offset="50%"
                        stopColor="#191A23"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="#191A23"
                        stopOpacity="0.3"
                      />
                    </linearGradient>
                  </defs>
                  <rect
                    width="1200"
                    height="600"
                    fill="url(#hero-circuit-glass)"
                  />
                </svg>
              </div>
            </div>

            {/* Glass Content Container */}
            <div className="relative z-10">
              <div className="backdrop-blur-xl bg-[#F3F3F3]/60 border border-white/40 shadow-lg mx-4 my-8 rounded-2xl overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-16">
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Poster Image at Top */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/80 border border-white/60 p-4 aspect-[3/4] flex items-center justify-center relative overflow-hidden w-48 rounded-lg">
                        <div className="text-center relative z-10">
                          <div className="w-16 h-16 bg-[#191A23] border border-white/40 flex items-center justify-center mx-auto mb-4 relative rounded-lg">
                            <Zap className="w-8 h-8 text-[#B9FF66]" />
                            <Star className="absolute -top-1 -right-1 w-4 h-4 text-[#B9FF66]" />
                          </div>
                          <h3 className="text-lg font-bold text-[#191A23] mb-2">
                            EVENT
                          </h3>
                          <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                            {featuredEvent.event_type ||
                              "Electrical Engineering"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="text-center">
                      <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium mb-4 rounded-lg">
                        {new Date(featuredEvent.start_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )}{" "}
                        •{" "}
                        {new Date(featuredEvent.start_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </div>

                      <h1 className="text-2xl font-bold text-[#191A23] leading-tight mb-4">
                        {featuredEvent.title}
                      </h1>

                      <p className="text-[#191A23]/80 leading-relaxed mb-4">
                        {featuredEvent.description}
                      </p>

                      {featuredEvent.location && (
                        <div className="flex items-center justify-center text-[#191A23]/80 bg-white/40 p-3 border border-white/40 mb-6 rounded-lg">
                          <MapPin className="w-5 h-5 mr-3 text-[#191A23] flex-shrink-0" />
                          <span>{featuredEvent.location}</span>
                        </div>
                      )}

                      {featuredEvent.registration_required && (
                        <Button
                          onClick={() => handleRegister(featuredEvent.id)}
                          className="w-full bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-3 text-base font-medium transition-all duration-300 rounded-lg"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Register Now
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex gap-8 lg:gap-12 items-start">
                    {/* Left Column: Poster and Register Button */}
                    <div className="flex-shrink-0 flex flex-col">
                      <div className="mb-4">
                        <div className="bg-white/80 border border-white/60 p-4 lg:p-6 aspect-[3/4] flex items-center justify-center relative overflow-hidden w-48 lg:w-64 rounded-lg">
                          <div className="text-center relative z-10">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#191A23] border border-white/40 flex items-center justify-center mx-auto mb-4 lg:mb-6 relative rounded-lg">
                              <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-[#B9FF66]" />
                              <Star className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 text-[#B9FF66]" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-bold text-[#191A23] mb-2">
                              EVENT
                            </h3>
                            <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                              {featuredEvent.event_type ||
                                "Electrical Engineering"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {featuredEvent.registration_required && (
                        <Button
                          onClick={() => handleRegister(featuredEvent.id)}
                          className="w-full bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] px-6 py-4 text-base font-medium transition-all duration-300 rounded-lg"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Register Now
                        </Button>
                      )}
                    </div>

                    {/* Right Column: Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-3 text-base font-medium mb-6 rounded-lg">
                        {new Date(featuredEvent.start_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )}{" "}
                        •{" "}
                        {new Date(featuredEvent.start_date).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </div>

                      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#191A23] leading-tight mb-6">
                        {featuredEvent.title}
                      </h1>

                      <p className="text-lg md:text-xl text-[#191A23]/80 leading-relaxed mb-6">
                        {featuredEvent.description}
                      </p>

                      {featuredEvent.location && (
                        <div className="flex items-center text-lg text-[#191A23]/80 bg-white/40 p-4 border border-white/40 mb-6 rounded-lg">
                          <MapPin className="w-6 h-6 mr-3 text-[#191A23] flex-shrink-0" />
                          <span>{featuredEvent.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Navigation Dots */}
                  {featuredEvents.length > 1 && (
                    <div className="flex justify-center mt-8 pt-6">
                      <div className="flex items-center gap-3 p-3 bg-white/40 border border-white/40 rounded-lg">
                        <div className="flex gap-2">
                          {featuredEvents.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentFeaturedIndex(index)}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                index === currentFeaturedIndex
                                  ? "bg-[#191A23]"
                                  : "bg-[#191A23]/40 hover:bg-[#191A23]/60"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Events List Section */}
        <section className="py-12 bg-[#F3F3F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-3xl font-bold text-[#191A23]">
                  {showPastEvents ? "Past Events" : "Upcoming Events"}
                </h2>
                <p className="mt-2 text-[#191A23]/70">
                  Discover and participate in our events
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10 w-64 border-[#191A23]/20 focus:border-[#B9FF66] focus:ring-[#B9FF66]"
                  />
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="px-3 border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Single Toggle Button for Upcoming/Past */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm border border-[#191A23]/10 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setShowPastEvents(false)}
                  className={`px-6 py-3 rounded-md font-medium text-sm transition-all duration-300 ${
                    !showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#F3F3F3]"
                  }`}
                >
                  Upcoming Events
                </button>
                <button
                  onClick={() => setShowPastEvents(true)}
                  className={`px-6 py-3 rounded-md font-medium text-sm transition-all duration-300 ${
                    showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#F3F3F3]"
                  }`}
                >
                  Past Events
                </button>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-[#191A23]/10 p-12 text-center">
                <Calendar className="w-12 h-12 text-[#191A23]/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#191A23] mb-2">
                  No events found
                </h3>
                <p className="text-[#191A23]/70">
                  {searchTerm
                    ? `No events match "${searchTerm}"`
                    : showPastEvents
                    ? "No past events available"
                    : "No upcoming events at the moment"}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="mt-4 border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => {
                  const { Icon } = getEventIcon(event.id);
                  const isEventFull =
                    event.max_participants &&
                    (event.registration_count || 0) >= event.max_participants;
                  const isEventEnded = new Date(event.end_date) < new Date();

                  return (
                    <div
                      key={event.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        // You can implement event details modal or navigation here
                        console.log("View details for event:", event.id);
                      }}
                    >
                      {/* Square Box Container - No 3D effects */}
                      <div className="aspect-square rounded-lg overflow-hidden border border-[#191A23]/10 bg-white/80 backdrop-blur-sm relative">
                        {/* Simplified Electrical SVG Background */}
                        <div className="absolute inset-0 opacity-5">
                          <svg
                            className="w-full h-full"
                            viewBox="0 0 400 400"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              {/* Simple Circuit Pattern */}
                              <pattern
                                id={`circuit-${event.id}`}
                                x="0"
                                y="0"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                              >
                                <path
                                  d="M0 20 L40 20 M20 0 L20 40"
                                  stroke="#191A23"
                                  strokeWidth="0.5"
                                  opacity="0.3"
                                />
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="2"
                                  fill="#191A23"
                                  opacity="0.4"
                                />
                              </pattern>
                            </defs>

                            {/* Background Grid */}
                            <rect
                              width="400"
                              height="400"
                              fill={`url(#circuit-${event.id})`}
                            />

                            {/* Simple Circuit Paths */}
                            <path
                              d="M50 80 L150 80 L150 150 L250 150 L250 220 L350 220"
                              stroke="#191A23"
                              strokeWidth="2"
                              fill="none"
                              opacity="0.2"
                              strokeLinecap="round"
                            />

                            <path
                              d="M80 50 L80 120 L180 120 L180 200 L280 200 L280 300 L350 300"
                              stroke="#191A23"
                              strokeWidth="1.5"
                              fill="none"
                              opacity="0.2"
                              strokeLinecap="round"
                            />

                            {/* Simple Components */}
                            <circle
                              cx="150"
                              cy="80"
                              r="4"
                              fill="#191A23"
                              opacity="0.3"
                            />
                            <circle
                              cx="150"
                              cy="150"
                              r="4"
                              fill="#191A23"
                              opacity="0.3"
                            />
                            <circle
                              cx="250"
                              cy="150"
                              r="4"
                              fill="#191A23"
                              opacity="0.3"
                            />
                            <circle
                              cx="250"
                              cy="220"
                              r="4"
                              fill="#191A23"
                              opacity="0.3"
                            />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col">
                          {/* Header Section */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="bg-[#191A23] text-[#B9FF66] px-3 py-2 rounded-lg inline-block mb-3">
                                <div className="text-xs font-medium">
                                  {new Date(
                                    event.start_date
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </div>
                                <div className="text-lg font-bold">
                                  {new Date(event.start_date).getDate()}
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#B9FF66] p-3 rounded-lg">
                              <Icon className="w-6 h-6 text-[#191A23]" />
                            </div>
                          </div>

                          {/* Event Title */}
                          <h3 className="text-xl font-bold text-[#191A23] mb-3 line-clamp-2">
                            {event.title}
                          </h3>

                          {/* Event Details */}
                          <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center text-sm text-[#191A23]/70">
                              <Clock className="w-4 h-4 mr-2 text-[#191A23]/50" />
                              <span>
                                {new Date(event.start_date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </span>
                            </div>

                            {event.location && (
                              <div className="flex items-center text-sm text-[#191A23]/70">
                                <MapPin className="w-4 h-4 mr-2 text-[#191A23]/50" />
                                <span className="truncate">
                                  {event.location}
                                </span>
                              </div>
                            )}

                            {event.max_participants && (
                              <div className="flex items-center text-sm text-[#191A23]/70">
                                <Users className="w-4 h-4 mr-2 text-[#191A23]/50" />
                                <span>
                                  {event.registration_count || 0} /{" "}
                                  {event.max_participants}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Event Type Badge */}
                          {event.event_type && (
                            <div className="mb-4">
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-[#B9FF66]/80 text-[#191A23] rounded-full">
                                {event.event_type.charAt(0).toUpperCase() +
                                  event.event_type.slice(1)}
                              </span>
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-[#191A23]/70 text-sm line-clamp-3 mb-6 flex-1">
                            {event.description}
                          </p>

                          {/* Action Button */}
                          <div className="mt-auto">
                            {event.registration_required ? (
                              <Button
                                onClick={(e?: React.MouseEvent) => {
                                  e?.stopPropagation();
                                  handleRegister(event.id);
                                }}
                                disabled={
                                  registering || isEventFull || isEventEnded
                                }
                                className="w-full bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] py-3 rounded-lg disabled:bg-[#191A23]/40 transition-all duration-300"
                              >
                                {isEventFull ? (
                                  "Event Full"
                                ) : isEventEnded ? (
                                  "Event Ended"
                                ) : registering ? (
                                  "Registering..."
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Register Now
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="w-full text-center py-3 text-sm text-[#191A23]/70 border-2 border-[#191A23]/20 rounded-lg bg-[#F3F3F3]/80">
                                No Registration Required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Guest Registration Modal */}
      {registrationModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F3F3F3]/95 backdrop-blur-lg rounded-lg max-w-md w-full p-6 border border-[#191A23]/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#191A23]">
                Register for Event
              </h3>
              <button
                onClick={closeModal}
                className="text-[#191A23]/50 hover:text-[#191A23] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#B9FF66]/20 border border-[#B9FF66]/40 rounded-lg">
              <h4 className="font-medium text-[#191A23] text-sm">
                {registrationModal.event?.title}
              </h4>
              <p className="text-[#191A23]/70 text-xs mt-1">
                {registrationModal.event &&
                  new Date(
                    registrationModal.event.start_date
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#191A23] mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={guestFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuestFormData({
                      ...guestFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  className="border-[#191A23]/20 focus:border-[#B9FF66] focus:ring-[#B9FF66]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191A23] mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={guestFormData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuestFormData({
                      ...guestFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email address"
                  className="border-[#191A23]/20 focus:border-[#B9FF66] focus:ring-[#B9FF66]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191A23] mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={guestFormData.mobile_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuestFormData({
                      ...guestFormData,
                      mobile_number: e.target.value,
                    })
                  }
                  placeholder="Enter your phone number"
                  className="border-[#191A23]/20 focus:border-[#B9FF66] focus:ring-[#B9FF66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-1">
                    Year of Study
                  </label>
                  <select
                    value={guestFormData.year_of_study || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setGuestFormData({
                        ...guestFormData,
                        year_of_study: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full p-2 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] text-sm"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191A23] mb-1">
                    Department
                  </label>
                  <select
                    value={guestFormData.department || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setGuestFormData({
                        ...guestFormData,
                        department: e.target.value || undefined,
                      })
                    }
                    className="w-full p-2 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] text-sm"
                  >
                    <option value="">Select</option>
                    <option value="electrical">Electrical</option>
                    <option value="electronics">Electronics</option>
                    <option value="computer">Computer</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="civil">Civil</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66]/10"
                disabled={registering}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGuestRegistration}
                disabled={
                  registering ||
                  !guestFormData.name ||
                  !guestFormData.email
                }
                className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66]"
              >
                {registering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#B9FF66] mr-2"></div>
                    Registering...
                  </>
                ) : (
                  "Register Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
