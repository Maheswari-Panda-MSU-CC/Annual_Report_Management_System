"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Calendar, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function TeachersARMSStatus() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleGenerateReport = async () => {
    if (!selectedYear || !selectedDocType) {
      toast({
        title: "Error",
        description: "Please select academic year and document type",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      const mockReportData = {
        year: selectedYear,
        docType: documentTypes.find((d) => d.id === selectedDocType)?.name,
        generatedAt: new Date().toLocaleString(),
        summary: {
          totalTeachers: 156,
          reportsSubmitted: 142,
          pendingReports: 14,
          completionRate: 91.0,
        },
        facultyWise: [
          {
            faculty: "Faculty of Science",
            total: 45,
            submitted: 42,
            pending: 3,
            rate: 93.3,
          },
          {
            faculty: "Faculty of Arts",
            total: 38,
            submitted: 35,
            pending: 3,
            rate: 92.1,
          },
          {
            faculty: "Faculty of Commerce",
            total: 32,
            submitted: 28,
            pending: 4,
            rate: 87.5,
          },
          {
            faculty: "Faculty of Engineering",
            total: 41,
            submitted: 37,
            pending: 4,
            rate: 90.2,
          },
        ],
        recentSubmissions: [
          {
            teacher: "Dr. Rajesh Kumar",
            faculty: "Science",
            department: "Computer Science",
            submittedOn: "2024-03-15",
          },
          { teacher: "Prof. Anita Sharma", faculty: "Science", department: "Physics", submittedOn: "2024-03-14" },
          { teacher: "Dr. Priya Patel", faculty: "Commerce", department: "Accounting", submittedOn: "2024-03-13" },
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
        description: "Teacher's ARMS status report generated successfully",
      })
    }, 2000)
  }

  const handleDownload = () => {
    // Simulate download
    toast({
      title: "Download Started",
      description: "Your Teacher's ARMS status report is being downloaded",
    })
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher's ARMS Status</h1>
          <p className="text-gray-600 mt-2">Generate and view Teacher's Annual Report Management System status</p>
        </div>

        {/* Report Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Generate ARMS Status Report
            </CardTitle>
            <CardDescription>
              Select academic year and document type to generate Teacher's ARMS status report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      ARMS Status Report Preview
                    </CardTitle>
                    <CardDescription>
                      Academic Year: {reportData.year} ({reportData.docType})
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
                  <h2 className="text-xl font-semibold">Teacher's ARMS Status Report</h2>
                  <p className="text-gray-600">Academic Year: {reportData.year}</p>
                  <p className="text-sm text-gray-500">Generated on: {reportData.generatedAt}</p>
                </div>

                {/* Summary Statistics */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Overall Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalTeachers}</div>
                      <div className="text-sm text-gray-600">Total Teachers</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{reportData.summary.reportsSubmitted}</div>
                      <div className="text-sm text-gray-600">Reports Submitted</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{reportData.summary.pendingReports}</div>
                      <div className="text-sm text-gray-600">Pending Reports</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{reportData.summary.completionRate}%</div>
                      <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                  </div>
                </div>

                {/* Faculty-wise Status */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Faculty-wise Status</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Faculty</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Total Teachers</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Submitted</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Pending</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.facultyWise.map((faculty: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{faculty.faculty}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{faculty.total}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">
                              {faculty.submitted}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-orange-600 font-semibold">
                              {faculty.pending}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span
                                className={`font-semibold ${faculty.rate >= 90 ? "text-green-600" : faculty.rate >= 80 ? "text-yellow-600" : "text-red-600"}`}
                              >
                                {faculty.rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Submissions */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Submissions</h3>
                  <div className="space-y-3">
                    {reportData.recentSubmissions.map((submission: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">{submission.teacher}</p>
                            <p className="text-sm text-gray-600">
                              {submission.faculty} - {submission.department}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          {new Date(submission.submittedOn).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
