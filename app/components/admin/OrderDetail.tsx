"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Phone, User, FileText, DollarSign, Clock, Upload, Image as ImageIcon, Video, File, Calendar, Wrench, MessageSquare, Eye } from "lucide-react"
import type { Order } from "@/app/types"

interface OrderDetailProps {
  order: Order
  onBack: () => void
}

export default function OrderDetail({ order, onBack }: OrderDetailProps) {
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ Pending</Badge>
      case "in-progress":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">🔄 In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-50 text-green-700 border-green-200">✅ Completed</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case "video":
        return <Video className="w-4 h-4 text-purple-500" />
      default:
        return <File className="w-4 h-4 text-orange-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
              className="hover:bg-gray-100 p-2"
              >
              <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
              <h1 className="text-lg font-bold text-gray-900">Order #{order.id}</h1>
              <p className="text-xs text-gray-500">{order.customerName} • {order.serviceType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-green-600">
                  RM {order.status === "completed" && order.finalAmount ? order.finalAmount.toFixed(2) : order.quotedPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-blue-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Customer Name</label>
                    <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Phone Number</label>
                    <p className="text-sm font-semibold text-gray-900">{order.phone}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Address</label>
                  <p className="text-sm font-semibold text-gray-900">{order.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Service Type</label>
                    <p className="text-sm font-semibold text-gray-900">{order.serviceType}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Assigned Technician</label>
                    <p className="text-sm font-semibold text-gray-900">{order.assignedTechnician}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Problem Description</label>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.problemDescription}</p>
                </div>
                {order.adminNotes && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Admin Notes</label>
                    <p className="text-sm text-gray-700 leading-relaxed">{order.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completion Information */}
            {order.status === "completed" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    Completion Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Work Completed</label>
                    <p className="text-sm text-gray-700 leading-relaxed">{order.workDone}</p>
                  </div>
                  {order.remarks && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Remarks</label>
                      <p className="text-sm text-gray-700 leading-relaxed">{order.remarks}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Completed on {new Date(order.completedAt || "").toLocaleDateString()} at {new Date(order.completedAt || "").toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Uploaded Files */}
            {order.uploadedFiles && order.uploadedFiles.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Upload className="w-4 h-4 text-blue-600" />
                    Uploaded Files ({order.uploadedFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {order.uploadedFiles.map((file, index) => (
                      <div key={index} className="group">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                        >
                          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-300 group-hover:shadow-lg transition-all duration-200 relative">
                            {file.type === "image" ? (
                              <img 
                                src={file.url} 
                                alt={file.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                {getFileIcon(file.type)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-10">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </a>
                        <p className="mt-1 text-xs text-gray-600 truncate text-center">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Financial & Timeline */}
          <div className="space-y-4">
            {/* Financial Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-600">Quoted Price</span>
                  <span className="text-sm font-semibold text-gray-900">RM {order.quotedPrice.toFixed(2)}</span>
                </div>
                {order.status === "completed" && order.extraCharges && order.extraCharges > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-600">Extra Charges</span>
                    <span className="text-sm font-semibold text-orange-600">+RM {order.extraCharges.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-gray-900">Final Amount</span>
                  <span className="text-lg font-bold text-green-600">
                    RM {order.status === "completed" && order.finalAmount ? order.finalAmount.toFixed(2) : order.quotedPrice.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {order.assignedAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Assigned to Technician</p>
                        <p className="text-xs text-gray-500">{new Date(order.assignedAt).toLocaleDateString()} at {new Date(order.assignedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                  {order.status === "completed" && order.completedAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Job Completed</p>
                        <p className="text-xs text-gray-500">{new Date(order.completedAt).toLocaleDateString()} at {new Date(order.completedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
        </div>
      </div>
    </div>
  )
} 