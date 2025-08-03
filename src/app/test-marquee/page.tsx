'use client';

import { useState, useEffect } from 'react';
import MarqueeNotifications from '@/components/ui/MarqueeNotifications';

export default function TestMarqueePage() {
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        console.log('Testing API endpoint...');
        
        // Test the actual API endpoint  
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiBaseUrl}/events/notifications/marquee/`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        setApiData(data);
      } catch (error) {
        console.error('API Error:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Marquee Notifications Test</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Test Results</h2>
        {loading && <p>Testing API...</p>}
        {apiError && (
          <div className="text-red-600">
            <strong>Error:</strong> {apiError}
          </div>
        )}
        {apiData && (
          <div className="space-y-2">
            <p><strong>Status:</strong> ✅ API Working</p>
            <p><strong>Notifications:</strong> {apiData.notifications?.length || 0}</p>
            <p><strong>Settings:</strong> {apiData.settings ? '✅ Available' : '❌ Missing'}</p>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Raw API Response</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Live Marquee Component</h2>
        <p className="mb-4">This displays the marquee with real data from the API (no fallbacks):</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg">
          <MarqueeNotifications />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Note: Component will not render if API fails or returns no data
        </p>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Expected API Structure</h2>
        <pre className="text-sm overflow-auto">
{`{
  "notifications": [
    {
      "id": number,
      "title": string,
      "message": string,
      "notification_type": string,
      "priority": "urgent" | "high" | "normal" | "low",
      "is_active": boolean,
      "is_marquee": boolean,
      "action_url": string?,
      "action_text": string?,
      "text_color": string?,
      "background_color": string?
    }
  ],
  "settings": {
    "marquee_speed": number,
    "marquee_pause_on_hover": boolean,
    "max_notifications_display": number,
    "show_type_icon": boolean,
    "auto_refresh_interval": number
  }
}`}
        </pre>
      </div>
    </div>
  );
}
