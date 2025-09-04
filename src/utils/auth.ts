import { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'eesa_access_token';
const REFRESH_TOKEN_KEY = 'eesa_refresh_token';

// In-memory cache for user session to prevent multiple API calls
let sessionCache: {
  user: any | null;
  timestamp: number;
  ttl: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const tokenStorage = {
  setTokens: (tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;
    
    // Clear any existing session cache when tokens change
    sessionCache = null;
    
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getTokens: (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!access || !refresh) return null;
    
    return { access, refresh };
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    // Clear session cache
    sessionCache = null;
    
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    // Add 30 second buffer to prevent race conditions
    return payload.exp < (currentTime + 30);
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

// Session cache utilities
export const sessionUserCache = {
  get: () => {
    if (!sessionCache) return null;
    
    const now = Date.now();
    if (now - sessionCache.timestamp > sessionCache.ttl) {
      sessionCache = null;
      return null;
    }
    
    return sessionCache.user;
  },

  set: (user: any) => {
    sessionCache = {
      user,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };
  },

  clear: () => {
    sessionCache = null;
  }
};
