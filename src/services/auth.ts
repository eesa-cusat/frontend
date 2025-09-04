import { User, UserGroup } from '@/types/auth';

export const authService = {
  canAccessAdmin: (user: User | null): boolean => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;
    return user.groups && user.groups.length > 0;
  },

  hasGroupAccess: (user: User | null, group: UserGroup): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.groups?.some(g => g === group) || false;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch('/api/accounts/auth/me/', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return response.json();
  }
};
