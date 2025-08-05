"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CalendarIcon,
  Plus,
  X,
  User,
  GraduationCap,
  Briefcase,
  Award,
  MapPin,
  Loader2,
  Save,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

interface FacultyFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  alternatePhone: string
  dateOfBirth: Date | null
  gender: string
  nationality: string
  religion: string
  category: string
  maritalStatus: string

  // Address Information
  currentAddress: string
  permanentAddress: string
  city: string
  state: string
  pincode: string
  country: string

  // Employment Information
  employeeId: string
  designation: string
  department: string
  faculty: string
  joiningDate: Date | null
  employmentType: string
  workingStatus: string
  salary: string

  // Academic Information
  highestQualification: string
  university: string
  yearOfPassing: string
  specialization: string
  experience: string
  previousInstitution: string

  // Research Information
  researchAreas: string[]
  publications: string
  projects: string
  awards: string
  patents: string

  // Teaching Information
  coursesTeaching: string[]
  teachingExperience: string

  // Additional Information
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  bloodGroup: string
  medicalConditions: string

  // Documents
  profilePhoto: File | null
  resume: File | null
  certificates: File[]
}

const initialFormData: FacultyFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  dateOfBirth: null,
  gender: "",
  nationality: "Indian",
  religion: "",
  category: "",
  maritalStatus: "",
  currentAddress: "",
  permanentAddress: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  employeeId: "",
  designation: "",
  department: "",
  faculty: "",
  joiningDate: null,
  employmentType: "",
  workingStatus: "Active",
  salary: "",
  highestQualification: "",
  university: "",
  yearOfPassing: "",
  specialization: "",
  experience: "",
  previousInstitution: "",
  researchAreas: [],
  publications: "",
  projects: "",
  awards: "",
  patents: "",
  coursesTeaching: [],
  teachingExperience: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  bloodGroup: "",
  medicalConditions: "",
  profilePhoto: null,
  resume: null,
  certificates: [],
}

export default function AddFacultyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FacultyFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newResearchArea, setNewResearchArea] = useState("")
  const [newCourse, setNewCourse] = useState("")

  const departments = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Electrical Engineering",
    "Instrumentation & Control Engineering",
    "Biomedical Engineering",
    "Applied Mathematics",
    "Applied Physics",
    "Applied Chemistry",
  ]

  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Senior Lecturer",
    "Principal",
    "Vice Principal",
    "Head of Department",
  ]

  const qualifications = ["PhD", "M.Tech", "M.E", "M.Sc", "M.A", "MBA", "B.Tech", "B.E", "B.Sc", "B.A"]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!formData.designation) newErrors.designation = "Designation is required"
    if (!formData.department) newErrors.department = "Department is required"
    if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    // Employee ID validation (should be unique)
    if (formData.employeeId && formData.employeeId.length < 6) {
      newErrors.employeeId = "Employee ID should be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FacultyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleDateChange = (field: "dateOfBirth" | "joiningDate", date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: date || null }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addResearchArea = () => {
    if (newResearchArea.trim() && !formData.researchAreas.includes(newResearchArea.trim())) {
      setFormData((prev) => ({
        ...prev,
        researchAreas: [...prev.researchAreas, newResearchArea.trim()],
      }))
      setNewResearchArea("")
    }
  }

  const removeResearchArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      researchAreas: prev.researchAreas.filter((a) => a !== area),
    }))
  }

  const addCourse = () => {
    if (newCourse.trim() && !formData.coursesTeaching.includes(newCourse.trim())) {
      setFormData((prev) => ({
        ...prev,
        coursesTeaching: [...prev.coursesTeaching, newCourse.trim()],
      }))
      setNewCourse("")
    }
  }

  const removeCourse = (course: string) => {
    setFormData((prev) => ({
      ...prev,
      coursesTeaching: prev.coursesTeaching.filter((c) => c !== course),
    }))
  }

  const handleFileChange = (field: "profilePhoto" | "resume", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically make an API call to save the faculty data
      console.log("Faculty data to be saved:", formData)

      // Show success message and redirect
      alert("Faculty member added successfully!")
      router.push("/teacher/faculty-management")
    } catch (error) {
      console.error("Error adding faculty:", error)
      alert("Error adding faculty member. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setIsNavigating(true)
            router.push("/teacher/faculty-management")
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} disabled={isNavigating} className="flex items-center gap-2">
              {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
              Back to Faculty Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Faculty Member</h1>
              <p className="text-gray-600 mt-1">Enter complete information for the new faculty member</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Research
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input
                        id="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dateOfBirth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth || undefined}
                            onSelect={(date) => handleDateChange("dateOfBirth", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={(value) => handleInputChange("maritalStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </h3>

                    <div>
                      <Label htmlFor="currentAddress">Current Address</Label>
                      <Textarea
                        id="currentAddress"
                        value={formData.currentAddress}
                        onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="permanentAddress">Permanent Address</Label>
                      <Textarea
                        id="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emergencyContactName">Contact Name</Label>
                        <Input
                          id="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactRelation">Relation</Label>
                        <Input
                          id="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employment Information Tab */}
            <TabsContent value="employment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange("employeeId", e.target.value)}
                        className={errors.employeeId ? "border-red-500" : ""}
                      />
                      {errors.employeeId && <p className="text-sm text-red-500 mt-1">{errors.employeeId}</p>}
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation *</Label>
                      <Select
                        value={formData.designation}
                        onValueChange={(value) => handleInputChange("designation", value)}
                      >
                        <SelectTrigger className={errors.designation ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {designations.map((designation) => (
                            <SelectItem key={designation} value={designation}>
                              {designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.designation && <p className="text-sm text-red-500 mt-1">{errors.designation}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
                    </div>
                    <div>
                      <Label htmlFor="faculty">Faculty</Label>
                      <Input
                        id="faculty"
                        value={formData.faculty}
                        onChange={(e) => handleInputChange("faculty", e.target.value)}
                        placeholder="e.g., Faculty of Technology and Engineering"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Joining Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.joiningDate && "text-muted-foreground",
                              errors.joiningDate && "border-red-500",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.joiningDate ? format(formData.joiningDate, "PPP") : "Pick joining date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.joiningDate || undefined}
                            onSelect={(date) => handleDateChange("joiningDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.joiningDate && <p className="text-sm text-red-500 mt-1">{errors.joiningDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select
                        value={formData.employmentType}
                        onValueChange={(value) => handleInputChange("employmentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Visiting">Visiting</SelectItem>
                          <SelectItem value="Guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workingStatus">Working Status</Label>
                      <Select
                        value={formData.workingStatus}
                        onValueChange={(value) => handleInputChange("workingStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Leave">On Leave</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="salary">Monthly Salary</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        placeholder="e.g., ₹85,000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="previousInstitution">Previous Institution</Label>
                    <Input
                      id="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={(e) => handleInputChange("previousInstitution", e.target.value)}
                      placeholder="Previous workplace (if any)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Information Tab */}
            <TabsContent value="academic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="highestQualification">Highest Qualification</Label>
                      <Select
                        value={formData.highestQualification}
                        onValueChange={(value) => handleInputChange("highestQualification", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select qualification" />
                        </SelectTrigger>
                        <SelectContent>
                          {qualifications.map((qualification) => (
                            <SelectItem key={qualification} value={qualification}>
                              {qualification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={formData.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        placeholder="University/Institution name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearOfPassing">Year of Passing</Label>
                      <Input
                        id="yearOfPassing"
                        value={formData.yearOfPassing}
                        onChange={(e) => handleInputChange("yearOfPassing", e.target.value)}
                        placeholder="e.g., 2015"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Total Experience</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="e.g., 8 years"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Textarea
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      placeholder="Areas of specialization"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="teachingExperience">Teaching Experience</Label>
                    <Input
                      id="teachingExperience"
                      value={formData.teachingExperience}
                      onChange={(e) => handleInputChange("teachingExperience", e.target.value)}
                      placeholder="e.g., 5 years"
                    />
                  </div>

                  {/* Courses Teaching */}
                  <div>
                    <Label>Courses Teaching</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                        placeholder="Enter course name"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
                      />
                      <Button type="button" onClick={addCourse} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.coursesTeaching.map((course, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {course}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeCourse(course)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Research Information Tab */}
            <TabsContent value="research">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Research Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Research Areas */}
                  <div>
                    <Label>Research Areas</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newResearchArea}
                        onChange={(e) => setNewResearchArea(e.target.value)}
                        placeholder="Enter research area"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResearchArea())}
                      />
                      <Button type="button" onClick={addResearchArea} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.researchAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {area}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeResearchArea(area)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publications">Number of Publications</Label>
                      <Input
                        id="publications"
                        value={formData.publications}
                        onChange={(e) => handleInputChange("publications", e.target.value)}
                        placeholder="e.g., 25"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projects">Number of Projects</Label>
                      <Input
                        id="projects"
                        value={formData.projects}
                        onChange={(e) => handleInputChange("projects", e.target.value)}
                        placeholder="e.g., 3"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="awards">Number of Awards</Label>
                      <Input
                        id="awards"
                        value={formData.awards}
                        onChange={(e) => handleInputChange("awards", e.target.value)}
                        placeholder="e.g., 2"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patents">Number of Patents</Label>
                      <Input
                        id="patents"
                        value={formData.patents}
                        onChange={(e) => handleInputChange("patents", e.target.value)}
                        placeholder="e.g., 1"
                        type="number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="profilePhoto">Profile Photo</Label>
                      <Input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("profilePhoto", e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resume">Resume/CV</Label>
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange("resume", e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) => handleInputChange("bloodGroup", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="EWS">EWS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions (if any)</Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                      placeholder="Any medical conditions or allergies"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading || isNavigating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Faculty...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Faculty Member
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </form>
      </div>
  )
}
