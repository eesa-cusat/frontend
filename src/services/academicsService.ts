/**
 * Academic Resources API Service
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LikeResponse {
  liked: boolean;
  like_count: number;
}

interface AcademicResource {
  id: number;
  title: string;
  description: string;
  likes_count: number;
  // ... other properties
}

/**
 * Like/Unlike academic resource
 */
export const toggleResourceLike = async (resourceId: number): Promise<LikeResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/academics/resources/${resourceId}/like/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data: LikeResponse = await response.json();
      return data;
    } else {
      console.error('API: Failed to toggle like, status:', response.status);
      const errorText = await response.text();
      console.error('API: Error response:', errorText);
      return null;
    }
  } catch (error) {
    console.error('API: Error toggling like:', error);
    return null;
  }
};

/**
 * Get user's liked resources
 */
export const getUserLikedResources = async (): Promise<number[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/academics/resources/liked/`);
    
    if (response.ok) {
      const data = await response.json();
      return data.map((resource: { id: number }) => resource.id);
    } else {
      console.error('API: Failed to fetch user likes, status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('API: Error fetching user likes:', error);
    return [];
  }
};
