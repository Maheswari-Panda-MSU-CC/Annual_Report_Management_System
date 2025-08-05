"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Eye, Calendar, TrendingUp, Users, BookOpen } from "lucide-react"

const academicYears = [
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
  { value: "2021-22", label: "2021-22" },
  { value: "2020-21", label: "2020-21" },
]

const documentTypes = [
  { value: "complete", label: "Complete AQAR Report" },
  { value: "criteria-wise", label: "Criteria-wise Report" },
  { value: "executive-summary", label: "Executive Summary" },
  { value: "data-template", label: "Data Template" },
]

const mockAQARData = {
  "2023-24": {
    complete: {
      title: "Annual Quality Assurance Report (AQAR) 2023-24",
      criteria: [
        { name: "Curricular Aspects", score: 3.2, maxScore: 4.0 },
        { name: "Teaching-Learning and Evaluation", score: 3.5, maxScore: 4.0 },
        { name: "Research, Innovation and Extension", score: 3.1, maxScore: 4.0 },
        { name: "Infrastructure and Learning Resources", score: 3.4, maxScore: 4.0 },
        { name: "Student Support and Progression", score: 3.3, maxScore: 4.0 },
        { name: "Governance, Leadership and Management", score: 3.2, maxScore: 4.0 },
        { name: "Institutional Values and Best Practices", score: 3.6, maxScore: 4.0 },
      ],
      overallScore: 3.33,
      totalPages: 245,
      lastUpdated: "2024-03-20",
      submissionDate: "2024-04-15",
    },
  },
}

export default function AQARReport() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!selectedYear || !selectedDocType) return

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setIsGenerating(false)
    setShowPreview(true)
  }

  useEffect(() => {
    if (showPreview && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [showPreview])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = "#"
    link.download = `aqar-report-${selectedYear}-${selectedDocType}.pdf`
    link.click()
  }

  const reportData =
    mockAQARData[selectedYear as keyof typeof mockAQARData]?.[selectedDocType as keyof (typeof mockAQARData)["2023-24"]]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AQAR Report</h1>
          <p className="text-gray-600 mt-2">Annual Quality Assurance Report generation and management</p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generate AQAR Report
            </CardTitle>
            <CardDescription>Select academic year and document type to generate NAAC AQAR report</CardDescription>
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
                      AQAR Report Preview
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
                      <span className="flex items-center">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        Overall Score: {reportData.overallScore}/4.0
                      </span>
                    </div>
                  </div>

                  {/* NAAC Criteria Scores */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">NAAC Criteria Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportData.criteria.map((criterion, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{criterion.name}</span>
                            <Badge variant="outline">
                              {criterion.score}/{criterion.maxScore}
                            </Badge>
                          </div>
                          <Progress value={(criterion.score / criterion.maxScore) * 100} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">
                            {((criterion.score / criterion.maxScore) * 100).toFixed(1)}% Achievement
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Report Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-900 mb-1">{reportData.overallScore}</div>
                      <div className="text-sm font-medium text-blue-700">Overall CGPA</div>
                      <div className="text-xs text-blue-600 mt-1">Out of 4.0</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900 mb-1">{reportData.totalPages}</div>
                      <div className="text-sm font-medium text-green-700">Total Pages</div>
                      <div className="text-xs text-green-600 mt-1">Complete Report</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-900 mb-1">7</div>
                      <div className="text-sm font-medium text-purple-700">Criteria</div>
                      <div className="text-xs text-purple-600 mt-1">NAAC Framework</div>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Key Highlights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Academic Excellence</div>
                            <div className="text-xs text-gray-600">
                              Strong performance in teaching-learning and evaluation processes
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Student Support</div>
                            <div className="text-xs text-gray-600">
                              Comprehensive student support and progression programs
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Best Practices</div>
                            <div className="text-xs text-gray-600">
                              Outstanding institutional values and innovative practices
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Documentation</div>
                            <div className="text-xs text-gray-600">
                              Comprehensive documentation and evidence collection
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Submission Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <span className="ml-2 text-gray-600">{reportData.lastUpdated}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submission Deadline:</span>
                        <span className="ml-2 text-gray-600">{reportData.submissionDate}</span>
                      </div>
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
