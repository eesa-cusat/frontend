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
        upi_reference_id: formData.upi_reference_id?.trim() || '',
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

  const flyerUrl = event.flyer_url || event.event_flyer || event.banner_image;
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

      {/* Event Flyer */}
      {flyerUrl && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative h-96 bg-gradient-to-br from-[#191A23] to-[#2A2B35]">
              <Image
                src={getImageUrl(flyerUrl) || flyerUrl}
                alt={event.title}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                onClick={() => window.open(getImageUrl(flyerUrl) || flyerUrl, "_blank")}
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
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#191A23] mb-3">
              About This Event
            </h2>
            <p className="text-[#191A23]/80 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Registration Button */}
          {event.registration_required && event.is_registration_open && (
            <div className="mb-6">
              <button
                onClick={handleRegister}
                disabled={isRegistered || isRegistering}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  isRegistered
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-[#191A23] text-[#B9FF66] hover:bg-[#2A2B35]"
                }`}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {isRegistered ? "Registered" : "Register Now"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Speakers Section - Using speaker_names array */}
      {event.speaker_names && event.speaker_names.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#191A23] mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-[#B9FF66]" />
              Speakers
            </h2>
            <div className="space-y-3">
              {event.speaker_names.map((speaker, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#191A23]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#191A23] text-base">{speaker}</h3>
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
