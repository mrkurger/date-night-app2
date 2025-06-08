// Token types
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

// Token expiration times (in milliseconds)
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Token service for managing tokens
export const TokenService = {
  // Store tokens securely
  setTokens(tokens: Tokens): void {
    if (typeof window === 'undefined') return; // SSR safety check
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    // Set token expiry timestamps
    const accessExpiry = Date.now() + ACCESS_TOKEN_EXPIRY;
    const refreshExpiry = Date.now() + REFRESH_TOKEN_EXPIRY;

    localStorage.setItem(`${ACCESS_TOKEN_KEY}_expiry`, accessExpiry.toString());
    localStorage.setItem(`${REFRESH_TOKEN_KEY}_expiry`, refreshExpiry.toString());
  },

  // Get access token
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety check
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety check
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Clear all tokens
  clearTokens(): void {
    if (typeof window === 'undefined') return; // SSR safety check
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(`${ACCESS_TOKEN_KEY}_expiry`);
    localStorage.removeItem(`${REFRESH_TOKEN_KEY}_expiry`);
    localStorage.removeItem(USER_KEY);
  },

  // Check if access token is expired
  isAccessTokenExpired(): boolean {
    if (typeof window === 'undefined') return true; // SSR safety check
    const expiryStr = localStorage.getItem(`${ACCESS_TOKEN_KEY}_expiry`);
    if (!expiryStr) return true;

    const expiry = Number.parseInt(expiryStr, 10);
    return Date.now() > expiry;
  },

  // Check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    if (typeof window === 'undefined') return true; // SSR safety check
    const expiryStr = localStorage.getItem(`${REFRESH_TOKEN_KEY}_expiry`);
    if (!expiryStr) return true;

    const expiry = Number.parseInt(expiryStr, 10);
    return Date.now() > expiry;
  },

  // Store user data
  setUser(user: any): void {
    if (typeof window === 'undefined') return; // SSR safety check
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get user data
  getUser(): any {
    if (typeof window === 'undefined') return null; // SSR safety check
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
};
