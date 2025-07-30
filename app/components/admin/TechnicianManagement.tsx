"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { User, Phone, Mail, Edit, Trash2, UserPlus, Lock } from "lucide-react"
import { techniciansService, usersService } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import type { Technician } from "@/app/types"

export default function TechnicianManagement() {
  const { register } = useAuth()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    loadTechnicians()
  }, [])

  const loadTechnicians = async () => {
    try {
      const techList = await techniciansService.getAll()
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingTechnician) {
        // Update existing technician
        await techniciansService.update(editingTechnician.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        })
        
        // Update user profile if email changed
        if (formData.email !== editingTechnician.email) {
          const userProfile = await usersService.getByEmail(editingTechnician.email)
          if (userProfile) {
            await usersService.update(userProfile.id, { email: formData.email })
          }
        }

        toast({
          title: "Technician Updated",
          description: `${formData.name} has been updated successfully.`,
        })
      } else {
        // Create technician profile
        const technicianId = await techniciansService.create({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          joinedDate: new Date().toISOString().split("T")[0]
        })

        // Create Firebase Auth account without user profile
        await register(formData.email, formData.password, {})

        toast({
          title: "Technician Added",
          description: `${formData.name} has been added successfully.`,
        })
      }

      // Reload technicians
      await loadTechnicians()

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
      })
      setEditingTechnician(null)
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving technician:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save technician. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician)
    setFormData({
      name: technician.name,
      phone: technician.phone,
      email: technician.email,
      password: "", // Clear password on edit
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technician?")) return

    try {
      const technician = technicians.find(t => t.id === id)
      if (!technician) throw new Error("Technician not found")

      // Delete technician profile
      await techniciansService.delete(id)

      // Delete user profile
      const userProfile = await usersService.getByEmail(technician.email)
      if (userProfile) {
        await usersService.delete(userProfile.id)
      }

      await loadTechnicians()
      toast({
        title: "Technician Removed",
        description: "Technician has been removed from the system.",
      })
    } catch (error) {
      console.error("Error deleting technician:", error)
      toast({
        title: "Error",
        description: "Failed to delete technician. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Technician Management</h2>
          <p className="text-blue-600">Manage your technician team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            // Reset form when dialog closes
            setEditingTechnician(null)
            setFormData({
              name: "",
              phone: "",
              email: "",
              password: "",
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTechnician(null)
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  password: "",
                })
                setIsDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTechnician ? "Edit Technician" : "Add New Technician"}</DialogTitle>
              <DialogDescription>
                {editingTechnician ? "Update technician information" : "Fill in the details to add a new technician"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="e.g., +60123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@sejuksejuk.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password {!editingTechnician && "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={editingTechnician ? "Leave blank to keep unchanged" : "Enter password"}
                  required={!editingTechnician}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : editingTechnician ? "Update" : "Add"} Technician
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {technicians.map((technician) => (
              <Card key={technician.id} className="border border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-blue-900">{technician.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{technician.phone}</p>
                    <p className="text-sm text-gray-600">{technician.email}</p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(technician)}
                        className="bg-transparent text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(technician.id)}
                        className="bg-transparent text-red-600 hover:bg-red-50 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((technician) => (
                  <TableRow key={technician.id} className="hover:bg-blue-50">
                    <TableCell className="font-semibold">{technician.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{technician.phone}</p>
                        <p className="text-sm text-gray-500">{technician.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(technician.joinedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(technician)}
                          className="bg-transparent"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(technician.id)}
                          className="bg-transparent text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
