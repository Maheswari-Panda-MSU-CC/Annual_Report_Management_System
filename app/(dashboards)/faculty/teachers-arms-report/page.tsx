"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Eye, FileText } from "lucide-react"

export default function FacultyTeachersArmsReportPage() {
  const [selectedYear, setSelectedYear] = useState("")
  const [documentType, setDocumentType] = useState("")

  const handleGenerateReport = () => {
    if (!selectedYear || !documentType) {
      alert("Please select both year and document type")
      return
    }

    console.log("Generating Teachers ARMS Report:", { selectedYear, documentType })
    alert(`Generating Teachers ARMS Report for ${selectedYear} in ${documentType} format`)
  }

  const handlePreviewReport = () => {
    if (!selectedYear || !documentType) {
      alert("Please select both year and document type")
      return
    }

    console.log("Previewing Teachers ARMS Report:", { selectedYear, documentType })
    alert(`Previewing Teachers ARMS Report for ${selectedYear}`)
  }

  const reportSections = [
    "Faculty Profile and Qualifications",
    "Teaching Load and Course Distribution",
    "Research Publications and Patents",
    "Conference Presentations and Seminars",
    "Research Projects and Grants",
    "Awards and Recognition",
    "Professional Development Activities",
    "Industry Collaborations",
    "Student Guidance and Mentoring",
    "Administrative Responsibilities",
  ]

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Teachers ARMS Report</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Teachers ARMS Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="selectedYear">Select Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                    <SelectItem value="2021-22">2021-22</SelectItem>
                    <SelectItem value="2020-21">2020-21</SelectItem>
                    <SelectItem value="2019-20">2019-20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="word">Word Document</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handlePreviewReport} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Report
              </Button>
              <Button onClick={handleGenerateReport}>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Report Sections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportSections.map((section, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">About Teachers ARMS Report</h4>
              <p className="text-sm text-blue-800">
                The Teachers ARMS (Academic and Research Management System) Report provides a comprehensive overview of
                faculty academic and research activities, including publications, projects, teaching load, and
                professional development activities for the selected academic year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
