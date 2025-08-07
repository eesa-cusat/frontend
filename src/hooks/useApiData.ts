import { useState, useEffect } from 'react';
import { academicsAPI, eventsAPI, careersAPI, peopleAPI } from '@/services/api';
import type { Subject, Scheme, Event, CareerOpportunity, TeamMember } from '@/types/api';

// Custom hook for academics data
export const useAcademics = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, schemesData] = await Promise.all([
        academicsAPI.getSubjects(),
        academicsAPI.getSchemes()
      ]);
      setSubjects(subjectsData);
      setSchemes(schemesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch academics data');
      console.error('Academics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    subjects,
    schemes,
    loading,
    error,
    refetch: fetchData,
    setSubjects,
    setSchemes
  };
};

// Custom hook for events data
export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events data');
      console.error('Events fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    events,
    loading,
    error,
    refetch: fetchData,
    setEvents
  };
};

// Custom hook for careers data
export const useCareers = () => {
  const [careers, setCareers] = useState<CareerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await careersAPI.getCareers();
      setCareers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch careers data');
      console.error('Careers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    careers,
    loading,
    error,
    refetch: fetchData,
    setCareers
  };
};

// Custom hook for people data
export const usePeople = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await peopleAPI.getTeamMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team members data');
      console.error('People fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    members,
    loading,
    error,
    refetch: fetchData,
    setMembers
  };
};
