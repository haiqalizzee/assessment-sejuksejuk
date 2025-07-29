"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import JobCard from "./JobCard"
import type { Order } from "@/app/types"

interface CompletedJobsProps {
  jobs: Order[]
}

export default function CompletedJobs({ jobs }: CompletedJobsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Completed Jobs</h2>
        <p className="text-blue-600">Jobs you have successfully completed</p>
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} isCompleted={true} />)
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Completed Jobs</h3>
              <p className="text-gray-500">Completed jobs will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
