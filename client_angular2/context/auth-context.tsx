'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { TokenService } from '../lib/token-service';
import { AuthAPI } from '../lib/api-service';

interface User {
  id: string;
  name: string;
  email: string;
  isVipMember: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a valid session
        const storedUser = TokenService.getUser();

        if (storedUser) {
          // Check if tokens are valid
          if (TokenService.isAccessTokenExpired()) {
            // Try to refresh the token if refresh token is available
            if (TokenService.getRefreshToken() && !TokenService.isRefreshTokenExpired()) {
              await refreshSession();
            } else {
              // If refresh token is expired or not available, clear everything
              TokenService.clearTokens();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            // Access token is still valid
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenService.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Refresh session using refresh token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) return false;

      // Get new tokens
      const tokens = await AuthAPI.refreshToken(refreshToken);
      TokenService.setTokens(tokens);

      // Get user data from storage (or you could fetch fresh user data here)
      const userData = TokenService.getUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      TokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call login API
      const { tokens, user: userData } = await AuthAPI.login(email, password);

      // Store tokens and user data
      TokenService.setTokens(tokens);
      TokenService.setUser(userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call register API
      const { tokens, user: userData } = await AuthAPI.register(name, email, password);

      // Store tokens and user data
      TokenService.setTokens(tokens);
      TokenService.setUser(userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout API to invalidate tokens on server
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server logout fails
    } finally {
      // Clear local tokens and state
      TokenService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  console.log('AuthContext initialized with login:', login);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isLoading,
        isAuthenticated,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { AuthContextType };
