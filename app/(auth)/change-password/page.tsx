"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle, KeyRound } from "lucide-react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [otpToken, setOtpToken] = useState<string>("")
  const [step, setStep] = useState(1) // 1: Email, 2: Verification, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const handleSendVerificationOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
  
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
  
      const data = await res.json()
      setOtpToken(data.otpToken);
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP.")
      }
  
      setSuccess("Verification code sent to your email address!")
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Something went wrong while sending the OTP.")
    } finally {
      setIsLoading(false)
    }
  }
 

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
  
    if (!formData.verificationCode) {
      setError("Please enter the verification code")
      setIsLoading(false)
      return
    }
  
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.verificationCode,
          otpToken: otpToken, 
        }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed")
      }
  
      setSuccess("Verification successful! Please enter your new password.")
      setStep(3)
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all password fields")
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      })

      setSuccess("Password changed successfully! Redirecting to login...")

      // Redirect after success
      setTimeout(() => {
        router.push("/teacher/dashboard")
      }, 2000)
    } catch (err) {
      setError("Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      router.push("/teacher/dashboard")
    } else {
      setStep(step - 1)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendVerificationOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <p className="text-sm text-muted-foreground">We'll send a verification code to this email address</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>
        )

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                placeholder="Enter 6-digit verification code"
                maxLength={6}
                required
                disabled={isLoading}
                className="text-center text-lg tracking-widest h-12 border-gray-300 focus:border-primary focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground">Check your email for the verification code</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 h-12 bg-transparent"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1 h-12 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Code
                  </>
                )}
              </Button>
            </div>
          </form>
        )

      case 3:
        return (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 h-12 bg-transparent"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1 h-12 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Reset Your Password"
      case 2:
        return "Enter Verification Code"
      case 3:
        return "Set New Password"
      default:
        return "Change Password"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email address and we'll send you a verification code to reset your password"
      case 2:
        return "Enter the 6-digit verification code sent to your email"
      case 3:
        return "Create a new secure password for your account"
      default:
        return "Follow the steps to change your password securely"
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-center items-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/msu-logo.png"
              alt="MSU Baroda Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Secure Password Reset</h1>
            <p className="text-lg text-gray-600">MSU Baroda Annual Report System</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Follow our secure process to reset your password and regain access to your account.
            </p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lock className="h-4 w-4 text-primary" />
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
            <Image src="/images/msu-logo.png" alt="MSU Baroda Logo" width={80} height={80} className="object-contain" />
          </div>

          {/* Back to Login Link */}
          <div className="flex items-center">
            <Link
              href="/teacher/dashboard"
              className="flex items-center text-sm text-gray-600 hover:text-primary transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          <Card className="border-0 shadow-lg lg:shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">{getStepTitle()}</CardTitle>
              <CardDescription className="text-center text-gray-600">{getStepDescription()}</CardDescription>
              <div className="flex justify-center mt-4">
                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                  stepNumber <= step ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Additional help text */}
          <div className="text-center text-xs text-gray-500 space-y-2">
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
