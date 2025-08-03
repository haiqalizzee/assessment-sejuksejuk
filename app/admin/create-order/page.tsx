"use client"

import CreateOrderForm from "../../components/admin/CreateOrderForm"
import { useRouter } from "next/navigation"
import type { Order } from "../../types"
import { usePageTitle } from "@/hooks/use-page-title"

export default function CreateOrderPage() {
  usePageTitle("Create Order")
  const router = useRouter()

  const handleOrderCreate = (newOrder: Order) => {
    // Redirect to all orders page after creating an order
    router.push("/admin/all-orders")
  }

  return <CreateOrderForm onOrderCreate={handleOrderCreate} />
} 