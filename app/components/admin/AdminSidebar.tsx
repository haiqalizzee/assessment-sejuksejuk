"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, FileText, BarChart3, ArrowLeft, Snowflake, X, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "create-order", label: "Create Order", icon: Plus, path: "/admin/create-order" },
  { id: "all-orders", label: "All Orders", icon: FileText, path: "/admin/all-orders" },
  { id: "technicians", label: "Technicians", icon: Users, path: "/admin/technicians" },
  { id: "kpi", label: "KPI Dashboard", icon: BarChart3, path: "/admin/kpi" },
]

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div
      className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-blue-100 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="p-4 lg:p-6 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Snowflake className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-blue-900">Admin Portal</h1>
              <p className="text-xs lg:text-sm text-blue-600">Sejuk Sejuk Service</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-1">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-red-200 text-red-700 hover:bg-red-50 text-xs lg:text-sm"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={onClose} // Close sidebar on mobile after selection
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all duration-200 text-sm lg:text-base ${
                pathname === item.path ? "bg-blue-100 text-blue-900 font-semibold" : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              <item.icon className="w-4 lg:w-5 h-4 lg:h-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}