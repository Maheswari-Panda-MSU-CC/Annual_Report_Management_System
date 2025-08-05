"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Eye, Calendar, Users, BookOpen, Award, TrendingUp } from "lucide-react"

const academicYears = [
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
  { value: "2021-22", label: "2021-22" },
  { value: "2020-21", label: "2020-21" },
]

const documentTypes = [
  { value: "complete", label: "Complete Teachers Consolidated Report" },
  { value: "performance", label: "Performance Analysis Report" },
  { value: "faculty-wise", label: "Faculty-wise Teacher Report" },
  { value: "department-wise", label: "Department-wise Teacher Report" },
]

const mockTeachersData = {
  "2023-24": {
    complete: {
      title: "Teachers Consolidated Report 2023-24",
      metrics: [
        { name: "Teaching Performance", score: 85, maxScore: 100 },
        { name: "Research Output", score: 78, maxScore: 100 },
        { name: "Student Feedback", score: 92, maxScore: 100 },
        { name: "Professional Development", score: 88, maxScore: 100 },
        { name: "Administrative Contribution", score: 75, maxScore: 100 },
        { name: "Community Engagement", score: 82, maxScore: 100 },
      ],
      totalTeachers: 245,
      activeTeachers: 238,
      newRecruitments: 12,
      totalPages: 156,
      lastUpdated: "2024-03-22",
    },
    performance: {
      title: "Teachers Performance Analysis 2023-24",
      totalPages: 89,
      lastUpdated: "2024-03-20",
    },
  },
}

export default function TeachersConsolidatedReport() {
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
    link.download = `teachers-consolidated-report-${selectedYear}-${selectedDocType}.pdf`
    link.click()
  }

  const reportData =
    mockTeachersData[selectedYear as keyof typeof mockTeachersData]?.[
      selectedDocType as keyof (typeof mockTeachersData)["2023-24"]
    ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Consolidated Report</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive teachers performance and activity reports</p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generate Teachers Consolidated Report
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
                      <span className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        Teachers: {reportData.totalTeachers || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Teacher Statistics */}
                  {reportData.totalTeachers && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-900 mb-1">{reportData.totalTeachers}</div>
                        <div className="text-sm font-medium text-blue-700">Total Teachers</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-900 mb-1">{reportData.activeTeachers}</div>
                        <div className="text-sm font-medium text-green-700">Active Teachers</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-900 mb-1">{reportData.newRecruitments}</div>
                        <div className="text-sm font-medium text-purple-700">New Recruitments</div>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {reportData.metrics && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.metrics.map((metric, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                              <Badge variant="outline">
                                {metric.score}/{metric.maxScore}
                              </Badge>
                            </div>
                            <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {((metric.score / metric.maxScore) * 100).toFixed(1)}% Achievement
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Key Highlights */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Key Highlights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Teaching Excellence</div>
                            <div className="text-xs text-gray-600">
                              Outstanding performance in curriculum delivery and student engagement
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Research Contributions</div>
                            <div className="text-xs text-gray-600">
                              Significant research output and scholarly publications
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Professional Growth</div>
                            <div className="text-xs text-gray-600">
                              Continuous professional development and skill enhancement
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Student Mentorship</div>
                            <div className="text-xs text-gray-600">
                              Effective student guidance and mentorship programs
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Content */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This consolidated report provides a comprehensive overview of teacher performance, activities, and
                      contributions during the academic year {selectedYear}. The report encompasses teaching
                      effectiveness, research output, professional development activities, and administrative
                      contributions across all faculties and departments. Key performance indicators demonstrate the
                      university's commitment to academic excellence and continuous improvement in educational delivery.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
