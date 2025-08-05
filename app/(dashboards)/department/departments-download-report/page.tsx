"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Download, FileSpreadsheet, Eye } from "lucide-react"

const reportOptions = [
  "Events",
  "Students Academic Activities",
  "Seminars/Conferences/Workshops organized by the Students' Associations/Bodies",
  "Awards/Fellowship/Recognition",
  "Distinguished Visitors at Department",
  "Visiting Faculty (Other than MSU Faculty members)",
  "Development Programs Organized",
  "Extension Activities",
  "Consultancy Undertaken (Teacher-wise)",
  "Achievements/Honours/Awards (Faculty Wise)",
  "Achievements/Honours/Awards (Department Wise)",
  "Paper Presented",
  "Student Progression",
  "Activities Organized outside MSU",
  "Other Activities Organised",
  "Industry Linkages / Collaborations",
  "ICT Detail",
  "Career and Counselling Sessions",
  "Placements",
  "Scholarships/Freeship Awarded (Facultywise/Departmentwise)",
  "Alumni Activities(Facultywise/Departmentwise)",
  "Feedback taken during the year",
  "PhD Awarded",
  "Research Projects",
  "Patents",
  "E-Content",
  "Academic/Research Visit",
  "Financial Support/Aid Received For Academic/Research Activities",
  "Details Of JRF/SRF",
  "PhD Guidance Details",
  "Books Published",
  "Reviews",
  "Monographs",
  "E-Resources Developed",
  "Published Articles/Papers in Journals/Edited Volumes",
  "Refresher/Orientantion Course",
  "Contribution in Organising Academic Programs",
  "Participation in Academic Bodies of other Universities",
  "Participation in Committees of University",
  "Performance by Individual/Group",
  "Talks of Academic nature at Academic Institutions (Other than MSU)",
  "Departments receiving funds from UGC-SAP/ CAS/ DST-FIST/ DPE/ DBT Scheme/ any other funding agency",
]

export default function DepartmentDownloadReport() {
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedYear) {
      alert("Please select both report type and year")
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      // Create a sample Excel file download
      const link = document.createElement("a")
      link.href = "#"
      link.download = `${selectedReport.replace(/[^a-zA-Z0-9]/g, "_")}_${selectedYear}.xlsx`
      link.click()
      alert(`${selectedReport} report for ${selectedYear} exported to Excel successfully!`)
    }, 2000)
  }

  const handlePreview = () => {
    if (!selectedReport || !selectedYear) {
      alert("Please select both report type and year")
      return
    }
    alert(`Preview for ${selectedReport} - ${selectedYear}`)
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department's Download Report</h1>

        <Card>
          <CardHeader>
            <CardTitle>Generate Department Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="reportType">Select Report Type</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {reportOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Select Year</Label>
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

              <div className="flex space-x-4">
                <Button onClick={handlePreview} variant="outline" disabled={!selectedReport || !selectedYear}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleGenerateReport} disabled={!selectedReport || !selectedYear || isGenerating}>
                  {isGenerating ? (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel
                    </>
                  )}
                </Button>
              </div>

              {selectedReport && selectedYear && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Report Details</h3>
                  <p className="text-green-800">
                    <strong>Report Type:</strong> {selectedReport}
                    <br />
                    <strong>Academic Year:</strong> {selectedYear}
                    <br />
                    <strong>Department:</strong> Computer Science
                    <br />
                    <strong>Export Format:</strong> Excel (.xlsx)
                    <br />
                    <strong>Generated Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
