"use client"

import { useAuth } from "@/app/api/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Download, Eye, Calendar } from "lucide-react"
import { useState } from "react"

export default function FacultyReportPage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocumentType, setSelectedDocumentType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i
    return `${year}-${(year + 1).toString().slice(-2)}`
  })

  const documentTypes = [
    { value: "word", label: "Word Document (.docx)", icon: FileText },
    { value: "pdf", label: "PDF Document (.pdf)", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet (.xlsx)", icon: FileText },
  ]

  const handleGenerateReport = async () => {
    if (!selectedYear || !selectedDocumentType) {
      alert("Please select both year and document type")
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      const mockPreviewUrl = `/placeholder.svg?height=600&width=800&text=Faculty+Report+${selectedYear}+Preview`
      setPreviewUrl(mockPreviewUrl)
      setIsGenerating(false)
    }, 2000)
  }

  const handleDownloadReport = () => {
    if (!previewUrl) return

    // Simulate download
    const link = document.createElement("a")
    link.href = previewUrl
    link.download = `Faculty_Report_${selectedYear}.${selectedDocumentType === "word" ? "docx" : selectedDocumentType === "pdf" ? "pdf" : "xlsx"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Report Generator</h1>
            <p className="text-gray-600 mt-2">Generate comprehensive reports for {user?.faculty}</p>
          </div>
        </div>

        {/* Report Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Faculty Report
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
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document format" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedYear || !selectedDocumentType || isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Generate & Preview
                  </>
                )}
              </Button>

              {previewUrl && (
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Report Preview - {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center space-y-4">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Report Preview"
                    className="mx-auto border rounded shadow-lg max-w-full h-auto"
                  />
                  <div className="text-sm text-gray-600">
                    <p>Faculty Report for Academic Year {selectedYear}</p>
                    <p>Format: {documentTypes.find((t) => t.value === selectedDocumentType)?.label}</p>
                    <p>Generated on: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle>Report Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Faculty Information</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Faculty Profile and Introduction</li>
                  <li>• Department Details</li>
                  <li>• Staff Information (Teaching & Non-Teaching)</li>
                  <li>• Infrastructure Details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Academic Activities</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Events and Programs</li>
                  <li>• Student Activities and Progression</li>
                  <li>• Alumni Activities</li>
                  <li>• Collaborations and MOUs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Student Information</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Enrollment Statistics</li>
                  <li>• Placement Records</li>
                  <li>• Scholarship Details</li>
                  <li>• Support Services</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quality Assurance</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Curriculum Enrichment</li>
                  <li>• NAAC Criteria Forms</li>
                  <li>• AQAR Reports</li>
                  <li>• Quality Matrix</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { year: "2023-24", type: "PDF", date: "2024-03-15", size: "2.5 MB" },
                { year: "2022-23", type: "Word", date: "2023-03-20", size: "1.8 MB" },
                { year: "2021-22", type: "Excel", date: "2022-03-18", size: "3.2 MB" },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Faculty Report {report.year}</p>
                      <p className="text-sm text-gray-600">
                        {report.type} • {report.size} • Generated on {report.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
