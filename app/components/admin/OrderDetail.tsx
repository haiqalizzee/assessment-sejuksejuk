"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Phone, User, FileText, DollarSign, Clock, Upload, Image as ImageIcon, Video, File, Calendar, Wrench, MessageSquare, Eye, AlertTriangle, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Order } from "@/app/types"
import { ordersService } from "@/lib/firebase-services"
import FileViewerModal from "./FileViewerModal"
import { toast } from "@/hooks/use-toast"
import { formatDate, formatDateTime, toLocalDateTimeString } from "@/lib/utils"

interface OrderDetailProps {
  order: Order
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter()
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [isReworkDialogOpen, setIsReworkDialogOpen] = useState(false)
  const [reworkReason, setReworkReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case "rework-required":
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Rework Required</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  const handleMarkForRework = async () => {
    if (!reworkReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rework.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const reworkEntry = {
        date: toLocalDateTimeString(new Date()),
        reason: reworkReason,
        adminNotes: "",
      }

      const updates = {
        status: "rework-required" as const,
        reworkHistory: [...(order.reworkHistory || []), reworkEntry],
        reworkCount: (order.reworkCount || 0) + 1,
        originalCompletedAt: order.completedAt,
      }

      await ordersService.update(order.id, updates)
      
      toast({
        title: "Success",
        description: "Order marked for rework. Technician will be notified.",
      })
      
      setIsReworkDialogOpen(false)
      setReworkReason("")
      router.refresh()
    } catch (error) {
      console.error("Error marking for rework:", error)
      toast({
        title: "Error",
        description: "Failed to mark order for rework.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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

  const handleFileClick = (index: number) => {
    setSelectedFileIndex(index)
    setIsFileViewerOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
              className="hover:bg-gray-100 p-2"
              >
              <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
              <h1 className="text-lg font-bold text-gray-900">Order #{order.id}</h1>
              {getStatusBadge(order.status)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              
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
                    Completed on {formatDateTime(order.completedAt || "")}
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <Dialog open={isReworkDialogOpen} onOpenChange={setIsReworkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Mark for Rework
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Mark Order for Rework</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="rework-reason">Reason for Rework</Label>
                            <Textarea
                              id="rework-reason"
                              placeholder="Describe why this job needs rework..."
                              value={reworkReason}
                              onChange={(e) => setReworkReason(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsReworkDialogOpen(false)
                                setReworkReason("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleMarkForRework}
                              disabled={isUpdating || !reworkReason.trim()}
                            >
                              {isUpdating ? "Marking..." : "Mark for Rework"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rework Information */}
            {order.status === "rework-required" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RotateCcw className="w-4 h-4 text-orange-600" />
                    Rework Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.reworkHistory && order.reworkHistory.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Latest Rework Reason</label>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {order.reworkHistory[order.reworkHistory.length - 1].reason}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Marked on {formatDate(order.reworkHistory[order.reworkHistory.length - 1].date)}
                      </div>
                    </div>
                  )}
                  {order.reworkCount && order.reworkCount > 1 && (
                    <div className="text-xs text-orange-600">
                      This is the {order.reworkCount}nd rework for this order
                    </div>
                  )}
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
                        <button
                          onClick={() => handleFileClick(index)}
                          className="block relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg w-full"
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
                        </button>
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
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Price Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-600">Quoted Price</span>
                  <span className="text-sm font-semibold text-gray-900">RM {order.quotedPrice.toFixed(2)}</span>
                </div>
                
                {/* Extra Charges - Handle both old and new format */}
                {order.status === "completed" && order.extraCharges && (
                  <>
                    {/* New format: Array of charges */}
                    {Array.isArray(order.extraCharges) && order.extraCharges.length > 0 && (
                      <>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">Extra Charges</div>
                          {order.extraCharges.map((charge, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700">{charge.reason}</span>
                              <span className="font-semibold text-orange-600">+RM {charge.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Old format: Single number */}
                    {!Array.isArray(order.extraCharges) && order.extraCharges > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-gray-600">Extra Charges</span>
                        <span className="text-sm font-semibold text-orange-600">+RM {order.extraCharges.toFixed(2)}</span>
                      </div>
                    )}
                  </>
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
                      <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.assignedAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Date Assigned to Technician</p>
                        <p className="text-xs text-gray-500">{formatDate(order.assignedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.completedAt && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Job Completed</p>
                        <p className="text-xs text-gray-500">{formatDateTime(order.completedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.reworkHistory && order.reworkHistory.length > 0 && (
                    order.reworkHistory.map((rework, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Marked for Rework</p>
                          <p className="text-xs text-gray-500">{formatDateTime(rework.date)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {order.uploadedFiles && order.uploadedFiles.length > 0 && (
        <FileViewerModal
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          files={order.uploadedFiles}
          initialIndex={selectedFileIndex}
        />
      )}
    </div>
  )
} 