"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Wrench, DollarSign, Upload, Video, File, Clock, Image as ImageIcon, CheckCircle, MapPin, Phone, User, Calendar, Tag } from "lucide-react"
import type { Order } from "@/app/types"
import { formatDate } from "@/lib/utils"

interface CompletedJobDetailProps {
  job: Order
  onBack: () => void
}

export default function CompletedJobDetail({ job, onBack }: CompletedJobDetailProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "pdf":
        return <File className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack} 
            className="bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              Job #{job.id}
            </h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Job Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <User className="w-4 h-4" />
                      Customer
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{job.customerName}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{job.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <MapPin className="w-4 h-4" />
                    Address
                  </div>
                  <p className="text-gray-900 leading-relaxed">{job.address}</p>
                </div>

                <Separator />

                {/* Service Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Tag className="w-4 h-4" />
                      Service Type
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {job.serviceType}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Completed Date
                    </div>
                    <p className="text-gray-900">
                      {job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "N/A"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Problem Description */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Problem Description</div>
                  <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {job.problemDescription}
                  </p>
                </div>

                {job.adminNotes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Admin Notes</div>
                      <p className="text-gray-900 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-200">
                        {job.adminNotes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Work Details Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {job.workDone && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Work Completed</div>
                    <p className="text-gray-900 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-200">
                      {job.workDone}
                    </p>
                  </div>
                )}

                {job.remarks && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">Technician Remarks</div>
                      <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {job.remarks}
                      </p>
                    </div>
                  </>
                )}

                {/* Uploaded Files */}
                {job.uploadedFiles && job.uploadedFiles.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Upload className="w-4 h-4" />
                        Uploaded Files ({job.uploadedFiles.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {job.uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="p-2 bg-white rounded-lg">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{file.type}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="shrink-0"
                            >
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs"
                              >
                                View
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Rework History */}
                {job.reworkHistory && job.reworkHistory.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-600">Rework History</div>
                      <div className="space-y-3">
                        {job.reworkHistory.map((rework, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                  Rework #{index + 1}
                                </Badge>
                                <span className="text-xs text-orange-600">
                                  {formatDate(rework.date)}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-orange-700">Reason:</span>
                                <p className="text-orange-800 mt-1">{rework.reason}</p>
                              </div>
                              <div>
                                <span className="font-medium text-orange-700">Admin Notes:</span>
                                <p className="text-orange-800 mt-1">{rework.adminNotes}</p>
                              </div>
                              {rework.technicianNotes && (
                                <div>
                                  <span className="font-medium text-orange-700">Technician Notes:</span>
                                  <p className="text-orange-800 mt-1">{rework.technicianNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quoted Price</span>
                  <span className="font-semibold text-gray-900">RM {job.quotedPrice.toFixed(2)}</span>
                </div>
                
                {/* Extra Charges - Handle both old and new format */}
                {job.extraCharges && (
                  <>
                    {/* New format: Array of charges */}
                    {Array.isArray(job.extraCharges) && job.extraCharges.length > 0 && (
                      <>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-600">Extra Charges</div>
                          {job.extraCharges.map((charge, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{charge.reason}</span>
                              <span className="font-semibold text-orange-600">+RM {charge.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Old format: Single number */}
                    {!Array.isArray(job.extraCharges) && job.extraCharges > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Extra Charges</span>
                          <span className="font-semibold text-orange-600">+RM {job.extraCharges.toFixed(2)}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Final Amount</span>
                  <span className="text-xl font-bold text-green-600">
                    RM {job.finalAmount?.toFixed(2) || job.quotedPrice.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-700">Completed</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Completed At</div>
                  <div className="text-sm font-medium text-gray-900">
                    {job.completedAt ? new Date(job.completedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 