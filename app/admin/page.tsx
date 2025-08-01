"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDefaultPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/admin/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-600">Redirecting to dashboard...</div>
    </div>
  )
} 