"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, FileText, Upload, Image, Video, File } from "lucide-react"
import type { Order } from "@/app/types"

interface JobCardProps {
  job: Order
  isCompleted?: boolean
  onClick?: () => void
}

export default function JobCard({ job, isCompleted = false, onClick }: JobCardProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-3 h-3" />
      case "video":
        return <Video className="w-3 h-3" />
      case "pdf":
        return <File className="w-3 h-3" />
      default:
        return <File className="w-3 h-3" />
    }
  }

  return (
    <Card
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        isCompleted ? "bg-green-50" : "bg-white"
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg text-blue-900">{job.id}</CardTitle>
          <Badge className={`text-xs sm:text-sm ${
            isCompleted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
          }`}>
            {isCompleted ? "Completed" : job.serviceType}
          </Badge>
        </div>
        <CardDescription className="text-sm sm:text-base text-blue-600">{job.customerName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-gray-700">{job.address}</p>
        </div>
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-gray-700">{job.problemDescription}</p>
        </div>
        
        {/* Show uploaded files for completed jobs */}
        {isCompleted && job.uploadedFiles && job.uploadedFiles.length > 0 && (
          <div className="flex items-start gap-2">
            <Upload className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {job.uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                  {getFileIcon(file.type)}
                  <span className="text-gray-600">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs sm:text-sm font-semibold text-green-600">
            RM {isCompleted && job.finalAmount ? job.finalAmount.toFixed(2) : job.quotedPrice}
          </span>
          <span className="text-xs text-gray-500">
            {job.assignedAt
              ? new Date(job.assignedAt).toLocaleDateString()
              : new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
