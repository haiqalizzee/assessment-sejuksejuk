"use client"

import CreateOrderForm from "../../components/admin/CreateOrderForm"
import { useRouter } from "next/navigation"
import type { Order } from "../../types"
import { usePageTitle } from "@/hooks/use-page-title"

export default function CreateOrderPage() {
  usePageTitle("Create Order")
  const router = useRouter()

  const handleOrderCreate = (newOrder: Order) => {
    // This will be called when user closes the summary modal
    console.log("Order created:", newOrder)
  }

  const handleOrderComplete = () => {
    // Redirect to all orders page after user closes the summary
    router.push("/admin/all-orders")
  }

  return <CreateOrderForm onOrderCreate={handleOrderCreate} onOrderComplete={handleOrderComplete} />
} 