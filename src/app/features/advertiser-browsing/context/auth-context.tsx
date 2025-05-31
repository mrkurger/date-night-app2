'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define user types
export type UserRole = 'user' | 'advertiser' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// Update AuthContext initialization to allow undefined values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error loading user:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    if (typeof window !== 'undefined') {
      try {
        // In a real app, this would be an API call
        if (email === 'user@example.com' && password === 'password') {
          const newUser: User = {
            id: 'user-1',
            name: 'Demo User',
            email: 'user@example.com',
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          return { success: true };
        }

        if (email === 'advertiser@example.com' && password === 'password') {
          const newUser: User = {
            id: 'adv-1',
            name: 'Demo Advertiser',
            email: 'advertiser@example.com',
            role: 'advertiser',
            createdAt: new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          return { success: true };
        }

        return { success: false, message: 'Invalid email or password' };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'An error occurred during login' };
      }
    }
    return { success: false, message: 'localStorage is not available' };
  };

  // Mock signup function
  const signup = async (name: string, email: string, password: string) => {
    if (typeof window !== 'undefined') {
      try {
        // In a real app, this would be an API call
        if (!name || !email || !password) {
          return { success: false, message: 'All fields are required' };
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true };
      } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'An error occurred during signup' };
      }
    }
    return { success: false, message: 'localStorage is not available' };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Update user function
  const updateUser = (data: Partial<User>) => {
    if (typeof window !== 'undefined' && user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Add logging to debug AuthContext initialization
  useEffect(() => {
    console.log('AuthContext initialized with:', {
      user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    });
  }, [user, isLoading, login, signup, logout, updateUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
