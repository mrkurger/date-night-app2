// Token types
export interface Tokens {
  accessToken: string
  refreshToken: string
}

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_KEY = "user"

// Token expiration times (in milliseconds)
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000 // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

// Token service for managing tokens
export const TokenService = {
  // Store tokens securely
  setTokens(tokens: Tokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)

    // Set token expiry timestamps
    const accessExpiry = Date.now() + ACCESS_TOKEN_EXPIRY
    const refreshExpiry = Date.now() + REFRESH_TOKEN_EXPIRY

    localStorage.setItem(`${ACCESS_TOKEN_KEY}_expiry`, accessExpiry.toString())
    localStorage.setItem(`${REFRESH_TOKEN_KEY}_expiry`, refreshExpiry.toString())
  },

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(`${ACCESS_TOKEN_KEY}_expiry`)
    localStorage.removeItem(`${REFRESH_TOKEN_KEY}_expiry`)
    localStorage.removeItem(USER_KEY)
  },

  // Check if access token is expired
  isAccessTokenExpired(): boolean {
    const expiryStr = localStorage.getItem(`${ACCESS_TOKEN_KEY}_expiry`)
    if (!expiryStr) return true

    const expiry = Number.parseInt(expiryStr, 10)
    return Date.now() > expiry
  },

  // Check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    const expiryStr = localStorage.getItem(`${REFRESH_TOKEN_KEY}_expiry`)
    if (!expiryStr) return true

    const expiry = Number.parseInt(expiryStr, 10)
    return Date.now() > expiry
  },

  // Store user data
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Get user data
  getUser(): any {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  },
}
