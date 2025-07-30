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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-1 sm:mb-2">Assigned Jobs</h2>
        <p className="text-sm sm:text-base text-blue-600">Jobs assigned to you for completion</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} onClick={() => onJobSelect(job)} />)
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">No Assigned Jobs</h3>
              <p className="text-sm sm:text-base text-gray-500">New job assignments will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
