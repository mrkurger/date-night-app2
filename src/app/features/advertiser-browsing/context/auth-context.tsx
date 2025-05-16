"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user types
export type UserRole = "user" | "advertiser" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
})

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Mock login function
  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      if (email === "user@example.com" && password === "password") {
        const newUser: User = {
          id: "user-1",
          name: "Demo User",
          email: "user@example.com",
          role: "user",
          createdAt: new Date().toISOString(),
        }
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        return { success: true }
      }

      if (email === "advertiser@example.com" && password === "password") {
        const newUser: User = {
          id: "adv-1",
          name: "Demo Advertiser",
          email: "advertiser@example.com",
          role: "advertiser",
          createdAt: new Date().toISOString(),
        }
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        return { success: true }
      }

      return { success: false, message: "Invalid email or password" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  // Mock signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      if (!name || !email || !password) {
        return { success: false, message: "All fields are required" }
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, message: "An error occurred during signup" }
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // Update user function
  const updateUser = (data: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext)
}
