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
      <div className="px-3 py-2 sm:px-4">
        <div className="flex flex-col sm:flex-row gap-1">
          <Button
            variant={currentPage === "assigned-jobs" ? "default" : "ghost"}
            onClick={() => onPageChange("assigned-jobs")}
            className={`flex-1 text-xs sm:text-sm ${
              currentPage === "assigned-jobs"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-50 bg-transparent"
            }`}
          >
            <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Assigned Jobs</span>
            <span className="sm:hidden">Assigned</span>
            <span className="ml-1">({assignedJobsCount})</span>
          </Button>
          <Button
            variant={currentPage === "completed-jobs" ? "default" : "ghost"}
            onClick={() => onPageChange("completed-jobs")}
            className={`flex-1 text-xs sm:text-sm ${
              currentPage === "completed-jobs"
                ? "bg-green-600 text-white"
                : "text-blue-700 hover:bg-blue-50 bg-transparent"
            }`}
          >
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Completed Jobs</span>
            <span className="sm:hidden">Completed</span>
            <span className="ml-1">({completedJobsCount})</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
