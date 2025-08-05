"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

export default function DepartmentCriterion7() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    facultyName: "Dr. John Smith",
    departmentName: "Computer Science",
    year: "2023-24",
    innovations:
      "Implementation of AI-based learning management system and virtual reality labs for enhanced student experience.",
    actionTakenReport:
      "All planned activities for the academic year were successfully implemented with 95% completion rate. Key achievements include infrastructure upgrades, faculty development programs, and student support initiatives.",
    bestPractices:
      "1. Peer-to-peer learning programs that have improved student engagement by 40%.\n2. Industry-academia collaboration model that has resulted in 80% placement rate.",
    environmentalContribution:
      "Tree plantation drives, waste segregation programs, and renewable energy initiatives have been implemented.",
    environmentalAudit: "yes",
    additionalInformation:
      "SWOT Analysis:\nStrengths: Strong faculty, modern infrastructure, industry connections\nWeaknesses: Limited research funding, need for more international collaborations\nOpportunities: Emerging technologies, government initiatives\nThreats: Competition from private institutions, changing industry requirements",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Criterion 7</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criterion - VII Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facultyName">Faculty Name</Label>
                  <Input
                    id="facultyName"
                    value={formData.facultyName}
                    onChange={(e) => handleInputChange("facultyName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={formData.departmentName}
                    onChange={(e) => handleInputChange("departmentName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

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
                <Label htmlFor="innovations">
                  7.1 Innovations introduced during this academic year which have created a positive impact on the
                  functioning of the institution. Give details.
                </Label>
                <Textarea
                  id="innovations"
                  value={formData.innovations}
                  onChange={(e) => handleInputChange("innovations", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="actionTakenReport">
                  7.2 Provide the Action Taken Report(ATR) based on the plan of action decided upon at the beginning of
                  the year
                </Label>
                <Textarea
                  id="actionTakenReport"
                  value={formData.actionTakenReport}
                  onChange={(e) => handleInputChange("actionTakenReport", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="bestPractices">
                  7.3 Give two Best Practices of the institution (please see the format in the NAAC Self-study Manuals)
                </Label>
                <Textarea
                  id="bestPractices"
                  value={formData.bestPractices}
                  onChange={(e) => handleInputChange("bestPractices", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[150px]"
                />
              </div>

              <div>
                <Label htmlFor="environmentalContribution">
                  7.4 Contribution to environmental awareness / protection
                </Label>
                <Textarea
                  id="environmentalContribution"
                  value={formData.environmentalContribution}
                  onChange={(e) => handleInputChange("environmentalContribution", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label>7.5 Whether environmental audit was conducted?</Label>
                <RadioGroup
                  value={formData.environmentalAudit}
                  onValueChange={(value) => handleInputChange("environmentalAudit", value)}
                  disabled={!isEditing}
                  className="flex flex-row space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="env-audit-yes" />
                    <Label htmlFor="env-audit-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="env-audit-no" />
                    <Label htmlFor="env-audit-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="additionalInformation">
                  7.6 Any other relevant information wishes to add. (for example SWOT Analysis)
                </Label>
                <Textarea
                  id="additionalInformation"
                  value={formData.additionalInformation}
                  onChange={(e) => handleInputChange("additionalInformation", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[150px]"
                />
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
