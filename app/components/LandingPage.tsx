"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Snowflake, Shield, Users, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { techniciansService } from "@/lib/firebase-services"
import { usePageTitle } from "@/hooks/use-page-title"
type UserRole = "admin" | "technician"

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void
}

export default function LandingPage({ onRoleSelect }: LandingPageProps) {
  usePageTitle("") // Landing page - no additional title
  const { login } = useAuth()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("") // Clear previous error messages

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
      setErrorMessage("Invalid email or password. Please check your credentials and try again.")
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#72C6EF] to-[#004E8F] bg-[length:400%_400%] animate-gradient-slow relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Snowflake className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sejuk Sejuk Service</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Service Portal
              </span>
            </h1>
          </div>


          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <Card className="w-full bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
                  <p className="text-white/70">Access your service portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20"
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
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20"
                      required
                    />
                  </div>
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                      <p className="text-red-200 text-sm text-center">{errorMessage}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-300 font-semibold py-3"
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
      <footer className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/80">© 2025 Sejuk Sejuk Service Sdn Bhd.</p>
        </div>
      </footer>
    </div>
  )
}
