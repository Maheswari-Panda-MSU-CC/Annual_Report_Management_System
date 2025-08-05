"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Calendar, Award, Users, BookOpen } from "lucide-react"

const academicYears = [
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
  { value: "2021-22", label: "2021-22" },
  { value: "2020-21", label: "2020-21" },
]

const documentTypes = [
  { value: "complete", label: "Complete Academic Recommendation Report" },
  { value: "faculty-wise", label: "Faculty-wise Recommendations" },
  { value: "department-wise", label: "Department-wise Recommendations" },
  { value: "summary", label: "Summary Report" },
]

const mockRecommendationData = {
  "2023-24": {
    complete: {
      title: "Academic Recommendation Report 2023-24",
      categories: [
        "Faculty Promotions",
        "Research Excellence Awards",
        "Teaching Excellence Recognition",
        "Student Mentorship Awards",
        "Innovation in Curriculum",
        "Community Service Recognition",
      ],
      totalRecommendations: 45,
      approvedRecommendations: 38,
      pendingRecommendations: 7,
      totalPages: 89,
      lastUpdated: "2024-03-18",
    },
    "faculty-wise": {
      title: "Faculty-wise Academic Recommendations 2023-24",
      faculties: ["Science", "Arts", "Commerce", "Engineering"],
      totalPages: 56,
      lastUpdated: "2024-03-15",
    },
  },
}

export default function AcademicRecommendationReport() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!selectedYear || !selectedDocType) return

    setIsGenerating(true)
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
    const link = document.createElement("a")
    link.href = "#"
    link.download = `academic-recommendation-report-${selectedYear}-${selectedDocType}.pdf`
    link.click()
  }

  const reportData =
    mockRecommendationData[selectedYear as keyof typeof mockRecommendationData]?.[
      selectedDocType as keyof (typeof mockRecommendationData)["2023-24"]
    ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Recommendation Report</h1>
          <p className="text-gray-600 mt-2">Generate and download academic recommendation reports</p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Generate Academic Recommendation Report
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

                  {/* Report Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-900 mb-1">
                        {reportData.totalRecommendations || reportData.totalPages}
                      </div>
                      <div className="text-sm font-medium text-blue-700">
                        {reportData.totalRecommendations ? "Total Recommendations" : "Total Pages"}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900 mb-1">
                        {reportData.approvedRecommendations || reportData.faculties?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-green-700">
                        {reportData.approvedRecommendations ? "Approved" : "Faculties"}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-900 mb-1">
                        {reportData.pendingRecommendations || reportData.categories?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-orange-700">
                        {reportData.pendingRecommendations ? "Pending" : "Categories"}
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Recommendation Categories</h4>
                      <div className="space-y-2">
                        {reportData.categories?.map((category, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <Badge variant="outline" className="mr-2">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{category}</span>
                          </div>
                        ))}
                        {reportData.faculties?.map((faculty, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <Award className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-sm">Faculty of {faculty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-3">Key Highlights</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Excellence Recognition</div>
                            <div className="text-xs text-gray-600">
                              Outstanding faculty achievements and contributions
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Faculty Development</div>
                            <div className="text-xs text-gray-600">
                              Professional growth and career advancement recommendations
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <BookOpen className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Academic Innovation</div>
                            <div className="text-xs text-gray-600">Innovative teaching and research methodologies</div>
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
                        This academic recommendation report provides comprehensive documentation of faculty
                        achievements, research contributions, and teaching excellence during the academic year{" "}
                        {selectedYear}. The report includes detailed recommendations for promotions, awards, and
                        recognition based on performance evaluations, peer reviews, and academic contributions across
                        all departments and faculties of the university.
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
