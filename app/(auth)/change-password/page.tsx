"use client"

import type React from "react"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle, KeyRound } from "lucide-react"

// Component that uses useSearchParams - must be wrapped in Suspense
function ChangePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get("token"), [searchParams])
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    setError("")
  }, [token])

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
  
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
  
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link.")
      }
  
      setSuccess("Reset link sent to your email address. It expires in 5 minutes.")
      toast({
        title: "Email Sent",
        description: "Check your inbox for the password reset link.",
      })
    } catch (err: any) {
      const message = err.message || "Something went wrong while sending the reset link."
      setError(message)
      toast({
        title: "Failed to send reset link",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.")
      }

      setSuccess("Password changed successfully! Redirecting to login...")
      toast({
        title: "Password Updated",
        description: "You can now sign in with your new password.",
      })

      // Redirect after success
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      const message = err.message || "Failed to change password. Please try again."
      setError(message)
      toast({
        title: "Password Update Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => router.push("/login")

  const renderStepContent = () => {
    if (!token) {
        return (
          <form onSubmit={handleSendResetLink} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">We'll send a password reset link to this email address</p>
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Sending link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        )
    }

    return (
          <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs sm:text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base bg-transparent"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1 h-10 sm:h-12 text-sm sm:text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )
  }

  const getStepTitle = () => {
    if (!token) return "Reset Your Password"
    return "Set New Password"
  }

  const getStepDescription = () => {
    if (!token) return "Enter your email address and we'll send you a reset link"
    return "Create a new secure password for your account"
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-center items-center p-6 lg:p-8">
        <div className="max-w-md text-center space-y-4 lg:space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/msu-logo.png"
              alt="MSU Baroda Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Secure Password Reset</h1>
            <p className="text-base sm:text-lg text-gray-600">MSU Baroda Annual Report System</p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Follow our secure process to reset your password and regain access to your account.
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="font-semibold">Secure Process</span>
            </div>
            <p>Your security is our priority. We use industry-standard verification methods.</p>
          </div>
        </div>
      </div>

      {/* Right side - Password Reset Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Image src="/images/msu-logo.png" alt="MSU Baroda Logo" width={60} height={60} className="object-contain sm:w-20 sm:h-20" />
          </div>

          {/* Back to Login Link */}
          <div className="flex items-center">
            <Link
              href="/login"
              className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          <Card className="border-0 shadow-lg lg:shadow-xl">
            <CardHeader className="space-y-1 pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">{getStepTitle()}</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm text-gray-600">{getStepDescription()}</CardDescription>
       
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs sm:text-sm">{success}</AlertDescription>
                </Alert>
              )}

              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Additional help text */}
          <div className="text-center text-[10px] sm:text-xs text-gray-500 space-y-1 sm:space-y-2">
            <p>
              Need help? Contact{" "}
              <a
                href="mailto:support@msubaroda.ac.in"
                className="text-primary hover:text-primary/80 transition-colors duration-200"
              >
                support@msubaroda.ac.in
              </a>
            </p>
            <p>© 2024 The Maharaja Sayajirao University of Baroda. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function ChangePasswordLoading() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-center items-center p-6 lg:p-8">
        <div className="max-w-md text-center space-y-4 lg:space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/msu-logo.png"
              alt="MSU Baroda Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-0 shadow-lg lg:shadow-xl">
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<ChangePasswordLoading />}>
      <ChangePasswordContent />
    </Suspense>
  )
}
