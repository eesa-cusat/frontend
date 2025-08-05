"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Users, UserPlus, Download } from "lucide-react";
import Image from "next/image";
import RegistrationModal, {
  RegistrationFormData,
} from "@/components/ui/RegistrationModal";

// Utility function to format time
const formatTime = (timeString: string) => {
  if (!timeString) return timeString;
  
  try {
    // Handle different time formats
    let date;
    if (timeString.includes('T')) {
      // ISO format: "2024-01-15T14:30:00" or "2025-09-24T09:24:26Z"
      date = new Date(timeString);
    } else if (timeString.includes(':')) {
      // Time only format: "14:30:00" or "14:30"
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
    } else {
      return timeString; // Return as-is if format is unrecognized
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString; // Return original if parsing fails
  }
};

// Utility function to format date and time
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return dateTimeString;
  
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateTimeString; // Return original if parsing fails
  }
};

// Utility function to format date only
const formatDate = (dateString: string) => {
  if (!dateString) return dateString;
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString; // Return original if parsing fails
  }
};

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  venue?: string;
  address?: string;
  is_online: boolean;
  meeting_link?: string;
  banner_image?: string;
  registration_required: boolean;
  registration_count: number;
  max_participants?: number;
  is_registration_open: boolean;
  registration_fee: number;
  registration_deadline?: string;
  payment_required: boolean;
  payment_qr_code?: string;
  payment_upi_id?: string;
  payment_instructions?: string;
  event_flyer?: string;
  speakers?: Speaker[];
  schedule?: ScheduleItem[];
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio?: string;
  profile_image?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
}

interface ScheduleItem {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  venue_details?: string;
  speaker?: Speaker;
}

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

    if (!event.is_registration_open) {
      alert("Registration is closed for this event.");
      return;
    }

    if (
      event.max_participants &&
      event.registration_count >= event.max_participants
    ) {
      alert("This event has reached maximum capacity.");
      return;
    }

    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    if (!event) return;

    try {
      setIsRegistering(true);
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

      const response = await fetch(
        `${apiBaseUrl}/events/events/${id}/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            mobile_number: formData.mobile_number.trim(),
            institution: formData.institution.trim(),
            department: formData.department.trim(),
            year_of_study: formData.year_of_study.trim(),
          }),
        }
      );

      if (response.ok) {
        setIsRegistered(true);
        setShowRegistrationModal(false);
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (
          errorData.detail &&
          errorData.detail.includes("already registered")
        ) {
          setIsRegistered(true);
          setShowRegistrationModal(false);
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
    const fetchEvent = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiBaseUrl}/events/events/${id}/`);

        if (!res.ok) {
          throw new Error(`Event not found (status ${res.status})`);
        }

        const data = await res.json();
        setEvent(data);
      } catch {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
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
              {formatDate(event.start_date)}
              {event.end_date &&
                event.start_date !== event.end_date &&
                ` - ${formatDate(event.end_date)}`}
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
              src={event.banner_image}
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

            {event.registration_fee > 0 && (
              <p className="text-gray-700 mb-2">
                Registration Fee: ₹{event.registration_fee}
              </p>
            )}

            {event.registration_deadline && (
              <p className="text-gray-700 mb-4">
                Deadline: {formatDateTime(event.registration_deadline)}
              </p>
            )}

            <div className="flex justify-center md:justify-start">
              <button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  isRegistered ||
                  !event.is_registration_open ||
                  Boolean(
                    event.max_participants &&
                      event.registration_count >= event.max_participants
                  )
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
                ) : !event.is_registration_open ? (
                  "Registration Closed"
                ) : event.max_participants &&
                  event.registration_count >= event.max_participants ? (
                  "Event Full"
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
                    href={event.event_flyer}
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
                src={event.event_flyer}
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
                      src={speaker.profile_image}
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
                      {speaker.twitter_url && (
                        <a
                          href={speaker.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          Twitter
                        </a>
                      )}
                      {speaker.website_url && (
                        <a
                          href={speaker.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:underline text-sm"
                        >
                          Website
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
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
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
