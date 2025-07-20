"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Calendar, Clock, MapPin, Users, UserPlus, Download } from "lucide-react";
import Image from "next/image";

const PdfViewer = dynamic(() => import("@/components/ui/PdfViewer"), { ssr: false });

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      setHttpStatus(null);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
        const apiUrl = `${apiBaseUrl}/events/events/${id}/`;
        const res = await fetch(apiUrl);
        setHttpStatus(res.status);
        if (!res.ok) {
          let errText = await res.text();
          setDebugInfo({ apiUrl, status: res.status, error: errText });
          throw new Error(`Event not found (status ${res.status})`);
        }
        const data = await res.json();
        setEvent(data);
        setDebugInfo({ apiUrl, status: res.status, data });
      } catch (err: any) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
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
          <Link href="/events" className="text-blue-600 hover:underline">Back to Events</Link>
          {/* Debug Info */}
          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded text-left text-xs text-gray-700 max-w-xl mx-auto break-all">
              <div><b>Debug Info</b></div>
              <div><b>Event ID:</b> {String(id)}</div>
              <div><b>API URL:</b> {debugInfo.apiUrl}</div>
              <div><b>HTTP Status:</b> {debugInfo.status}</div>
              <div><b>API Response/Error:</b></div>
              <pre className="whitespace-pre-wrap">{typeof debugInfo.error === 'string' ? debugInfo.error : JSON.stringify(debugInfo.data || debugInfo.error, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {event.title}
        </h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {event.event_type?.replace("_", " ").toUpperCase()}
          </span>
          <span className="text-sm text-gray-500">Status: {event.status}</span>
          <span className="text-sm text-gray-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            {event.start_date} {event.end_date && event.start_date !== event.end_date && `- ${event.end_date}`}
          </span>
          <span className="text-sm text-gray-500">
            <MapPin className="w-4 h-4 inline mr-1" />
            {event.location}
          </span>
          {event.venue && <span className="text-sm text-gray-500">Venue: {event.venue}</span>}
          {event.address && <span className="text-sm text-gray-500">Address: {event.address}</span>}
          {event.is_online && event.meeting_link && (
            <span className="text-sm text-blue-600 underline">
              <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">Join Online</a>
            </span>
          )}
        </div>
        {event.banner_image && (
          <div className="mb-6">
            <Image src={event.banner_image} alt="Event Banner" width={800} height={300} className="rounded-lg w-full object-cover" />
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>
        {/* Registration Info */}
        {event.registration_required && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Registration</h2>
            <div className="flex items-center gap-4 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">
                {event.registration_count || 0} / {event.max_participants || '∞'} participants
              </span>
              <span className="text-gray-700">{event.is_registration_open ? "Registration Open" : "Registration Closed"}</span>
            </div>
            {event.registration_fee > 0 && (
              <div className="text-gray-700 mb-2">Fee: ₹{event.registration_fee}</div>
            )}
            {event.registration_deadline && (
              <div className="text-gray-700 mb-2">Deadline: {event.registration_deadline}</div>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Register
            </button>
          </div>
        )}
        {/* Payment Info */}
        {event.payment_required && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Information</h2>
            {event.payment_qr_code && (
              <div className="mb-2">
                <Image src={event.payment_qr_code} alt="Payment QR Code" width={200} height={200} className="rounded" />
              </div>
            )}
            {event.payment_upi_id && <div className="text-gray-700 mb-2">UPI ID: {event.payment_upi_id}</div>}
            {event.payment_instructions && <div className="text-gray-700 mb-2">{event.payment_instructions}</div>}
          </div>
        )}
        {/* Event Flyer (PDF or image) */}
        {event.event_flyer && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Event Flyer</h2>
            {event.event_flyer.endsWith('.pdf') ? (
              <div className="bg-gray-100 rounded-lg p-4">
                <PdfViewer fileUrl={event.event_flyer} fileName={event.title + " Flyer"} isOpen={true} onClose={() => {}} />
              </div>
            ) : (
              <Image src={event.event_flyer} alt="Event Flyer" width={800} height={600} className="rounded-lg w-full object-cover" />
            )}
          </div>
        )}
        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Speakers</h2>
            <div className="space-y-4">
              {event.speakers.map((speaker: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  {speaker.profile_image && (
                    <Image src={speaker.profile_image} alt={speaker.name} width={64} height={64} className="rounded-full w-16 h-16 object-cover" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{speaker.name}</div>
                    <div className="text-gray-700">{speaker.title} at {speaker.organization}</div>
                    {speaker.bio && <div className="text-gray-600 text-sm mt-1">{speaker.bio}</div>}
                    <div className="flex gap-2 mt-1">
                      {speaker.linkedin_url && <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">LinkedIn</a>}
                      {speaker.twitter_url && <a href={speaker.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs">Twitter</a>}
                      {speaker.website_url && <a href={speaker.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 underline text-xs">Website</a>}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Schedule</h2>
            <div className="space-y-4">
              {event.schedule.map((item: any, idx: number) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-gray-700 text-sm">{item.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.start_time} - {item.end_time}
                    {item.venue_details && <> | Venue: {item.venue_details}</>}
                  </div>
                  {item.speaker && (
                    <div className="mt-2 text-xs text-gray-700">Speaker: {item.speaker.name}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Contact Info */}
        {(event.contact_person || event.contact_email || event.contact_phone) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact</h2>
            {event.contact_person && <div className="text-gray-700">Person: {event.contact_person}</div>}
            {event.contact_email && <div className="text-gray-700">Email: {event.contact_email}</div>}
            {event.contact_phone && <div className="text-gray-700">Phone: {event.contact_phone}</div>}
          </div>
        )}
        {/* Feedback/Stats (optional, if available) */}
        {/* Add feedback section here if you want to display event feedback */}
      </div>
    </div>
  );
} 