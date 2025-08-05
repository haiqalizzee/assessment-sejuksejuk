"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { User, Phone, MapPin, Wrench, DollarSign, UserCheck, StickyNote, FileText, MessageCircle, X, Calendar, ArrowLeft } from "lucide-react"
import { ordersService, techniciansService } from "@/lib/firebase-services"
import type { Order, Technician } from "@/app/types"
import { DatePicker } from "@/components/ui/datepicker"
import { toLocalDateString, toLocalDateTimeString } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  getStates,
  getCities,
  getPostcodes,
  getPostcodesByPrefix,
  findPostcode
} from "malaysia-postcodes"

interface EditOrderFormProps {
  order: Order
  onOrderUpdate: (order: Order) => void
  onOrderComplete?: () => void
}

export default function EditOrderForm({ order, onOrderUpdate, onOrderComplete }: EditOrderFormProps) {
  const router = useRouter()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  
  // Address-related state
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [postcodes, setPostcodes] = useState<string[]>([])
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [filteredPostcodes, setFilteredPostcodes] = useState<string[]>([])
  
  // Parse address into components
  const parseAddress = (address: string) => {
    const parts = address.split(", ").map(part => part.trim())
    return {
      address: parts[0] || "",
      city: parts[1] || "",
      postcode: parts[2] || "",
      state: parts[3] || ""
    }
  }

  const addressParts = parseAddress(order.address)
  
  const [formData, setFormData] = useState({
    customerName: order.customerName,
    phone: order.phone,
    address: addressParts.address,
    city: addressParts.city,
    postcode: addressParts.postcode,
    state: addressParts.state,
    problemDescription: order.problemDescription,
    serviceType: order.serviceType,
    quotedPrice: order.quotedPrice.toString(),
    assignedTechnicianId: order.assignedTechnicianId || "",
    assignedTechnician: order.assignedTechnician || "",
    assignedDate: order.assignedAt ? new Date(order.assignedAt) : undefined,
    adminNotes: order.adminNotes || "",
  })

  useEffect(() => {
    loadTechnicians()
    loadStates()
    if (formData.state) {
      loadCities(formData.state)
    }
    if (formData.city) {
      loadPostcodes(formData.city)
    }
  }, [])

  const loadTechnicians = async () => {
    try {
      const techList = await techniciansService.getAll()
      console.log("Loaded technicians:", techList)
      setTechnicians(techList)
    } catch (error) {
      console.error("Error loading technicians:", error)
      toast({
        title: "Error",
        description: "Failed to load technicians",
        variant: "destructive",
      })
    }
  }

  const loadStates = () => {
    try {
      const statesList = getStates()
      setStates(statesList)
    } catch (error) {
      console.error("Error loading states:", error)
    }
  }

  const loadCities = (state: string) => {
    try {
      const citiesList = getCities(state)
      setCities(citiesList)
      setFilteredCities(citiesList)
    } catch (error) {
      console.error("Error loading cities:", error)
      setCities([])
      setFilteredCities([])
    }
  }

  const loadPostcodes = (city: string) => {
    try {
      const postcodesList = getPostcodes(formData.state, city)
      setPostcodes(postcodesList)
      setFilteredPostcodes(postcodesList)
    } catch (error) {
      console.error("Error loading postcodes:", error)
      setPostcodes([])
      setFilteredPostcodes([])
    }
  }

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStateChange = (state: string) => {
    setFormData(prev => ({
      ...prev,
      state,
      city: "",
      postcode: "",
      address: ""
    }))
    loadCities(state)
  }

  const handleCityChange = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city,
      postcode: "",
      address: ""
    }))
    loadPostcodes(city)
  }

  const handlePostcodeChange = (postcode: string) => {
    setFormData(prev => ({
      ...prev,
      postcode,
      address: ""
    }))
  }

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({
      ...prev,
      address
    }))
  }

  const handleCitySearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredCities(cities)
      return
    }
    const filtered = cities.filter(city => 
      city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCities(filtered)
  }

  const handlePostcodeSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredPostcodes(postcodes)
      return
    }
    const filtered = postcodes.filter(postcode => 
      postcode.includes(searchTerm)
    )
    setFilteredPostcodes(filtered)
  }

  const handleTechnicianSelect = (technicianId: string) => {
    console.log("Selecting technician with ID:", technicianId)
    console.log("Available technicians:", technicians)
    
    const selectedTechnician = technicians.find(tech => tech.id === technicianId)
    console.log("Found technician:", selectedTechnician)
    
    if (selectedTechnician) {
      console.log("Setting technician data:", {
        id: technicianId,
        name: selectedTechnician.name
      })
      
      setFormData(prev => ({
        ...prev,
        assignedTechnicianId: technicianId,
        assignedTechnician: selectedTechnician.name
      }))
    }
  }

  // Combine address fields into one string
  const combineAddress = () => {
    const parts = [
      formData.address,
      formData.city,
      formData.postcode,
      formData.state
    ].filter(part => part && part.trim() !== "")
    
    return parts.join(", ")
  }

  // Send WhatsApp message
  const sendWhatsAppMessage = (order: Order) => {
    const technician = technicians.find(tech => tech.id === order.assignedTechnicianId)
    const message = `*Order Updated*

*Order ID:* ${order.id}
*Customer:* ${order.customerName}
*Phone:* ${order.phone}
*Address:* ${order.address}
*Service Type:* ${order.serviceType}
*Problem:* ${order.problemDescription}
*Quoted Price:* RM ${order.quotedPrice}
*Assigned Date:* ${order.assignedAt}
${order.adminNotes ? `*Admin Notes:* ${order.adminNotes}` : ''}

Please contact the customer and update the order status.`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${technician?.phone?.replace(/\D/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate assigned date is selected and not in the past
      if (!formData.assignedDate) {
        toast({
          title: "Missing Date",
          description: "Please select an assigned date for the service.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get today's date in local timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const assignedDate = new Date(formData.assignedDate!)
      assignedDate.setHours(0, 0, 0, 0)
      
      if (assignedDate.getTime() < today.getTime()) {
        toast({
          title: "Invalid Date",
          description: "Assigned date cannot be in the past. Please select today or a future date.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log("Selected technician ID:", formData.assignedTechnicianId)
      console.log("Selected technician name:", formData.assignedTechnician)
      
      // Combine address fields
      const combinedAddress = combineAddress()
      
      const updatedOrderData = {
        ...order,
        customerName: formData.customerName,
        phone: formData.phone,
        address: combinedAddress,
        problemDescription: formData.problemDescription,
        serviceType: formData.serviceType,
        quotedPrice: Number.parseFloat(formData.quotedPrice),
        assignedTechnicianId: formData.assignedTechnicianId,
        assignedTechnician: formData.assignedTechnician,
        assignedAt: toLocalDateString(formData.assignedDate),
        adminNotes: formData.adminNotes,
        updatedAt: toLocalDateTimeString(new Date()),
      }
      
      console.log("Updated order data:", updatedOrderData)

      const { isConfirmed } = await (window as any).Swal.fire({
        title: 'Confirm Order Update',
        text: `Are you sure you want to update order ${order.id}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update order!',
        cancelButtonText: 'Cancel'
      })

      if (!isConfirmed) {
        setIsLoading(false)
        return
      }

      // Update order
      await ordersService.update(order.id, updatedOrderData)

      setUpdatedOrder(updatedOrderData)
      setShowOrderSummary(true)

      toast({
        title: "Order Updated Successfully!",
        description: `Order ${order.id} has been updated.`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="hover:bg-gray-100 p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-blue-900 mb-2">Edit Order #{order.id}</h2>
          <p className="text-blue-600 text-sm lg:text-base">Update the order details below</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 lg:p-6">
          <form onSubmit={handleSubmitOrder} className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2 text-sm lg:text-base">
                  <User className="w-4 h-4" />
                  Customer Name *
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm lg:text-base">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="e.g., +60123456789"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm lg:text-base">
                  <Wrench className="w-4 h-4" />
                  Service Type *
                </Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotedPrice" className="flex items-center gap-2 text-sm lg:text-base">
                  <DollarSign className="w-4 h-4" />
                  Quoted Price (RM) *
                </Label>
                <Input
                  id="quotedPrice"
                  type="number"
                  step="0.01"
                  value={formData.quotedPrice}
                  onChange={(e) => handleInputChange("quotedPrice", e.target.value)}
                  placeholder="0.00"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTechnician" className="flex items-center gap-2 text-sm lg:text-base">
                  <UserCheck className="w-4 h-4" />
                  Assigned Technician *
                </Label>
                <Select
                  value={formData.assignedTechnicianId}
                  onValueChange={handleTechnicianSelect}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedDate" className="flex items-center gap-2 text-sm lg:text-base">
                  <Calendar className="w-4 h-4" />
                  Assigned Date *
                </Label>
                <DatePicker
                  date={formData.assignedDate}
                  onDateChange={(date) => {
                    setFormData(prev => ({ ...prev, assignedDate: date }))
                  }}
                  placeholder="Select assigned date"
                  minDate={(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return today
                  })()}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm lg:text-base font-semibold">
                <MapPin className="w-4 h-4" />
                Customer Address *
              </Label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm">
                    State *
                  </Label>
                  <Select value={formData.state} onValueChange={handleStateChange}>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">
                    City *
                  </Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={handleCityChange}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search cities..."
                          onChange={(e) => handleCitySearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-sm">
                    Postcode *
                  </Label>
                  <Select 
                    value={formData.postcode} 
                    onValueChange={handlePostcodeChange}
                    disabled={!formData.city}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder={formData.city ? "Select postcode" : "Select city first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search postcodes..."
                          onChange={(e) => handlePostcodeSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredPostcodes.map((postcode) => (
                        <SelectItem key={postcode} value={postcode}>
                          {postcode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm">
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Enter street address"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemDescription" className="flex items-center gap-2 text-sm lg:text-base">
                <FileText className="w-4 h-4" />
                Problem Description *
              </Label>
              <Textarea
                id="problemDescription"
                value={formData.problemDescription}
                onChange={(e) => handleInputChange("problemDescription", e.target.value)}
                placeholder="Describe the aircond problem in detail"
                required
                className="min-h-[80px] lg:min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes" className="flex items-center gap-2 text-sm lg:text-base">
                <StickyNote className="w-4 h-4" />
                Admin Notes
              </Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) => handleInputChange("adminNotes", e.target.value)}
                placeholder="Additional notes for the technician (optional)"
                className="min-h-[60px] lg:min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base lg:text-lg font-semibold transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? "Updating Order..." : "Update Service Order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Summary Modal */}
      <Dialog open={showOrderSummary} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Order Updated
            </DialogTitle>
            <DialogDescription>
              Order has been updated successfully. Review the changes below.
            </DialogDescription>
          </DialogHeader>
          
          {updatedOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Updated Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Order ID:</span>
                    <span className="text-blue-600 font-bold">{updatedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span>{updatedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{updatedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Service Type:</span>
                    <span>{updatedOrder.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-semibold">RM {updatedOrder.quotedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Technician:</span>
                    <span className="text-green-600">{updatedOrder.assignedTechnician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Assigned Date:</span>
                    <span>{updatedOrder.assignedAt}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Address:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{updatedOrder.address}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Problem Description:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{updatedOrder.problemDescription}</p>
              </div>

              {updatedOrder.adminNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Admin Notes:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{updatedOrder.adminNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    sendWhatsAppMessage(updatedOrder)
                    setShowOrderSummary(false)
                    onOrderUpdate(updatedOrder)
                    onOrderComplete?.()
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send to Technician
                </Button>
                <Button
                  onClick={() => {
                    setShowOrderSummary(false)
                    onOrderUpdate(updatedOrder)
                    onOrderComplete?.()
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 