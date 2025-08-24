"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  UserPlus,
  Search,
  X,
  Camera,
  ArrowRight,
  Image as ImageIcon,
  Eye,
  Filter,
  ChevronDown,
  Star,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";
import { getImageUrl } from "@/utils/api";
import { useToast } from "@/components/ui/Toast";

// Enhanced Event interface with gallery support
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
  status?: string;
  gallery_album_id?: number;
  photo_count?: number;
  speakers?: string[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeringEvents, setRegisteringEvents] = useState<Set<number>>(
    new Set()
  );
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(
    new Set()
  );
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] =
    useState<Event | null>(null);

  // Toast notifications
  const { showSuccess, showError, ToastContainer } = useToast();

  // Utility functions for styling and formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'seminar': return 'bg-blue-100 text-blue-800';
      case 'festival': return 'bg-pink-100 text-pink-800';
      case 'industry connect': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical': return 'from-purple-500 to-indigo-600';
      case 'workshop': return 'from-orange-500 to-red-600';
      case 'seminar': return 'from-blue-500 to-cyan-600';
      case 'festival': return 'from-pink-500 to-rose-600';
      case 'industry connect': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

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
              const detailResponse = await fetch(
                `${API_BASE_URL}/events/events/${event.id}/`
              );
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                return {
                  ...event,
                  event_flyer: detailData.event_flyer || null,
                };
              }
              return event;
            } catch (error) {
              console.error(
                `Failed to fetch details for event ${event.id}:`,
                error
              );
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

  // Enhanced filtering with type and status filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = new Date(event.start_date);
    const today = new Date();
    const isUpcoming = eventDate >= today;
    
    // Determine event status
    const eventStatus = isUpcoming ? 'upcoming' : 'completed';
    
    const matchesType = filterType === "all" || 
      (event.event_type && event.event_type.toLowerCase() === filterType.toLowerCase());
    const matchesStatus = filterStatus === "all" || eventStatus === filterStatus;

    if (showPastEvents) {
      return matchesSearch && !isUpcoming && matchesType && matchesStatus;
    } else {
      return matchesSearch && isUpcoming && matchesType && matchesStatus;
    }
  });

  const handleRegister = async (eventId: number) => {
    try {
      // Prevent multiple registration attempts or registering already registered events
      if (registeringEvents.has(eventId) || registeredEvents.has(eventId)) {
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
      showError(
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
        // Mark event as registered
        setRegisteredEvents((prev) => new Set([...prev, eventId]));
        showSuccess(
          "🎉 Registration successful! We're excited to have you join us for this event."
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (
          errorData.detail &&
          errorData.detail.includes("already registered")
        ) {
          setShowRegistrationModal(false);
          setSelectedEventForRegistration(null);
          // Mark event as registered since they're already registered
          setRegisteredEvents((prev) => new Set([...prev, eventId]));
          showError("You are already registered for this event.");
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
      showError(
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
      {/* Toast Container */}
      <ToastContainer />

      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="bg-[#B9FF66] text-[#191A23] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Calendar className="w-16 h-16 mr-4 text-[#191A23]" />
                <h1 className="text-4xl md:text-6xl font-bold text-[#191A23]">
                  Events
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#191A23]">
                Discover workshops, seminars, and technical events that shape your engineering journey
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-lg text-[#191A23]">
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                  <Ticket className="w-5 h-5 mr-2" />
                  <span>{events.length} Events</span>
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                  <Camera className="w-5 h-5 mr-2" />
                  <span>{events.filter(e => e.gallery_album_id).length} Photo Albums</span>
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 mr-2" />
                  <span>1000+ Participants</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] transition-colors text-[#191A23]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#B9FF66] hover:bg-[#a8e25d] text-[#191A23] rounded-lg transition-colors shadow-md"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowPastEvents(false)}
                    className={`px-6 py-3 font-medium transition-all duration-300 ${
                      !showPastEvents
                        ? "bg-[#191A23] text-[#B9FF66]"
                        : "text-[#191A23] hover:bg-[#191A23]/10"
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setShowPastEvents(true)}
                    className={`px-6 py-3 font-medium transition-all duration-300 ${
                      showPastEvents
                        ? "bg-[#191A23] text-[#B9FF66]"
                        : "text-[#191A23] hover:bg-[#191A23]/10"
                    }`}
                  >
                    Past Events
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 p-6 bg-[#B9FF66]/10 rounded-lg border border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#191A23] mb-2">Event Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] bg-white text-[#191A23]"
                    >
                      <option value="all">All Types</option>
                      <option value="technical">Technical</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="festival">Festival</option>
                      <option value="industry connect">Industry Connect</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#191A23] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B9FF66] focus:border-[#B9FF66] bg-white text-[#191A23]"
                    >
                      <option value="all">All Events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilterType("all");
                        setFilterStatus("all");
                        setSearchQuery("");
                      }}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#191A23]">
                {showPastEvents ? "Past Events" : "Upcoming Events"}
              </h2>
              <span className="text-[#191A23] font-semibold bg-[#B9FF66]/20 px-4 py-2 rounded-full">
                {filteredEvents.length} events found
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.start_date);
                const today = new Date();
                const eventStatus = eventDate >= today ? 'upcoming' : 'completed';
                
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#B9FF66]"
                  >
                    {/* Cover Photo */}
                    <div className={`relative h-48 bg-gradient-to-r ${getCoverGradient(event.event_type || 'default')} rounded-lg mb-4 overflow-hidden`}>
                      {event.event_flyer || event.banner_image ? (
                        <Image
                          src={getImageUrl(event.event_flyer || event.banner_image) || ""}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-80" />
                              <p className="text-sm font-medium opacity-90">Event Cover Photo</p>
                              <p className="text-xs opacity-70">{event.title}</p>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Status badges overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(eventStatus)}`}>
                          {eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(event.event_type || 'event')}`}>
                          {event.event_type || 'Event'}
                        </span>
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#191A23] mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-[#191A23]">
                          <Calendar className="w-4 h-4 mr-3 text-gray-600" />
                          <span className="font-medium">{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-[#191A23]">
                          <Clock className="w-4 h-4 mr-3 text-gray-600" />
                          <span className="font-medium">
                            {formatTime(event.start_date)} - {formatTime(event.end_date || event.start_date)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm text-[#191A23]">
                            <MapPin className="w-4 h-4 mr-3 text-gray-600" />
                            <span className="font-medium">{event.location}</span>
                          </div>
                        )}
                        {event.registration_required && event.max_participants && (
                          <div className="flex items-center text-sm text-[#191A23]">
                            <Users className="w-4 h-4 mr-3 text-gray-600" />
                            <span className="font-medium">
                              {event.registration_count || 0}/{event.max_participants} registered
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Gallery Connection */}
                      {event.gallery_album_id && event.photo_count && event.photo_count > 0 && (
                        <div className="bg-[#B9FF66]/10 p-4 rounded-lg mb-4 border border-[#B9FF66]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Camera className="w-5 h-5 text-[#191A23] mr-2" />
                              <div>
                                <p className="text-sm font-semibold text-[#191A23]">Event Photos Available</p>
                                <p className="text-xs text-gray-600">{event.photo_count} photos in gallery</p>
                              </div>
                            </div>
                            <Link
                              href={`/gallery?album=${event.gallery_album_id}`}
                              className="flex items-center text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/30 hover:bg-[#B9FF66]/50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              View Photos
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="flex items-center text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/20 hover:bg-[#B9FF66]/30 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                          {eventStatus === 'upcoming' && event.registration_required && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!registeredEvents.has(event.id)) {
                                  handleRegister(event.id);
                                }
                              }}
                              disabled={
                                registeringEvents.has(event.id) ||
                                registeredEvents.has(event.id)
                              }
                              className={`transition-all duration-300 ${
                                registeredEvents.has(event.id)
                                  ? "bg-green-500 text-white cursor-default"
                                  : registeringEvents.has(event.id)
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              {registeredEvents.has(event.id) ? (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Registered ✓
                                </>
                              ) : registeringEvents.has(event.id) ? (
                                <>
                                  <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Register
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {event.speakers ? `${event.speakers.length} speaker${event.speakers.length > 1 ? 's' : ''}` : 'Event Details'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredEvents.length === 0 && (
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

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-[#191A23] mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(new Date(selectedEvent.start_date) >= new Date() ? 'upcoming' : 'completed')}`}>
                        {new Date(selectedEvent.start_date) >= new Date() ? 'Upcoming' : 'Completed'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(selectedEvent.event_type || 'event')}`}>
                        {selectedEvent.event_type || 'Event'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    {/* Large Cover Photo */}
                    <div className={`relative bg-gradient-to-r ${getCoverGradient(selectedEvent.event_type || 'default')} rounded-xl h-64 mb-6 overflow-hidden`}>
                      {selectedEvent.event_flyer || selectedEvent.banner_image ? (
                        <Image
                          src={getImageUrl(selectedEvent.event_flyer || selectedEvent.banner_image) || ""}
                          alt={selectedEvent.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/30"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Calendar className="w-20 h-20 mx-auto mb-3 opacity-90" />
                              <p className="text-lg font-semibold mb-1">{selectedEvent.title}</p>
                              <p className="text-sm opacity-80">Event Cover Photo</p>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(new Date(selectedEvent.start_date) >= new Date() ? 'upcoming' : 'completed')}`}>
                          {new Date(selectedEvent.start_date) >= new Date() ? 'Upcoming' : 'Completed'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedEvent.event_type || 'event')}`}>
                          {selectedEvent.event_type || 'Event'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[#B9FF66]/10 p-4 rounded-lg">
                        <h3 className="font-bold text-[#191A23] mb-3">Event Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{formatDate(selectedEvent.start_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{formatTime(selectedEvent.start_date)} - {formatTime(selectedEvent.end_date || selectedEvent.start_date)}</span>
                          </div>
                          {selectedEvent.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              <span>{selectedEvent.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedEvent.gallery_album_id && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="font-bold text-[#191A23] mb-3 flex items-center">
                            <Camera className="w-5 h-5 mr-2" />
                            Event Gallery
                          </h3>
                          <p className="text-sm text-gray-700 mb-3">
                            {selectedEvent.photo_count || 0} photos available from this event
                          </p>
                          <Link
                            href={`/gallery?album=${selectedEvent.gallery_album_id}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-colors font-medium"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            View Event Photos
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-[#191A23] mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                    </div>

                    {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                      <div>
                        <h3 className="font-bold text-[#191A23] mb-3">Speakers</h3>
                        <div className="space-y-2">
                          {selectedEvent.speakers.map((speaker: string, index: number) => (
                            <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                              <Users className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-[#191A23] font-medium">{speaker}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEvent.registration_required && selectedEvent.max_participants && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-bold text-[#191A23] mb-3">Registration</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Registered:</span>
                            <span className="font-semibold">{selectedEvent.registration_count || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Capacity:</span>
                            <span className="font-semibold">{selectedEvent.max_participants}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{width: `${((selectedEvent.registration_count || 0) / selectedEvent.max_participants) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
