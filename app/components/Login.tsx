"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import type { UserRole } from "@/app/types"
import { techniciansService } from "@/lib/firebase-services"

interface LoginProps {
  onLogin: (role: UserRole) => void
  onBack: () => void
  initialRole: UserRole
}

export default function Login({ onLogin, onBack, initialRole }: LoginProps) {
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
        onLogin("admin")
      } else {
        // For technician, check technicians collection
        const technicians = await techniciansService.getAll()
        const technician = technicians.find(t => t.email === credentials.email)

        if (technician) {
          toast({
            title: "Login Successful",
            description: `Welcome back, ${technician.name}!`,
          })
          onLogin("technician")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold">
              {initialRole === "admin" ? "Admin Login" : "Technician Login"}
            </h2>
          </div>

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
  )
}
