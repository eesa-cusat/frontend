"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  Plus,
  UserPlus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event, GuestRegistrationData } from "@/types/api";
import Link from "next/link";

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

  // For demo purposes, we'll hide the create event button
  // In production, this would be controlled by staff login
  const canCreateEvents = false; // Always false for public access

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
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-black">Events</h1>
              <p className="mt-2 text-gray-600">
                Discover and participate in upcoming events
            </p>
          </div>
          {canCreateEvents && (
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Show past events</span>
            </label>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "There are no upcoming events at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
            <Link
                key={event.id}
                href={`/events/${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow block"
              >
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

                  {event.registration_required && (
                    <Button
                      onClick={e => { e.stopPropagation(); handleRegister(event); }}
                      disabled={
                        registering ||
                        (event.max_participants &&
                          (event.registration_count || 0) >=
                            event.max_participants) ||
                        new Date(event.end_date) < new Date()
                      }
                      className="w-full"
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
              </Link>
            ))}
          </div>
        )}

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
        </div>
      </div>
    </>
  );
}
