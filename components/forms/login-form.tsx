"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../../app/api/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login(email, password)
      console.log(email,password,response);
      if (response.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to MSU Annual Report System",
          variant: "default",
        })
        console.log("toast");
        // No need to manually redirect here as auth provider handles it
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please check your credentials.",
          variant: "destructive",
        })
        
        console.log("login failed");
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (userType: "admin" | "faculty" | "department" | "teacher", userEmail?: string) => {
    if (userType === "admin") {
      setEmail("admin@msubaroda.ac.in")
    } else if (userType === "faculty") {
      setEmail("dean-arts@msubaroda.ac.in")
    } else if (userType === "department") {
      setEmail("head.cs@msubaroda.ac.in")
    } else if (userType === "teacher") {
      setEmail("viral.kapadia-cse@msubaroda.ac.in")
    } else if (userEmail) {
      setEmail(userEmail)
    }
    setPassword("password")
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 pr-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/change-password"
              className="font-medium text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Demo credentials section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:text-gray-600"
            onClick={() => {
              const demoSection = document.getElementById("demo-credentials")
              if (demoSection) {
                demoSection.classList.toggle("hidden")
              }
            }}
          >
            Demo Credentials
          </button>
          <div id="demo-credentials" className="hidden mt-3 text-xs text-gray-500 space-y-3 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="font-medium text-gray-700 mb-2">Admin Account:</p>
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="text-left w-full p-2 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800"
              >
                admin@msubaroda.ac.in (Password: password)
              </button>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Faculty Account:</p>
              <button
                type="button"
                onClick={() => fillDemoCredentials("faculty")}
                className="text-left w-full p-2 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800"
              >
                dean-arts@msubaroda.ac.in (Password: password)
              </button>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Department Account:</p>
              <button
                type="button"
                onClick={() => fillDemoCredentials("department")}
                className="text-left w-full p-2 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800"
              >
                head.cs@msubaroda.ac.in (Password: password)
              </button>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-2">Teacher Account:</p>
              <button
                type="button"
                onClick={() => fillDemoCredentials("teacher")}
                className="text-left w-full p-2 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800"
              >
                viral.kapadia-cse@msubaroda.ac.in (Password: password)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
