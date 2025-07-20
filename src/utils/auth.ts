import Cookies from 'js-cookie';
import { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'eesa_access_token';
const REFRESH_TOKEN_KEY = 'eesa_refresh_token';

export const tokenStorage = {
  setTokens: (tokens: AuthTokens) => {
    Cookies.set(ACCESS_TOKEN_KEY, tokens.access, { 
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set(REFRESH_TOKEN_KEY, tokens.refresh, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  getAccessToken: (): string | null => {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  },

  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  },

  getTokens: (): AuthTokens | null => {
    const access = Cookies.get(ACCESS_TOKEN_KEY);
    const refresh = Cookies.get(REFRESH_TOKEN_KEY);
    
    if (!access || !refresh) return null;
    
    return { access, refresh };
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
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
