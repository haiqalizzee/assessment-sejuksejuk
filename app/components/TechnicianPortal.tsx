"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface TechnicianPortalProps {
  onBack: () => void
}

export default function TechnicianPortal({ onBack }: TechnicianPortalProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new URL-based technician portal
    router.push("/technician")
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        <p className="text-blue-900 font-semibold">Redirecting to technician portal...</p>
      </div>
    </div>
  )
}
