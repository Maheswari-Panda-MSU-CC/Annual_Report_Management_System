"use client"

import React from "react"
import { useState, useEffect } from "react"
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
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useToast } from "@/components/ui/use-toast"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"

export default function RegisterUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAccessDenied, setIsAccessDenied] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    userType: "",
    department: "",
    faculty: "",
    password: "test@123", // Default password
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [userTypes, setUserTypes] = useState<{ id: number; name: string }[]>([])
  const { facultyOptions, departmentOptions, fetchFaculties, fetchDepartments } = useDropDowns()

  // Check if user is admin
  useEffect(() => {
    if (user?.user_type !== 1) {
      setIsAccessDenied(true)
    }
    fetchFaculties()
  }, [user])

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await fetch('/api/admin/user-types')
        if (!res.ok) throw new Error('Failed to fetch user types')
        const data = await res.json()
        setUserTypes(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchUserTypes()
  }, [])

  // Fetch departments when faculty changes
  useEffect(() => {
    if (formData.faculty) {
      fetchDepartments(Number(formData.faculty))
    }
  }, [formData.faculty])

  // Reset dependent fields when user type changes
  useEffect(() => {
    if (formData.userType) {
      const userTypeNum = Number(formData.userType)
      // Only reset if switching away from types that need these fields
      if (userTypeNum !== 3 && userTypeNum !== 4) {
        setFormData(prev => ({ ...prev, faculty: "", department: "" }))
      }
    }
  }, [formData.userType])

  // Determine which fields to show based on user type
  const userTypeNum = Number(formData.userType)
  const showFaculty = userTypeNum === 3 || userTypeNum === 4 // Department or Teacher
  const showDepartment = userTypeNum === 3 || userTypeNum === 4 // Department or Teacher
  const requiresFaculty = userTypeNum === 3 || userTypeNum === 4
  const requiresDepartment = userTypeNum === 4 // Only Teacher requires department

  const handleFacultyChange = (value: string | number) => {
    const facultyId = String(value)
    setFormData((prev) => ({ ...prev, faculty: facultyId, department: "" }))
    if (errors.faculty) {
      setErrors({ ...errors, faculty: "" })
    }
  }

  const handleDepartmentChange = (value: string | number) => {
    const deptId = String(value)
    setFormData((prev) => ({ ...prev, department: deptId }))
    if (errors.department) {
      setErrors({ ...errors, department: "" })
    }
  }

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

    // Faculty validation (required for Department and Teacher)
    if (requiresFaculty && !formData.faculty) {
      newErrors.faculty = "Faculty is required"
    }

    // Department validation (required only for Teacher)
    if (requiresDepartment && !formData.department) {
      newErrors.department = "Department is required"
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
      toast({
        title: "Validation Failed",
        description: "Please fill all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSuccessMessage("")
    setErrors({})

    try {
      // Prepare signup payload based on user type
      const signupPayload: any = {
        email: formData.email,
        password: formData.password,
        user_type: Number(formData.userType),
      }

      // Add Fid and DeptId based on user type
      if (userTypeNum === 3) {
        // Department - requires Fid
        signupPayload.fid = Number(formData.faculty)
      } else if (userTypeNum === 4) {
        // Teacher - requires both Fid and DeptId
        signupPayload.fid = Number(formData.faculty)
        signupPayload.deptid = Number(formData.department)
      }

      // Step 1: Create user via signup API
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      })

      if (!signupRes.ok) {
        const errorData = await signupRes.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to register user",
          variant: "destructive",
        })
        throw new Error(errorData.error || "Failed to register user")
      }

      // Step 2: Send welcome email with credentials
      const userTypeName = userTypes.find((item) => item.id.toString() === formData.userType)?.name || ""
      const emailContent = `
            Welcome to MSU Baroda Annual Report Management System (ARMS)!

            Your account has been created successfully.

            LOGIN CREDENTIALS:
            Email: ${formData.email}
            Temporary Password: ${formData.password}

            User Type: ${userTypeName}

            Please login at: ${window.location.origin}/login

            ⚠️ IMPORTANT SECURITY REMINDER ⚠️
            Please change your password immediately after your first login for security purposes.

            If you have any questions, please contact the system administrator.

            Best regards,
            MSU Baroda Computer Centre
      `.trim()

      const emailRes = await fetch("/api/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.email,
          subject: "Welcome to MSU Baroda Annual Report Management System (ARMS)",
          text: emailContent,
        }),
      })

      if (!emailRes.ok) {
        console.warn("User created but email sending failed")
        toast({
          title: "User Created",
          description: "User registered but email notification failed. Please notify them manually.",
          variant: "default",
        })
      } else {
        toast({
          title: "Success",
          description: "User registered and welcome email sent successfully!",
        })
      }

      setSuccessMessage(
        `User registered successfully! Welcome email with login credentials has been sent to ${formData.email}`
      )

      // Step 3: Reset form
      setFormData({
        email: "",
        userType: "",
        department: "",
        faculty: "",
        password: "test@123", // Reset to default
      })
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to register user" })
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

  // Prepare options for searchable selects
  const facultySelectOptions: SearchableSelectOption[] = facultyOptions.map((faculty) => ({
    value: faculty.Fid,
    label: faculty.Fname,
  }))

  const departmentSelectOptions: SearchableSelectOption[] = departmentOptions.map((dept) => ({
    value: dept.Deptid,
    label: dept.name,
  }))

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
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Registration</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Register new users for the Annual Report System</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/user-management")} className="w-full md:w-auto">
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
                    User Level *
                  </Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) => {
                      handleInputChange("userType", value)
                      // Reset dependent fields
                      setFormData(prev => ({ ...prev, faculty: "", department: "" }))
                    }}
                  >
                    <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.userType && <p className="text-sm text-red-600">{errors.userType}</p>}
                </div>

                {/* Faculty - Only show for Department (3) and Teacher (4) */}
                {showFaculty && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Faculty {requiresFaculty && "*"}
                    </Label>
                    <SearchableSelect
                      options={facultySelectOptions}
                      value={formData.faculty ? Number(formData.faculty) : undefined}
                      onValueChange={handleFacultyChange}
                      placeholder="Select Faculty"
                      disabled={!formData.userType}
                      className={errors.faculty ? "border-red-500" : ""}
                      emptyMessage="No faculty found."
                    />
                    {errors.faculty && <p className="text-sm text-red-600">{errors.faculty}</p>}
                    <p className="text-xs text-gray-500">Type to search for a faculty</p>
                  </div>
                )}

                {/* Department - Only show for Department (3) and Teacher (4) */}
                {showDepartment && (
                  <div className="space-y-2">
                    <Label>
                      Department {requiresDepartment && "*"}
                    </Label>
                    <SearchableSelect
                      options={departmentSelectOptions}
                      value={formData.department ? Number(formData.department) : undefined}
                      onValueChange={handleDepartmentChange}
                      placeholder="Select Department"
                      disabled={!formData.faculty || !departmentSelectOptions.length}
                      className={errors.department ? "border-red-500" : ""}
                      emptyMessage="No department found. Please select a faculty first."
                    />
                    {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
                    <p className="text-xs text-gray-500">
                      {!formData.faculty
                        ? "Please select a faculty first"
                        : "Type to search for a department"}
                    </p>
                  </div>
                )}

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
                  <p className="text-sm text-gray-500">Default password: test@123 (minimum 8 characters required)</p>
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
              <CardTitle className="text-lg">Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                <p className="text-sm">{formData.email || "Not specified"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">User Level</Label>
                <div className="mt-1">
                  {formData.userType ? (
                    <Badge variant="secondary" className="capitalize">
                      {userTypes.find((item) => item.id.toString() === formData.userType)?.name || ""}
                    </Badge>
                  ) : (
                    <p className="text-sm text-gray-400">Not selected</p>
                  )}
                </div>
              </div>

              {showFaculty && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Faculty</Label>
                  <p className="text-sm">
                    {facultyOptions.find((item) => item.Fid.toString() === formData.faculty)?.Fname ||
                      "Not selected"}
                  </p>
                </div>
              )}

              {showDepartment && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="text-sm">
                    {departmentOptions.find((item) => item.Deptid.toString() === formData.department)?.name ||
                      "Not selected"}
                  </p>
                </div>
              )}

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
              <CardTitle className="text-lg">Email Notification</CardTitle>
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
