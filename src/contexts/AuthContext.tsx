"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User, AuthState, AuthTokens, LoginCredentials } from "@/types/auth";
import { tokenStorage, getTokenPayload, sessionUserCache } from "@/utils/auth";
import { authApi } from "@/lib/authApi";
import toast from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canAccessAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TOKENS"; payload: AuthTokens | null }
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
    case "SET_TOKENS":
      return { ...state, tokens: action.payload };
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
  isLoading: false, // Start with false to not block public pages
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await authApi.login(credentials);
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
    sessionUserCache.clear(); // Clear session cache
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    try {
      const user = await authApi.getCurrentUser();
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const canAccessAdmin = (): boolean => {
    if (!state.user) return false;
    if (state.user.is_superuser || state.user.is_staff) return true;
    return state.user.groups && state.user.groups.length > 0;
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // Check session cache first
      const cachedUser = sessionUserCache.get();
      if (cachedUser) {
        dispatch({ type: "SET_USER", payload: cachedUser });
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      const tokens = tokenStorage.getTokens();
      if (!tokens) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        // Validate token and get user data
        const payload = getTokenPayload(tokens.access);
        if (!payload) {
          throw new Error("Invalid token");
        }

        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          throw new Error("Token expired");
        }

        dispatch({ type: "SET_TOKENS", payload: tokens });

        // Only fetch user data if we don't have it in cache
        const user = await authApi.getCurrentUser();
        sessionUserCache.set(user); // Cache the user data
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        tokenStorage.clearTokens();
        sessionUserCache.clear();
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    // Only initialize once
    if (!state.isAuthenticated && !state.isLoading) {
      initAuth();
    }
  }, []); // Empty dependency array to run only once

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
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
