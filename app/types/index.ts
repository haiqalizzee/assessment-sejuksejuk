export interface Order {
  id: string
  customerName: string
  phone: string
  address: string
  problemDescription: string
  serviceType: string
  quotedPrice: number
  assignedTechnicianId: string  // New field for technician ID
  assignedTechnician: string    // Keep name for display
  adminNotes: string
  status: "pending" | "in-progress" | "completed" | "assigned"
  createdAt: string
  assignedAt?: string
  // Job completion fields
  extraCharges?: number
  finalAmount?: number
  workDone?: string
  remarks?: string
  completedAt?: string
  uploadedFiles?: Array<{ url: string; name: string; type: string }>
}

export interface TechnicianKPI {
  name: string
  jobsDone: number
  totalAmount: number
  reworks: number
}

export interface Technician {
  id: string       // Format: TECH001, TECH002, etc.
  name: string
  phone: string
  email: string
  joinedDate: string
}

export interface FileUpload {
  id: string
  file: File
  preview: string
  type: "image" | "video" | "pdf"
}

export interface LoginCredentials {
  username: string
  password: string
  role: "admin" | "technician"
}

export type AdminPage = "dashboard" | "create-order" | "all-orders" | "kpi" | "technicians"
export type TechnicianPage = "assigned-jobs" | "completed-jobs" | "job-detail"
