"use client"

import OrdersList from "../../components/admin/OrdersList"
import { useState, useEffect } from "react"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "../../types"

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600">Loading...</div>
      </div>
    )
  }

  return <OrdersList orders={orders} />
} 