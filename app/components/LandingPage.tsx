"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Snowflake } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { techniciansService } from "@/lib/firebase-services"
import type { UserRole } from "@/app/types"

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  const { login } = useAuth()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(credentials.email, credentials.password)

      // For admin, use email prefix
      if (credentials.email.startsWith("admin")) {
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
        })
        onRoleSelect("admin")
      } else {
        // For technician, check technicians collection
        const technicians = await techniciansService.getAll()
        const technician = technicians.find(t => t.email === credentials.email)

        if (technician) {
          toast({
            title: "Login Successful",
            description: `Welcome back, ${technician.name}!`,
          })
          onRoleSelect("technician")
        } else {
          throw new Error("No technician account found")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

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
          </div>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <Card className="w-full">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
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
