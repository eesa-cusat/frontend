"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";
import { getImageUrl } from "@/utils/api";

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
  event_flyer?: string;
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
  const [registeringEvents, setRegisteringEvents] = useState<Set<number>>(
    new Set()
  );
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] =
    useState<Event | null>(null);

  // Fetch events from Django API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Fetch events
        const eventsResponse = await fetch(`${API_BASE_URL}/events/events/`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!eventsResponse.ok) {
          throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        }
        const eventsData = await eventsResponse.json();
        const eventsArray = Array.isArray(eventsData.results)
          ? eventsData.results
          : [];

        // Fetch detailed data for each event to get event_flyer field
        const eventsWithFlyers = await Promise.all(
          eventsArray.map(async (event: Event) => {
            try {
              const detailResponse = await fetch(`${API_BASE_URL}/events/events/${event.id}/`);
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return {
                  ...event,
                  event_flyer: detailData.event_flyer || null
                };
              }
              return event;
            } catch (error) {
              console.error(`Failed to fetch details for event ${event.id}:`, error);
              return event;
            }
          })
        );

        setEvents(eventsWithFlyers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setEvents([]); // Set empty array if API fails
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

  const handleRegister = async (eventId: number) => {
    try {
      // Prevent multiple registration attempts
      if (registeringEvents.has(eventId)) {
        return;
      }

      // Find the event and open registration modal
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setSelectedEventForRegistration(event);
        setShowRegistrationModal(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    }
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    if (!selectedEventForRegistration) return;

    const eventId = selectedEventForRegistration.id;

    try {
      setRegisteringEvents((prev) => new Set([...prev, eventId]));

      const registrationPayload = {
        event: eventId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile_number: formData.mobile_number.trim(),
        institution: formData.institution.trim(),
        department: formData.department.trim(),
        year_of_study: formData.year_of_study.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/events/registrations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      });

      if (response.ok) {
        setShowRegistrationModal(false);
        setSelectedEventForRegistration(null);
        alert("Registration successful!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (
          errorData.detail &&
          errorData.detail.includes("already registered")
        ) {
          setShowRegistrationModal(false);
          setSelectedEventForRegistration(null);
          alert("You are already registered for this event.");
        } else {
          throw new Error(
            errorData.message ||
              errorData.detail ||
              `Registration failed (${response.status})`
          );
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setRegisteringEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
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
        {/* Events List Section */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* THIS IS THE UPDATED BLOCK */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              <div className="flex bg-white/80 border border-[#191A23]/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowPastEvents(false)}
                  className={`flex-1 sm:flex-none px-6 py-3 font-medium transition-all duration-300 ${
                    !showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#191A23]/10"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setShowPastEvents(true)}
                  className={`flex-1 sm:flex-none px-6 py-3 font-medium transition-all duration-300 ${
                    showPastEvents
                      ? "bg-[#191A23] text-[#B9FF66]"
                      : "text-[#191A23] hover:bg-[#191A23]/10"
                  }`}
                >
                  Past Events
                </button>
              </div>
            </div>
            {/* END OF UPDATED BLOCK */}
            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => window.open(`/events/${event.id}`, "_self")}
                    className="bg-white/80 border border-white/60 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-sm cursor-pointer group"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 bg-[#F3F3F3]">
                      {(event.event_flyer || event.banner_image) ? (
                        <Image
                          src={getImageUrl(event.event_flyer || event.banner_image) || ''}
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
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                        <Clock className="w-4 h-4 ml-4 mr-2" />
                        <span>
                          {new Date(event.start_date).toLocaleTimeString(
                            "en-US",
                            { hour: "numeric", minute: "2-digit", hour12: true }
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.id);
                          }}
                          disabled={registeringEvents.has(event.id)}
                          className={`w-full transition-all duration-300 ${
                            registeringEvents.has(event.id)
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66]"
                          }`}
                        >
                          {registeringEvents.has(event.id) ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Registering...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Register
                            </>
                          )}
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

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setSelectedEventForRegistration(null);
        }}
        onSubmit={handleRegistrationSubmit}
        eventTitle={selectedEventForRegistration?.title || ""}
        isRegistering={
          selectedEventForRegistration
            ? registeringEvents.has(selectedEventForRegistration.id)
            : false
        }
      />
    </>
  );
}
