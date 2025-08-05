"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  Star,
  Zap,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Simplified Event interface
interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  event_type?: string;
  registration_required: boolean;
  banner_image?: string;
  is_featured?: boolean;
  max_participants?: number;
  registration_count?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Fetch events from Django API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/events/events/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure the events state is always an array
        const eventsArray = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        setEvents(eventsArray);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Set empty array if API fails - no mock data
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search and date
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = new Date(event.start_date);
    const today = new Date();
    const isUpcoming = eventDate >= today;

    if (showPastEvents) {
      return matchesSearch && !isUpcoming;
    } else {
      return matchesSearch && isUpcoming;
    }
  });

  // Get featured event for hero section
  const featuredEvent = events.find((event) => event.is_featured) || events[0];

  const handleRegister = async (eventId: number) => {
    try {
      // Simple registration - in real app this would open a form or redirect
      alert("Registration functionality would be implemented here");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#191A23] border-t-[#B9FF66] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#191A23] font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F3F3F3]">
        {/* Hero Section with Featured Event */}
        {featuredEvent && !showPastEvents && (
          <section className="relative overflow-hidden min-h-[70vh]">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[#F3F3F3]"></div>
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10">
              <div className="backdrop-blur-xl bg-[#F3F3F3]/60 border border-white/40 shadow-lg mx-4 my-8 rounded-2xl overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-16">
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Poster Image at Top */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white/80 border border-white/60 relative overflow-hidden w-48 aspect-[3/4] rounded-lg">
                        {featuredEvent.banner_image ? (
                          <Image
                            src={featuredEvent.banner_image}
                            alt={featuredEvent.title}
                            fill
                            className="object-cover"
                            sizes="192px"
                          />
                        ) : (
                          <div className="p-4 flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-[#191A23] flex items-center justify-center mx-auto mb-4 rounded-lg">
                                <Zap className="w-8 h-8 text-[#B9FF66]" />
                              </div>
                              <h3 className="text-lg font-bold text-[#191A23] mb-2">
                                EVENT
                              </h3>
                              <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                                {featuredEvent.event_type || "Conference"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Event Type Overlay */}
                        <div className="absolute top-2 left-2 bg-[#191A23]/90 text-[#B9FF66] px-2 py-1 text-xs font-medium rounded">
                          {featuredEvent.event_type || "Event"}
                        </div>
                        {/* Featured Badge */}
                        {featuredEvent.is_featured && (
                          <div className="absolute top-2 right-2 bg-[#B9FF66] text-[#191A23] px-2 py-1 text-xs font-bold rounded">
                            FEATURED
                          </div>
                        )}
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
                    {/* Left Column: Poster */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/80 border border-white/60 relative overflow-hidden w-48 lg:w-64 aspect-[3/4] rounded-lg mb-4">
                        {featuredEvent.banner_image ? (
                          <Image
                            src={featuredEvent.banner_image}
                            alt={featuredEvent.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 192px, 256px"
                          />
                        ) : (
                          <div className="p-4 lg:p-6 flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#191A23] flex items-center justify-center mx-auto mb-4 lg:mb-6 rounded-lg">
                                <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-[#B9FF66]" />
                              </div>
                              <h3 className="text-lg lg:text-xl font-bold text-[#191A23] mb-2">
                                EVENT
                              </h3>
                              <p className="text-[#191A23]/70 text-sm bg-white/60 px-3 py-1 rounded">
                                {featuredEvent.event_type || "Conference"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Overlays */}
                        <div className="absolute top-2 left-2 bg-[#191A23]/90 text-[#B9FF66] px-2 py-1 text-xs font-medium rounded">
                          {featuredEvent.event_type || "Event"}
                        </div>
                        {featuredEvent.is_featured && (
                          <div className="absolute top-2 right-2 bg-[#B9FF66] text-[#191A23] px-2 py-1 text-xs font-bold rounded">
                            FEATURED
                          </div>
                        )}
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
                    <div className="flex-1">
                      <div className="inline-block bg-[#191A23] text-[#B9FF66] px-4 py-2 text-sm font-medium mb-6 rounded-lg">
                        {new Date(featuredEvent.start_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
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

                      <h1 className="text-3xl lg:text-4xl font-bold text-[#191A23] leading-tight mb-6">
                        {featuredEvent.title}
                      </h1>

                      <p className="text-[#191A23]/80 text-lg leading-relaxed mb-6">
                        {featuredEvent.description}
                      </p>

                      <div className="grid gap-4 mb-6">
                        {featuredEvent.location && (
                          <div className="flex items-center text-[#191A23]/80 bg-white/40 p-4 border border-white/40 rounded-lg">
                            <MapPin className="w-6 h-6 mr-4 text-[#191A23] flex-shrink-0" />
                            <span className="text-lg">
                              {featuredEvent.location}
                            </span>
                          </div>
                        )}

                        {featuredEvent.max_participants && (
                          <div className="flex items-center text-[#191A23]/80 bg-white/40 p-4 border border-white/40 rounded-lg">
                            <Users className="w-6 h-6 mr-4 text-[#191A23] flex-shrink-0" />
                            <span className="text-lg">
                              {featuredEvent.registration_count || 0} /{" "}
                              {featuredEvent.max_participants} registered
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Events List Section */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#191A23] mb-4">
                {showPastEvents ? "Past Events" : "Upcoming Events"}
              </h2>
              <p className="text-[#191A23]/70 text-lg max-w-2xl mx-auto">
                {showPastEvents
                  ? "Discover the events we've successfully organized"
                  : "Join us for exciting upcoming events and workshops"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#191A23]/20 rounded-lg bg-white/80 text-[#191A23] placeholder-[#191A23]/50 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#191A23]/50 hover:text-[#191A23]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Toggle */}
              <div className="flex bg-white/80 border border-[#191A23]/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowPastEvents(false)}
                  className={`flex-1 px-6 py-3 font-medium transition-all duration-300 ${
                    !showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#191A23]/10"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setShowPastEvents(true)}
                  className={`flex-1 px-6 py-3 font-medium transition-all duration-300 ${
                    showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#191A23]/10"
                  }`}
                >
                  Past Events
                </button>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/80 border border-white/60 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-[#F3F3F3]">
                      {event.banner_image ? (
                        <Image
                          src={event.banner_image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-[#191A23] flex items-center justify-center mx-auto mb-2 rounded-lg">
                              <Calendar className="w-6 h-6 text-[#B9FF66]" />
                            </div>
                            <p className="text-[#191A23]/60 text-sm">
                              {event.event_type || "Event"}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Event Type Badge */}
                      <div className="absolute top-3 left-3 bg-[#191A23]/90 text-[#B9FF66] px-3 py-1 text-xs font-medium rounded">
                        {event.event_type || "Event"}
                      </div>
                      {/* Featured Badge */}
                      {event.is_featured && (
                        <div className="absolute top-3 right-3 bg-[#B9FF66] text-[#191A23] px-3 py-1 text-xs font-bold rounded">
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <div className="flex items-center text-[#191A23]/60 text-sm mb-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <Clock className="w-4 h-4 ml-4 mr-2" />
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

                      <h3 className="text-xl font-bold text-[#191A23] mb-3 line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-[#191A23]/70 mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {event.location && (
                        <div className="flex items-center text-[#191A23]/60 mb-4">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {event.location}
                          </span>
                        </div>
                      )}

                      {event.max_participants && (
                        <div className="flex items-center text-[#191A23]/60 mb-4">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">
                            {event.registration_count || 0} /{" "}
                            {event.max_participants} registered
                          </span>
                        </div>
                      )}

                      {event.registration_required && (
                        <Button
                          onClick={() => handleRegister(event.id)}
                          className="w-full bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] transition-all duration-300"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#191A23]/10 flex items-center justify-center mx-auto mb-4 rounded-full">
                  <Calendar className="w-8 h-8 text-[#191A23]/50" />
                </div>
                <h3 className="text-xl font-semibold text-[#191A23] mb-2">
                  {showPastEvents
                    ? "No Past Events Found"
                    : "No Upcoming Events"}
                </h3>
                <p className="text-[#191A23]/60">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : showPastEvents
                    ? "Check back later for past event archives"
                    : "Stay tuned for exciting events coming soon!"}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
