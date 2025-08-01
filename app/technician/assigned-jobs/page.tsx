"use client"

import { useRouter } from "next/navigation"
import AssignedJobs from "../../components/technician/AssignedJobs"
import { useTechnician } from "../../contexts/TechnicianContext"

export default function AssignedJobsPage() {
  const { assignedJobs, technician } = useTechnician()
  const router = useRouter()

  const handleJobSelect = (job: any) => {
    router.push(`/technician/job/${job.id}`)
  }

  return (
    <div>
      <AssignedJobs jobs={assignedJobs} onJobSelect={handleJobSelect} />
      {/* Debug info - remove this later */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>Current User:</strong> {technician?.name} ({technician?.email})</p>
        <p><strong>Technician ID:</strong> {technician?.id}</p>
        <p><strong>Assigned Jobs:</strong> {assignedJobs.length}</p>
      </div>
    </div>
  )
} 