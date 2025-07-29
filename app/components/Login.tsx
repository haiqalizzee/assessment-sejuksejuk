"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Snowflake, User, Lock, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { UserRole } from "@/app/types"

interface LoginProps {
  onLogin: (role: UserRole) => void
  onBack: () => void
  initialRole: UserRole
}

export default function Login({ onLogin, onBack, initialRole }: LoginProps) {
  const { login } = useAuth()
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

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      })

      // Determine role based on email domain or user profile
      // For demo purposes, we'll use email prefixes
      const role = credentials.email.startsWith("admin") ? "admin" : "technician"
      onLogin(role as UserRole)
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
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900">
              {initialRole === "admin" ? "Admin Login" : "Technician Login"}
            </CardTitle>
            <CardDescription className="text-blue-600">
              Sign in to access {initialRole === "admin" ? "admin portal" : "technician portal"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <User className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  className="bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold transition-all duration-200 hover:shadow-lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="ghost" onClick={onBack} className="text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
