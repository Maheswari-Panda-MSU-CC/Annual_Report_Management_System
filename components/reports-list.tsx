"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Search, Calendar, FileText } from "lucide-react"

const mockReports = [
  {
    id: "1",
    title: "Faculty of Science Annual Report 2023-24",
    faculty: "Faculty of Science",
    department: "All Departments",
    academicYear: "2023-24",
    generatedDate: "2024-03-15",
    generatedBy: "Dr. Science Dean",
    status: "published",
    fileSize: "2.5 MB",
    downloadCount: 45,
  },
  {
    id: "2",
    title: "Computer Science Department Report 2023-24",
    faculty: "Faculty of Technology and Engineering",
    department: "Computer Science & Engineering",
    academicYear: "2023-24",
    generatedDate: "2024-03-10",
    generatedBy: "Dr. CS Head",
    status: "draft",
    fileSize: "1.8 MB",
    downloadCount: 12,
  },
  {
    id: "3",
    title: "University Annual Report 2022-23",
    faculty: "All Faculties",
    department: "All Departments",
    academicYear: "2022-23",
    generatedDate: "2023-04-20",
    generatedBy: "University Admin",
    status: "published",
    fileSize: "5.2 MB",
    downloadCount: 156,
  },
]

export function ReportsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFaculty = facultyFilter === "all" || report.faculty.includes(facultyFilter)
    const matchesStatus = statusFilter === "all" || report.status === statusFilter

    return matchesSearch && matchesFaculty && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                <SelectItem value="Science">Faculty of Science</SelectItem>
                <SelectItem value="Technology">Faculty of Technology</SelectItem>
                <SelectItem value="Arts">Faculty of Arts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Faculty:</span> {report.faculty}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {report.department}
                    </div>
                    <div>
                      <span className="font-medium">Academic Year:</span> {report.academicYear}
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span> {report.fileSize}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Generated: {new Date(report.generatedDate).toLocaleDateString()}
                    </div>
                    <div>By: {report.generatedBy}</div>
                    <div>Downloads: {report.downloadCount}</div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reports found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
