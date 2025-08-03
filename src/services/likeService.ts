/**
 * Academic Resources Like Service
 * Handles like/unlike functionality for academic resources
 */

export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

export interface ResourceLikeInfo {
  id: number;
  title: string;
  likeCount: number;
  isLiked: boolean;
  downloadCount: number;
}

/**
 * Toggle like/unlike status for a resource
 */
export const toggleResourceLike = async (resourceId: number): Promise<LikeResult> => {
  try {
    const response = await fetch(`http://localhost:8000/api/academics/resources/${resourceId}/like/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:3000/',
      },
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
      throw new Error(data.error || 'Failed to toggle like');
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

/**
 * Get resource information including like status
 */
export const getResourceWithLikes = async (resourceId: number): Promise<ResourceLikeInfo> => {
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

/**
 * Get multiple resources with like information
 */
export const getResourcesWithLikes = async (resourceIds: number[]): Promise<ResourceLikeInfo[]> => {
  try {
    const promises = resourceIds.map(id => getResourceWithLikes(id));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<ResourceLikeInfo> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching multiple resources:', error);
    throw error;
  }
};
