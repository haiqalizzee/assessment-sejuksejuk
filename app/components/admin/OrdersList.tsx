"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import type { Order, Technician } from "@/app/types"

interface OrdersListProps {
  orders: Order[]
  searchTerm?: string
  onSearchChange?: (value: string) => void
  technicians?: Technician[]
  selectedTechnician?: string
  onTechnicianChange?: (value: string) => void
  serviceTypes?: string[]
  selectedServiceType?: string
  onServiceTypeChange?: (value: string) => void
  statuses?: readonly string[]
  selectedStatus?: string
  onStatusChange?: (value: string) => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export default function OrdersList({ 
  orders, 
  searchTerm = "", 
  onSearchChange,
  technicians = [],
  selectedTechnician = "",
  onTechnicianChange,
  serviceTypes = [],
  selectedServiceType = "",
  onServiceTypeChange,
  statuses = [],
  selectedStatus = "",
  onStatusChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange
}: OrdersListProps) {
  const router = useRouter()

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
    router.push(`/admin/orders/${order.id}`)
  }

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const clearFilters = () => {
    if (onSearchChange) onSearchChange("")
    if (onTechnicianChange) onTechnicianChange("all")
    if (onServiceTypeChange) onServiceTypeChange("all")
    if (onStatusChange) onStatusChange("all")
  }

  const hasActiveFilters = searchTerm || (selectedTechnician && selectedTechnician !== "all") || (selectedServiceType && selectedServiceType !== "all") || (selectedStatus && selectedStatus !== "all")

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-blue-900 mb-2">All Orders</h2>
        <p className="text-blue-600 text-sm lg:text-base">Manage and track all service orders</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end">
        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by customer name, phone, service type, technician, order ID, or status..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto lg:ml-4">
          {/* Technician Filter */}
          {onTechnicianChange && (
            <div className="space-y-2 min-w-[150px]">
              <label className="text-sm font-medium text-gray-700">Technician</label>
              <Select value={selectedTechnician} onValueChange={onTechnicianChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All technicians</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Type Filter */}
          {onServiceTypeChange && (
            <div className="space-y-2 min-w-[150px]">
              <label className="text-sm font-medium text-gray-700">Service Type</label>
              <Select value={selectedServiceType} onValueChange={onServiceTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Filter */}
          {onStatusChange && (
            <div className="space-y-2 min-w-[150px]">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <Card className="border-0 shadow-lg">
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters ? "No orders found matching your filters." : "No orders available."}
              </div>
            ) : (
              orders.map((order) => (
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
              ))
            )}
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
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {hasActiveFilters ? "No orders found matching your filters." : "No orders available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row items-center justify-between text-sm text-gray-600 gap-2">
        {/* Results Summary */}
        <span>
          Showing {orders.length} of {totalItems} orders
          {hasActiveFilters}
        </span>
        {/* Pagination Controls */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
