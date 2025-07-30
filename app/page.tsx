"use client"

import { useState, useEffect } from "react"
import LandingPage from "./components/LandingPage"
import AdminPortal from "./components/AdminPortal"
import TechnicianPortal from "./components/TechnicianPortal"
import { useAuth } from "@/contexts/AuthContext"
import type { UserRole } from "./types"

export default function App() {
  const { user, userProfile, logout, loading, isConfigured } = useAuth()
  const [currentRole, setCurrentRole] = useState<UserRole>("landing")

  useEffect(() => {
    if (!loading && user && userProfile) {
      // Determine role based on user profile or email
      const role = userProfile.role || (user.email?.startsWith("admin") ? "admin" : "technician")
      setCurrentRole(role)
    } else if (!loading && !user) {
      setCurrentRole("landing")
    }
  }, [user, userProfile, loading])

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

  const renderCurrentView = () => {
    switch (currentRole) {
      case "admin":
        return <AdminPortal onBack={handleLogout} />
      case "technician":
        return <TechnicianPortal onBack={handleLogout} />
      default:
        return <LandingPage onRoleSelect={handleRoleSelect} />
    }
  }

  return <div className="min-h-screen">{renderCurrentView()}</div>
}
