"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, BarChart3 } from "lucide-react"
import type { Order, AdminPage } from "@/app/types"

interface AdminDashboardProps {
  orders: Order[]
  onPageChange: (page: AdminPage) => void
}

export default function AdminDashboard({ orders, onPageChange }: AdminDashboardProps) {
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Admin Dashboard</h2>
        <p className="text-blue-600">Welcome to the Sejuk Sejuk Service admin portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onPageChange("create-order")}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Create New Order</CardTitle>
            <CardDescription>Add a new service request</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onPageChange("all-orders")}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">View All Orders</CardTitle>
            <CardDescription>Manage existing orders</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onPageChange("kpi")}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-lg">KPI Dashboard</CardTitle>
            <CardDescription>View performance metrics</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Recent Orders</CardTitle>
          <CardDescription>Latest service requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">{order.customerName}</p>
                  <p className="text-sm text-blue-600">
                    {order.serviceType} • {order.assignedTechnician}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    RM {order.status === "completed" && order.finalAmount ? order.finalAmount.toFixed(2) : order.quotedPrice}
                  </p>
                  {order.status === "completed" && order.extraCharges && order.extraCharges > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      +RM {order.extraCharges.toFixed(2)} extra
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
