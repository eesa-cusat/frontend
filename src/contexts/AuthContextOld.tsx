"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials, UserGroup } from "@/types/auth";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasGroupAccess: (groupName: string) => boolean;
  canAccessAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await apiRequest<{ user: User; tokens: AuthTokens }>(
        "POST",
        "/auth/login/",
        credentials
      );

      const { user, tokens } = response;

      tokenStorage.setTokens(tokens);
      dispatch({ type: "SET_TOKENS", payload: tokens });
      dispatch({ type: "SET_USER", payload: user });

      toast.success("Login successful!");
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    try {
      const user = await apiRequest<User>("GET", "/auth/profile/");
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const hasGroupAccess = (groupName: string): boolean => {
    if (!state.user) return false;
    if (state.user.is_superuser) return true;
    return state.user.groups.includes(groupName as any);
  };

  const canAccessAdmin = (): boolean => {
    if (!state.user) return false;
    if (state.user.is_superuser || state.user.is_staff) return true;
    return state.user.groups.length > 0;
  };

  const hasGroupAccess = (group: UserGroup): boolean => {
    return authService.hasGroupAccess(state.user, group);
  };

  const canAccessAdmin = (): boolean => {
    return authService.canAccessAdmin(state.user);
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Try to get current user to check if session is valid
        const user = await authService.getCurrentUser();
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        // If we get a 403 or any auth error, it just means no valid session exists
        // This is normal behavior when the user hasn't logged in yet
        console.log("No valid session found, user needs to log in");
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
        hasGroupAccess,
        canAccessAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
