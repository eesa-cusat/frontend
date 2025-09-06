import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }
  
  return await handleProxyRequest('GET', endpoint);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }
  
  const body = await request.json();
  return await handleProxyRequest('POST', endpoint, body);
}

async function handleProxyRequest(method: string, endpoint: string, body?: any) {
  console.log(`🔄 Proxy ${method} request for:`, endpoint);
  
  // Clean up the endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/\/+$/, '');
  
  // Backend URLs to try
  const backendUrls = [
    'http://localhost:8000/api',
    'http://127.0.0.1:8000/api',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ];
  
  // Endpoint variations to try
  const endpointVariations = [
    cleanEndpoint,
    `events/${cleanEndpoint}`,
    `events/events/${cleanEndpoint}`,
    cleanEndpoint.replace('events/', 'events/events/'),
  ];
  
  for (const baseUrl of backendUrls) {
    for (const endpointVar of endpointVariations) {
      try {
        console.log(`Trying: ${baseUrl}/${endpointVar}`);
        
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };
        
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          fetchOptions.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${baseUrl}/${endpointVar}`, fetchOptions);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Proxy success: ${baseUrl}/${endpointVar}`);
          return NextResponse.json(data);
        } else {
          console.log(`❌ Proxy failed: ${baseUrl}/${endpointVar} - ${response.status}`);
        }
        
      } catch (error: any) {
        console.log(`❌ Proxy error: ${baseUrl}/${endpointVar} - ${error.message}`);
        continue;
      }
    }
  }
  
  console.log('❌ All proxy attempts failed for:', endpoint);
  return NextResponse.json(
    { error: `Failed to connect to backend for endpoint: ${endpoint}` },
    { status: 502 }
  );
}
