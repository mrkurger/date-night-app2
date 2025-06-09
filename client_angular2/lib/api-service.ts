import { TokenService, type Tokens } from './token-service';

// Base API URL
const API_BASE_URL = 'http://localhost:3000/api/v1'; // Updated to match server port in .env

// Mock API responses for demonstration
const mockResponses = {
  login: {
    accessToken: 'mock_access_token_' + Math.random().toString(36).substring(2),
    refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(2),
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      isVipMember: false,
    },
  },
  register: {
    accessToken: 'mock_access_token_' + Math.random().toString(36).substring(2),
    refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(2),
    user: {
      id: 'user-' + Date.now(),
      name: '',
      email: '',
      isVipMember: false,
    },
  },
  refresh: {
    accessToken: 'mock_access_token_' + Math.random().toString(36).substring(2),
    refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substring(2),
  },
};

// API service for authentication
export const AuthAPI = {
  // Login user
  async login(email: string, password: string): Promise<{ tokens: Tokens; user: any }> {
    try {
      // Real API call
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        user: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please check your credentials.');
    }
  },

  // Register user
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ tokens: Tokens; user: any }> {
    try {
      // Real API call
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        user: data.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register. Please try again.');
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<Tokens> {
    try {
      // Real API call
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh authentication. Please login again.');
    }
  },

  // Logout user (revoke tokens on server)
  async logout(): Promise<void> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) return;

      // Real API call
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server logout fails
    }
  },
};
