'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { eventsService, Event, EventRegistration, EventNotification } from '@/services/eventsService';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign,
  ExternalLink,
  Bell,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import Image from 'next/image';

interface EventsPageProps {}

const EventsPage: React.FC<EventsPageProps> = () => {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    institution: '',
    department: '',
    year_of_study: '',
    dietary_requirements: '',
    special_needs: ''
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadEvents();
    loadNotifications();
  }, [eventTypeFilter, timeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (eventTypeFilter !== 'all') {
        filters.event_type = eventTypeFilter;
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      // Add time-based filtering
      const now = new Date().toISOString();
      if (timeFilter === 'upcoming') {
        filters.start_date_after = now;
      } else if (timeFilter === 'past') {
        filters.start_date_before = now;
      }

      const eventsData = await eventsService.getEvents(filters);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsData = await eventsService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSearch = () => {
    loadEvents();
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setRegistrationLoading(true);
      const registration = await eventsService.registerForEvent(selectedEvent.id, registrationData);
      
      if (registration) {
        alert('Registration successful! You will receive a confirmation email shortly.');
        setShowRegistrationModal(false);
        setRegistrationData({
          name: '',
          email: '',
          mobile_number: '',
          institution: '',
          department: '',
          year_of_study: '',
          dietary_requirements: '',
          special_needs: ''
        });
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    return eventsService.getEventTypeColor(type);
  };

  const getStatusColor = (status: string) => {
    return eventsService.getStatusColor(status);
  };

  const formatDate = (dateString: string) => {
    return eventsService.formatDate(dateString);
  };

  const formatDateTime = (dateString: string) => {
    return eventsService.formatDateTime(dateString);
  };

  const formatTime = (dateString: string) => {
    return eventsService.formatTime(dateString);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  // Event Registration Modal Component
  const RegistrationModal = () => {
    if (!showRegistrationModal || !selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Register for Event</h2>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-600">{formatDateTime(selectedEvent.start_date)}</p>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  required
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  value={registrationData.mobile_number}
                  onChange={(e) => setRegistrationData({ ...registrationData, mobile_number: e.target.value })}
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <Input
                  value={registrationData.institution}
                  onChange={(e) => setRegistrationData({ ...registrationData, institution: e.target.value })}
                  placeholder="Enter your institution name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  value={registrationData.department}
                  onChange={(e) => setRegistrationData({ ...registrationData, department: e.target.value })}
                  placeholder="Enter your department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <select
                  value={registrationData.year_of_study}
                  onChange={(e) => setRegistrationData({ ...registrationData, year_of_study: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Requirements
                </label>
                <Input
                  value={registrationData.dietary_requirements}
                  onChange={(e) => setRegistrationData({ ...registrationData, dietary_requirements: e.target.value })}
                  placeholder="Any dietary restrictions?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Needs
                </label>
                <Input
                  value={registrationData.special_needs}
                  onChange={(e) => setRegistrationData({ ...registrationData, special_needs: e.target.value })}
                  placeholder="Any special accommodations needed?"
                />
              </div>

              {selectedEvent.payment_required && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Payment Required</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Registration fee: {selectedEvent.registration_fee}
                  </p>
                  {selectedEvent.payment_instructions && (
                    <p className="text-sm text-yellow-700">
                      {selectedEvent.payment_instructions}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registrationLoading}
                  className="flex-1"
                >
                  {registrationLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-2">
                Discover upcoming workshops, seminars, and networking events
              </p>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md"
                  >
                    {getNotificationIcon(notification.notification_type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{notification.title}</h4>
                      <p className="text-sm text-blue-700">{notification.message}</p>
                    </div>
                    {notification.target_url && (
                      <a
                        href={notification.target_url}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => eventsService.incrementNotificationClicks(notification.id)}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="conference">Conference</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="webinar">Webinar</option>
                </select>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming Events</option>
                  <option value="past">Past Events</option>
                  <option value="all">All Events</option>
                </select>
                <Button onClick={handleSearch} size="sm">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                onClick={() => handleEventClick(event)}
              >
                {event.banner_image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.banner_image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </div>
                    {event.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{event.title}</CardTitle>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.is_online && (
                      <div className="flex items-center gap-2">
                        <ExternalLink size={14} />
                        <span>Online Event</span>
                      </div>
                    )}
                  </div>

                  {event.registration_required && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{event.registration_count} registered</span>
                        </div>
                        {event.max_participants && (
                          <span className="text-gray-500">
                            / {event.max_participants} max
                          </span>
                        )}
                      </div>
                      {event.spots_remaining !== undefined && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${event.max_participants ? ((event.registration_count / event.max_participants) * 100) : 0}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.spots_remaining} spots remaining
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {event.payment_required && event.registration_fee && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="text-green-600 font-medium">{event.registration_fee}</span>
                    </div>
                  )}

                  {event.contact_person && (
                    <div className="text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{event.contact_person}</span>
                      </div>
                      {event.contact_email && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={14} />
                          <span>{event.contact_email}</span>
                        </div>
                      )}
                      {event.contact_phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={14} />
                          <span>{event.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {event.registration_required && eventsService.isRegistrationOpen(event) && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterClick(event);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Register Now
                    </Button>
                  )}

                  {event.registration_required && !eventsService.isRegistrationOpen(event) && (
                    <Button disabled className="w-full" size="sm">
                      {eventsService.isEventFull(event) ? 'Event Full' : 'Registration Closed'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <RegistrationModal />
    </div>
  );
};

export default EventsPage;
