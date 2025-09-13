import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Transform the data to guest registration format
    const guestRegistrationData = {
      event: parseInt(id),
      guest_name: body.name,
      guest_email: body.email,
      guest_phone: body.mobile_number,
      guest_semester: parseInt(body.year_of_study) || null,
      guest_department: body.department?.toLowerCase() || 'other',
    };

    console.log('Attempting guest registration with data:', guestRegistrationData);

    // Try the registrations endpoint directly
    const response = await fetch(`${API_BASE_URL}/events/registrations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Try without auth first
      },
      body: JSON.stringify(guestRegistrationData),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Backend error response:', errorText);
      
      // If authentication is required, return a helpful message
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Registration system requires setup. Please contact administrators.',
            details: 'Backend requires authentication for registration.',
            status: response.status,
            suggestion: 'This appears to be a configuration issue where the backend requires authentication for event registration.'
          },
          { status: 200 } // Return 200 so frontend can show a proper message
        );
      }
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { 
          error: errorData.detail || errorData.message || 'Registration failed',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
