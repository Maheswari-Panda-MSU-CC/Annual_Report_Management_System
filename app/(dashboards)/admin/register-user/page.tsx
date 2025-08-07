"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Mail,
  Users,
  Building,
  Key,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"

// Department options
const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Management Studies",
  "Commerce",
  "Economics",
  "Psychology",
  "Sociology",
]

// Faculty options
const faculties = [
  "Faculty of Technology and Engineering",
  "Faculty of Science",
  "Faculty of Arts",
  "Faculty of Commerce",
  "Faculty of Management Studies",
  "Faculty of Social Work",
  "Faculty of Education and Psychology",
  "Faculty of Law",
  "Faculty of Medicine",
  "Faculty of Pharmacy",
]

export default function RegisterUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAccessDenied, setIsAccessDenied] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    userType: "",
    department: "",
    faculty: "",
    password: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Check if user is admin
  React.useEffect(() => {
    if (user?.user_type !== 1) {
      setIsAccessDenied(true)
    }
  }, [user])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!formData.email.endsWith("@msubaroda.ac.in")) {
      newErrors.email = "Email must be from @msubaroda.ac.in domain"
    }

    // User type validation
    if (!formData.userType) {
      newErrors.userType = "User type is required"
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = "Department is required"
    }

    // Faculty validation
    if (!formData.faculty) {
      newErrors.faculty = "Faculty is required"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccessMessage("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Send welcome email automatically
      const emailContent = `
        Welcome to MSU Baroda Annual Report System!
        
        Your account has been created successfully.
        
        Login Credentials:
        Email: ${formData.email}
        Temporary Password: ${formData.password}
        
        User Details:
        Type: ${formData.userType}
        Department: ${formData.department}
        Faculty: ${formData.faculty}
        
        Please login at: ${window.location.origin}/login
        
        IMPORTANT: Please change your password immediately after your first login for security purposes.
        
        If you have any questions, please contact the system administrator.
        
        Best regards,
        MSU Baroda IT Team
      `

      console.log("Welcome email sent to:", formData.email)
      console.log("Email content:", emailContent)

      setSuccessMessage(
        `User registered successfully! Welcome email with login credentials has been sent to ${formData.email}`,
      )

      // Reset form
      setFormData({
        email: "",
        userType: "",
        department: "",
        faculty: "",
        password: "",
      })
    } catch (error) {
      setErrors({ submit: "Failed to register user. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  if (isAccessDenied) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Access denied. Only University Administrators can register users.</AlertDescription>
          </Alert>
        </div>
    )
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Registration</h1>
            <p className="text-gray-600 mt-1">Register new users for the Annual Report System</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/user-management")}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errors.submit && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Register New User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Official Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@msubaroda.ac.in"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* User Type */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Type *
                    </Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                      <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.userType && <p className="text-sm text-red-600">{errors.userType}</p>}
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department *
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
                  </div>

                  {/* Faculty */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Faculty *
                    </Label>
                    <Select value={formData.faculty} onValueChange={(value) => handleInputChange("faculty", value)}>
                      <SelectTrigger className={errors.faculty ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty} value={faculty}>
                            {faculty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.faculty && <p className="text-sm text-red-600">{errors.faculty}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Temporary Password *
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter temporary password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={errors.password ? "border-red-500" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    <p className="text-sm text-gray-500">Minimum 8 characters required</p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering User...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register User & Send Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Registration Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                  <p className="text-sm">{formData.email || "Not specified"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">User Type</Label>
                  <div className="mt-1">
                    {formData.userType ? (
                      <Badge variant="secondary" className="capitalize">
                        {formData.userType}
                      </Badge>
                    ) : (
                      <p className="text-sm text-gray-400">Not selected</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-sm">{formData.department || "Not selected"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Faculty</Label>
                  <p className="text-sm">{formData.faculty || "Not selected"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Password Status</Label>
                  <p className="text-sm">
                    {formData.password ? (
                      <span className="text-green-600">✓ Password set</span>
                    ) : (
                      <span className="text-gray-400">Password required</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Notification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Welcome email will be sent automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Login credentials included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Password change reminder</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
