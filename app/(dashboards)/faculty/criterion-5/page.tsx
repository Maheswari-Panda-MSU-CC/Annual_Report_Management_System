"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, FileText, Users, Award } from "lucide-react"

interface Criterion5Data {
  facultyName: string
  selectedYear: string
  iqacContribution: string
  trackingEfforts: string
  supportMechanismDetails: string
  supportMechanismBeneficiaries: string
  counsellingDetails: string
  counsellingBeneficiaries: string
  genderSensitizationDetails: string
}

export default function FacultyCriterion5Page() {
  const [formData, setFormData] = useState<Criterion5Data>({
    facultyName: "",
    selectedYear: "",
    iqacContribution: "",
    trackingEfforts: "",
    supportMechanismDetails: "",
    supportMechanismBeneficiaries: "",
    counsellingDetails: "",
    counsellingBeneficiaries: "",
    genderSensitizationDetails: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Criterion V data saved:", formData)
      alert("Criterion V form data saved successfully!")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Criterion5Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Criterion - V Form</h1>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Form"}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Form Status</p>
                  <p className="text-2xl font-bold text-gray-900">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Student Support</p>
                  <p className="text-2xl font-bold text-gray-900">Services</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">IQAC</p>
                  <p className="text-2xl font-bold text-gray-900">Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Criterion V - Student Support and Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facultyName">Faculty Name</Label>
                <Input
                  id="facultyName"
                  value={formData.facultyName}
                  onChange={(e) => handleInputChange("facultyName", e.target.value)}
                  placeholder="Enter faculty name"
                />
              </div>

              <div>
                <Label htmlFor="selectedYear">Select Year</Label>
                <Select
                  value={formData.selectedYear}
                  onValueChange={(value) => handleInputChange("selectedYear", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}-{Number.parseInt(year) + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 5.1 IQAC Contribution */}
            <div>
              <Label htmlFor="iqacContribution">
                5.1 Contribution of IQAC in enhancing awareness about Student Support Services
              </Label>
              <Textarea
                id="iqacContribution"
                value={formData.iqacContribution}
                onChange={(e) => handleInputChange("iqacContribution", e.target.value)}
                placeholder="Describe IQAC's contribution to student support services awareness..."
                rows={4}
              />
            </div>

            {/* 5.2 Tracking Efforts */}
            <div>
              <Label htmlFor="trackingEfforts">5.2 Efforts made by the institution for tracking the progression</Label>
              <Textarea
                id="trackingEfforts"
                value={formData.trackingEfforts}
                onChange={(e) => handleInputChange("trackingEfforts", e.target.value)}
                placeholder="Describe efforts made for tracking student progression..."
                rows={4}
              />
            </div>

            {/* 5.4 Student Support Mechanism */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="supportMechanismDetails">
                  5.4 Details of student support mechanism for coaching for competitive examinations (If any)
                </Label>
                <Textarea
                  id="supportMechanismDetails"
                  value={formData.supportMechanismDetails}
                  onChange={(e) => handleInputChange("supportMechanismDetails", e.target.value)}
                  placeholder="Provide details of coaching support for competitive examinations..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="supportMechanismBeneficiaries">No. of students benefitted</Label>
                <Input
                  id="supportMechanismBeneficiaries"
                  type="number"
                  value={formData.supportMechanismBeneficiaries}
                  onChange={(e) => handleInputChange("supportMechanismBeneficiaries", e.target.value)}
                  placeholder="Enter number of students benefitted"
                />
              </div>
            </div>

            {/* 5.6 Student Counselling */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="counsellingDetails">5.6 Details of student counselling & career guidance</Label>
                <Textarea
                  id="counsellingDetails"
                  value={formData.counsellingDetails}
                  onChange={(e) => handleInputChange("counsellingDetails", e.target.value)}
                  placeholder="Provide details of student counselling and career guidance programs..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="counsellingBeneficiaries">No. of students benefitted</Label>
                <Input
                  id="counsellingBeneficiaries"
                  type="number"
                  value={formData.counsellingBeneficiaries}
                  onChange={(e) => handleInputChange("counsellingBeneficiaries", e.target.value)}
                  placeholder="Enter number of students benefitted"
                />
              </div>
            </div>

            {/* 5.8 Gender Sensitization */}
            <div>
              <Label htmlFor="genderSensitizationDetails">5.8 Details of gender sensitization programmes</Label>
              <Textarea
                id="genderSensitizationDetails"
                value={formData.genderSensitizationDetails}
                onChange={(e) => handleInputChange("genderSensitizationDetails", e.target.value)}
                placeholder="Describe gender sensitization programmes conducted..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline">Reset Form</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save & Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
