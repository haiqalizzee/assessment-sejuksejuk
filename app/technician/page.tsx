"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePageTitle } from "@/hooks/use-page-title"

export default function TechnicianPage() {
  usePageTitle("Assigned Jobs")
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