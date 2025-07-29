"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "./admin/AdminSidebar"
import AdminHeader from "./admin/AdminHeader"
import AdminDashboard from "./admin/AdminDashboard"
import CreateOrderForm from "./admin/CreateOrderForm"
import OrdersList from "./admin/OrdersList"
import KPIDashboard from "./admin/KPIDashboard"
import TechnicianManagement from "./admin/TechnicianManagement"
import { ordersService, kpiService } from "@/lib/firebase-services"
import type { Order, AdminPage } from "@/app/types"

interface AdminPortalProps {
  onBack: () => void
}

export default function AdminPortal({ onBack }: AdminPortalProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard")
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

  const handleOrderCreate = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev])
    // KPIs will be recalculated automatically due to the real-time listener
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-blue-600">Loading...</div>
        </div>
      )
    }

    switch (currentPage) {
      case "create-order":
        return <CreateOrderForm onOrderCreate={handleOrderCreate} />
      case "all-orders":
        return <OrdersList orders={orders} />
      case "technicians":
        return <TechnicianManagement />
      case "kpi":
        return <KPIDashboard />
      default:
        return <AdminDashboard orders={orders} onPageChange={setCurrentPage} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onBack={onBack}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}
