"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { eventsService } from '@/services/eventsService';
import { galleryService } from '@/services/galleryService';

export default function APITestPage() {
  const [eventResults, setEventResults] = useState<any>(null);
  const [galleryResults, setGalleryResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPIs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing Events API...');
      
      // Test direct API call
      const directEventsResponse = await api.events.list();
      console.log('Direct events API response:', directEventsResponse);
      
      // Test events service
      const serviceEvents = await eventsService.getEvents();
      console.log('Events service response:', serviceEvents);
      
      setEventResults({
        direct: directEventsResponse.data,
        service: serviceEvents,
        directType: Array.isArray(directEventsResponse.data) ? 'array' : typeof directEventsResponse.data,
        serviceType: Array.isArray(serviceEvents) ? 'array' : typeof serviceEvents,
        directLength: Array.isArray(directEventsResponse.data) ? directEventsResponse.data.length : 'N/A',
        serviceLength: Array.isArray(serviceEvents) ? serviceEvents.length : 'N/A'
      });

      console.log('Testing Gallery API...');
      
      // Test gallery service
      const galleryCategories = await galleryService.getCategories();
      const galleryImages = await galleryService.getImages();
      
      console.log('Gallery categories:', galleryCategories);
      console.log('Gallery images:', galleryImages);
      
      setGalleryResults({
        categories: galleryCategories,
        images: galleryImages,
        categoriesType: Array.isArray(galleryCategories) ? 'array' : typeof galleryCategories,
        imagesType: Array.isArray(galleryImages) ? 'array' : typeof galleryImages,
        categoriesLength: Array.isArray(galleryCategories) ? galleryCategories.length : 'N/A',
        imagesLength: Array.isArray(galleryImages) ? galleryImages.length : 'N/A'
      });
      
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPIs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connectivity Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testAPIs}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test APIs'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Events Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Events API Results</h2>
          {eventResults ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Direct API Call:</h3>
                <p>Type: {eventResults.directType}</p>
                <p>Length: {eventResults.directLength}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(eventResults.direct, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Events Service:</h3>
                <p>Type: {eventResults.serviceType}</p>
                <p>Length: {eventResults.serviceLength}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(eventResults.service, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No results yet...</p>
          )}
        </div>

        {/* Gallery Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Gallery API Results</h2>
          {galleryResults ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Categories:</h3>
                <p>Type: {galleryResults.categoriesType}</p>
                <p>Length: {galleryResults.categoriesLength}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(galleryResults.categories, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium">Images:</h3>
                <p>Type: {galleryResults.imagesType}</p>
                <p>Length: {galleryResults.imagesLength}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(galleryResults.images, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No results yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
