/**
 * Enhanced Like Button Component for Academic Resources with Real-time Updates
 */
"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  resourceId: number;
  initialCount?: number;
  onLikeChange?: (newCount: number) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Get CSRF token from cookies (if available)
const getCSRFToken = () => {
  if (typeof document === 'undefined') return null;
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// API Functions
const toggleLike = async (resourceId: number) => {
  try {
    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add CSRF token if available (endpoint should be CSRF exempt in production)
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/like/`, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({})  // Empty body for POST request
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        liked: data.liked,        // true if now liked, false if unliked
        likeCount: data.like_count // updated total like count
      };
    } else {
      throw new Error(data.error || data.detail || 'Failed to toggle like');
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

const getResourceStats = async (resourceId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/stats/`, {
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resource stats');
    }
    
    const stats = await response.json();
    
    return {
      id: stats.id,
      likeCount: stats.like_count || 0,
      downloadCount: stats.download_count || 0,
      isLiked: stats.is_liked || false,
      viewCount: stats.view_count || 0
    };
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    throw error;
  }
};

const LikeButton: React.FC<LikeButtonProps> = ({
  resourceId,
  initialCount = 0,
  onLikeChange
}) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load initial like status and stats from backend
    const loadResourceStats = async () => {
      try {
        const stats = await getResourceStats(resourceId);
        setLiked(stats.isLiked);
        setLikeCount(stats.likeCount);
      } catch (error) {
        console.error('❌ Failed to load resource stats:', error);
        // Fallback to initial values
        setLiked(false);
        setLikeCount(initialCount);
      }
    };
    
    loadResourceStats();
  }, [resourceId, initialCount]);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    
    try {
      const result = await toggleLike(resourceId);
      
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      
      if (onLikeChange) {
        onLikeChange(result.likeCount);
      }
      
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      
      // Show user-friendly error message based on error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('CSRF')) {
        alert('Session expired. Please refresh the page and try again.');
      } else {
        alert('Failed to update like. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 ${
          loading 
            ? 'bg-gray-200 cursor-wait' 
            : liked 
              ? 'bg-red-100 hover:bg-red-200 shadow-md' 
              : 'bg-gray-100 hover:bg-red-50'
        }`}
        title={`${loading ? 'Processing...' : liked ? 'Unlike' : 'Like'} this resource`}
        aria-label={`${liked ? 'Unlike' : 'Like'} resource - ${likeCount} likes`}
      >
        <Heart 
          className={`w-5 h-5 transition-all duration-200 ${
            loading 
              ? 'text-gray-400' 
              : liked 
                ? 'text-red-500 fill-red-500 scale-110' 
                : 'text-red-500 hover:text-red-600'
          }`} 
        />
      </button>
      <span className={`text-xs font-medium transition-colors ${
        liked ? 'text-red-600' : 'text-gray-600'
      }`}>
        {loading ? '...' : likeCount}
      </span>
    </div>
  );
};

export default LikeButton;
