"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase-services"
import { isConfigValid } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  isConfigured: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigValid) {
      setLoading(false)
      return
    }

    let unsubscribe: (() => void) | undefined

    const initializeAuth = async () => {
      try {
        // Small delay to ensure Firebase is fully ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        const auth = getFirebaseAuth()

        // Set persistence to keep user logged in across sessions
        try {
          await setPersistence(auth, browserLocalPersistence)
        } catch (persistenceError) {
          console.warn("Could not set auth persistence:", persistenceError)
        }

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user)
          
          if (user && user.email) {
            // Create profile based on email pattern
            const profile = {
              email: user.email,
              role: user.email.startsWith("admin") ? "admin" : "technician",
              name: user.email.split("@")[0] || "User"
            }
            setUserProfile(profile)
          } else {
            setUserProfile(null)
          }
          
          setLoading(false)
        })
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!isConfigValid) throw new Error("Firebase not configured")

    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Login error:", error)
      throw new Error(error.message || "Login failed")
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    if (!isConfigValid) throw new Error("Firebase not configured")

    try {
      const auth = getFirebaseAuth()
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Registration error:", error)
      throw new Error(error.message || "Registration failed")
    }
  }

  const logout = async () => {
    if (!isConfigValid) throw new Error("Firebase not configured")

    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
    } catch (error: any) {
      console.error("Logout error:", error)
      throw new Error(error.message || "Logout failed")
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isConfigured: isConfigValid,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
