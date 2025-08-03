/**
 * Enhanced Like Button Component for Academic Resources
 */
"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { getCSRFHeaders, clearCSRFToken, initializeSession } from '@/utils/csrf';

interface LikeButtonProps {
  resourceId: number;
  initialCount?: number;
  onLikeChange?: (newCount: number) => void;
}

// API Functions
const toggleLike = async (resourceId: number) => {
  try {
    const headers = await getCSRFHeaders();
    
    const response = await fetch(`http://localhost:8000/api/academics/resources/${resourceId}/like/`, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return {
        liked: data.liked,        // true if now liked, false if unliked
        likeCount: data.like_count // updated total like count
      };
    } else {
      // If CSRF error, clear token and retry once
      if (response.status === 403 && data.detail?.includes('CSRF')) {
        clearCSRFToken();
        
        const retryHeaders = await getCSRFHeaders();
        const retryResponse = await fetch(`http://localhost:8000/api/academics/resources/${resourceId}/like/`, {
          method: 'POST',
          headers: retryHeaders,
          mode: 'cors',
          credentials: 'include'
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return {
            liked: retryData.liked,
            likeCount: retryData.like_count
          };
        }
      }
      
      throw new Error(data.error || data.detail || 'Failed to toggle like');
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

const getResourceWithLikes = async (resourceId: number) => {
  try {
    const response = await fetch(`http://localhost:8000/api/academics/resources/${resourceId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch resource');
    }
    
    const resource = await response.json();
    
    return {
      id: resource.id,
      title: resource.title,
      likeCount: resource.like_count || 0,    // Total likes
      isLiked: resource.is_liked || false,    // Current user's like status
      downloadCount: resource.download_count || 0
    };
  } catch (error) {
    console.error('Error fetching resource:', error);
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
    // Load initial like status from backend
    const loadResource = async () => {
      try {
        const resource = await getResourceWithLikes(resourceId);
        setLiked(resource.isLiked);
        setLikeCount(resource.likeCount);
      } catch (error) {
        console.error('❌ Failed to load resource:', error);
        // Fallback to initial values
        setLiked(false);
        setLikeCount(initialCount);
      }
    };
    
    loadResource();
  }, [resourceId, initialCount]);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    
    try {
      // Initialize session first to ensure cookies are set
      await initializeSession();
      
      const result = await toggleLike(resourceId);
      
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      
      if (onLikeChange) {
        onLikeChange(result.likeCount);
      }
      
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center justify-center p-2 rounded-full transition-colors disabled:cursor-not-allowed ${
          loading 
            ? 'bg-gray-200 cursor-wait' 
            : liked 
              ? 'bg-red-100 hover:bg-red-200' 
              : 'bg-gray-100 hover:bg-red-100'
        }`}
        title={`${loading ? 'Processing...' : liked ? 'Unlike' : 'Like'} this resource`}
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            loading 
              ? 'text-gray-400' 
              : liked 
                ? 'text-red-500 fill-red-500' 
                : 'text-red-500'
          }`} 
        />
      </button>
      <span className="text-xs text-gray-600 font-medium">
        {loading ? '...' : likeCount}
      </span>
    </div>
  );
};

export default LikeButton;
