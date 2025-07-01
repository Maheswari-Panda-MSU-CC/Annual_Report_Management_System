"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ReportGenerator() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    title: "",
    academicYear: "2023-24",
    faculty: "",
    department: "",
    reportType: "annual",
    includeResearch: true,
    includePublications: true,
    includeEvents: true,
    includeAwards: true,
    includeFaculty: true,
    includeStudents: true,
  })

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      // Mock report generation - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Report Generated Successfully",
        description: "Your annual report has been generated and is ready for download.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Annual Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                placeholder="Annual Report 2023-24"
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select
                value={reportConfig.academicYear}
                onValueChange={(value) => setReportConfig({ ...reportConfig, academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                  <SelectItem value="2021-22">2021-22</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select
                value={reportConfig.faculty}
                onValueChange={(value) => setReportConfig({ ...reportConfig, faculty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  <SelectItem value="science">Faculty of Science</SelectItem>
                  <SelectItem value="technology">Faculty of Technology and Engineering</SelectItem>
                  <SelectItem value="arts">Faculty of Arts</SelectItem>
                  <SelectItem value="commerce">Faculty of Commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={reportConfig.department}
                onValueChange={(value) => setReportConfig({ ...reportConfig, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="computer-science">Computer Science & Engineering</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Sections */}
          <div>
            <Label className="text-base font-medium">Include Sections</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeResearch"
                  checked={reportConfig.includeResearch}
                  onCheckedChange={(checked) =>
                    setReportConfig({ ...reportConfig, includeResearch: checked as boolean })
                  }
                />
                <Label htmlFor="includeResearch">Research Projects</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePublications"
                  checked={reportConfig.includePublications}
                  onCheckedChange={(checked) =>
                    setReportConfig({ ...reportConfig, includePublications: checked as boolean })
                  }
                />
                <Label htmlFor="includePublications">Publications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeEvents"
                  checked={reportConfig.includeEvents}
                  onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeEvents: checked as boolean })}
                />
                <Label htmlFor="includeEvents">Events & Activities</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAwards"
                  checked={reportConfig.includeAwards}
                  onCheckedChange={(checked) => setReportConfig({ ...reportConfig, includeAwards: checked as boolean })}
                />
                <Label htmlFor="includeAwards">Awards & Recognition</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFaculty"
                  checked={reportConfig.includeFaculty}
                  onCheckedChange={(checked) =>
                    setReportConfig({ ...reportConfig, includeFaculty: checked as boolean })
                  }
                />
                <Label htmlFor="includeFaculty">Faculty Details</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStudents"
                  checked={reportConfig.includeStudents}
                  onCheckedChange={(checked) =>
                    setReportConfig({ ...reportConfig, includeStudents: checked as boolean })
                  }
                />
                <Label htmlFor="includeStudents">Student Achievements</Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Report preview will appear here after generation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
