"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Snowflake } from "lucide-react"
import { useTechnician } from "@/app/contexts/TechnicianContext"

interface TechnicianHeaderProps {
  onBack: () => void
}

export default function TechnicianHeader({ onBack }: TechnicianHeaderProps) {
  const { technician } = useTechnician()

  return (
    <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-blue-900">Technician Portal</h1>
              <p className="text-xs sm:text-sm text-blue-600">
                Welcome! Technician {technician?.name || "Loading..."}
              </p>
            </div>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-transparent border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
