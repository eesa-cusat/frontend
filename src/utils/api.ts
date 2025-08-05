// API utility functions

/**
 * Get the base URL for API calls
 */
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
};

/**
 * Get the base URL for media files (removes /api if present)
 */
export const getMediaBaseUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};

/**
 * Convert a relative image URL to absolute URL
 * @param imageUrl - The image URL from API (could be relative or absolute)
 * @returns Absolute URL for the image
 */
export const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  
  // If already absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If relative URL, prepend the media base URL
  const baseUrl = getMediaBaseUrl();
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
