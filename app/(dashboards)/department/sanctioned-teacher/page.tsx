"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Edit } from "lucide-react"

export default function DepartmentSanctionedTeacher() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    year: "2023-24",
    fullTimeTeachers: "25",
    sanctionedTeachers: "30",
    uploadedFile: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        uploadedFile: file,
      }))
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sanctioned Teacher</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sanctioned Teacher Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="year">Select Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange("year", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                    <SelectItem value="2021-22">2021-22</SelectItem>
                    <SelectItem value="2020-21">2020-21</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fullTimeTeachers">Full Time Teachers</Label>
                <Input
                  id="fullTimeTeachers"
                  value={formData.fullTimeTeachers}
                  onChange={(e) => handleInputChange("fullTimeTeachers", e.target.value)}
                  disabled={!isEditing}
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="sanctionedTeachers">Sanctioned Teachers</Label>
                <Input
                  id="sanctionedTeachers"
                  value={formData.sanctionedTeachers}
                  onChange={(e) => handleInputChange("sanctionedTeachers", e.target.value)}
                  disabled={!isEditing}
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="teachersList">Upload List Of Teachers</Label>
                <Input
                  id="teachersList"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={!isEditing}
                  accept=".pdf,.doc,.docx,.xlsx,.xls"
                  className="mt-1"
                />
                {formData.uploadedFile && (
                  <p className="text-sm text-gray-600 mt-2">Uploaded: {formData.uploadedFile.name}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
