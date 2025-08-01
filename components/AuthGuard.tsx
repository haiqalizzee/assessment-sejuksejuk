"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { techniciansService } from "@/lib/firebase-services"
import type { UserRole } from "@/app/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return

      // If no user is logged in, redirect to login
      if (!user) {
        router.push("/")
        return
      }

      // If no role is required, just check if user is logged in
      if (!requiredRole) {
        setIsAuthorized(true)
        setCheckingAuth(false)
        return
      }

      // Check if user has the required role
      if (userProfile) {
        const userRole = userProfile.role || (user.email?.startsWith("admin") ? "admin" : "technician")
        
        if (userRole === requiredRole) {
          setIsAuthorized(true)
        } else {
          // User doesn't have the required role
          if (userRole === "admin") {
            router.push("/admin/dashboard")
          } else if (userRole === "technician") {
            router.push("/technician/assigned-jobs")
          } else {
            router.push("/")
          }
          return
        }
      } else {
        // For technician role, check if they exist in technicians collection
        if (requiredRole === "technician") {
          try {
            const technicians = await techniciansService.getAll()
            const technician = technicians.find(t => t.email === user.email)
            
            if (technician) {
              setIsAuthorized(true)
            } else {
              router.push("/")
              return
            }
          } catch (error) {
            console.error("Error checking technician authorization:", error)
            router.push("/")
            return
          }
        } else {
          // For admin role, check email pattern
          if (user.email?.startsWith("admin")) {
            setIsAuthorized(true)
          } else {
            router.push("/")
            return
          }
        }
      }

      setCheckingAuth(false)
    }

    checkAuthorization()
  }, [user, userProfile, loading, requiredRole, router])

  // Show loading while checking authorization
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-blue-900 font-semibold">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Show fallback or children based on authorization
  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-red-900 font-semibold">Access Denied</p>
          <p className="text-red-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 