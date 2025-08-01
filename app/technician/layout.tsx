"use client"

import { useRouter } from "next/navigation"
import TechnicianHeader from "../components/technician/TechnicianHeader"
import TechnicianNavigation from "../components/technician/TechnicianNavigation"
import { TechnicianProvider, useTechnician } from "../contexts/TechnicianContext"
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/AuthGuard"

function TechnicianLayoutContent({ children }: { children: React.ReactNode }) {
  const { assignedJobs, completedJobs, isLoading } = useTechnician()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TechnicianHeader onBack={handleLogout} />

      {/* Navigation */}
      <TechnicianNavigation
        assignedJobsCount={assignedJobs.length}
        completedJobsCount={completedJobs.length}
      />

      {/* Main Content */}
      <main className="px-3 py-3 sm:px-4 sm:py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-blue-600">Loading jobs...</div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="technician">
      <TechnicianProvider>
        <TechnicianLayoutContent>{children}</TechnicianLayoutContent>
      </TechnicianProvider>
    </AuthGuard>
  )
} 