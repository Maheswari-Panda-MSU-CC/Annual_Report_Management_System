"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const faculties = [
  { id: "1", name: "Faculty of Science" },
  { id: "2", name: "Faculty of Arts" },
  { id: "3", name: "Faculty of Commerce" },
  { id: "4", name: "Faculty of Engineering" },
  { id: "5", name: "Faculty of Medicine" },
]

const academicYears = [
  { id: "2023-24", year: "2023-24" },
  { id: "2022-23", year: "2022-23" },
  { id: "2021-22", year: "2021-22" },
  { id: "2020-21", year: "2020-21" },
]

const documentTypes = [
  { id: "pdf", name: "PDF Document" },
  { id: "excel", name: "Excel Spreadsheet" },
  { id: "word", name: "Word Document" },
]

export default function FacultyReports() {
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleGenerateReport = async () => {
    if (!selectedFaculty || !selectedYear || !selectedDocType) {
      toast({
        title: "Error",
        description: "Please select faculty, academic year, and document type",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      const mockReportData = {
        faculty: faculties.find((f) => f.id === selectedFaculty)?.name,
        year: selectedYear,
        docType: documentTypes.find((d) => d.id === selectedDocType)?.name,
        generatedAt: new Date().toLocaleString(),
        summary: {
          totalTeachers: 45,
          totalPublications: 128,
          totalResearchProjects: 23,
          totalAwards: 12,
        },
        details: [
          { department: "Computer Science", teachers: 12, publications: 45, projects: 8 },
          { department: "Mathematics", teachers: 15, publications: 38, projects: 6 },
          { department: "Physics", teachers: 18, publications: 45, projects: 9 },
        ],
      }

      setReportData(mockReportData)
      setShowPreview(true)
      setIsGenerating(false)

      // Auto scroll to preview
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

      toast({
        title: "Success",
        description: "Faculty report generated successfully",
      })
    }, 2000)
  }

  const handleDownload = () => {
    // Simulate download
    toast({
      title: "Download Started",
      description: "Your faculty report is being downloaded",
    })
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Reports</h1>
          <p className="text-gray-600 mt-2">Generate detailed faculty performance and activity reports</p>
        </div>

        {/* Report Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Generate Faculty Report
            </CardTitle>
            <CardDescription>
              Select faculty, academic year, and document type to generate detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="faculty">Select Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerateReport} disabled={isGenerating} className="min-w-[150px]">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        {showPreview && reportData && (
          <div ref={previewRef}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Report Preview
                    </CardTitle>
                    <CardDescription>
                      {reportData.faculty} - {reportData.year} ({reportData.docType})
                    </CardDescription>
                  </div>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold">Faculty Report - {reportData.faculty}</h2>
                  <p className="text-gray-600">Academic Year: {reportData.year}</p>
                  <p className="text-sm text-gray-500">Generated on: {reportData.generatedAt}</p>
                </div>

                {/* Summary Statistics */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalTeachers}</div>
                      <div className="text-sm text-gray-600">Total Teachers</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{reportData.summary.totalPublications}</div>
                      <div className="text-sm text-gray-600">Publications</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportData.summary.totalResearchProjects}
                      </div>
                      <div className="text-sm text-gray-600">Research Projects</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{reportData.summary.totalAwards}</div>
                      <div className="text-sm text-gray-600">Awards</div>
                    </div>
                  </div>
                </div>

                {/* Department Details */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Department-wise Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Teachers</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Publications</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Projects</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.details.map((dept: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{dept.department}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{dept.teachers}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{dept.publications}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{dept.projects}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
