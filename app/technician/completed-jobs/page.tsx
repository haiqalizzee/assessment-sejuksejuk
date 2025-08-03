"use client"

import { useRouter } from "next/navigation"
import CompletedJobs from "../../components/technician/CompletedJobs"
import { useTechnician } from "../../contexts/TechnicianContext"
import { usePageTitle } from "@/hooks/use-page-title"

export default function CompletedJobsPage() {
  usePageTitle("Completed Jobs")
  const { completedJobs, technician } = useTechnician()
  const router = useRouter()

  const handleJobSelect = (job: any) => {
    router.push(`/technician/job/${job.id}`)
  }

  return (
    <div>
      <CompletedJobs jobs={completedJobs} onJobSelect={handleJobSelect} />
    </div>
  )
} 