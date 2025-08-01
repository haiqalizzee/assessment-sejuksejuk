"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TechnicianPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/technician/assigned-jobs")
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-600">Redirecting...</div>
    </div>
  )
} 