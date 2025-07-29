"use client"

import { Button } from "@/components/ui/button"
import { Menu, Snowflake } from "lucide-react"

interface AdminHeaderProps {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
        <Menu className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
          <Snowflake className="w-3 h-3 text-white" />
        </div>
        <span className="font-semibold text-blue-900 text-sm">Admin Portal</span>
      </div>
      <div className="w-9" /> {/* Spacer for centering */}
    </div>
  )
}
