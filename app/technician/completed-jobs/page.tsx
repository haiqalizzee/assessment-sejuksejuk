"use client"

import CompletedJobs from "../../components/technician/CompletedJobs"
import { useTechnician } from "../../contexts/TechnicianContext"
import { usePageTitle } from "@/hooks/use-page-title"

export default function CompletedJobsPage() {
  usePageTitle("Completed Jobs")
  const { completedJobs, technician } = useTechnician()

  return (
    <div>
      <CompletedJobs jobs={completedJobs} />
      {/* Debug info - remove this later */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>Current User:</strong> {technician?.name} ({technician?.email})</p>
        <p><strong>Technician ID:</strong> {technician?.id}</p>
        <p><strong>Completed Jobs:</strong> {completedJobs.length}</p>
      </div>
    </div>
  )
} 