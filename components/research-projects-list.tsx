"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Calendar, IndianRupee, TrendingUp, User, Building2 } from "lucide-react"

export function ResearchProjectsList() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [agencyFilter, setAgencyFilter] = useState("all")

  useEffect(() => {
    // In a real implementation, fetch projects from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setProjects([
        {
          projid: "1",
          title: "Development of Novel Nanomaterials for Sustainable Energy Applications",
          funding_agency: 3,
          funding_agency_name: "Department of Science and Technology",
          grant_sanctioned: 2500000,
          grant_received: 1800000,
          proj_nature: 2,
          proj_nature_name: "Applied Research",
          duration: 36, // months
          status: 1,
          status_name: "Ongoing",
          start_date: "2022-07-01",
          proj_level: 2,
          proj_level_name: "National",
          progress: 65,
          department: "Chemistry",
          principal_investigator: "Dr. Rajesh Kumar",
        },
        {
          projid: "2",
          title: "Machine Learning Approaches for Climate Change Prediction",
          funding_agency: 5,
          funding_agency_name: "Council of Scientific & Industrial Research",
          grant_sanctioned: 1800000,
          grant_received: 1800000,
          proj_nature: 1,
          proj_nature_name: "Basic Research",
          duration: 24, // months
          status: 2,
          status_name: "Completed",
          start_date: "2021-04-15",
          proj_level: 2,
          proj_level_name: "National",
          progress: 100,
          department: "Computer Science",
          principal_investigator: "Dr. Amit Patel",
        },
        {
          projid: "3",
          title: "Biodiversity Conservation in Western Ghats",
          funding_agency: 4,
          funding_agency_name: "University Grants Commission",
          grant_sanctioned: 1200000,
          grant_received: 800000,
          proj_nature: 3,
          proj_nature_name: "Field Study",
          duration: 18, // months
          status: 1,
          status_name: "Ongoing",
          start_date: "2023-01-10",
          proj_level: 1,
          proj_level_name: "Regional",
          progress: 40,
          department: "Environmental Science",
          principal_investigator: "Dr. Priya Sharma",
        },
        {
          projid: "4",
          title: "Advanced Materials for Aerospace Applications",
          funding_agency: 1,
          funding_agency_name: "Indian Space Research Organisation",
          grant_sanctioned: 3500000,
          grant_received: 2100000,
          proj_nature: 2,
          proj_nature_name: "Applied Research",
          duration: 48, // months
          status: 1,
          status_name: "Ongoing",
          start_date: "2022-03-15",
          proj_level: 3,
          proj_level_name: "International",
          progress: 55,
          department: "Mechanical Engineering",
          principal_investigator: "Dr. Suresh Reddy",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status.toString() === statusFilter
    const matchesLevel = levelFilter === "all" || project.proj_level.toString() === levelFilter
    const matchesAgency = agencyFilter === "all" || project.funding_agency.toString() === agencyFilter

    return matchesSearch && matchesStatus && matchesLevel && matchesAgency
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "international":
        return "bg-purple-100 text-purple-800"
      case "national":
        return "bg-blue-100 text-blue-800"
      case "regional":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="1">Ongoing</SelectItem>
                <SelectItem value="2">Completed</SelectItem>
                <SelectItem value="3">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Regional</SelectItem>
                <SelectItem value="2">National</SelectItem>
                <SelectItem value="3">International</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agencyFilter} onValueChange={setAgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Funding Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="1">ISRO</SelectItem>
                <SelectItem value="3">DST</SelectItem>
                <SelectItem value="4">UGC</SelectItem>
                <SelectItem value="5">CSIR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <Card
            key={project.projid}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Left Section - Main Info */}
                <div className="flex-1 space-y-4">
                  {/* Title and Badges */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                        onClick={() => router.push(`/research/${project.projid}`)}
                      >
                        {project.title}
                      </h3>
                      <div className="flex gap-2 ml-4">
                        <Badge className={getStatusColor(project.status_name)}>{project.status_name}</Badge>
                        <Badge className={getLevelColor(project.proj_level_name)}>{project.proj_level_name}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Principal Investigator */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Principal Investigator</p>
                        <p className="font-medium text-gray-900">{project.principal_investigator}</p>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium text-gray-900">{project.department}</p>
                      </div>
                    </div>

                    {/* Funding */}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Grant Sanctioned</p>
                        <p className="font-medium text-gray-900">{formatCurrency(project.grant_sanctioned)}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">{project.duration} months</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress and Funding Agency */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-500">Progress</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Funding Agency</p>
                      <p className="font-medium text-gray-900">{project.funding_agency_name}</p>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teacher/research/${project.projid}`)}
                    className="w-20"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teacher/research/${project.projid}/edit`)}
                    className="w-20"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search criteria or add a new project.</p>
              <Button className="mt-4" onClick={() => router.push("/research/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
