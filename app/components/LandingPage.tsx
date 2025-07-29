"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Monitor, Smartphone, Snowflake, ShieldPlus, Drill } from "lucide-react"
import type { UserRole } from "@/app/types"


interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Snowflake className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Sejuk Sejuk Service</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Service Portal
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamlined air-conditioning service management for enhanced productivity
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <ShieldPlus className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Admin Portal</h3>
                <Button
                  onClick={() => onRoleSelect("admin")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold transition-all duration-300 hover:shadow-xl group-hover:scale-105"
                >
                  Access Admin Portal
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Drill className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Technician Portal</h3>
                <Button
                  onClick={() => onRoleSelect("technician")}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white py-4 text-lg font-semibold transition-all duration-300 hover:shadow-xl group-hover:scale-105"
                >
                  Access Technician Portal
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-blue-600">© 2024 Sejuk Sejuk Service Sdn Bhd.</p>
        </div>
      </footer>
    </div>
  )
}
