"use client"

import { useRouter } from "next/navigation"
import AssignedJobs from "../../components/technician/AssignedJobs"
import { useTechnician } from "../../contexts/TechnicianContext"
import { usePageTitle } from "@/hooks/use-page-title"

export default function AssignedJobsPage() {
  usePageTitle("Assigned Jobs")
  const { assignedJobs, technician } = useTechnician()
  const router = useRouter()

  const handleJobSelect = (job: any) => {
    router.push(`/technician/job/${job.id}`)
  }

  return (
    <div>
      <AssignedJobs jobs={assignedJobs} onJobSelect={handleJobSelect} />
    </div>
  )
} 