"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Eye, Building } from "lucide-react"

export default function FacultyDepartmentsArmsReportPage() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [documentType, setDocumentType] = useState("")

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Biotechnology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Management Studies",
  ]

  const handleGenerateReport = () => {
    if (!selectedYear || !selectedDepartment || !documentType) {
      alert("Please select all required fields")
      return
    }

    console.log("Generating Department ARMS Report:", { selectedYear, selectedDepartment, documentType })
    alert(`Generating ${selectedDepartment} ARMS Report for ${selectedYear} in ${documentType} format`)
  }

  const handlePreviewReport = () => {
    if (!selectedYear || !selectedDepartment || !documentType) {
      alert("Please select all required fields")
      return
    }

    console.log("Previewing Department ARMS Report:", { selectedYear, selectedDepartment, documentType })
    alert(`Previewing ${selectedDepartment} ARMS Report for ${selectedYear}`)
  }

  const reportMetrics = [
    { title: "Faculty Strength", value: "45", icon: "👥" },
    { title: "Research Publications", value: "128", icon: "📚" },
    { title: "Active Projects", value: "23", icon: "🔬" },
    { title: "Student Enrollment", value: "850", icon: "🎓" },
  ]

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Department-wise ARMS Report</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Department ARMS Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="selectedDepartment">Select Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
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

            {selectedDepartment && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {selectedDepartment} - Key Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportMetrics.map((metric, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{metric.icon}</span>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                          <p className="text-sm text-gray-600">{metric.title}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Available Departments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <Building className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">{dept}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">About Department ARMS Report</h4>
              <p className="text-sm text-green-800">
                The Department-wise ARMS Report provides detailed analytics and performance metrics for individual
                departments within the faculty, including faculty profiles, research output, student performance, and
                departmental achievements for the selected academic year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
