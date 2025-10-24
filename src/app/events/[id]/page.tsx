"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, UserPlus, Clock, ArrowLeft, User } from "lucide-react";
import Image from "next/image";
import { eventsService, Event } from "@/services/eventsService";
import { getImageUrl } from "@/utils/api";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";

// Format date utility
const formatDate = (dateString: string) => {
  if (!dateString) return dateString;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Format time utility
const formatTime = (timeString: string) => {
  if (!timeString) return timeString;
  try {
    let date;
    if (timeString.includes("T")) {
      date = new Date(timeString);
    } else if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const today = new Date();
      date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(hours),
        parseInt(minutes)
      );
    } else {
      return timeString;
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
};

// Named function for the component
function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleRegister = () => {
    if (!event || isRegistering || isRegistered) {
      return;
    }

    if (!eventsService.isRegistrationOpen(event)) {
      alert("Registration is closed for this event.");
      return;
    }

    if (eventsService.isEventFull(event)) {
      alert("This event has reached maximum capacity.");
      return;
    }

    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    if (!event) return;

    try {
      setIsRegistering(true);

      const registrationPayload = {
        event: event.id,
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
        payment_reference: formData.payment_reference?.trim() || '',
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE_URL}/events/quick-register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      });

      if (response.ok) {
        setIsRegistered(true);
        setShowRegistrationModal(false);
        alert("🎉 Registration successful! We're excited to have you join us for this event.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (
          errorData.detail &&
          errorData.detail.includes("already registered")
        ) {
          setShowRegistrationModal(false);
          setIsRegistered(true);
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
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchEvent = async () => {
      try {
        if (!id) return;
        
        const eventData = await eventsService.getEvent(Number(id));
        
        if (!eventData) {
          throw new Error("Event not found");
        }

        // Only update state if component is still mounted
        if (!isCancelled) {
          setEvent(eventData);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        if (!isCancelled) {
          setError("Failed to load event details");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchEvent();
    }

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3F3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#191A23] mx-auto mb-4"></div>
          <p className="text-[#191A23]/70">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F3F3] p-4">
        <div className="backdrop-blur-xl bg-white/80 border border-white/40 shadow-lg rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Event not found"}</p>
          <Link
            href="/events"
            className="inline-flex items-center bg-[#191A23] text-[#B9FF66] px-6 py-3 rounded-xl font-medium hover:bg-[#2A2B35] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const flyerUrl = event.flyer_url || event.event_flyer;
  const bannerUrl = event.banner_image;
  const upiId = event.upi_id || event.payment_upi_id;

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      {/* Navigation */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/events"
            className="inline-flex items-center text-[#191A23] hover:text-[#191A23]/70 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      {/* Event Banner - Show First */}
      {bannerUrl && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-[#191A23] to-[#2A2B35]">
              <Image
                src={getImageUrl(bannerUrl) || bannerUrl}
                alt={`${event.title} Banner`}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                onClick={() => window.open(getImageUrl(bannerUrl) || bannerUrl, "_blank")}
              />
              {event.is_paid && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                  <span className="text-lg">💳</span>
                  Paid Event
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Event Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
            {event.title}
          </h1>

          {/* Date and Location */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-[#B9FF66]" />
              <span>
                {formatDate(event.start_date)}
                {event.end_date &&
                  event.end_date !== event.start_date &&
                  ` - ${formatDate(event.end_date)}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-[#B9FF66]" />
                <span>{event.location}</span>
              </div>
            )}
            {event.is_online && (
              <div className="flex items-center gap-2 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-medium">Online Event</span>
              </div>
            )}
          </div>

          {/* Online Meeting Link */}
          {event.is_online && event.meeting_link && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    Join Online Meeting
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    {event.is_ongoing 
                      ? "The event is live now! Click the button below to join." 
                      : event.is_upcoming
                      ? "The meeting link will be active when the event starts."
                      : "This event has ended."}
                  </p>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-5 py-2.5 rounded-lg font-medium transition-all shadow-md ${
                      event.is_ongoing
                        ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!event.is_ongoing) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {event.is_ongoing ? "Join Meeting Now" : "Meeting Link"}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#191A23] mb-3">
              About This Event
            </h2>
            <p className="text-[#191A23]/80 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Gallery Backlink */}
          {event.album && event.album.photo_count > 0 && (
            <div className="mb-6">
              <Link
                href={`/gallery?album=${event.album.id}`}
                className="inline-flex items-center text-[#191A23] hover:text-white bg-[#B9FF66] hover:bg-[#191A23] px-5 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Event Gallery ({event.album.photo_count} Photos)
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Event Flyer - Show Before Register Button */}
      {flyerUrl && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative h-auto bg-gradient-to-br from-[#191A23] to-[#2A2B35]">
              <Image
                src={getImageUrl(flyerUrl) || flyerUrl}
                alt={`${event.title} Flyer`}
                width={1200}
                height={1600}
                className="w-full h-auto object-contain cursor-pointer"
                onClick={() => window.open(getImageUrl(flyerUrl) || flyerUrl, "_blank")}
              />
            </div>
          </div>
        </section>
      )}

      {/* Registration Button - Centered at Bottom After Flyer */}
      {event.registration_required && event.is_registration_open && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <button
              onClick={handleRegister}
              disabled={isRegistered || isRegistering}
              className={`inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
                isRegistered
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "bg-[#191A23] text-[#B9FF66] hover:bg-[#2A2B35] hover:scale-105"
              }`}
            >
              <UserPlus className="w-6 h-6 mr-2" />
              {isRegistered ? "Already Registered" : "Register Now"}
            </button>
          </div>
        </section>
      )}

      {/* Speakers Section - Using speakers array from API */}
      {event.speakers && event.speakers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-[#B9FF66]" />
              Speakers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers
                .sort((a, b) => a.order - b.order)
                .map((speaker) => (
                  <div
                    key={speaker.id}
                    onClick={() => {
                      if (speaker.linkedin_url) {
                        window.open(speaker.linkedin_url, '_blank');
                      }
                    }}
                    className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all ${
                      speaker.linkedin_url ? 'cursor-pointer hover:border-[#B9FF66]' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-4">
                      {/* Speaker Photo */}
                      <div className="relative w-24 h-24 bg-gradient-to-br from-[#B9FF66] to-[#9DE052] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        {speaker.profile_image ? (
                          <img
                            src={speaker.profile_image}
                            alt={speaker.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-[#191A23]" />
                        )}
                        {speaker.linkedin_url && (
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Speaker Info */}
                      <div className="flex-1 w-full">
                        <h3 className="font-bold text-[#191A23] text-lg mb-1">
                          {speaker.name}
                        </h3>
                        {speaker.title && (
                          <p className="text-sm text-gray-600 font-medium mb-1">
                            {speaker.title}
                          </p>
                        )}
                        {speaker.organization && (
                          <p className="text-sm text-gray-500 mb-3">
                            {speaker.organization}
                          </p>
                        )}
                        {speaker.bio && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                            {speaker.bio}
                          </p>
                        )}
                        {speaker.linkedin_url && (
                          <div className="mt-3">
                            <span className="inline-flex items-center text-xs text-[#0077B5] font-medium">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              Click to view LinkedIn
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section - With schedule_date and speaker_name */}
      {event.schedule && event.schedule.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-[#B9FF66]" />
              Event Schedule
            </h2>
            <div className="space-y-4">
              {event.schedule.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#191A23] mb-2">
                        {item.title}
                      </h3>
                      {item.speaker_name && (
                        <p className="text-[#191A23]/70 mb-2">
                          <span className="font-medium">Speaker:</span>{" "}
                          {item.speaker_name}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[#191A23]/70 text-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 md:text-right">
                      {item.schedule_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-[#B9FF66]" />
                          <span>{formatDate(item.schedule_date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-[#B9FF66]" />
                        <span>
                          {formatTime(item.start_time)} -{" "}
                          {formatTime(item.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal with Payment Support */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleRegistrationSubmit}
        eventTitle={event.title}
        isRegistering={isRegistering}
        isPaidEvent={event.is_paid || event.payment_required}
        paymentQrCode={event.payment_qr_code ? getImageUrl(event.payment_qr_code) || event.payment_qr_code : undefined}
        paymentUpiId={upiId}
        registrationFee={event.registration_fee}
        paymentInstructions={event.payment_instructions}
      />
    </div>
  );
}

// Separate default export statement
export default EventDetailPage;
