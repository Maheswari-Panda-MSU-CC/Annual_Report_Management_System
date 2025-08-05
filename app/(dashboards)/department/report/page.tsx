"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Eye } from "lucide-react"

export default function DepartmentReport() {
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedFormat, setSelectedFormat] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const handlePreview = () => {
    if (!selectedYear || !selectedFormat) {
      alert("Please select both year and document format")
      return
    }
    setIsPreviewOpen(true)
  }

  const handleDownload = async () => {
    if (!selectedYear || !selectedFormat) {
      alert("Please select both year and document format")
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create a sample report content
    const reportContent = generateReportContent()

    // Create and download the file
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `department_report_${selectedYear}.${selectedFormat === "doc" ? "txt" : selectedFormat === "excel" ? "csv" : "txt"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setIsGenerating(false)
  }

  const generateReportContent = () => {
    return `
DEPARTMENT ANNUAL REPORT - ${selectedYear}
==========================================

1. EXTENSION ACTIVITIES
   - Total Activities: 15
   - Total Participants: 500
   - Major Activities: Community Health Awareness, Environmental Conservation

2. CONSULTANCY DETAILS
   - Total Consultancies: 8
   - Total Revenue: ₹2,50,000
   - Major Clients: Tech Solutions Ltd, Innovation Corp

3. INDUSTRY LINKAGES
   - Total Linkages: 12
   - Industry Visits: 6
   - Collaboration Projects: 4

4. AWARDS & ACHIEVEMENTS
   - Faculty Awards: 5
   - Student Awards: 12
   - Department Recognition: 2

5. STUDENT PROGRESSION
   - NET Qualified: 15
   - GATE Qualified: 25
   - Placement Rate: 85%

6. STUDENT SUPPORT
   - Career Sessions: 10
   - Placements: 120
   - Scholarships Awarded: 25

7. ALUMNI ACTIVITIES
   - Alumni Meet: 2
   - Guest Lectures: 8
   - Mentorship Programs: 5

8. COLLABORATIONS
   - National Collaborations: 6
   - International Collaborations: 3
   - MOUs Signed: 9

9. CURRICULUM ENRICHMENT
   - Feedback Sessions: 4
   - Curriculum Updates: 3
   - New Courses Introduced: 2

10. PhD DETAILS
    - PhD Awarded: 8
    - Ongoing PhD: 15
    - Research Publications: 45

Generated on: ${new Date().toLocaleDateString()}
    `
  }

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Department Reports</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Department Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="year">Select Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}-{year + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Document Format</Label>
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
            </div>

            <div className="flex gap-4">
              <Button onClick={handlePreview} variant="outline" disabled={!selectedYear || !selectedFormat}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Report
              </Button>

              <Button onClick={handleDownload} disabled={!selectedYear || !selectedFormat || isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Download Report"}
              </Button>
            </div>

            {selectedYear && selectedFormat && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Report Summary</h3>
                <p className="text-blue-800">
                  <strong>Academic Year:</strong> {selectedYear}-{Number.parseInt(selectedYear) + 1}
                </p>
                <p className="text-blue-800">
                  <strong>Format:</strong> {selectedFormat.toUpperCase()}
                </p>
                <p className="text-blue-800 text-sm mt-2">
                  This report will include all department activities, achievements, student progression, collaborations,
                  and other relevant data for the selected academic year.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Report Preview - {selectedYear}-{Number.parseInt(selectedYear) + 1}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{generateReportContent()}</pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
