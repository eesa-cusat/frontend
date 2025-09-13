import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function GET() {
  try {
    // Test different possible registration endpoints
    const endpoints = [
      '/events/quick-register/',
      '/events/register/',
      '/events/1/register/',
      '/events/events/1/register/',
      '/events/registrations/',
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'OPTIONS', // Use OPTIONS to check if endpoint exists
          headers: {
            'Content-Type': 'application/json',
          },
        });

        results.push({
          endpoint,
          status: response.status,
          exists: response.status !== 404,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Also try to get events list to see structure
    let eventsStructure = null;
    try {
      const eventsResponse = await fetch(`${API_BASE_URL}/events/events/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        eventsStructure = {
          count: eventsData.count,
          hasResults: Array.isArray(eventsData.results),
          firstEventKeys: eventsData.results?.[0] ? Object.keys(eventsData.results[0]) : null
        };
      }
    } catch (error) {
      eventsStructure = { error: error instanceof Error ? error.message : String(error) };
    }

    return NextResponse.json({
      message: 'API Discovery Results',
      endpoints: results,
      eventsStructure,
      baseUrl: API_BASE_URL
    });

  } catch (error) {
    console.error('Error in API discovery:', error);
    return NextResponse.json(
      { error: 'Failed to discover API endpoints' },
      { status: 500 }
    );
  }
}
