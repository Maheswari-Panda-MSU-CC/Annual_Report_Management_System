"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/app/api/auth/auth-provider"
import { Save, Edit, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FacultyProfile {
  facultyName: string
  year: string
  introduction: string
  newDepartmentDetails: string
  nextYearPlan: string
  examinationReforms: string
  innovativeProcesses: string
}

export default function FacultyProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<FacultyProfile>({
    facultyName: user?.faculty || "",
    year: "2024-25",
    introduction: "",
    newDepartmentDetails: "",
    nextYearPlan: "",
    examinationReforms: "",
    innovativeProcesses: "",
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 5 + i
    return `${year}-${(year + 1).toString().slice(-2)}`
  })

  const handleInputChange = (field: keyof FacultyProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      // Here you would typically save to your backend
      console.log("Saving profile:", profile)

      toast({
        title: "Profile Updated",
        description: "Faculty profile has been successfully updated.",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original values if needed
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-8 w-8 text-blue-600" />
              Faculty Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your faculty information and details</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Details</CardTitle>
            <CardDescription>Update your faculty information and academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="facultyName">Faculty Name</Label>
                <Input
                  id="facultyName"
                  value={profile.facultyName}
                  onChange={(e) => handleInputChange("facultyName", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter faculty name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select
                  value={profile.year}
                  onValueChange={(value) => handleInputChange("year", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={profile.introduction}
                onChange={(e) => handleInputChange("introduction", e.target.value)}
                disabled={!isEditing}
                placeholder="Provide a comprehensive introduction about the faculty..."
                rows={4}
              />
            </div>

            {/* New Department Details */}
            <div className="space-y-2">
              <Label htmlFor="newDepartmentDetails">Details of Any New Department/Centre Setup During Year</Label>
              <Textarea
                id="newDepartmentDetails"
                value={profile.newDepartmentDetails}
                onChange={(e) => handleInputChange("newDepartmentDetails", e.target.value)}
                disabled={!isEditing}
                placeholder="Describe any new departments or centres established during the academic year..."
                rows={4}
              />
            </div>

            {/* Next Year Plan */}
            <div className="space-y-2">
              <Label htmlFor="nextYearPlan">Details of Next Year Plan</Label>
              <Textarea
                id="nextYearPlan"
                value={profile.nextYearPlan}
                onChange={(e) => handleInputChange("nextYearPlan", e.target.value)}
                disabled={!isEditing}
                placeholder="Outline the strategic plans and initiatives for the upcoming academic year..."
                rows={4}
              />
            </div>

            {/* Examination Reforms */}
            <div className="space-y-2">
              <Label htmlFor="examinationReforms">Examination Reforms</Label>
              <Textarea
                id="examinationReforms"
                value={profile.examinationReforms}
                onChange={(e) => handleInputChange("examinationReforms", e.target.value)}
                disabled={!isEditing}
                placeholder="Detail any examination reforms or improvements implemented..."
                rows={4}
              />
            </div>

            {/* Innovative Processes */}
            <div className="space-y-2">
              <Label htmlFor="innovativeProcesses">Innovative Processes in Teaching/Learning</Label>
              <Textarea
                id="innovativeProcesses"
                value={profile.innovativeProcesses}
                onChange={(e) => handleInputChange("innovativeProcesses", e.target.value)}
                disabled={!isEditing}
                placeholder="Describe innovative teaching and learning methodologies adopted..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Overview of your faculty profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">Faculty Members</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2,340</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
