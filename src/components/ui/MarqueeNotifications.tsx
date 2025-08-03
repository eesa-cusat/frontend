/**
 * Marquee Notifications Component
 * Fetches and displays scrolling notifications from the API
 */
"use client";

import { useState, useEffect } from 'react';

// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  type_display: string;
  priority: string;
  priority_display: string;
  is_active: boolean;
  is_marquee: boolean;
  action_url?: string;
  action_text?: string;
  background_color?: string;
  text_color?: string;
  created_at: string;
  is_currently_active: boolean;
}

interface MarqueeSettings {
  id: number;
  marquee_speed: number;
  marquee_pause_on_hover: boolean;
  max_notifications_display: number;
  show_date: boolean;
  show_type_icon: boolean;
  enable_sound: boolean;
  auto_refresh_interval: number;
}

interface MarqueeData {
  notifications: NotificationItem[];
  settings: MarqueeSettings;
}

interface MarqueeNotificationsProps {
  className?: string;
}

const MarqueeNotifications: React.FC<MarqueeNotificationsProps> = ({
  className = ""
}) => {
  const [marqueeData, setMarqueeData] = useState<MarqueeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarqueeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch marquee notifications
        const response = await fetch(`${API_BASE_URL}/events/notifications/marquee/`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validate data structure
        if (!data.notifications || !Array.isArray(data.notifications)) {
          throw new Error('Invalid data structure: notifications array missing');
        }

        setMarqueeData(data);
      } catch (error) {
        console.error('Error fetching marquee notifications:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
        // No fallback data - component will not render if API fails
        setMarqueeData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarqueeData();
  }, []);

  // Auto-refresh based on settings
  useEffect(() => {
    if (!marqueeData?.settings.auto_refresh_interval) return;

    const interval = setInterval(() => {
      // Re-fetch data
      const fetchUpdatedData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/events/notifications/marquee/`);
          if (response.ok) {
            const data = await response.json();
            setMarqueeData(data);
          }
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      };

      fetchUpdatedData();
    }, marqueeData.settings.auto_refresh_interval * 1000);

    return () => clearInterval(interval);
  }, [marqueeData?.settings.auto_refresh_interval]);

  // Don't render if loading, no data, or error
  if (loading || !marqueeData || error) {
    return null;
  }

  // Filter active notifications and sort by priority
  const priorityOrder = { 'urgent': 3, 'high': 2, 'normal': 1, 'low': 0 };
  const activeNotifications = marqueeData.notifications
    .filter(notification => notification.is_active && notification.is_marquee && notification.is_currently_active)
    .sort((a, b) => (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0))
    .slice(0, marqueeData.settings.max_notifications_display);

  // If no active notifications, don't render
  if (activeNotifications.length === 0) {
    return null;
  }

  // Generate dynamic styles based on settings
  const marqueeStyle = {
    animationDuration: `${marqueeData.settings.marquee_speed}s`
  };

  const marqueeClass = `whitespace-nowrap ${marqueeData.settings.marquee_pause_on_hover ? 'hover:pause' : ''}`;

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return '🚨';
    switch (type) {
      case 'announcement': return '📢';
      case 'event': return '🎉';
      case 'academic': return '📚';
      case 'placement': return '💼';
      case 'alert': return '⚠️';
      default: return '📌';
    }
  };

  return (
    <section className={`py-3 overflow-hidden bg-white border-y border-gray-200 ${className}`}>
      <div 
        className={`${marqueeClass} animate-marquee font-sans`}
        style={marqueeStyle}
      >
        {activeNotifications.map((notification, index) => (
          <span
            key={`${notification.id}-${index}`}
            className="text-sm md:text-base font-medium mx-8 inline-block text-gray-700"
          >
            {marqueeData.settings.show_type_icon && (
              <span className="mr-2">
                {getNotificationIcon(notification.notification_type, notification.priority)}
              </span>
            )}
            {notification.action_url ? (
              <a 
                href={notification.action_url}
                className="hover:text-blue-600 transition-colors"
              >
                {notification.title || notification.message}
              </a>
            ) : (
              notification.title || notification.message
            )}
          </span>
        ))}
        
        {/* Repeat notifications for seamless loop */}
        {activeNotifications.map((notification, index) => (
          <span
            key={`repeat-${notification.id}-${index}`}
            className="text-sm md:text-base font-medium mx-8 inline-block text-gray-700"
          >
            {marqueeData.settings.show_type_icon && (
              <span className="mr-2">
                {getNotificationIcon(notification.notification_type, notification.priority)}
              </span>
            )}
            {notification.action_url ? (
              <a 
                href={notification.action_url}
                className="hover:text-blue-600 transition-colors"
              >
                {notification.title || notification.message}
              </a>
            ) : (
              notification.title || notification.message
            )}
          </span>
        ))}
      </div>
    </section>
  );
};

export default MarqueeNotifications;
