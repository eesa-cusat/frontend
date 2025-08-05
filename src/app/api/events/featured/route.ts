import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/events/featured/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured events' },
      { status: 500 }
    );
  }
}
