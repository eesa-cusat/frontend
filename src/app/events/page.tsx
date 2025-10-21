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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";
import LazyImage from "@/components/ui/LazyImage";
import { getImageUrl } from "@/utils/api";
import { useToast } from "@/components/ui/Toast";
import { useSeamlessNavigation, useProgressiveLoading } from "@/lib/seamlessNavigation";

// Enhanced Event interface with gallery support
interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  venue?: string;
  event_type?: string;
  registration_required: boolean;
  banner_image?: string;
  event_flyer?: string;
  flyer_url?: string;
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
  // Seamless navigation and caching
  const {
    isPageCached,
    isDataLoaded,
    markVisited,
    cachePage,
    getCachedData,
    hasGlobalCacheData,
    getGlobalCacheData,
    storeInGlobalCache,
    ensurePrefetch,
    isPrefetching,
    isInitialPrefetchDone
  } = useSeamlessNavigation('events');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOrganization, setFilterOrganization] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [registeringEvents, setRegisteringEvents] = useState<Set<number>>(
    new Set()
  );

  // Progressive loading for images
  const { markImageLoaded, isImageLoaded, isImagesLoading } = useProgressiveLoading(events);
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
      case 'completed': return 'bg-[#191A23]/10 text-[#191A23]';
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
      case 'industry connect': return 'bg-[#191A23]/10 text-[#191A23]';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical': return 'from-purple-500 to-indigo-600';
      case 'workshop': return 'from-orange-500 to-red-600';
      case 'seminar': return 'from-blue-500 to-cyan-600';
      case 'festival': return 'from-pink-500 to-rose-600';
      case 'industry connect': return 'from-[#191A23] to-gray-700';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  // Optimized fetch events from Django API with caching
  useEffect(() => {
    const fetchEvents = async (useCache = true) => {
      try {
        // Check cache first for instant loading
        if (useCache && searchQuery === "" && !showPastEvents && filterType === "all") {
          const cachedData = getGlobalCacheData('events', 'list', currentPage);
          
          if (cachedData) {
            const eventsArray = Array.isArray(cachedData.results) ? cachedData.results : [];
            setEvents(eventsArray);
            setTotalCount(cachedData.count || 0);
            setTotalPages(Math.ceil((cachedData.count || 0) / 12));
            setLoading(false);
            return;
          }
        }

        setLoading(true);

        // Fetch events with pagination - EventListSerializer now includes event_flyer
        const url = new URL(`${API_BASE_URL}/events/`);
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('page_size', '12');

        const eventsResponse = await fetch(url.toString(), {
          headers: { "Content-Type": "application/json" },
        });

        if (!eventsResponse.ok) {
          throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        }
        
        const eventsData = await eventsResponse.json();
        const eventsArray = Array.isArray(eventsData.results)
          ? eventsData.results
          : [];
        
        // Update pagination info
        setTotalCount(eventsData.count || 0);
        setTotalPages(Math.ceil((eventsData.count || 0) / 12));

        // No need for secondary API calls - event_flyer is now in the list response
        setEvents(eventsArray);
        
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]); // Set empty array if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage]);

  // Initialize page with cache awareness
  useEffect(() => {
    // Mark page as visited for cache management
    markVisited();
    
    // Start prefetch if not done
    ensurePrefetch();
    
    // Load cached page state
    const cachedData = getCachedData();
    if (cachedData) {
      setEvents(cachedData.events || []);
      setCurrentPage(cachedData.currentPage || 1);
      setSearchQuery(cachedData.searchQuery || "");
      setShowPastEvents(cachedData.showPastEvents || false);
      setFilterType(cachedData.filterType || "all");
    }
  }, [markVisited, ensurePrefetch, getCachedData]);

  // Cache page state when events change
  useEffect(() => {
    if (events.length > 0) {
      const pageState = {
        events,
        currentPage,
        searchQuery,
        showPastEvents,
        filterType,
        filterStatus,
        totalCount,
        totalPages
      };
      cachePage(() => null, pageState); // Use null as component since we're just caching data
    }
  }, [events, currentPage, searchQuery, showPastEvents, filterType, filterStatus, totalCount, totalPages, cachePage]);

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
    
    // Organization filter - determine if event is EESA organized or external
    const isEESAEvent = !event.location || 
      event.location.toLowerCase().includes('eesa') || 
      event.location.toLowerCase().includes('cusat') ||
      event.venue?.toLowerCase().includes('eesa') ||
      event.venue?.toLowerCase().includes('cusat');
    
    const matchesOrganization = filterOrganization === "all" || 
      (filterOrganization === "eesa" && isEESAEvent) ||
      (filterOrganization === "external" && !isEESAEvent);

    if (showPastEvents) {
      return matchesSearch && !isUpcoming && matchesType && matchesStatus && matchesOrganization;
    } else {
      return matchesSearch && isUpcoming && matchesType && matchesStatus && matchesOrganization;
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
        institution: formData.institution?.trim() || '',
        department: formData.department?.trim() || '',
        year_of_study: formData.year_of_study?.trim() || '',
        organization: formData.organization?.trim() || '',
        designation: formData.designation?.trim() || '',
        dietary_requirements: formData.dietary_requirements?.trim() || '',
        special_needs: formData.special_needs?.trim() || '',
      };

      const response = await fetch(`${API_BASE_URL}/events/quick-register/`, {
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

      <div className="min-h-screen bg-[#F3F3F3] font-sans">
        {/* Hero Section - Quarter Height */}
        <section className="h-[25vh] min-h-[300px] bg-gradient-to-b from-[#F3F3F3] to-white flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#191A23] rounded-2xl flex items-center justify-center mr-4 shadow-lg transform rotate-3">
                  <Calendar className="w-8 h-8 text-[#B9FF66]" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191A23]">
                  Events
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
                Discover cutting-edge workshops, inspiring seminars, and transformative technical events
              </p>
              

            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search events by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 text-[#191A23] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent focus:bg-white transition-all duration-300"
                  />
                </div>

                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-4 bg-[#191A23] hover:bg-[#2A2B35] text-[#B9FF66] rounded-xl transition-all duration-300 shadow-lg font-medium text-sm md:text-base"
                  >
                    <Filter className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-md">
                    <button
                      onClick={() => setShowPastEvents(false)}
                      className={`px-3 py-2 md:px-6 md:py-4 font-semibold transition-all duration-300 text-sm md:text-base ${
                        !showPastEvents
                          ? "bg-[#191A23] text-[#B9FF66] shadow-lg"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setShowPastEvents(true)}
                      className={`px-3 py-2 md:px-6 md:py-4 font-semibold transition-all duration-300 text-sm md:text-base ${
                        showPastEvents
                          ? "bg-[#191A23] text-[#B9FF66] shadow-lg"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Past
                    </button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-8 p-8 bg-[#F3F3F3] rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#191A23] mb-3">Event Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all duration-300"
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
                      <label className="block text-sm font-bold text-[#191A23] mb-3">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#191A23] mb-3">Organization</label>
                      <select
                        value={filterOrganization}
                        onChange={(e) => setFilterOrganization(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#191A23] focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Organizations</option>
                        <option value="eesa">EESA Events</option>
                        <option value="external">External Events</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setFilterType("all");
                          setFilterStatus("all");
                          setFilterOrganization("all");
                          setSearchQuery("");
                        }}
                        className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.start_date);
                const today = new Date();
                const eventStatus = eventDate >= today ? 'upcoming' : 'completed';
                
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#B9FF66] cursor-pointer"
                    onClick={() => window.location.href = `/events/${event.id}`}
                  >
                    {/* Cover Photo - Using Image component like homepage EventCard */}
                    <div className="relative h-32 md:h-36 overflow-hidden">
                      {(event.event_flyer || event.banner_image || event.flyer_url) ? (
                        <>
                          <Image
                            src={getImageUrl(event.event_flyer || event.banner_image || event.flyer_url) || ""}
                            alt={event.title}
                            fill
                            className="object-cover transition-all duration-500 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                        </>
                      ) : (
                        <>
                          {/* Electrical circuit background pattern as fallback */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                          <svg
                            className="absolute inset-0 w-full h-full opacity-10"
                            viewBox="0 0 200 150"
                            fill="none"
                          >
                            <path
                              d="M20 30 L180 30 M20 60 L100 60 L100 90 L180 90 M20 120 L60 120 L60 60"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                            <circle cx="60" cy="30" r="3" fill="#191A23" />
                            <circle cx="100" cy="60" r="3" fill="#191A23" />
                            <circle cx="180" cy="90" r="3" fill="#191A23" />
                            <rect
                              x="140"
                              y="25"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                            <rect
                              x="80"
                              y="85"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="#191A23"
                              strokeWidth="1"
                            />
                          </svg>
                        </>
                      )}
                      {/* Status badges overlay */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(eventStatus)}`}>
                          {eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getTypeColor(event.event_type || 'event')}`}>
                          {event.event_type || 'Event'}
                        </span>
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-md text-xs font-semibold flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-[#191A23] mb-1 line-clamp-2">{event.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-[#191A23]">
                          <Calendar className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                          <span className="font-medium truncate">{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-[#191A23]">
                          <Clock className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                          <span className="font-medium truncate">
                            {formatTime(event.start_date)} - {formatTime(event.end_date || event.start_date)}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm text-[#191A23]">
                            <MapPin className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                            <span className="font-medium truncate">{event.location}</span>
                          </div>
                        )}
                        {event.registration_required && event.max_participants && (
                          <div className="flex items-center text-sm text-[#191A23]">
                            <Users className="w-4 h-4 mr-2 text-gray-600 flex-shrink-0" />
                            <span className="font-medium">
                              {event.registration_count || 0}/{event.max_participants} registered
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/events/${event.id}`;
                          }}
                          className="flex items-center text-[#191A23] hover:text-gray-700 bg-[#B9FF66]/20 hover:bg-[#B9FF66]/30 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                          {event.speakers ? `${event.speakers.length} speaker${event.speakers.length > 1 ? 's' : ''}` : ''}
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNumber === currentPage
                          ? 'bg-[#191A23] text-[#B9FF66] font-semibold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
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
