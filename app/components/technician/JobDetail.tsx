"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Wrench, DollarSign, Upload, X, Video, File, MessageCircle, Clock, Image as ImageIcon, User, Phone, MapPin, AlertTriangle, Plus, Trash2 } from "lucide-react"
import type { Order, FileUpload } from "@/app/types"
import { fileService, ordersService } from "@/lib/firebase-services"
import { toLocalDateTimeString } from "@/lib/utils"

interface ExtraCharge {
  id: string
  reason: string
  amount: number
}

interface JobDetailProps {
  job: Order
  onBack: () => void
  onJobComplete: (completionData: {
    extraCharges: ExtraCharge[]
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
    remarks: "",
  })
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([])
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

  const addExtraCharge = () => {
    const newCharge: ExtraCharge = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      reason: "",
      amount: 0
    }
    setExtraCharges(prev => [...prev, newCharge])
  }

  const updateExtraCharge = (id: string, field: keyof ExtraCharge, value: string | number) => {
    setExtraCharges(prev => prev.map(charge => 
      charge.id === id ? { ...charge, [field]: value } : charge
    ))
  }

  const removeExtraCharge = (id: string) => {
    setExtraCharges(prev => prev.filter(charge => charge.id !== id))
  }

  const totalExtraCharges = extraCharges.reduce((sum, charge) => sum + charge.amount, 0)
  const finalAmount = job.quotedPrice + totalExtraCharges

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

    // Validate extra charges
    const invalidCharges = extraCharges.filter(charge => !charge.reason.trim() || charge.amount <= 0)
    if (invalidCharges.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all extra charge reasons and ensure amounts are greater than 0.",
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
        extraCharges: extraCharges,
        finalAmount: finalAmount,
        workDone: jobFormData.workDone,
        remarks: jobFormData.remarks,
        uploadedFiles: uploadedFileUrls,
      }

      // Check if this is a rework job
      const isRework = job.status === "rework-required"
      
      // Update the order in Firestore with completion data
      const updateData: any = {
        status: "completed",
        workDone: jobFormData.workDone,
        extraCharges: extraCharges,
        finalAmount: finalAmount,
        remarks: jobFormData.remarks,
        uploadedFiles: uploadedFileUrls,
        completedAt: toLocalDateTimeString(new Date()),
      }

      // If this is a rework job, add technician notes to the latest rework entry
      if (isRework && job.reworkHistory && job.reworkHistory.length > 0) {
        const latestReworkIndex = job.reworkHistory.length - 1
        const updatedReworkHistory = [...job.reworkHistory]
        updatedReworkHistory[latestReworkIndex] = {
          ...updatedReworkHistory[latestReworkIndex],
          technicianNotes: jobFormData.remarks || "Rework completed"
        }
        updateData.reworkHistory = updatedReworkHistory
      }

      await ordersService.update(job.id, updateData)

      const reworkText = isRework ? "\n\n⚠️ This was a rework job to address previous issues." : ""
      
      // Build extra charges text for WhatsApp
      let extraChargesText = ""
      if (extraCharges.length > 0) {
        extraChargesText = "\n\nExtra Charges:\n" + extraCharges.map(charge => 
          `• ${charge.reason}: RM ${charge.amount.toFixed(2)}`
        ).join("\n")
      }
      
      const whatsappMessage = `Hi ${job.customerName}, job ${job.id} has been ${isRework ? "reworked and completed" : "completed"} by Technician Ali at ${new Date().toLocaleString()}. 

Final Amount: RM ${finalAmount.toFixed(2)}
Quoted Price: RM ${job.quotedPrice.toFixed(2)}${extraChargesText}${reworkText}

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
        title: isRework ? "Rework Completed Successfully!" : "Job Completed Successfully!",
        description: `Job ${job.id} has been ${isRework ? "reworked and marked as complete" : "marked as complete"}. Files uploaded and customer notification sent.`,
      })

      // Open WhatsApp in new tab
      console.log("Opening WhatsApp in new tab with URL:", whatsappUrl)
      console.log("Phone number:", job.phone, "Cleaned:", cleanPhone)
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank')

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
    <div className="max-w-4xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack} 
          className="self-start sm:self-auto w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              {job.status === "rework-required" ? "Complete Rework" : "Complete Job"}
            </h1>
            <Badge variant={job.status === "rework-required" ? "destructive" : "default"} className="w-fit">
              {job.status === "rework-required" ? "Rework Required" : "Completed"}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {job.status === "rework-required" 
              ? "Address the rework requirements and mark as complete" 
              : "Update job details and mark as complete"
            }
          </p>
        </div>
      </div>

      {/* Rework Alert */}
      {job.status === "rework-required" && job.reworkHistory && job.reworkHistory.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-orange-900 mb-1 text-sm sm:text-base">Rework Required</h3>
                <p className="text-orange-800 text-xs sm:text-sm break-words">
                  {job.reworkHistory[job.reworkHistory.length - 1].reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Job Information */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Order ID</Label>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 break-all">{job.id}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Service Type</Label>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">{job.serviceType}</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Quoted Price</Label>
                  <p className="text-sm sm:text-lg font-semibold text-green-600">RM {job.quotedPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Name</Label>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{job.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Phone</Label>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{job.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Address</Label>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{job.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Wrench className="w-4 h-4 sm:w-5 h-5" />
                Problem Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 leading-relaxed text-sm sm:text-base break-words">{job.problemDescription}</p>
              {job.adminNotes && (
                <>
                  <Separator className="my-3 sm:my-4" />
                  <div>
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Admin Notes</Label>
                    <p className="text-gray-900 leading-relaxed text-sm sm:text-base break-words">{job.adminNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Original Files */}
          {job.uploadedFiles && job.uploadedFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <File className="w-4 h-4 sm:w-5 h-5" />
                  Original Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {job.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      {file.type === "image" ? (
                        <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : file.type === "video" ? (
                        <Video className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <File className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 truncate min-w-0 flex-1"
                      >
                        {file.name}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Completion Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5 sm:w-6 h-6" />
                Job Completion Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Work Done */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="workDone" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Wrench className="w-4 h-4 sm:w-5 h-5" />
                  Work Done *
                </Label>
                <Textarea
                  id="workDone"
                  value={jobFormData.workDone}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, workDone: e.target.value }))}
                  placeholder="Describe the work completed in detail..."
                  required
                  className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                />
              </div>

              {/* Extra Charges */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 sm:w-5 h-5" />
                  Extra Charges (RM)
                </Label>
                <div className="space-y-2">
                  {extraCharges.map((charge) => (
                    <div key={charge.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Reason for extra charge (e.g., travel, parts)"
                          value={charge.reason}
                          onChange={(e) => updateExtraCharge(charge.id, "reason", e.target.value)}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          step="0.01"
                          value={charge.amount}
                          onChange={(e) => updateExtraCharge(charge.id, "amount", Number(e.target.value))}
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExtraCharge(charge.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={addExtraCharge}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Extra Charge
                </Button>
              </div>

              {/* Pricing Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 h-5" />
                    Quoted Price (RM)
                  </Label>
                  <Input 
                    value={job.quotedPrice.toFixed(2)} 
                    disabled 
                    className="text-sm sm:text-lg bg-gray-50" 
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 h-5" />
                    Final Amount (RM)
                  </Label>
                  <Input 
                    value={finalAmount.toFixed(2)} 
                    disabled 
                    className="text-sm sm:text-lg font-bold text-green-600 bg-green-50" 
                  />
                </div>
              </div>

              {/* Extra Charges Summary */}
              {extraCharges.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 h-5" />
                    Extra Charges Summary
                  </Label>
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                    {extraCharges.map((charge) => (
                      <div key={charge.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{charge.reason}</span>
                        <span className="font-semibold text-blue-600">RM {charge.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Extra Charges:</span>
                      <span className="text-blue-600">RM {totalExtraCharges.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Upload className="w-4 h-4 sm:w-5 h-5" />
                  Upload Files (Max 6 files)
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
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
                    className="mb-2 sm:mb-3"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Images, Videos, or PDF files ({uploadedFiles.length}/6)
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          {file.type === "image" ? (
                            <img
                              src={file.preview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : file.type === "video" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 sm:w-8 h-8 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <File className="w-6 h-6 sm:w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-2 h-2 sm:w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 sm:mt-2 truncate text-center break-words">{file.file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="remarks" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 h-5" />
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={jobFormData.remarks}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional remarks or notes..."
                  className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                />
              </div>

              {/* Completion Time */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 h-5" />
                  Completion Time
                </Label>
                <Input 
                  value={new Date().toLocaleString()} 
                  disabled 
                  className="text-sm sm:text-base bg-gray-50" 
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleJobCompletion}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-200 hover:shadow-lg"
                disabled={!jobFormData.workDone.trim() || isUploading}
                size="lg"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 h-5 mr-2" />
                {isUploading ? "Uploading Files & Completing Job..." : "Finish Job & Notify Customer"}
              </Button>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-center text-blue-600 font-medium text-sm sm:text-base">Uploading files to Firebase Storage...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-center text-xs sm:text-sm text-gray-600">
                    {uploadedFiles.length > 0 ? `${Math.round(uploadProgress)}% complete` : "Preparing upload..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
