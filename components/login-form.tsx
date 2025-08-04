import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { techniciansService } from "@/lib/firebase-services"

interface LoginFormProps extends React.ComponentProps<"div"> {
  onRoleSelect: (role: "admin" | "technician") => void
}

export function LoginForm({ className, onRoleSelect, ...props }: LoginFormProps) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleLogin} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome to Sejuk Sejuk</h1>
                <p className="text-balance text-muted-foreground">Login to your service portal</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required 
                />
              </div>
              {errorMessage && (
                <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-3">
                  <p className="text-destructive text-sm text-center">{errorMessage}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Enter your email and password to access your account
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://www.shutterstock.com/image-photo/air-conditioner-man-electrical-machine-600nw-2338891683.jpg"
              alt="Air conditioner technician"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
