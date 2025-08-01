"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import OrderDetail from "../../../components/admin/OrderDetail"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "../../../types"

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const orderData = await ordersService.getById(orderId)
      if (orderData) {
        setOrder(orderData)
      } else {
        setError("Order not found")
      }
    } catch (error) {
      console.error("Error loading order:", error)
      setError("Failed to load order")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-600">Loading order details...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error || "Order not found"}</div>
          <button 
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return <OrderDetail order={order} />
} 