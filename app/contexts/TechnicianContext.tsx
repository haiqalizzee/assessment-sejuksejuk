"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ordersService, techniciansService } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import type { Order, Technician } from "@/app/types"
import { toLocalDateString } from "@/lib/utils"

interface TechnicianContextType {
  technician: Technician | null
  assignedJobs: Order[]
  completedJobs: Order[]
  isLoading: boolean
  loadJobs: () => Promise<void>
  handleJobComplete: (jobId: string, completionData: {
    extraCharges: number
    finalAmount: number
    workDone: string
    remarks: string
    uploadedFiles: Array<{ url: string; name: string; type: string }>
  }) => Promise<void>
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined)

export function TechnicianProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [assignedJobs, setAssignedJobs] = useState<Order[]>([])
  const [completedJobs, setCompletedJobs] = useState<Order[]>([])
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const loadJobs = async (technicianId?: string) => {
    if (!technicianId && !technician?.id) return
    
    try {
      setIsLoading(true)
      const id = technicianId || technician?.id
      console.log("Loading jobs for technician:", id)
      
      // Get jobs by technician ID
      let allJobs = await ordersService.getByTechnician(id!)
      console.log("All jobs found for technician:", allJobs)
      
      const assignedJobs = allJobs.filter((job) => 
        job.status === "pending" || 
        job.status === "assigned" || 
        job.status === "in-progress" ||
        job.status === "rework-required"
      )
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

  const handleJobComplete = async (jobId: string, completionData: {
    extraCharges: number
    finalAmount: number
    workDone: string
    remarks: string
    uploadedFiles: Array<{ url: string; name: string; type: string }>
  }) => {
    try {
      await ordersService.update(jobId, {
        status: "completed",
        extraCharges: completionData.extraCharges,
        finalAmount: completionData.finalAmount,
        workDone: completionData.workDone,
        remarks: completionData.remarks,
        uploadedFiles: completionData.uploadedFiles,
        completedAt: toLocalDateTimeString(new Date()),
      })
      await loadJobs()
    } catch (error) {
      console.error("Error completing job:", error)
    }
  }

  const value = {
    technician,
    assignedJobs,
    completedJobs,
    isLoading,
    loadJobs,
    handleJobComplete,
  }

  return (
    <TechnicianContext.Provider value={value}>
      {children}
    </TechnicianContext.Provider>
  )
}

export function useTechnician() {
  const context = useContext(TechnicianContext)
  if (context === undefined) {
    throw new Error("useTechnician must be used within a TechnicianProvider")
  }
  return context
} 