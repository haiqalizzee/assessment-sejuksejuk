"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "technician"
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to landing page
        router.push("/")
        return
      }

      if (requiredRole && userProfile) {
        const userRole = userProfile.role || (user.email?.startsWith("admin") ? "admin" : "technician")
        
        if (userRole !== requiredRole) {
          // Wrong role, redirect to appropriate portal
          if (userRole === "admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/technician")
          }
          return
        }
      }
    }
  }, [user, userProfile, loading, requiredRole, router])

  // Show loading while checking auth
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

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-blue-900 font-semibold">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Check role if required
  if (requiredRole && userProfile) {
    const userRole = userProfile.role || (user.email?.startsWith("admin") ? "admin" : "technician")
    
    if (userRole !== requiredRole) {
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
  }

  return <>{children}</>
} 