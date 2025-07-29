"use client"

import { Button } from "@/components/ui/button"
import { ClipboardList, CheckCircle } from "lucide-react"
import type { TechnicianPage } from "@/app/types"

interface TechnicianNavigationProps {
  currentPage: TechnicianPage
  onPageChange: (page: TechnicianPage) => void
  assignedJobsCount: number
  completedJobsCount: number
}

export default function TechnicianNavigation({
  currentPage,
  onPageChange,
  assignedJobsCount,
  completedJobsCount,
}: TechnicianNavigationProps) {
  if (currentPage === "job-detail") return null

  return (
    <div className="bg-white border-b border-blue-100">
      <div className="px-4 py-2">
        <div className="flex gap-1">
          <Button
            variant={currentPage === "assigned-jobs" ? "default" : "ghost"}
            onClick={() => onPageChange("assigned-jobs")}
            className={
              currentPage === "assigned-jobs"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-50 bg-transparent"
            }
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Assigned Jobs ({assignedJobsCount})
          </Button>
          <Button
            variant={currentPage === "completed-jobs" ? "default" : "ghost"}
            onClick={() => onPageChange("completed-jobs")}
            className={
              currentPage === "completed-jobs"
                ? "bg-green-600 text-white"
                : "text-blue-700 hover:bg-blue-50 bg-transparent"
            }
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed Jobs ({completedJobsCount})
          </Button>
        </div>
      </div>
    </div>
  )
}
