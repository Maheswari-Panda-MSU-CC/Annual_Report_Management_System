"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, FileText, Eye } from "lucide-react"

export default function FacultyAQARReportPage() {
  const [selectedYear, setSelectedYear] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [selectedCriteria, setSelectedCriteria] = useState("")

  const handleGenerateReport = () => {
    if (!selectedYear || !documentType || !selectedCriteria) {
      alert("Please select all required fields")
      return
    }

    console.log("Generating AQAR Report:", { selectedYear, documentType, selectedCriteria })
    alert(`Generating ${selectedCriteria} report for ${selectedYear} in ${documentType} format`)
  }

  const handlePreviewReport = () => {
    if (!selectedYear || !documentType || !selectedCriteria) {
      alert("Please select all required fields")
      return
    }

    console.log("Previewing AQAR Report:", { selectedYear, documentType, selectedCriteria })
    alert(`Previewing ${selectedCriteria} report for ${selectedYear}`)
  }

  const criteriaOptions = [
    { value: "all", label: "All Criteria (I-VII)" },
    { value: "criterion-1", label: "Criterion I" },
    { value: "criterion-2", label: "Criterion II" },
    { value: "criterion-3", label: "Criterion III" },
    { value: "criterion-4", label: "Criterion IV" },
    { value: "criterion-5", label: "Criterion V" },
    { value: "criterion-6", label: "Criterion VI" },
    { value: "criterion-7", label: "Criterion VII" },
  ]

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AQAR Report Generation</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate AQAR Report - Criteria I to VII</CardTitle>
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

              <div>
                <Label htmlFor="selectedCriteria">Select Criteria</Label>
                <Select value={selectedCriteria} onValueChange={setSelectedCriteria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select criteria" />
                  </SelectTrigger>
                  <SelectContent>
                    {criteriaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
              <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criteriaOptions.slice(1).map((criteria) => (
                  <Card key={criteria.value} className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{criteria.label}</h4>
                        <p className="text-sm text-gray-600">AQAR Report</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
