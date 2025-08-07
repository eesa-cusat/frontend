"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  registration_required: boolean;
  max_participants: number;
  registration_fee: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export default function EventsPanel() {
  const { hasGroupAccess, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "workshop",
    status: "draft",
    start_date: "",
    end_date: "",
    location: "",
    registration_required: true,
    max_participants: 100,
    registration_fee: "0.00",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  console.log('Current user:', user);
  console.log('Has events_team access:', hasGroupAccess("events_team"));

  // Load events data
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/events/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.results || data);
      } else {
        console.error('Failed to fetch events:', response.status);
        toast.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/events/events/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data.results || data);
        } else {
          console.error('Failed to fetch events:', response.status);
          toast.error('Failed to load events');
        }
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [API_BASE_URL]);

  // Check access - temporarily allow all for testing
  if (false) { // Temporarily disabled: !hasGroupAccess("events_team")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the events panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/eesa">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newEvent.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (!newEvent.start_date || !newEvent.end_date) {
      toast.error("Please enter start and end dates");
      return;
    }

    try {
      setIsCreating(true);
      console.log('Starting event creation process...');
      
      // Get CSRF token first
      const csrfResponse = await fetch(`${API_BASE_URL}/accounts/auth/csrf/`, {
        credentials: 'include',
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const { csrfToken } = await csrfResponse.json();
      console.log('CSRF token obtained');
      
      // Prepare the event data with proper date formatting
      const eventData = {
        ...newEvent,
        start_date: newEvent.start_date ? new Date(newEvent.start_date).toISOString() : null,
        end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : null,
      };
      
      console.log('Sending event data:', eventData);
      
      // API call to create event
      const response = await fetch(`${API_BASE_URL}/events/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      toast.success("Event created successfully");
      setNewEvent({
        title: "",
        description: "",
        event_type: "workshop",
        status: "draft",
        start_date: "",
        end_date: "",
        location: "",
        registration_required: true,
        max_participants: 100,
        registration_fee: "0.00",
      });
      setIsCreating(false);
      loadEvents(); // Refresh events list
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/eesa">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Events Panel</h1>
                <p className="text-sm text-gray-600">
                  Create and manage events
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Add a new event to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Enter event location"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <select
                    id="event_type"
                    className="w-full p-2 border rounded-md"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  >
                    <option value="workshop">Workshop</option>
                    <option value="competition">Competition</option>
                    <option value="symposium">Symposium</option>
                    <option value="technical">Technical</option>
                    <option value="seminar">Seminar</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md"
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={newEvent.max_participants}
                    onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date & Time</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_fee">Registration Fee (₹)</Label>
                  <Input
                    id="registration_fee"
                    type="number"
                    step="0.01"
                    value={newEvent.registration_fee}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_fee: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="registration_required"
                    type="checkbox"
                    checked={newEvent.registration_required}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="registration_required">Registration Required</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => {
                  console.log('Create Event button clicked!');
                  handleCreate();
                }}>Create Event</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Manage Events</h2>
            <div className="text-sm text-gray-600">
              {events.length} events loaded
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg">Loading events...</div>
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No events created yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreating(true)}
                >
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'published' 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {event.status}
                          </span>
                          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                            {event.event_type}
                          </span>
                          {event.is_featured && (
                            <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mt-1">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Max: {event.max_participants} participants</span>
                          <span>Fee: ₹{event.registration_fee}</span>
                          <span>{event.registration_required ? 'Registration Required' : 'No Registration'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
