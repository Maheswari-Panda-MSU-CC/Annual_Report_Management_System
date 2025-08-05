"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, FileText, Lightbulb, Award } from "lucide-react"

interface Criterion7Data {
  facultyName: string
  selectedYear: string
  innovations: string
  actionTakenReport: string
  bestPractice1Title: string
  bestPractice1Description: string
  bestPractice1Objectives: string
  bestPractice1Context: string
  bestPractice1Practice: string
  bestPractice1Evidence: string
  bestPractice1Problems: string
  bestPractice2Title: string
  bestPractice2Description: string
  bestPractice2Objectives: string
  bestPractice2Context: string
  bestPractice2Practice: string
  bestPractice2Evidence: string
  bestPractice2Problems: string
  environmentalContribution: string
  environmentalAudit: string
  additionalInformation: string
}

export default function FacultyCriterion7Page() {
  const [formData, setFormData] = useState<Criterion7Data>({
    facultyName: "",
    selectedYear: "",
    innovations: "",
    actionTakenReport: "",
    bestPractice1Title: "",
    bestPractice1Description: "",
    bestPractice1Objectives: "",
    bestPractice1Context: "",
    bestPractice1Practice: "",
    bestPractice1Evidence: "",
    bestPractice1Problems: "",
    bestPractice2Title: "",
    bestPractice2Description: "",
    bestPractice2Objectives: "",
    bestPractice2Context: "",
    bestPractice2Practice: "",
    bestPractice2Evidence: "",
    bestPractice2Problems: "",
    environmentalContribution: "",
    environmentalAudit: "",
    additionalInformation: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Criterion VII data saved:", formData)
      alert("Criterion VII form data saved successfully!")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Error saving data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Criterion7Data, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Criterion - VII Form</h1>
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
                <Lightbulb className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Innovations</p>
                  <p className="text-2xl font-bold text-gray-900">Impact</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best</p>
                  <p className="text-2xl font-bold text-gray-900">Practices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Criterion VII - Innovations and Best Practices</CardTitle>
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

            {/* 7.1 Innovations */}
            <div>
              <Label htmlFor="innovations">
                7.1 Innovations introduced during this academic year which have created a positive impact on the
                functioning of the institution. Give details.
              </Label>
              <Textarea
                id="innovations"
                value={formData.innovations}
                onChange={(e) => handleInputChange("innovations", e.target.value)}
                placeholder="Describe the innovations introduced and their positive impact..."
                rows={5}
              />
            </div>

            {/* 7.2 Action Taken Report */}
            <div>
              <Label htmlFor="actionTakenReport">
                7.2 Provide the Action Taken Report(ATR) based on the plan of action decided upon at the beginning of
                the year
              </Label>
              <Textarea
                id="actionTakenReport"
                value={formData.actionTakenReport}
                onChange={(e) => handleInputChange("actionTakenReport", e.target.value)}
                placeholder="Provide detailed action taken report based on the annual plan..."
                rows={5}
              />
            </div>

            {/* 7.3 Best Practices */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                7.3 Give two Best Practices of the institution (please see the format in the NAAC Self-study Manuals)
              </h3>

              {/* Best Practice 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Best Practice 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bestPractice1Title">Title of the Practice</Label>
                    <Input
                      id="bestPractice1Title"
                      value={formData.bestPractice1Title}
                      onChange={(e) => handleInputChange("bestPractice1Title", e.target.value)}
                      placeholder="Enter title of best practice 1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Description">Description</Label>
                    <Textarea
                      id="bestPractice1Description"
                      value={formData.bestPractice1Description}
                      onChange={(e) => handleInputChange("bestPractice1Description", e.target.value)}
                      placeholder="Provide a brief description of the practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Objectives">Objectives of the Practice</Label>
                    <Textarea
                      id="bestPractice1Objectives"
                      value={formData.bestPractice1Objectives}
                      onChange={(e) => handleInputChange("bestPractice1Objectives", e.target.value)}
                      placeholder="List the main objectives of this practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Context">The Context</Label>
                    <Textarea
                      id="bestPractice1Context"
                      value={formData.bestPractice1Context}
                      onChange={(e) => handleInputChange("bestPractice1Context", e.target.value)}
                      placeholder="Explain the context that required the initiation of the practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Practice">The Practice</Label>
                    <Textarea
                      id="bestPractice1Practice"
                      value={formData.bestPractice1Practice}
                      onChange={(e) => handleInputChange("bestPractice1Practice", e.target.value)}
                      placeholder="Describe the practice in detail..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Evidence">Evidence of Success</Label>
                    <Textarea
                      id="bestPractice1Evidence"
                      value={formData.bestPractice1Evidence}
                      onChange={(e) => handleInputChange("bestPractice1Evidence", e.target.value)}
                      placeholder="Provide evidence of success with data and outcomes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice1Problems">Problems Encountered and Resources Required</Label>
                    <Textarea
                      id="bestPractice1Problems"
                      value={formData.bestPractice1Problems}
                      onChange={(e) => handleInputChange("bestPractice1Problems", e.target.value)}
                      placeholder="Mention any problems encountered and resources required..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Best Practice 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Best Practice 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bestPractice2Title">Title of the Practice</Label>
                    <Input
                      id="bestPractice2Title"
                      value={formData.bestPractice2Title}
                      onChange={(e) => handleInputChange("bestPractice2Title", e.target.value)}
                      placeholder="Enter title of best practice 2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Description">Description</Label>
                    <Textarea
                      id="bestPractice2Description"
                      value={formData.bestPractice2Description}
                      onChange={(e) => handleInputChange("bestPractice2Description", e.target.value)}
                      placeholder="Provide a brief description of the practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Objectives">Objectives of the Practice</Label>
                    <Textarea
                      id="bestPractice2Objectives"
                      value={formData.bestPractice2Objectives}
                      onChange={(e) => handleInputChange("bestPractice2Objectives", e.target.value)}
                      placeholder="List the main objectives of this practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Context">The Context</Label>
                    <Textarea
                      id="bestPractice2Context"
                      value={formData.bestPractice2Context}
                      onChange={(e) => handleInputChange("bestPractice2Context", e.target.value)}
                      placeholder="Explain the context that required the initiation of the practice..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Practice">The Practice</Label>
                    <Textarea
                      id="bestPractice2Practice"
                      value={formData.bestPractice2Practice}
                      onChange={(e) => handleInputChange("bestPractice2Practice", e.target.value)}
                      placeholder="Describe the practice in detail..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Evidence">Evidence of Success</Label>
                    <Textarea
                      id="bestPractice2Evidence"
                      value={formData.bestPractice2Evidence}
                      onChange={(e) => handleInputChange("bestPractice2Evidence", e.target.value)}
                      placeholder="Provide evidence of success with data and outcomes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bestPractice2Problems">Problems Encountered and Resources Required</Label>
                    <Textarea
                      id="bestPractice2Problems"
                      value={formData.bestPractice2Problems}
                      onChange={(e) => handleInputChange("bestPractice2Problems", e.target.value)}
                      placeholder="Mention any problems encountered and resources required..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7.4 Environmental Contribution */}
            <div>
              <Label htmlFor="environmentalContribution">
                7.4 Contribution to environmental awareness / protection
              </Label>
              <Textarea
                id="environmentalContribution"
                value={formData.environmentalContribution}
                onChange={(e) => handleInputChange("environmentalContribution", e.target.value)}
                placeholder="Describe contributions to environmental awareness and protection..."
                rows={4}
              />
            </div>

            {/* 7.5 Environmental Audit */}
            <div>
              <Label>7.5 Whether environmental audit was conducted?</Label>
              <RadioGroup
                value={formData.environmentalAudit}
                onValueChange={(value) => handleInputChange("environmentalAudit", value)}
                className="mt-2"
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

            {/* 7.6 Additional Information */}
            <div>
              <Label htmlFor="additionalInformation">
                7.6 Any other relevant information wishes to add. (for example SWOT Analysis)
              </Label>
              <Textarea
                id="additionalInformation"
                value={formData.additionalInformation}
                onChange={(e) => handleInputChange("additionalInformation", e.target.value)}
                placeholder="Provide any additional relevant information, SWOT analysis, etc..."
                rows={5}
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
