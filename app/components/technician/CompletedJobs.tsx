"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import JobCard from "./JobCard"
import type { Order } from "@/app/types"

interface CompletedJobsProps {
  jobs: Order[]
  onJobSelect?: (job: Order) => void
}

export default function CompletedJobs({ jobs, onJobSelect }: CompletedJobsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-1 sm:mb-2">Completed Jobs</h2>
        <p className="text-sm sm:text-base text-blue-600">Jobs you have successfully completed</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} isCompleted={true} onClick={() => onJobSelect?.(job)} />)
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">No Completed Jobs</h3>
              <p className="text-sm sm:text-base text-gray-500">Completed jobs will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
