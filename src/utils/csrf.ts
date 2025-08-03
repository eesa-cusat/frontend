/**
 * CSRF Token Management
 * Handles CSRF token retrieval and management for Django backend
 */

let csrfToken: string | null = null;

/**
 * Get CSRF token from cookies
 */
export const getCSRFTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Get CSRF token from meta tag
 */
export const getCSRFTokenFromMeta = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

/**
 * Fetch fresh CSRF token from backend
 */
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('http://localhost:8000/api/academics/resources/', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      // Wait a bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      return getCSRFTokenFromCookie();
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
};

/**
 * Get CSRF token with multiple fallback methods
 */
export const getCSRFToken = async (): Promise<string | null> => {
  // Try cached token first
  if (csrfToken) {
    return csrfToken;
  }
  
  // Try to get from cookie
  csrfToken = getCSRFTokenFromCookie();
  if (csrfToken) {
    return csrfToken;
  }
  
  // Try to get from meta tag
  csrfToken = getCSRFTokenFromMeta();
  if (csrfToken) {
    return csrfToken;
  }
  
  // Fetch fresh token from backend
  csrfToken = await fetchCSRFToken();
  return csrfToken;
};

/**
 * Clear cached CSRF token (call when getting 403 errors)
 */
export const clearCSRFToken = (): void => {
  csrfToken = null;
};

/**
 * Initialize session by making a GET request to establish cookies
 */
export const initializeSession = async (): Promise<void> => {
  try {
    await fetch('http://localhost:8000/api/academics/resources/', {
      method: 'GET',
      credentials: 'include',
    });
    // Small delay to ensure cookies are set
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Failed to initialize session:', error);
  }
};

/**
 * Get headers with CSRF token for API requests
 */
export const getCSRFHeaders = async (): Promise<Record<string, string>> => {
  const token = await getCSRFToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Referer': 'http://localhost:3000/',
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  if (token) {
    headers['X-CSRFToken'] = token;
  }
  
  return headers;
};
