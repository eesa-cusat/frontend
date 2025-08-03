"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Target,
  Trophy,
  Lightbulb,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event, GuestRegistrationData } from "@/types/api";
import Link from "next/link";
import Image from "next/image";

// Helper function to get random icon and color for each event
const getEventIcon = (eventId: number) => {
  const icons = [
    { Icon: Star, color: "bg-orange-500" },
    { Icon: Zap, color: "bg-lime-400" },
    { Icon: Target, color: "bg-blue-500" },
    { Icon: Trophy, color: "bg-yellow-500" },
    { Icon: Lightbulb, color: "bg-purple-500" },
    { Icon: Rocket, color: "bg-red-500" },
  ];
  return icons[eventId % icons.length];
};

// Events Carousel Component
interface EventsCarouselProps {
  events: Event[];
  onRegister: (event: Event) => void;
  registering: boolean;
}

const EventsCarousel: React.FC<EventsCarouselProps> = ({ events, onRegister, registering }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const totalSlides = Math.ceil(events.length / 3);

  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const currentEvents = events.slice(currentIndex * 3, (currentIndex + 1) * 3);

  return (
    <div className="relative">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentEvents.map((event) => {
          const { Icon, color } = getEventIcon(event.id);
          return (
            <div
              key={event.id}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/20 transition-all duration-300"
            >
              {/* Electrical Circuit Background */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id={`circuit-${event.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="#3b82f6" opacity="0.3"/>
                      <path d="M2,10 L18,10 M10,2 L10,18" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#circuit-${event.id})`}/>
                </svg>
              </div>

              <div className="relative z-10 p-6">
                {/* Event Image */}
                {event.poster_image && (
                  <div className="h-40 mb-4 overflow-hidden">
                    <Image
                      src={event.poster_image}
                      alt={event.title}
                      width={300}
                      height={160}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Event Icon */}
                <div className={`w-12 h-12 ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2 text-green-500" />
                    {new Date(event.start_date).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    {event.location}
                  </div>
                  {event.registration_count !== undefined && event.max_participants && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      {event.registration_count}/{event.max_participants} registered
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    onClick={() => onRegister(event)}
                    disabled={registering}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {registering ? 'Registering...' : 'Register'}
                  </Button>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {totalSlides > 1 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 scale-125' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationData, setRegistrationData] = useState<GuestRegistrationData>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_department: "electrical",
  });
  const [canCreateEvents, setCanCreateEvents] = useState(false);

  // Auto-rotate featured events
  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  useEffect(() => {
    fetchEvents();
    checkUserPermissions();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setFeaturedEvents(data.filter((event: Event) => event.is_featured).slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCanCreateEvents(userData.canCreateEvents || false);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const handleRegister = async (event: Event) => {
    if (!registrationData.guest_name || !registrationData.guest_email) {
      alert("Please fill in your name and email");
      return;
    }

    try {
      setRegistering(true);
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        alert("Registration successful!");
        setRegistrationData({ guest_name: "", guest_email: "", guest_phone: "", guest_department: "electrical" });
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const currentFeaturedEvent = featuredEvents[currentFeaturedIndex];
  const upcomingEvents = events.filter(event => event.is_upcoming);
  const pastEvents = events.filter(event => event.is_past);
  const displayEvents = showPastEvents ? pastEvents : upcomingEvents;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background SVG Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" className="absolute inset-0">
          <defs>
            <pattern id="electrical-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="3" fill="#3b82f6" opacity="0.4"/>
              <path d="M50,10 L50,90 M10,50 L90,50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="20" cy="20" r="1.5" fill="#10b981" opacity="0.4"/>
              <circle cx="80" cy="80" r="1.5" fill="#f59e0b" opacity="0.4"/>
              <path d="M20,20 L35,35 M65,65 L80,80" stroke="#8b5cf6" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#electrical-grid)"/>
        </svg>
      </div>

      {/* Hero Section with Featured Event */}
      {currentFeaturedEvent && (
        <section className="relative min-h-screen flex items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Blur Container */}
          <div className="absolute inset-0">
            {/* Blurred Background Image */}
            {currentFeaturedEvent.poster_image && (
              <div className="absolute inset-0">
                <Image
                  src={currentFeaturedEvent.poster_image}
                  alt={currentFeaturedEvent.title}
                  fill
                  className="object-cover blur-2xl scale-110 opacity-30"
                  priority
                />
              </div>
            )}
            
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
            
            {/* Electrical Circuit Overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 1000 1000" className="w-full h-full">
                <defs>
                  <pattern id="hero-circuit" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                    <circle cx="25" cy="25" r="2" fill="#3b82f6"/>
                    <path d="M5,25 L45,25 M25,5 L25,45" stroke="#3b82f6" strokeWidth="1"/>
                    <rect x="20" y="20" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-circuit)"/>
              </svg>
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Event Poster */}
              <div className="flex flex-col items-start space-y-4">
                {/* Event Poster */}
                <div className="w-32 md:w-48 lg:w-64 aspect-[3/4] overflow-hidden shadow-2xl backdrop-blur-md bg-white/40 border border-white/30">
                  {currentFeaturedEvent.poster_image ? (
                    <Image
                      src={currentFeaturedEvent.poster_image}
                      alt={currentFeaturedEvent.title}
                      width={256}
                      height={340}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <Button
                  onClick={() => handleRegister(currentFeaturedEvent)}
                  disabled={registering}
                  className="w-32 md:w-48 lg:w-64 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 shadow-lg backdrop-blur-md border border-white/30 transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {registering ? 'Registering...' : 'Register Now'}
                </Button>
              </div>

              {/* Right Column - Event Content */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                    {currentFeaturedEvent.title}
                  </h1>
                  
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                    {currentFeaturedEvent.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Date Badge */}
                  <div className="inline-flex items-center px-4 py-2 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-semibold text-gray-900">{new Date(currentFeaturedEvent.start_date).toLocaleDateString()}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center text-gray-800">
                    <Clock className="w-5 h-5 mr-3 text-green-600" />
                    <span className="text-lg font-medium">{new Date(currentFeaturedEvent.start_date).toLocaleTimeString()}</span>
                  </div>

                  {/* Location Badge */}
                  <div className="inline-flex items-center px-4 py-2 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-semibold text-gray-900">{currentFeaturedEvent.location}</span>
                  </div>

                  {/* Capacity */}
                  {currentFeaturedEvent.registration_count !== undefined && currentFeaturedEvent.max_participants && (
                    <div className="flex items-center text-gray-800">
                      <Users className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="text-lg font-medium">
                        {currentFeaturedEvent.registration_count}/{currentFeaturedEvent.max_participants} registered
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Centered Event Navigation Dots */}
            {featuredEvents.length > 1 && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-white/40 border border-white/30 shadow-lg">
                  <div className="flex gap-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        className={`w-3 h-3 transition-all duration-300 ${
                          index === currentFeaturedIndex 
                            ? 'bg-blue-600 scale-125 shadow-lg' 
                            : 'bg-white/60 backdrop-blur-sm hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Registration Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Circuit Board Background */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <defs>
              <pattern id="registration-circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#3b82f6"/>
                <path d="M5,20 L35,20 M20,5 L20,35" stroke="#3b82f6" strokeWidth="0.8"/>
                <rect x="15" y="15" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#registration-circuit)"/>
          </svg>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Registration</h2>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Your Name"
                value={registrationData.guest_name}
                onChange={(e) => setRegistrationData({...registrationData, guest_name: e.target.value})}
                className="bg-white/50 border-white/30"
              />
              
              <Input
                type="email"
                placeholder="Email Address"
                value={registrationData.guest_email}
                onChange={(e) => setRegistrationData({...registrationData, guest_email: e.target.value})}
                className="bg-white/50 border-white/30"
              />
              
              <Input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={registrationData.guest_phone}
                onChange={(e) => setRegistrationData({...registrationData, guest_phone: e.target.value})}
                className="bg-white/50 border-white/30"
              />
              
              <select
                value={registrationData.guest_department}
                onChange={(e) => setRegistrationData({...registrationData, guest_department: e.target.value as 'electrical' | 'electronics' | 'computer' | 'mechanical' | 'civil' | 'other'})}
                className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="electrical">Electrical Engineering</option>
                <option value="electronics">Electronics Engineering</option>
                <option value="computer">Computer Engineering</option>
                <option value="mechanical">Mechanical Engineering</option>
                <option value="civil">Civil Engineering</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Circuit Board Background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <defs>
              <pattern id="events-circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="#3b82f6"/>
                <path d="M10,30 L50,30 M30,10 L30,50" stroke="#3b82f6" strokeWidth="1"/>
                <circle cx="15" cy="15" r="1" fill="#10b981"/>
                <circle cx="45" cy="45" r="1" fill="#f59e0b"/>
                <path d="M15,15 L25,25 M35,35 L45,45" stroke="#8b5cf6" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#events-circuit)"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {showPastEvents ? 'Past Events' : 'Upcoming Events'}
            </h2>
            
            <div className="flex justify-center gap-4 mb-8">
              {canCreateEvents && (
                <Link href="/admin/events/create">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowPastEvents(!showPastEvents)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {showPastEvents ? 'View Upcoming' : 'View Past Events'}
              </Button>
            </div>
          </div>

          {displayEvents.length > 0 ? (
            <EventsCarousel
              events={displayEvents}
              onRegister={handleRegister}
              registering={registering}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No {showPastEvents ? 'past' : 'upcoming'} events found
              </h3>
              <p className="text-gray-500">
                {showPastEvents
                  ? 'No past events to display.'
                  : 'Stay tuned for exciting upcoming events!'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
