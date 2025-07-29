"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"
import JobCard from "./JobCard"
import type { Order } from "@/app/types"

interface AssignedJobsProps {
  jobs: Order[]
  onJobSelect: (job: Order) => void
}

export default function AssignedJobs({ jobs, onJobSelect }: AssignedJobsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Assigned Jobs</h2>
        <p className="text-blue-600">Jobs assigned to you for completion</p>
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} onClick={() => onJobSelect(job)} />)
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Assigned Jobs</h3>
              <p className="text-gray-500">New job assignments will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
