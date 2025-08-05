"use client"

import OrdersList from "../../components/admin/OrdersList"
import { useState, useEffect, useMemo } from "react"
import { ordersService, techniciansService } from "@/lib/firebase-services"
import type { Order, Technician } from "../../types"
import { usePageTitle } from "@/hooks/use-page-title"

// Service types from CreateOrderForm
const SERVICE_TYPES = [
  "Cleaning",
  "Repair", 
  "Installation"
]

// Statuses from the Order interface
const ORDER_STATUSES = [
  "pending",
  "completed",
  "rework-required"
] as const

export default function AllOrdersPage() {
  usePageTitle("All Orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all")
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    loadData()

    // Set up real-time listener for orders
    const unsubscribe = ordersService.onSnapshot((updatedOrders) => {
      setOrders(updatedOrders)
    })

    return () => unsubscribe()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [ordersData, techniciansData] = await Promise.all([
        ordersService.getAll(),
        techniciansService.getAll()
      ])
      setOrders(ordersData)
      setTechnicians(techniciansData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderDeleted = () => {
    // The real-time listener will automatically update the orders
    // But we can also reload data if needed
    loadData()
  }

  // Filter orders based on search term and dropdown filters
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Text search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((order) => {
        return (
          order.customerName.toLowerCase().includes(searchLower) ||
          order.phone.toLowerCase().includes(searchLower) ||
          order.serviceType.toLowerCase().includes(searchLower) ||
          order.assignedTechnician.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower)
        )
      })
    }

    // Technician filter
    if (selectedTechnician && selectedTechnician !== "all") {
      filtered = filtered.filter((order) => 
        order.assignedTechnicianId === selectedTechnician
      )
    }

    // Service type filter
    if (selectedServiceType && selectedServiceType !== "all") {
      filtered = filtered.filter((order) => 
        order.serviceType === selectedServiceType
      )
    }

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter((order) => 
        order.status === selectedStatus
      )
    }

    return filtered
  }, [orders, searchTerm, selectedTechnician, selectedServiceType, selectedStatus])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTechnician, selectedServiceType, selectedStatus])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600">Loading...</div>
      </div>
    )
  }

  return (
    <OrdersList 
      orders={currentOrders}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      technicians={technicians}
      selectedTechnician={selectedTechnician}
      onTechnicianChange={setSelectedTechnician}
      serviceTypes={SERVICE_TYPES}
      selectedServiceType={selectedServiceType}
      onServiceTypeChange={setSelectedServiceType}
      statuses={ORDER_STATUSES}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={filteredOrders.length}
      onPageChange={setCurrentPage}
      onOrderDeleted={handleOrderDeleted}
    />
  )
} 