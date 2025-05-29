import { TokenService } from "./token-service"
import { AuthAPI } from "./api-service"

// API client with token refresh interceptor
export const apiClient = {
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Check if access token is expired and refresh token is available
    if (
      TokenService.isAccessTokenExpired() &&
      TokenService.getRefreshToken() &&
      !TokenService.isRefreshTokenExpired()
    ) {
      try {
        // Refresh the token
        const refreshToken = TokenService.getRefreshToken()!
        const tokens = await AuthAPI.refreshToken(refreshToken)

        // Store new tokens
        TokenService.setTokens(tokens)
      } catch (error) {
        // If refresh fails, clear tokens and force re-login
        console.error("Token refresh failed:", error)
        TokenService.clearTokens()
        window.location.href = "/login?session_expired=true"
        throw new Error("Authentication expired. Please login again.")
      }
    }

    // Get the current access token
    const accessToken = TokenService.getAccessToken()

    // Add authorization header if token exists
    const headers = new Headers(options.headers || {})
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }

    // Make the request with the updated headers
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      // Clear tokens and redirect to login
      TokenService.clearTokens()
      window.location.href = "/login?session_expired=true"
      throw new Error("Authentication expired. Please login again.")
    }

    return response
  },

  // Helper methods for common HTTP methods
  async get(url: string, options: RequestInit = {}): Promise<any> {
    const response = await this.fetch(url, { ...options, method: "GET" })
    return response.json()
  },

  async post(url: string, data: any, options: RequestInit = {}): Promise<any> {
    const response = await this.fetch(url, {
      ...options,
      method: "POST",
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async put(url: string, data: any, options: RequestInit = {}): Promise<any> {
    const response = await this.fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(url: string, options: RequestInit = {}): Promise<any> {
    const response = await this.fetch(url, { ...options, method: "DELETE" })
    return response.json()
  },
}
