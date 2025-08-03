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
import { User, Phone, MapPin, Wrench, DollarSign, UserCheck, StickyNote, FileText, MessageCircle, X, Calendar } from "lucide-react"
import { ordersService, techniciansService } from "@/lib/firebase-services"
import type { Order, Technician } from "@/app/types"
import { DatePicker } from "@/components/ui/datepicker"
import { toLocalDateString, toLocalDateTimeString } from "@/lib/utils"
import {
  getStates,
  getCities,
  getPostcodes,
  getPostcodesByPrefix,
  findPostcode
} from "malaysia-postcodes"

interface CreateOrderFormProps {
  onOrderCreate: (order: Order) => void
  onOrderComplete?: () => void
}

export default function CreateOrderForm({ onOrderCreate, onOrderComplete }: CreateOrderFormProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  
  // Address-related state
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [postcodes, setPostcodes] = useState<string[]>([])
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [filteredPostcodes, setFilteredPostcodes] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    state: "",
    problemDescription: "",
    serviceType: "",
    quotedPrice: "",
    assignedTechnicianId: "",  // New field for ID
    assignedTechnician: "",    // Keep name for display
    assignedDate: undefined as Date | undefined,   // New field for assigned date - undefined by default
    adminNotes: "",
  })

  useEffect(() => {
    loadTechnicians()
    loadStates()
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

  // Generate custom order ID
  const generateOrderId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit random number
    return `ORDER${randomNum}`
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
    const message = `🔧 *New Service Order Assigned*

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

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (formData.assignedDate < today) {
        toast({
          title: "Invalid Date",
          description: "Assigned date cannot be in the past. Please select today or a future date.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const orderId = generateOrderId()
      
      console.log("Selected technician ID:", formData.assignedTechnicianId)
      console.log("Selected technician name:", formData.assignedTechnician)
      
      // Combine address fields
      const combinedAddress = combineAddress()
      
      const newOrderData = {
        ...formData,
        address: combinedAddress, // Use combined address
        quotedPrice: Number.parseFloat(formData.quotedPrice),
        status: "pending" as const,
        createdAt: toLocalDateTimeString(new Date()),
        assignedAt: toLocalDateString(formData.assignedDate), // Convert Date to string preserving local date
      }
      
      console.log("New order data:", newOrderData)

      const { isConfirmed } = await (window as any).Swal.fire({
        title: 'Confirm Order Creation',
        text: `Are you sure you want to create order`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, create order!',
        cancelButtonText: 'Cancel'
      })

      if (!isConfirmed) {
        setIsLoading(false)
        return
      }

      // Create order with custom ID
      await ordersService.createWithId(orderId, newOrderData)

      const newOrder: Order = {
        id: orderId,
        ...newOrderData,
      }

      setCreatedOrder(newOrder)
      setShowOrderSummary(true)
      // Don't call onOrderCreate here - wait for user to close summary

      setFormData({
        customerName: "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
        state: "",
        problemDescription: "",
        serviceType: "",
        quotedPrice: "",
        assignedTechnicianId: "",
        assignedTechnician: "",
        assignedDate: undefined,
        adminNotes: "",
      })

      toast({
        title: "Order Created Successfully!",
        description: `Order ${orderId} has been created and assigned to ${newOrderData.assignedTechnician}.`,
      })
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-blue-900 mb-2">Create New Order</h2>
        <p className="text-blue-600 text-sm lg:text-base">Fill in the details to create a new service order</p>
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
                  minDate={new Date()}
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

              {/* Combined Address Preview */}
              {formData.address && formData.city && formData.postcode && formData.state && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">Complete Address:</Label>
                  <p className="text-sm text-blue-700 mt-1">
                    {combineAddress()}
                  </p>
                </div>
              )}
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
              {isLoading ? "Creating Order..." : "Create Service Order"}
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
              Order Summary
            </DialogTitle>
            <DialogDescription>
              Order has been created successfully. Review the details below.
            </DialogDescription>
          </DialogHeader>
          
          {createdOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Order ID:</span>
                    <span className="text-blue-600 font-bold">{createdOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Customer:</span>
                    <span>{createdOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{createdOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Service Type:</span>
                    <span>{createdOrder.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-semibold">RM {createdOrder.quotedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Technician:</span>
                    <span className="text-green-600">{createdOrder.assignedTechnician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Assigned Date:</span>
                    <span>{createdOrder.assignedAt}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Address:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{createdOrder.address}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Problem Description:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{createdOrder.problemDescription}</p>
              </div>

              {createdOrder.adminNotes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Admin Notes:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{createdOrder.adminNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    sendWhatsAppMessage(createdOrder)
                    setShowOrderSummary(false)
                    onOrderCreate(createdOrder)
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
                    onOrderCreate(createdOrder)
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
