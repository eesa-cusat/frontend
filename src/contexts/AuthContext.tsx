"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState, AuthTokens, LoginCredentials } from "@/types/auth";
import { tokenStorage, getTokenPayload } from "@/utils/auth";
import { apiRequest } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
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

        dispatch({ type: "SET_TOKENS", payload: tokens });

        // Try to get user profile to verify token is still valid
        const user = await apiRequest<User>("GET", "/auth/profile/");
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        console.error("Auth initialization failed:", error);
        tokenStorage.clearTokens();
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
