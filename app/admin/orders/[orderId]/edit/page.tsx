"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import EditOrderForm from "../../../../components/admin/EditOrderForm"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "../../../../types"
import { usePageTitle } from "@/hooks/use-page-title"

export default function EditOrderPage() {
  usePageTitle("Edit Order")
  const params = useParams()
  const router = useRouter()
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

  const handleOrderUpdate = (updatedOrder: Order) => {
    console.log("Order updated:", updatedOrder)
  }

  const handleOrderComplete = () => {
    router.push("/admin/all-orders")
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
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <EditOrderForm 
      order={order} 
      onOrderUpdate={handleOrderUpdate} 
      onOrderComplete={handleOrderComplete} 
    />
  )
} 