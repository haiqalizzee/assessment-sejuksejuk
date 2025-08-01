"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../components/admin/AdminSidebar"
import AdminHeader from "../components/admin/AdminHeader"
import AuthGuard from "@/components/AuthGuard"
import { ordersService } from "@/lib/firebase-services"
import type { Order } from "../types"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen bg-gray-50 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 