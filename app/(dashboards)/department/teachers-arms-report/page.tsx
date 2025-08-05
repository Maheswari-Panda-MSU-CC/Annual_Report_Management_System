"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Download, FileText, Eye } from "lucide-react"

export default function DepartmentTeachersArmsReport() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedYear || !selectedFormat) {
      alert("Please select both year and document type")
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      alert(
        `Teachers ARMS Report for ${selectedYear} generated successfully in ${selectedFormat.toUpperCase()} format!`,
      )
    }, 2000)
  }

  const handlePreview = () => {
    if (!selectedYear || !selectedFormat) {
      alert("Please select both year and document type")
      return
    }
    alert(`Preview for Teachers ARMS Report ${selectedYear} (${selectedFormat.toUpperCase()})`)
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Teacher's ARMS Report</h1>

        <Card>
          <CardHeader>
            <CardTitle>Generate Teacher's ARMS Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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

              <div>
                <Label htmlFor="format">Document Type</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handlePreview} variant="outline" disabled={!selectedYear || !selectedFormat}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleGenerateReport} disabled={!selectedYear || !selectedFormat || isGenerating}>
                  {isGenerating ? (
                    <>
                      <FileText className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>

              {selectedYear && selectedFormat && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Report Preview</h3>
                  <p className="text-blue-800">
                    <strong>Academic Year:</strong> {selectedYear}
                    <br />
                    <strong>Format:</strong> {selectedFormat.toUpperCase()}
                    <br />
                    <strong>Report Type:</strong> Teacher's Annual Report Management System (ARMS)
                    <br />
                    <strong>Department:</strong> Computer Science
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
