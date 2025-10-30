"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Calendar, IndianRupee, TrendingUp, User, Building2, FileText, Upload } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"

export function ResearchProjectsList() {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [agencyFilter, setAgencyFilter] = useState("all")
  

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const teacherId = 29323 // or dynamically get from session/user context if available
        const res = await fetch(`/api/teacher/research?teacherId=${user?.role_id}&type=projects`)
  
        if (!res.ok) {
          throw new Error(`Failed to fetch research projects (${res.status})`)
        }
  
        const data = await res.json()
  
        // Ensure consistency: sometimes API might return a single object instead of array
        const formattedProjects = Array.isArray(data.researchProjects)
          ? data.researchProjects
          : [data.researchProjects]
  
        // Normalize key names to match your existing structure
        const mapped = formattedProjects.map((proj: any) => ({
          projid: proj.projid,
          title: proj.title,
          funding_agency: proj.funding_agency,
          funding_agency_name: proj.FundingAgencyName || "Unknown Agency",
          grant_sanctioned: proj.grant_sanctioned,
          grant_received: proj.grant_received,
          grant_year:proj.grant_year || "N/A",
          grant_sealed:proj.grant_sealed || "N/A",
          document:proj.Pdf,
          proj_nature: proj.proj_nature,
          proj_nature_name: proj.ResearchProjectNature || "N/A",
          duration: proj.duration,
          status: proj.status,
          status_name: proj.ResearchProjectStatus || "Unknown",
          start_date: proj.start_date,
          proj_level: proj.proj_level,
          proj_level_name: proj.ResearchProjectLevel || "Unknown Level",
          department: user?.department || "N/A",
        }))
  
        setProjects(mapped)
      } catch (err) {
        console.error("Error fetching research projects:", err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchProjects()
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
      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
    >
      <CardContent className="p-6 space-y-6">
        {/* HEADER: Title + Status + Level */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3
            className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition cursor-pointer"
            onClick={() => router.push(`/teacher/research/${project.projid}`)}
          >
            {project.title || "Untitled Research Project"}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <Badge className={getStatusColor(project.status_name)}>{project.status_name}</Badge>
            <Badge className={getLevelColor(project.proj_level_name)}>{project.proj_level_name}</Badge>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
          {project.proj_nature_name && (
            <div>
              <p className="text-gray-500">Nature</p>
              <p className="font-medium">{project.proj_nature_name}</p>
            </div>
          )}

          {project.funding_agency_name && (
            <div>
              <p className="text-gray-500">Funding Agency</p>
              <p className="font-medium">{project.funding_agency_name}</p>
            </div>
          )}

          {project.department && (
            <div>
              <p className="text-gray-500">Department</p>
              <p className="font-medium">{project.department}</p>
            </div>
          )}

          {project.start_date && (
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-medium">
                {new Date(project.start_date).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}

          {project.duration && (
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">{project.duration} months</p>
            </div>
          )}

          {project.grant_sanctioned && (
            <div>
              <p className="text-gray-500">Grant Sanctioned</p>
              <p className="font-medium">{formatCurrency(project.grant_sanctioned)}</p>
            </div>
          )}

          {project.grant_received && (
            <div>
              <p className="text-gray-500">Grant Received</p>
              <p className="font-medium">{formatCurrency(project.grant_received)}</p>
            </div>
          )}

          {project.grant_year && (
            <div>
              <p className="text-gray-500">Grant Year</p>
              <p className="font-medium">{project.grant_year}</p>
            </div>
          )}

          {project.grant_sealed && (
            <div>
              <p className="text-gray-500">Grant Sealed</p>
              <p className="font-medium">{project.grant_sealed}</p>
            </div>
          )}
         
        </div>

       

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/teacher/research/${project.projid}`)}
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/teacher/research/${project.projid}/edit`)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
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
