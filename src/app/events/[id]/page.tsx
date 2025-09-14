"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, UserPlus, Download, Camera, ArrowRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { eventsService, Event } from "@/services/eventsService";
import { getImageUrl } from "@/utils/api";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";



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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Event not found"}</p>
          <Link href="/events" className="text-blue-600 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {event.event_type?.replace("_", " ").toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {eventsService.formatDate(event.start_date)}
              {event.end_date &&
                event.start_date !== event.end_date &&
                ` - ${eventsService.formatDate(event.end_date)}`}
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {event.location}
            </span>
          </div>

          {event.venue && (
            <p className="text-sm text-gray-600 mb-2">Venue: {event.venue}</p>
          )}

          {event.address && (
            <p className="text-sm text-gray-600 mb-2">
              Address: {event.address}
            </p>
          )}

          {event.is_online && event.meeting_link && (
            <a
              href={event.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline text-sm mb-4"
            >
              Join Online Meeting
            </a>
          )}
        </div>

        {/* Event Banner */}
        {event.banner_image ? (
          <div className="mb-8">
            <Image
              src={getImageUrl(event.banner_image) || ''}
              alt="Event Banner"
              width={800}
              height={400}
              className="rounded-lg w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-600 mb-2">
                  {event.title}
                </h3>
                <p className="text-blue-500 text-sm">
                  {event.event_type?.replace("_", " ").toUpperCase() || "EVENT"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>

        {/* Gallery Link */}
        {event.gallery_album_id && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#B9FF66]/20 to-[#B9FF66]/10 p-6 rounded-lg border border-[#B9FF66]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="w-6 h-6 text-[#191A23] mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#191A23]">Event Gallery</h3>
                    <p className="text-gray-600">
                      {event.photo_count && event.photo_count > 0 
                        ? `View ${event.photo_count} photos from this event` 
                        : "Photo album available for this event"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/gallery?album=${event.gallery_album_id}`}
                  className="flex items-center text-[#191A23] hover:text-gray-700 bg-[#B9FF66] hover:bg-[#B9FF66]/80 px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  View Gallery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Registration Section */}
        {event.registration_required && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Registration
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">
                {event.registration_count} / {event.max_participants || "∞"}{" "}
                participants
              </span>
              <span
                className={`text-sm font-medium ${
                  event.is_registration_open ? "text-green-600" : "text-red-600"
                }`}
              >
                {event.is_registration_open
                  ? "Registration Open"
                  : "Registration Closed"}
              </span>
            </div>

            {event.registration_fee && parseFloat(event.registration_fee) > 0 && (
              <p className="text-gray-700 mb-2">
                Registration Fee: ₹{event.registration_fee}
              </p>
            )}

            {event.registration_deadline && (
              <p className="text-gray-700 mb-4">
                Deadline: {eventsService.formatDateTime(event.registration_deadline)}
              </p>
            )}

            <div className="flex justify-center md:justify-start">
              <button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  isRegistered ||
                  !eventsService.isRegistrationOpen(event) ||
                  eventsService.isEventFull(event)
                }
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 ${
                  isRegistered
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : isRegistering ||
                      !event.is_registration_open ||
                      (event.max_participants &&
                        event.registration_count >= event.max_participants)
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66] hover:shadow-lg"
                }`}
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : isRegistered ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Registered
                  </>
                ) : !eventsService.isRegistrationOpen(event) ? (
                  eventsService.isEventFull(event) ? "Event Full" : "Registration Closed"
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Event Flyer */}
        {event.event_flyer && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Flyer</h2>
            {event.event_flyer.endsWith(".pdf") ? (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-center">
                  <Download className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">PDF Flyer Available</p>
                  <a
                    href={getImageUrl(event.event_flyer) || event.event_flyer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Flyer
                  </a>
                </div>
              </div>
            ) : (
              <Image
                src={getImageUrl(event.event_flyer) || ''}
                alt="Event Flyer"
                width={800}
                height={600}
                className="rounded-lg w-full object-cover"
              />
            )}
          </div>
        )}

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Speakers</h2>
            <div className="grid gap-6">
              {event.speakers.map((speaker, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  {speaker.profile_image ? (
                    <Image
                      src={getImageUrl(speaker.profile_image) || ''}
                      alt={speaker.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{speaker.name}</h3>
                    <p className="text-gray-700 mb-2">{speaker.title} at {speaker.organization}</p>
                    {speaker.bio && (
                      <p className="text-gray-600 text-sm mb-3">{speaker.bio}</p>
                    )}
                    <div className="flex gap-3">
                      {speaker.linkedin_url && (
                        <a
                          href={speaker.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          LinkedIn
                        </a>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {event.schedule && event.schedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Schedule</h2>
            <div className="space-y-4">
              {event.schedule.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  <div className="text-sm text-gray-500 mb-2">
                    {eventsService.formatTime(item.start_time)} - {eventsService.formatTime(item.end_time)}
                    {item.venue_details && ` | Venue: ${item.venue_details}`}
                  </div>
                  {item.speaker && (
                    <p className="text-sm text-gray-700">Speaker: {item.speaker.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {(event.contact_person || event.contact_email || event.contact_phone) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              {event.contact_person && (
                <p className="text-gray-700 mb-2">Contact Person: {event.contact_person}</p>
              )}
              {event.contact_email && (
                <p className="text-gray-700 mb-2">
                  Email: <a href={`mailto:${event.contact_email}`} className="text-blue-600 hover:underline">{event.contact_email}</a>
                </p>
              )}
              {event.contact_phone && (
                <p className="text-gray-700">
                  Phone: <a href={`tel:${event.contact_phone}`} className="text-blue-600 hover:underline">{event.contact_phone}</a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Back to Events Link */}
        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300"
          >
            ← Back to Events
          </Link>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleRegistrationSubmit}
        eventTitle={event.title}
        isRegistering={isRegistering}
      />
    </div>
  );
}

// Separate default export statement
export default EventDetailPage;
