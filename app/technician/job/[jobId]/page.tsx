"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import JobDetail from "../../../components/technician/JobDetail"
import { useTechnician } from "../../../contexts/TechnicianContext"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "@/app/types"
import { usePageTitle } from "@/hooks/use-page-title"

export default function JobDetailPage() {
  usePageTitle("Job Details")
  const params = useParams()
  const router = useRouter()
  const { handleJobComplete } = useTechnician()
  const [job, setJob] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const jobId = params.jobId as string

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const loadJob = async () => {
    try {
      setIsLoading(true)
      const jobData = await ordersService.getById(jobId)
      setJob(jobData)
    } catch (error) {
      console.error("Error loading job:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/technician/assigned-jobs")
  }

  const handleComplete = async (completionData: {
    extraCharges: number
    finalAmount: number
    workDone: string
    remarks: string
    uploadedFiles: Array<{ url: string; name: string; type: string }>
  }) => {
    await handleJobComplete(jobId, completionData)
    router.push("/technician/assigned-jobs")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Job not found</div>
      </div>
    )
  }

  return (
    <JobDetail
      job={job}
      onBack={handleBack}
      onJobComplete={handleComplete}
    />
  )
} 