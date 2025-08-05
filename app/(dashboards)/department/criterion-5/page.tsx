"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function DepartmentCriterion5() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    facultyName: "Dr. John Smith",
    departmentName: "Computer Science",
    year: "2023-24",
    iqacContribution:
      "IQAC has enhanced awareness about student support services through regular workshops and orientation programs.",
    trackingEfforts:
      "Institution tracks student progression through automated systems and regular feedback mechanisms.",
    coachingDetails: "Competitive exam coaching provided for GATE, NET, and other entrance examinations.",
    coachingBeneficiaries: "150",
    counsellingDetails: "Regular counselling sessions conducted by qualified counsellors and career guidance experts.",
    counsellingBeneficiaries: "200",
    genderSensitization: "Gender sensitization programs conducted monthly with focus on awareness and equality.",
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
          <h1 className="text-3xl font-bold text-gray-900">Criterion 5</h1>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criterion - V Form</CardTitle>
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
                <Label htmlFor="iqacContribution">
                  5.1 Contribution of IQAC in enhancing awareness about Student Support Services
                </Label>
                <Textarea
                  id="iqacContribution"
                  value={formData.iqacContribution}
                  onChange={(e) => handleInputChange("iqacContribution", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="trackingEfforts">
                  5.2 Efforts made by the institution for tracking the progression
                </Label>
                <Textarea
                  id="trackingEfforts"
                  value={formData.trackingEfforts}
                  onChange={(e) => handleInputChange("trackingEfforts", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="coachingDetails">
                  5.4 Details of student support mechanism for coaching for competitive examinations (If any)
                </Label>
                <Textarea
                  id="coachingDetails"
                  value={formData.coachingDetails}
                  onChange={(e) => handleInputChange("coachingDetails", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="coachingBeneficiaries">No. of students benefitted</Label>
                <Input
                  id="coachingBeneficiaries"
                  value={formData.coachingBeneficiaries}
                  onChange={(e) => handleInputChange("coachingBeneficiaries", e.target.value)}
                  disabled={!isEditing}
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="counsellingDetails">5.6 Details of student counselling & career guidance</Label>
                <Textarea
                  id="counsellingDetails"
                  value={formData.counsellingDetails}
                  onChange={(e) => handleInputChange("counsellingDetails", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="counsellingBeneficiaries">No. of students benefitted</Label>
                <Input
                  id="counsellingBeneficiaries"
                  value={formData.counsellingBeneficiaries}
                  onChange={(e) => handleInputChange("counsellingBeneficiaries", e.target.value)}
                  disabled={!isEditing}
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="genderSensitization">5.8 Details of gender sensitization programmes</Label>
                <Textarea
                  id="genderSensitization"
                  value={formData.genderSensitization}
                  onChange={(e) => handleInputChange("genderSensitization", e.target.value)}
                  disabled={!isEditing}
                  className="min-h-[100px]"
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
