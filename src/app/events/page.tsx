'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  UserPlus, 
  Search, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { eventsService, Event } from '@/services/eventsService';
import { useToast } from '@/components/ui/Toast';
import { getImageUrl } from '@/utils/api';

// Registration form interface
interface RegistrationFormData {
  name: string;
  email: string;
  mobile_number: string;
  participant_type?: 'student' | 'professional';
  // Student fields
  institution?: string;
  department?: string;
  year_of_study?: string;
  // Professional fields
  organization?: string;
  designation?: string;
  // Optional fields
  dietary_requirements?: string;
  special_needs?: string;
  payment_reference?: string;
}

// Registration Modal Component
interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RegistrationFormData) => Promise<void>;
  eventTitle: string;
  isRegistering: boolean;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  eventTitle,
  isRegistering
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    mobile_number: '',
    institution: '',
    department: '',
    year_of_study: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      name: '',
      email: '',
      mobile_number: '',
      institution: '',
      department: '',
      year_of_study: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#191A23]">Register for Event</h2>
            <button
              onClick={onClose}
              className="text-[#191A23]/50 hover:text-[#191A23] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#191A23] mb-2">{eventTitle}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile_number}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                placeholder="Enter your mobile number"
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Institution
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Enter your institution name"
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter your department"
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#191A23] mb-2">
                Year of Study
              </label>
              <select
                value={formData.year_of_study}
                onChange={(e) => setFormData(prev => ({ ...prev, year_of_study: e.target.value }))}
                className="w-full px-4 py-3 border border-[#191A23]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B9FF66] focus:border-transparent"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#191A23]/10 text-[#191A23] hover:bg-[#191A23]/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegistering}
                className="flex-1 bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66]"
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [registeringEvents, setRegisteringEvents] = useState<Set<number>>(new Set());
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set());
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null);

  // Toast notifications
  const { showSuccess, showError, ToastContainer } = useToast();

  // Fetch events using the new eventsService - FIXED: Removed loop-causing dependency
  useEffect(() => {
    let isCancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        
        // Add time-based filtering using the new service
        if (showPastEvents) {
          filters.start_date_before = new Date().toISOString();
        } else {
          filters.start_date_after = new Date().toISOString();
        }

        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }

        const eventsData = await eventsService.getEvents(filters);
        
        // Only update state if component is still mounted
        if (!isCancelled) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        if (!isCancelled) {
          showError('Failed to load events. Please try again.');
          setEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [showPastEvents, searchQuery]); // FIXED: Removed showError dependency

  // Filter events based on search and date
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
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
      console.error('Registration error:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      );
    }
  };

  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    if (!selectedEventForRegistration) return;

    const eventId = selectedEventForRegistration.id;

    try {
      setRegisteringEvents((prev) => new Set([...prev, eventId]));

      // Use the API from lib/api.ts for registration
      const registrationPayload = {
        event: eventId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile_number: formData.mobile_number.trim(),
        participant_type: formData.participant_type || 'student',
        // Include only relevant fields based on participant type
        ...(formData.participant_type === 'student' ? {
          institution: formData.institution?.trim() || '',
          department: formData.department?.trim() || '',
          year_of_study: formData.year_of_study?.trim() || '',
        } : {
          organization: formData.organization?.trim() || '',
          designation: formData.designation?.trim() || '',
        }),
        // Optional fields
        dietary_requirements: formData.dietary_requirements?.trim() || '',
        special_needs: formData.special_needs?.trim() || '',
        payment_reference: formData.payment_reference?.trim() || '',
      };

      // Use the eventsService for registration
      const registrationResult = await eventsService.registerForEvent(eventId, registrationPayload);
      
      if (registrationResult) {
        setShowRegistrationModal(false);
        setSelectedEventForRegistration(null);
        // Mark event as registered
        setRegisteredEvents((prev) => new Set([...prev, eventId]));
        showSuccess('🎉 Registration successful! We\'re excited to have you join us for this event.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
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
      
      <div className="min-h-screen bg-[#F3F3F3]">
        {/* Events List Section */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#191A23] mb-4">
                {showPastEvents ? 'Past Events' : 'Upcoming Events'}
              </h2>
              <p className="text-[#191A23]/70 text-lg max-w-2xl mx-auto">
                {showPastEvents
                  ? 'Discover the events we\'ve successfully organized'
                  : 'Join us for exciting upcoming events and workshops'}
              </p>
            </div>

            {/* Search and Filter Controls */}
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
                    onClick={() => setSearchQuery('')}
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
                      ? 'bg-[#191A23] text-[#B9FF66]'
                      : 'text-[#191A23] hover:bg-[#191A23]/10'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setShowPastEvents(true)}
                  className={`flex-1 sm:flex-none px-6 py-3 font-medium transition-all duration-300 ${
                    showPastEvents
                      ? 'bg-[#191A23] text-[#B9FF66]'
                      : 'text-[#191A23] hover:bg-[#191A23]/10'
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
                    onClick={() => window.open(`/events/${event.id}`, '_self')}
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
                              {event.event_type || 'Event'}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Event Type Badge */}
                      <div className="absolute top-3 left-3 bg-[#191A23]/90 text-[#B9FF66] px-3 py-1 text-xs font-medium rounded">
                        {event.event_type || 'Event'}
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
                          {eventsService.formatDate(event.start_date)}
                        </span>
                        <Clock className="w-4 h-4 ml-4 mr-2" />
                        <span>
                          {eventsService.formatTime(event.start_date)}
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
                            {event.registration_count || 0} / {event.max_participants} registered
                          </span>
                        </div>
                      )}
                      
                      {event.registration_required && eventsService.isRegistrationOpen(event) && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!registeredEvents.has(event.id)) {
                              handleRegister(event.id);
                            }
                          }}
                          disabled={registeringEvents.has(event.id) || registeredEvents.has(event.id)}
                          className={`w-full transition-all duration-300 ${
                            registeredEvents.has(event.id)
                              ? 'bg-green-500 text-white cursor-default'
                              : registeringEvents.has(event.id)
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-[#191A23] hover:bg-[#191A23]/90 text-[#B9FF66]'
                          }`}
                        >
                          {registeredEvents.has(event.id) ? (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Registered ✓
                            </>
                          ) : registeringEvents.has(event.id) ? (
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
                  {showPastEvents ? 'No Past Events Found' : 'No Upcoming Events'}
                </h3>
                <p className="text-[#191A23]/60">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : showPastEvents
                    ? 'Check back later for past event archives'
                    : 'Stay tuned for exciting events coming soon!'}
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
        eventTitle={selectedEventForRegistration?.title || ''}
        isRegistering={
          selectedEventForRegistration
            ? registeringEvents.has(selectedEventForRegistration.id)
            : false
        }
      />
    </>
  );
}
