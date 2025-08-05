"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Calendar, Building } from "lucide-react"

const academicYears = [
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
  { value: "2021-22", label: "2021-22" },
  { value: "2020-21", label: "2020-21" },
]

const documentTypes = [
  { value: "complete", label: "Complete Appendices Report" },
  { value: "faculty-wise", label: "Faculty-wise Appendices" },
  { value: "department-wise", label: "Department-wise Appendices" },
  { value: "summary", label: "Summary Report" },
]

const mockAppendicesData = {
  "2023-24": {
    complete: {
      title: "Complete Appendices Report 2023-24",
      sections: [
        "Faculty Publications",
        "Research Projects",
        "Awards and Recognition",
        "Student Achievements",
        "Infrastructure Development",
        "Financial Summary",
      ],
      totalPages: 156,
      lastUpdated: "2024-03-15",
    },
    "faculty-wise": {
      title: "Faculty-wise Appendices 2023-24",
      faculties: ["Science", "Arts", "Commerce", "Engineering"],
      totalPages: 89,
      lastUpdated: "2024-03-12",
    },
  },
}

export default function AppendicesReport() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!selectedYear || !selectedDocType) return

    setIsGenerating(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setShowPreview(true)
  }

  useEffect(() => {
    if (showPreview && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [showPreview])

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement("a")
    link.href = "#"
    link.download = `appendices-report-${selectedYear}-${selectedDocType}.pdf`
    link.click()
  }

  const reportData =
    mockAppendicesData[selectedYear as keyof typeof mockAppendicesData]?.[
      selectedDocType as keyof (typeof mockAppendicesData)["2023-24"]
    ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appendices Report</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive appendices reports</p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generate Appendices Report
            </CardTitle>
            <CardDescription>Select academic year and document type to generate report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedYear || !selectedDocType || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Generate Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {showPreview && reportData && (
          <div ref={previewRef}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Report Preview
                    </CardTitle>
                    <CardDescription>Preview of {reportData.title}</CardDescription>
                  </div>
                  <Button onClick={handleDownload} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Maharaja Sayajirao University of Baroda</h2>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{reportData.title}</h3>
                    <div className="flex justify-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Academic Year: {selectedYear}
                      </span>
                      <span className="flex items-center">
                        <FileText className="mr-1 h-4 w-4" />
                        Pages: {reportData.totalPages}
                      </span>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Report Sections</h4>
                      <div className="space-y-2">
                        {reportData.sections?.map((section, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <Badge variant="outline" className="mr-2">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{section}</span>
                          </div>
                        ))}
                        {reportData.faculties?.map((faculty, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-sm">Faculty of {faculty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-3">Report Statistics</h4>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-700">Total Pages</span>
                            <span className="text-2xl font-bold text-blue-900">{reportData.totalPages}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700">Last Updated</span>
                            <span className="text-sm font-semibold text-green-900">{reportData.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-700">Document Type</span>
                            <span className="text-sm font-semibold text-purple-900">
                              {documentTypes.find((t) => t.value === selectedDocType)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sample Content */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Sample Content Preview</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Executive Summary:</strong>
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        This appendices report provides comprehensive documentation of all academic and administrative
                        activities undertaken during the academic year {selectedYear}. The report includes detailed
                        information about faculty achievements, research publications, student progression,
                        infrastructure development, and financial allocations across all departments and faculties of
                        the university.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
