/**
 * Authentication context
 * Manages user authentication state and provides auth methods
 */
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  _id: string
  email: string
  name: string
  age: number
  bio: string
  gender: string
  interestedIn: string
  profilePicture?: string
  likes: string[]
  dislikes: string[]
  matches: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  register: (data: any) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken")
    if (savedToken) {
      setToken(savedToken)
      fetchCurrentUser(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("authToken")
        setToken(null)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: any) => {
    try {
      setError(null)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Registration failed")
      }

      const { token: newToken, user: userData } = await response.json()
      setToken(newToken)
      setUser(userData)
      localStorage.setItem("authToken", newToken)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const { token: newToken, user: userData } = await response.json()
      setToken(newToken)
      setUser(userData)
      localStorage.setItem("authToken", newToken)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("authToken")
  }

  const updateProfile = async (data: any) => {
    try {
      setError(null)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
