"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/api/auth/auth-provider"
import { Save, Edit, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DepartmentProfile {
  details: string
  year: string
  facultyName: string
  departmentName: string
  introduction: string
  examinationReforms: string
  innovativeProcesses: string
  newEquipmentBooks: string
  newLaboratories: string
}

export default function DepartmentProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<DepartmentProfile>({
    details: "",
    year: "2024",
    facultyName: user?.faculty || "",
    departmentName: user?.department || "",
    introduction: "",
    examinationReforms: "",
    innovativeProcesses: "",
    newEquipmentBooks: "",
    newLaboratories: "",
  })

  const handleInputChange = (field: keyof DepartmentProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      console.log("Saving profile:", profile)

      toast({
        title: "Profile Updated",
        description: "Department profile has been successfully updated.",
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
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-8 w-8 text-blue-600" />
              Department Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your department information and details</p>
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
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Update your department information and academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  value={profile.departmentName}
                  onChange={(e) => handleInputChange("departmentName", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter department name"
                />
              </div>
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
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={profile.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter year"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={profile.details}
                onChange={(e) => handleInputChange("details", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter department details..."
                rows={4}
              />
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={profile.introduction}
                onChange={(e) => handleInputChange("introduction", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter department introduction..."
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
                placeholder="Enter examination reforms details..."
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
                placeholder="Enter innovative processes in teaching/learning..."
                rows={4}
              />
            </div>

            {/* New Equipment and Books */}
            <div className="space-y-2">
              <Label htmlFor="newEquipmentBooks">New Equipment and Books in the Departmental Library</Label>
              <Textarea
                id="newEquipmentBooks"
                value={profile.newEquipmentBooks}
                onChange={(e) => handleInputChange("newEquipmentBooks", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter details about new equipment and books..."
                rows={4}
              />
            </div>

            {/* New Laboratories */}
            <div className="space-y-2">
              <Label htmlFor="newLaboratories">New Laboratories/Seminar/Conference Rooms</Label>
              <Textarea
                id="newLaboratories"
                value={profile.newLaboratories}
                onChange={(e) => handleInputChange("newLaboratories", e.target.value)}
                disabled={!isEditing}
                placeholder="Enter details about new laboratories, seminar and conference rooms..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
