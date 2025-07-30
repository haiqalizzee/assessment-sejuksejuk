"use client"

import { useState, useEffect } from "react"
import TechnicianHeader from "./technician/TechnicianHeader"
import TechnicianNavigation from "./technician/TechnicianNavigation"
import AssignedJobs from "./technician/AssignedJobs"
import CompletedJobs from "./technician/CompletedJobs"
import JobDetail from "./technician/JobDetail"
import { ordersService, techniciansService } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import type { Order, TechnicianPage, Technician } from "@/app/types"

interface TechnicianPortalProps {
  onBack: () => void
}

export default function TechnicianPortal({ onBack }: TechnicianPortalProps) {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<TechnicianPage>("assigned-jobs")
  const [selectedJob, setSelectedJob] = useState<Order | null>(null)
  const [assignedJobs, setAssignedJobs] = useState<Order[]>([])
  const [completedJobs, setCompletedJobs] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [technician, setTechnician] = useState<Technician | null>(null)

  useEffect(() => {
    if (user?.email) {
      loadTechnicianData()
    }
  }, [user])

  const loadTechnicianData = async () => {
    try {
      // Get all technicians and find by email
      const technicians = await techniciansService.getAll()
      console.log("All technicians:", technicians)
      console.log("Current user email:", user?.email)
      
      const technicianData = technicians.find(t => t.email === user?.email)
      console.log("Found technician data:", technicianData)
      
      if (technicianData) {
        console.log("Setting technician with ID:", technicianData.id)
        setTechnician(technicianData)
        loadJobs(technicianData.id)
      } else {
        console.error("No technician found for email:", user?.email)
      }
    } catch (error) {
      console.error("Error loading technician data:", error)
    }
  }

  const loadJobs = async (technicianId: string) => {
    try {
      setIsLoading(true)
      console.log("Loading jobs for technician:", technicianId)
      
      // Get jobs by technician ID
      let allJobs = await ordersService.getByTechnician(technicianId)
      console.log("All jobs found for technician:", allJobs)
      
      const assignedJobs = allJobs.filter((job) => job.status === "pending" || job.status === "assigned" || job.status === "in-progress")
      const completedJobs = allJobs.filter((job) => job.status === "completed")
      
      console.log("Assigned jobs:", assignedJobs)
      console.log("Completed jobs:", completedJobs)
      
      setAssignedJobs(assignedJobs)
      setCompletedJobs(completedJobs)
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobSelect = (job: Order) => {
    setSelectedJob(job)
    setCurrentPage("job-detail")
  }

  const handleJobComplete = async (completionData: {
    extraCharges: number
    finalAmount: number
    workDone: string
    remarks: string
    uploadedFiles: Array<{ url: string; name: string; type: string }>
  }) => {
    if (selectedJob) {
      try {
        await ordersService.update(selectedJob.id, {
          status: "completed",
          extraCharges: completionData.extraCharges,
          finalAmount: completionData.finalAmount,
          workDone: completionData.workDone,
          remarks: completionData.remarks,
          uploadedFiles: completionData.uploadedFiles,
          completedAt: new Date().toISOString(),
        })
        await loadJobs(technician?.id || "")
      } catch (error) {
        console.error("Error completing job:", error)
      }
    }

    setSelectedJob(null)
    setCurrentPage("assigned-jobs")
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-blue-600">Loading jobs...</div>
        </div>
      )
    }

    switch (currentPage) {
      case "job-detail":
        if (!selectedJob) return null
        return (
          <JobDetail
            job={selectedJob}
            onBack={() => setCurrentPage("assigned-jobs")}
            onJobComplete={handleJobComplete}
          />
        )
      case "completed-jobs":
        return <CompletedJobs jobs={completedJobs} />
      default:
        return (
          <div>
            <AssignedJobs jobs={assignedJobs} onJobSelect={handleJobSelect} />
            {/* Debug info - remove this later */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p><strong>Current User:</strong> {technician?.name} ({technician?.email})</p>
              <p><strong>Technician ID:</strong> {technician?.id}</p>
              <p><strong>Assigned Jobs:</strong> {assignedJobs.length}</p>
              <p><strong>Completed Jobs:</strong> {completedJobs.length}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TechnicianHeader onBack={onBack} />

      {/* Navigation */}
      <TechnicianNavigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        assignedJobsCount={assignedJobs.length}
        completedJobsCount={completedJobs.length}
      />

      {/* Main Content */}
      <main className="px-3 py-3 sm:px-4 sm:py-4">{renderContent()}</main>
    </div>
  )
}
