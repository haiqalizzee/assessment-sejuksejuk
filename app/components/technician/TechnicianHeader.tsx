"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Snowflake } from "lucide-react"

interface TechnicianHeaderProps {
  onBack: () => void
}

export default function TechnicianHeader({ onBack }: TechnicianHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">Technician Portal</h1>
              <p className="text-sm text-blue-600">Ali - Sejuk Sejuk Service</p>
            </div>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </header>
  )
}
