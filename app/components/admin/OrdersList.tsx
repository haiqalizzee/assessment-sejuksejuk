"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye } from "lucide-react"
import type { Order } from "@/app/types"
import OrderDetail from "./OrderDetail"

interface OrdersListProps {
  orders: Order[]
}

export default function OrdersList({ orders }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
  }

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-blue-900 mb-2">All Orders</h2>
        <p className="text-blue-600 text-sm lg:text-base">Manage and track all service orders</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-blue-600 text-sm">{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{order.serviceType}</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600 text-sm">
                          RM {order.status === "completed" && order.finalAmount ? order.finalAmount.toFixed(2) : order.quotedPrice}
                        </span>
                        {order.status === "completed" && order.extraCharges && order.extraCharges > 0 && (
                          <p className="text-xs text-orange-600">
                            +RM {order.extraCharges.toFixed(2)} extra
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{order.assignedTechnician}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-transparent text-xs"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Assigned Technician</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-blue-50">
                    <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.serviceType}</TableCell>
                    <TableCell>{order.assignedTechnician}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          RM {order.status === "completed" && order.finalAmount ? order.finalAmount.toFixed(2) : order.quotedPrice}
                        </p>
                        {order.status === "completed" && order.extraCharges && order.extraCharges > 0 && (
                          <p className="text-xs text-orange-600">
                            +RM {order.extraCharges.toFixed(2)} extra
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-transparent"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
