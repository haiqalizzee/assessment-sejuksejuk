"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, FileText, BarChart3, ArrowLeft, Snowflake, X, Users } from "lucide-react"
import type { AdminPage } from "@/app/types"

interface AdminSidebarProps {
  currentPage: AdminPage
  onPageChange: (page: AdminPage) => void
  onBack: () => void
  isOpen: boolean
  onClose: () => void
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create-order", label: "Create Order", icon: Plus },
  { id: "all-orders", label: "All Orders", icon: FileText },
  { id: "technicians", label: "Technicians", icon: Users },
  { id: "kpi", label: "KPI Dashboard", icon: BarChart3 },
]

export default function AdminSidebar({ currentPage, onPageChange, onBack, isOpen, onClose }: AdminSidebarProps) {
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
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id as AdminPage)
                onClose() // Close sidebar on mobile after selection
              }}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all duration-200 text-sm lg:text-base ${
                currentPage === item.id ? "bg-blue-100 text-blue-900 font-semibold" : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              <item.icon className="w-4 lg:w-5 h-4 lg:h-5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50 text-sm lg:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
