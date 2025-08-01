"use client"

import OrdersList from "../../components/admin/OrdersList"
import { useState, useEffect, useMemo } from "react"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "../../types"

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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
      const ordersData = await ordersService.getAll()
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders

    const searchLower = searchTerm.toLowerCase()
    return orders.filter((order) => {
      return (
        order.customerName.toLowerCase().includes(searchLower) ||
        order.phone.toLowerCase().includes(searchLower) ||
        order.serviceType.toLowerCase().includes(searchLower) ||
        order.assignedTechnician.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      )
    })
  }, [orders, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={filteredOrders.length}
      onPageChange={setCurrentPage}
    />
  )
} 