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
            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          {/* <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700">
              Remember me
            </label>
          </div> */}

          <div className="text-xs sm:text-sm">
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
          className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              <span className="text-xs sm:text-sm">Signing in...</span>
            </>
          ) : (
            <span className="text-xs sm:text-sm">Sign In</span>
          )}
        </Button>
      </form>


    </div>
  )
}
