import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  limit,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { app, isConfigValid } from "./firebase"
import type { Order, Technician, TechnicianKPI } from "@/app/types"

// Lazy initialization of Firebase services
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

const initializeServices = () => {
  if (!app || !isConfigValid) {
    throw new Error("Firebase is not properly configured")
  }

  if (!auth) {
    auth = getAuth(app)
  }
  if (!db) {
    db = getFirestore(app)
  }
  if (!storage) {
    storage = getStorage(app)
  }

  return { auth, db, storage }
}

// Export getters for services
export const getFirebaseAuth = () => {
  const services = initializeServices()
  return services.auth
}

export const getFirebaseDb = () => {
  const services = initializeServices()
  return services.db
}

export const getFirebaseStorage = () => {
  const services = initializeServices()
  return services.storage
}

// Collections
const ORDERS_COLLECTION = "orders"
const TECHNICIANS_COLLECTION = "technicians"
const USERS_COLLECTION = "users"

// Helper function to handle Firestore timestamp conversion
const convertTimestamp = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString().split("T")[0]
  if (timestamp.toDate) return timestamp.toDate().toISOString().split("T")[0]
  if (typeof timestamp === "string") return timestamp
  return new Date(timestamp).toISOString().split("T")[0]
}

// Helper function to generate technician ID
const generateTechnicianId = async (): Promise<string> => {
  try {
    const firestore = getFirebaseDb()
    const querySnapshot = await getDocs(
      query(collection(firestore, TECHNICIANS_COLLECTION), orderBy("id", "desc"), limit(1))
    )
    
    if (querySnapshot.empty) {
      return "TECH001"
    }

    const lastId = querySnapshot.docs[0].data().id
    const numericPart = parseInt(lastId.replace("TECH", ""))
    const nextNumericPart = numericPart + 1
    return `TECH${nextNumericPart.toString().padStart(3, "0")}`
  } catch (error) {
    console.error("Error generating technician ID:", error)
    throw error
  }
}

// Orders Services
export const ordersService = {
  // Get all orders
  async getAll(): Promise<Order[]> {
    try {
      const firestore = getFirebaseDb()
      const querySnapshot = await getDocs(query(collection(firestore, ORDERS_COLLECTION), orderBy("createdAt", "desc")))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Order[]
    } catch (error) {
      console.error("Error getting orders:", error)
      return []
    }
  },

  // Get orders by technician
  async getByTechnician(technicianId: string): Promise<Order[]> {
    try {
      const firestore = getFirebaseDb()
      const querySnapshot = await getDocs(
        query(
          collection(firestore, ORDERS_COLLECTION),
          where("assignedTechnicianId", "==", technicianId),
          orderBy("createdAt", "desc"),
        ),
      )
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
      })) as Order[]
    } catch (error) {
      console.error("Error getting orders by technician:", error)
      return []
    }
  },

  // Create new order
  async create(orderData: Omit<Order, "id">): Promise<string> {
    try {
      const firestore = getFirebaseDb()
      const docRef = await addDoc(collection(firestore, ORDERS_COLLECTION), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },

  // Create new order with custom ID
  async createWithId(id: string, orderData: Omit<Order, "id">): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await setDoc(doc(firestore, ORDERS_COLLECTION, id), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error creating order with custom ID:", error)
      throw error
    }
  },

  // Update order
  async update(id: string, updates: Partial<Order>): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await updateDoc(doc(firestore, ORDERS_COLLECTION, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  },

  // Delete order
  async delete(id: string): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await deleteDoc(doc(firestore, ORDERS_COLLECTION, id))
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  },

  // Listen to orders changes
  onSnapshot(callback: (orders: Order[]) => void) {
    try {
      const firestore = getFirebaseDb()
      return onSnapshot(
        query(collection(firestore, ORDERS_COLLECTION), orderBy("createdAt", "desc")),
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt),
          })) as Order[]
          callback(orders)
        },
        (error) => {
          console.error("Error in orders snapshot:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("Error setting up orders snapshot:", error)
      return () => {}
    }
  },
}

// Technicians Services
export const techniciansService = {
  // Get all technicians
  async getAll(): Promise<Technician[]> {
    try {
      const firestore = getFirebaseDb()
      const querySnapshot = await getDocs(query(collection(firestore, TECHNICIANS_COLLECTION), orderBy("name")))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use the document ID which is now our TECH### format
        ...doc.data(),
        joinedDate: convertTimestamp(doc.data().joinedDate),
      })) as Technician[]
    } catch (error) {
      console.error("Error getting technicians:", error)
      return []
    }
  },

  // Get technician by ID
  async getById(id: string): Promise<Technician | null> {
    try {
      const firestore = getFirebaseDb()
      const docSnap = await getDoc(doc(firestore, TECHNICIANS_COLLECTION, id))
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          joinedDate: convertTimestamp(docSnap.data().joinedDate),
        } as Technician
      }
      return null
    } catch (error) {
      console.error("Error getting technician:", error)
      return null
    }
  },

  // Create new technician
  async create(technicianData: Omit<Technician, "id">): Promise<string> {
    try {
      const firestore = getFirebaseDb()
      const technicianId = await generateTechnicianId()
      
      // Use setDoc with the custom ID as document ID
      await setDoc(doc(firestore, TECHNICIANS_COLLECTION, technicianId), {
        ...technicianData,
        joinedDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return technicianId
    } catch (error) {
      console.error("Error creating technician:", error)
      throw error
    }
  },

  // Update technician
  async update(id: string, updates: Partial<Technician>): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await updateDoc(doc(firestore, TECHNICIANS_COLLECTION, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating technician:", error)
      throw error
    }
  },

  // Delete technician
  async delete(id: string): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await deleteDoc(doc(firestore, TECHNICIANS_COLLECTION, id))
    } catch (error) {
      console.error("Error deleting technician:", error)
      throw error
    }
  },

  // Listen to technicians changes
  onSnapshot(callback: (technicians: Technician[]) => void) {
    try {
      const firestore = getFirebaseDb()
      return onSnapshot(
        query(collection(firestore, TECHNICIANS_COLLECTION), orderBy("name")),
        (snapshot) => {
          const technicians = snapshot.docs.map((doc) => ({
            id: doc.data().id, // Use the custom TECH### ID
            ...doc.data(),
            joinedDate: convertTimestamp(doc.data().joinedDate),
          })) as Technician[]
          callback(technicians)
        },
        (error) => {
          console.error("Error in technicians snapshot:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("Error setting up technicians snapshot:", error)
      return () => {}
    }
  },
}

// Users Services
export const usersService = {
  // Get user by email
  async getByEmail(email: string) {
    try {
      const firestore = getFirebaseDb()
      const querySnapshot = await getDocs(query(collection(firestore, USERS_COLLECTION), where("email", "==", email)))
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() }
      }
      return null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  },

  // Create user profile
  async create(userData: any): Promise<string> {
    try {
      const firestore = getFirebaseDb()
      const docRef = await addDoc(collection(firestore, USERS_COLLECTION), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  },

  // Update user profile
  async update(id: string, updates: any): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await updateDoc(doc(firestore, USERS_COLLECTION, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },

  // Delete user profile
  async delete(id: string): Promise<void> {
    try {
      const firestore = getFirebaseDb()
      await deleteDoc(doc(firestore, USERS_COLLECTION, id))
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  },
}

// File Upload Services
export const fileService = {
  // Upload file to Firebase Storage
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const firebaseStorage = getFirebaseStorage()
      const storageRef = ref(firebaseStorage, path)
      const snapshot = await uploadBytes(storageRef, file)
      return await getDownloadURL(snapshot.ref)
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(path: string): Promise<void> {
    try {
      const firebaseStorage = getFirebaseStorage()
      const storageRef = ref(firebaseStorage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error("Error deleting file:", error)
      throw error
    }
  },
}

// KPI Services
export const kpiService = {
  // Calculate technician KPIs from orders
  async calculateTechnicianKPIs(): Promise<TechnicianKPI[]> {
    try {
      const [orders, technicians] = await Promise.all([ordersService.getAll(), techniciansService.getAll()])

      const kpiMap = new Map<string, TechnicianKPI>()

      // Initialize KPIs for all technicians
      technicians.forEach((tech) => {
        kpiMap.set(tech.id, {
          name: tech.name,
          jobsDone: 0,
          totalAmount: 0,
          reworks: 0,
        })
      })

      // Calculate KPIs from orders
      orders.forEach((order) => {
        const kpi = kpiMap.get(order.assignedTechnicianId)
        if (kpi) {
          if (order.status === "completed") {
            kpi.jobsDone += 1
            kpi.totalAmount += order.finalAmount || order.quotedPrice
          }
        }
      })

      return Array.from(kpiMap.values())
    } catch (error) {
      console.error("Error calculating KPIs:", error)
      return []
    }
  },

  // Get weekly metrics for comparison
  async getWeeklyMetrics(): Promise<{
    currentWeek: {
      totalJobs: number
      totalRevenue: number
      totalReworks: number
    }
    previousWeek: {
      totalJobs: number
      totalRevenue: number
      totalReworks: number
    }
    percentageChanges: {
      jobs: number
      revenue: number
      reworks: number
    }
  }> {
    try {
      const orders = await ordersService.getAll()
      
      // Get current week dates (Monday to Sunday)
      const now = new Date()
      const currentWeekStart = new Date(now)
      currentWeekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
      currentWeekStart.setHours(0, 0, 0, 0)
      
      const currentWeekEnd = new Date(currentWeekStart)
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6) // Sunday
      currentWeekEnd.setHours(23, 59, 59, 999)

      // Get previous week dates
      const previousWeekStart = new Date(currentWeekStart)
      previousWeekStart.setDate(currentWeekStart.getDate() - 7)
      
      const previousWeekEnd = new Date(currentWeekEnd)
      previousWeekEnd.setDate(currentWeekEnd.getDate() - 7)

      // Helper function to check if date is within range
      const isDateInRange = (dateStr: string, startDate: Date, endDate: Date) => {
        const orderDate = new Date(dateStr)
        return orderDate >= startDate && orderDate <= endDate
      }

      // Calculate current week metrics
      const currentWeekOrders = orders.filter(order => 
        order.status === "completed" && 
        isDateInRange(order.createdAt, currentWeekStart, currentWeekEnd)
      )

      const currentWeek = {
        totalJobs: currentWeekOrders.length,
        totalRevenue: currentWeekOrders.reduce((sum, order) => 
          sum + (order.finalAmount || order.quotedPrice), 0
        ),
        totalReworks: currentWeekOrders.filter(order => 
          order.remarks?.toLowerCase().includes('rework') || 
          order.workDone?.toLowerCase().includes('rework')
        ).length
      }

      // Calculate previous week metrics
      const previousWeekOrders = orders.filter(order => 
        order.status === "completed" && 
        isDateInRange(order.createdAt, previousWeekStart, previousWeekEnd)
      )

      const previousWeek = {
        totalJobs: previousWeekOrders.length,
        totalRevenue: previousWeekOrders.reduce((sum, order) => 
          sum + (order.finalAmount || order.quotedPrice), 0
        ),
        totalReworks: previousWeekOrders.filter(order => 
          order.remarks?.toLowerCase().includes('rework') || 
          order.workDone?.toLowerCase().includes('rework')
        ).length
      }

      // Calculate percentage changes
      const calculatePercentageChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
      }

      const percentageChanges = {
        jobs: calculatePercentageChange(currentWeek.totalJobs, previousWeek.totalJobs),
        revenue: calculatePercentageChange(currentWeek.totalRevenue, previousWeek.totalRevenue),
        reworks: calculatePercentageChange(currentWeek.totalReworks, previousWeek.totalReworks)
      }

      return {
        currentWeek,
        previousWeek,
        percentageChanges
      }
    } catch (error) {
      console.error("Error calculating weekly metrics:", error)
      return {
        currentWeek: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
        previousWeek: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
        percentageChanges: { jobs: 0, revenue: 0, reworks: 0 }
      }
    }
  },

  // Get technician KPIs with weekly comparison
  async getTechnicianKPIsWithComparison(): Promise<{
    technicianKPIs: TechnicianKPI[]
    weeklyMetrics: {
      currentWeek: { totalJobs: number; totalRevenue: number; totalReworks: number }
      previousWeek: { totalJobs: number; totalRevenue: number; totalReworks: number }
      percentageChanges: { jobs: number; revenue: number; reworks: number }
    }
  }> {
    try {
      const [technicianKPIs, weeklyMetrics] = await Promise.all([
        this.calculateTechnicianKPIs(),
        this.getWeeklyMetrics()
      ])

      return {
        technicianKPIs,
        weeklyMetrics
      }
    } catch (error) {
      console.error("Error getting KPIs with comparison:", error)
      return {
        technicianKPIs: [],
        weeklyMetrics: {
          currentWeek: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
          previousWeek: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
          percentageChanges: { jobs: 0, revenue: 0, reworks: 0 }
        }
      }
    }
  },

  // Get orders by date range for more detailed analysis
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const orders = await ordersService.getAll()
      
      return orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    } catch (error) {
      console.error("Error getting orders by date range:", error)
      return []
    }
  },

  // Get monthly trends for better insights
  async getMonthlyTrends(): Promise<{
    currentMonth: { totalJobs: number; totalRevenue: number; totalReworks: number }
    previousMonth: { totalJobs: number; totalRevenue: number; totalReworks: number }
    percentageChanges: { jobs: number; revenue: number; reworks: number }
  }> {
    try {
      const orders = await ordersService.getAll()
      
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

      const isDateInRange = (dateStr: string, startDate: Date, endDate: Date) => {
        const orderDate = new Date(dateStr)
        return orderDate >= startDate && orderDate <= endDate
      }

      const currentMonthOrders = orders.filter(order => 
        order.status === "completed" && 
        isDateInRange(order.createdAt, currentMonthStart, currentMonthEnd)
      )

      const previousMonthOrders = orders.filter(order => 
        order.status === "completed" && 
        isDateInRange(order.createdAt, previousMonthStart, previousMonthEnd)
      )

      const currentMonth = {
        totalJobs: currentMonthOrders.length,
        totalRevenue: currentMonthOrders.reduce((sum, order) => 
          sum + (order.finalAmount || order.quotedPrice), 0
        ),
        totalReworks: currentMonthOrders.filter(order => 
          order.remarks?.toLowerCase().includes('rework') || 
          order.workDone?.toLowerCase().includes('rework')
        ).length
      }

      const previousMonth = {
        totalJobs: previousMonthOrders.length,
        totalRevenue: previousMonthOrders.reduce((sum, order) => 
          sum + (order.finalAmount || order.quotedPrice), 0
        ),
        totalReworks: previousMonthOrders.filter(order => 
          order.remarks?.toLowerCase().includes('rework') || 
          order.workDone?.toLowerCase().includes('rework')
        ).length
      }

      const calculatePercentageChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
      }

      return {
        currentMonth,
        previousMonth,
        percentageChanges: {
          jobs: calculatePercentageChange(currentMonth.totalJobs, previousMonth.totalJobs),
          revenue: calculatePercentageChange(currentMonth.totalRevenue, previousMonth.totalRevenue),
          reworks: calculatePercentageChange(currentMonth.totalReworks, previousMonth.totalReworks)
        }
      }
    } catch (error) {
      console.error("Error calculating monthly trends:", error)
      return {
        currentMonth: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
        previousMonth: { totalJobs: 0, totalRevenue: 0, totalReworks: 0 },
        percentageChanges: { jobs: 0, revenue: 0, reworks: 0 }
      }
    }
  }
}
