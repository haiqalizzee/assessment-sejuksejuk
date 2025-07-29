"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Wrench, DollarSign, Upload, X, Video, File, MessageCircle, Clock, Image as ImageIcon } from "lucide-react"
import type { Order, FileUpload } from "@/app/types"
import { fileService, ordersService } from "@/lib/firebase-services"

interface JobDetailProps {
  job: Order
  onBack: () => void
  onJobComplete: (completionData: {
    extraCharges: number
    finalAmount: number
    workDone: string
    remarks: string
    uploadedFiles: Array<{ url: string; name: string; type: string }>
  }) => void
}

export default function JobDetail({ job, onBack, onJobComplete }: JobDetailProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [jobFormData, setJobFormData] = useState({
    workDone: "",
    extraCharges: "0",
    remarks: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach((file) => {
      if (uploadedFiles.length >= 6) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "pdf"

        const newFile: FileUpload = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview: e.target?.result as string,
          type: fileType,
        }

        setUploadedFiles((prev) => [...prev, newFile])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const finalAmount = job.quotedPrice + Number.parseFloat(jobFormData.extraCharges || "0")

  const uploadFilesToFirebase = async (): Promise<Array<{ url: string; name: string; type: string }>> => {
    const uploadedFileUrls: Array<{ url: string; name: string; type: string }> = []

    // If no files to upload, return empty array
    if (uploadedFiles.length === 0) {
      return uploadedFileUrls
    }

    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileUpload = uploadedFiles[i]
      try {
        // Update progress
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100)
        
        // Create a unique path for each file
        const timestamp = Date.now()
        const fileName = `${timestamp}_${fileUpload.file.name}`
        const filePath = `job-completions/${job.id}/${fileName}`
        
        // Upload file to Firebase Storage
        const downloadURL = await fileService.uploadFile(fileUpload.file, filePath)
        
        uploadedFileUrls.push({
          url: downloadURL,
          name: fileUpload.file.name,
          type: fileUpload.type
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        // If Firebase Storage is not available, we can still complete the job without files
        toast({
          title: "Warning",
          description: `Could not upload ${fileUpload.file.name}. Job will be completed without this file.`,
          variant: "destructive",
        })
        // Continue with other files instead of failing completely
      }
    }

    return uploadedFileUrls
  }

  const handleJobCompletion = async () => {
    if (!jobFormData.workDone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the work done field.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload files to Firebase Storage
      const uploadedFileUrls = await uploadFilesToFirebase()

      const completionData = {
        extraCharges: Number.parseFloat(jobFormData.extraCharges || "0"),
        finalAmount: finalAmount,
        workDone: jobFormData.workDone,
        remarks: jobFormData.remarks,
        uploadedFiles: uploadedFileUrls,
      }

      // Update the order in Firestore with completion data
      await ordersService.update(job.id, {
        status: "completed",
        workDone: jobFormData.workDone,
        extraCharges: Number.parseFloat(jobFormData.extraCharges || "0"),
        finalAmount: finalAmount,
        remarks: jobFormData.remarks,
        uploadedFiles: uploadedFileUrls,
        completedAt: new Date().toISOString(),
      })

      const whatsappMessage = `Hi ${job.customerName}, job ${job.id} has been completed by Technician Ali at ${new Date().toLocaleString()}. 

Final Amount: RM ${finalAmount.toFixed(2)}
${jobFormData.extraCharges && Number.parseFloat(jobFormData.extraCharges) > 0 ? `Extra Charges: RM ${Number.parseFloat(jobFormData.extraCharges).toFixed(2)}` : ''}

Please check and leave feedback. Thank you!

- Sejuk Sejuk Service Sdn Bhd`

      // Clean phone number (remove all non-numeric characters)
      const cleanPhone = job.phone.replace(/[^0-9]/g, "")
      
      // Check if phone number is valid (at least 10 digits)
      if (cleanPhone.length < 10) {
        toast({
          title: "Invalid Phone Number",
          description: `Phone number ${job.phone} is not valid. WhatsApp notification skipped.`,
          variant: "destructive",
        })
        onJobComplete(completionData)
        return
      }
      
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`

      toast({
        title: "Job Completed Successfully!",
        description: `Job ${job.id} has been marked as complete. Files uploaded and customer notification sent.`,
      })

      // Open WhatsApp notification immediately
      console.log("Opening WhatsApp with URL:", whatsappUrl)
      console.log("Phone number:", job.phone, "Cleaned:", cleanPhone)
      
      try {
        const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer")
        if (!newWindow) {
          // If popup was blocked, show the URL in a toast
          toast({
            title: "WhatsApp Notification",
            description: `Please manually send this message to ${job.customerName}. Click here to open WhatsApp.`,
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(whatsappUrl, "_blank")}
              >
                Open WhatsApp
              </Button>
            ),
          })
        }
      } catch (error) {
        console.error("Error opening WhatsApp:", error)
        // Fallback: show the WhatsApp URL in a toast
        toast({
          title: "WhatsApp Notification",
          description: `Please manually send this message to ${job.customerName}: ${whatsappMessage}`,
        })
      }

      onJobComplete(completionData)
    } catch (error) {
      console.error("Error completing job:", error)
      toast({
        title: "Error",
        description: `Failed to complete job: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Complete Job</h2>
          <p className="text-blue-600">Update job details and mark as complete</p>
        </div>
      </div>

      {/* Job Information */}
      <Card className="border-0 shadow-lg bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-blue-700">Order ID</Label>
              <p className="font-semibold text-blue-900">{job.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">Service Type</Label>
              <p className="font-semibold text-blue-900">{job.serviceType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">Customer Name</Label>
              <p className="font-semibold text-blue-900">{job.customerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">Phone</Label>
              <p className="font-semibold text-blue-900">{job.phone}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-700">Address</Label>
            <p className="font-semibold text-blue-900">{job.address}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-blue-700">Problem Description</Label>
            <p className="font-semibold text-blue-900">{job.problemDescription}</p>
          </div>
          {job.adminNotes && (
            <div>
              <Label className="text-sm font-medium text-blue-700">Admin Notes</Label>
              <p className="font-semibold text-blue-900">{job.adminNotes}</p>
            </div>
          )}
          {job.uploadedFiles && job.uploadedFiles.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-blue-700">Uploaded Files</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {job.uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    {file.type === "image" ? (
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                    ) : file.type === "video" ? (
                      <Video className="w-4 h-4 text-blue-600" />
                    ) : (
                      <File className="w-4 h-4 text-blue-600" />
                    )}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate"
                    >
                      {file.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Completion Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Job Completion Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workDone" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Work Done *
            </Label>
            <Textarea
              id="workDone"
              value={jobFormData.workDone}
              onChange={(e) => setJobFormData((prev) => ({ ...prev, workDone: e.target.value }))}
              placeholder="Describe the work completed in detail..."
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extraCharges" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Extra Charges (RM)
              </Label>
              <Input
                id="extraCharges"
                type="number"
                step="0.01"
                value={jobFormData.extraCharges}
                onChange={(e) => setJobFormData((prev) => ({ ...prev, extraCharges: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Final Amount (RM)
              </Label>
              <Input value={finalAmount.toFixed(2)} disabled className="bg-gray-50 font-semibold text-green-600" />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files (Max 6 files)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedFiles.length >= 6}
                className="bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">Images, Videos, or PDF files ({uploadedFiles.length}/6)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type === "image" ? (
                        <img
                          src={file.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : file.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <File className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{file.file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={jobFormData.remarks}
              onChange={(e) => setJobFormData((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Additional remarks or notes..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Completion Time
            </Label>
            <Input value={new Date().toLocaleString()} disabled className="bg-gray-50" />
          </div>

          <Button
            onClick={handleJobCompletion}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold transition-all duration-200 hover:shadow-lg"
            disabled={!jobFormData.workDone.trim() || isUploading}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {isUploading ? "Uploading Files & Completing Job..." : "Finish Job & Notify Customer"}
          </Button>
          {isUploading && (
            <div className="space-y-2">
              <p className="text-center text-blue-600">Uploading files to Firebase Storage...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-center text-sm text-gray-500">
                {uploadedFiles.length > 0 ? `${Math.round(uploadProgress)}% complete` : "Preparing upload..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
