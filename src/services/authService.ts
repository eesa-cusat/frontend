interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Get CSRF token from Django
  async getCSRFToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      return data.csrfToken || '';
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return '';
    }
  }

  // Login method
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const csrfToken = await this.getCSRFToken();
      
      const response = await fetch(`${this.baseUrl}/accounts/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error during login' };
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      const csrfToken = await this.getCSRFToken();
      
      await fetch(`${this.baseUrl}/accounts/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Verify session with backend
  async verifySession(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/user/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
          return true;
        }
      }
      
      // If verification fails, clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      return false;
    } catch (error) {
      console.error('Session verification error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      return false;
    }
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const csrfToken = await this.getCSRFToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    };

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  }
}

export default AuthService;
