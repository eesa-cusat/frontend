export type UserRole = 'student' | 'teacher' | 'alumni' | 'tech_head' | 'admin';
export type UserGroup = 'academics_team' | 'events_team' | 'careers_team' | 'people_team';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  groups: UserGroup[];
  is_staff: boolean;
  is_superuser: boolean;
  role?: UserRole;
  profile_picture?: string;
  is_verified?: boolean;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
}
