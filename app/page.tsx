"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "./components/LandingPage"
import { useAuth } from "@/contexts/AuthContext"
import type { UserRole } from "./types"

export default function App() {
  const { user, userProfile, logout, loading, isConfigured } = useAuth()
  const [currentRole, setCurrentRole] = useState<UserRole>("landing")
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && userProfile) {
      // Determine role based on user profile or email
      const role = userProfile.role || (user.email?.startsWith("admin") ? "admin" : "technician")
      setCurrentRole(role)
      
      // Redirect based on role
      if (role === "admin") {
        router.push("/admin/dashboard")
      } else if (role === "technician") {
        router.push("/technician")
      }
    } else if (!loading && !user) {
      setCurrentRole("landing")
    }
  }, [user, userProfile, loading, router])

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentRole("landing")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Show loading screen while Firebase initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-blue-900 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  // Only show landing page if user is not authenticated
  if (!user) {
    return <LandingPage onRoleSelect={handleRoleSelect} />
  }

  // Show loading while redirecting authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        <p className="text-blue-900 font-semibold">Redirecting...</p>
      </div>
    </div>
  )
}
