"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Eye, Save, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useForm, Controller } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentViewer } from "@/components/document-viewer"
import { ResearchProject, ResearchProjectFormData } from "@/types/interfaces"

export function ResearchProjectsList({ refreshKey }: { refreshKey?: number }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ResearchProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | "all">("all")
  const [levelFilter, setLevelFilter] = useState<number | "all">("all")
  const [agencyFilter, setAgencyFilter] = useState<number | "all">("all")
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string; type: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDeleteConfirm, setProjectToDeleteConfirm] = useState<ResearchProject | null>(null)

  // Dropdowns
  const {
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    fetchProjectStatuses,
    fetchProjectLevels,
    fetchFundingAgencies,
  } = useDropDowns()

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResearchProjectFormData>({
    defaultValues: {
      title: "",
      funding_agency: null,
      grant_sanctioned: "",
      grant_received: "",
      proj_nature: null,
      duration: 0,
      status: null,
      start_date: "",
      proj_level: null,
      grant_year: "",
      grant_sealed: false,
      Pdf: "",
    },
  })

  // Fetch dropdown data
  useEffect(() => {
    fetchProjectStatuses()
    fetchProjectLevels()
    fetchFundingAgencies()
  }, [])

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // Add cache-busting parameter to ensure fresh data
        const res = await fetch(`/api/teacher/research?teacherId=${user?.role_id}&type=projects&_t=${Date.now()}`)

        if (!res.ok) {
          throw new Error(`Failed to fetch research projects (${res.status})`)
        }

        const data = await res.json()
        const formattedProjects = Array.isArray(data.researchProjects)
          ? data.researchProjects
          : [data.researchProjects]

        const mapped = formattedProjects.map((proj: any) => ({
          projid: proj.projid,
          title: proj.title,
          funding_agency: proj.funding_agency,
          funding_agency_name: proj.FundingAgencyName || "Unknown Agency",
          grant_sanctioned: proj.grant_sanctioned,
          grant_received: proj.grant_received,
          grant_year: proj.grant_year || null,
          grant_sealed: proj.grant_sealed || false,
          document: proj.Pdf,
          proj_nature: proj.proj_nature,
          proj_nature_name: proj.ResearchProjectNature || "N/A",
          duration: proj.duration,
          status: proj.status,
          status_name: proj.ResearchProjectStatus || "Unknown",
          start_date: proj.start_date,
          proj_level: proj.proj_level,
          proj_level_name: proj.ResearchProjectLevel || "Unknown Level",
        }))

        setProjects(mapped)
      } catch (err) {
        console.error("Error fetching research projects:", err)
        toast({
          title: "Error",
          description: "Failed to fetch research projects",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.role_id) {
      fetchProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role_id, refreshKey]) // Add refreshKey to dependencies to trigger refetch

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false

    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesLevel = levelFilter === "all" || project.proj_level === levelFilter
    const matchesAgency = agencyFilter === "all" || project.funding_agency === agencyFilter

    return matchesSearch && matchesStatus && matchesLevel && matchesAgency
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date for input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split("T")[0]
    } catch (error) {
      return ""
    }
  }

  // Navigate to edit page
  const handleEditClick = (project: ResearchProject) => {
    router.push(`/teacher/research/${project.projid}/edit`)
  }

  // Open document viewer
  const handleViewDocument = (project: ResearchProject) => {
    const docUrl = project.document || "/assets/demo_document.pdf"
    
    // Extract file extension from URL (handle S3 paths, local paths, and URLs with query params)
    const getFileExtension = (url: string): string => {
      if (!url) return "pdf" // default
      
      // Remove query parameters and hash
      const urlWithoutParams = url.split('?')[0].split('#')[0]
      
      // Extract extension from the last part of the path
      const parts = urlWithoutParams.split('/')
      const fileName = parts[parts.length - 1]
      
      // Extract extension (handle cases like "file.pdf", "1_12345.pdf", "file.jpg", etc.)
      const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/)
      if (extensionMatch) {
        const ext = extensionMatch[1].toLowerCase()
        // Map common extensions
        if (['pdf'].includes(ext)) return 'pdf'
        if (['jpg', 'jpeg'].includes(ext)) return 'jpg'
        if (['png'].includes(ext)) return 'png'
        // Return the extension as-is for other types
        return ext
      }
      
      // Default to pdf if no extension found
      return "pdf"
    }
    
    // Use project title as the document name (more user-friendly than S3 filename)
    const docName = project.title || "Research Project Document"
    const docType = getFileExtension(docUrl)
    
    setSelectedDocument({ url: docUrl, name: docName, type: docType })
    setIsDocViewerOpen(true)
  }

  // Handle delete project - open confirmation dialog
  const handleDeleteClick = (project: ResearchProject) => {
    setProjectToDeleteConfirm(project)
    setDeleteDialogOpen(true)
  }

  // Confirm delete action
  const confirmDelete = () => {
    if (projectToDeleteConfirm) {
      setProjectToDelete(projectToDeleteConfirm.projid)
      deleteProject(projectToDeleteConfirm.projid)
      setDeleteDialogOpen(false)
    }
  }

  const deleteProject = async (projectId: number) => {
    setIsDeleting(true)
    try {
      // Get the document path from the project to delete
      const pdfPath = projectToDeleteConfirm?.document || null
      
      // Send DELETE request with body containing projectId and pdf
      const res = await fetch(`/api/teacher/research?projectId=${projectId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          pdf: pdfPath,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete research project")
      }

      // Show success message - handle different scenarios
      if (result.warning) {
        // Database deleted but S3 deletion had issues
        toast({
          title: "Success",
          description: result.message || "Research project deleted successfully",
          duration: 5000,
        })
        // Also show warning toast
        toast({
          title: "Warning",
          description: result.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        // Complete success - both database and S3 deleted
        toast({
          title: "Success",
          description: result.message || "Research project and document deleted successfully",
          duration: 3000,
        })
      }

      // Reload projects
      const refreshRes = await fetch(`/api/teacher/research?teacherId=${user?.role_id}&type=projects`)
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const formattedProjects = Array.isArray(refreshData.researchProjects)
          ? refreshData.researchProjects
          : [refreshData.researchProjects]
        const mapped = formattedProjects.map((proj: any) => ({
          projid: proj.projid,
          title: proj.title,
          funding_agency: proj.funding_agency,
          funding_agency_name: proj.FundingAgencyName || "Unknown Agency",
          grant_sanctioned: proj.grant_sanctioned,
          grant_received: proj.grant_received,
          grant_year: proj.grant_year || null,
          grant_sealed: proj.grant_sealed || false,
          document: proj.Pdf,
          proj_nature: proj.proj_nature,
          proj_nature_name: proj.ResearchProjectNature || "N/A",
          duration: proj.duration,
          status: proj.status,
          status_name: proj.ResearchProjectStatus || "Unknown",
          start_date: proj.start_date,
          proj_level: proj.proj_level,
          proj_level_name: proj.ResearchProjectLevel || "Unknown Level",
        }))
        setProjects(mapped)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete research project",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProjectToDelete(null)
      setProjectToDeleteConfirm(null)
    }
  }

  // Submit form (add or edit)
  const onSubmit = async (data: ResearchProjectFormData) => {
    setIsSubmitting(true)
    try {
      const teacherId = user?.role_id
      if (!teacherId) {
        toast({
          title: "Error",
          description: "User ID not found",
          variant: "destructive",
        })
        return
      }

      const payload = {
        teacherId,
        projectId: selectedProject?.projid,
        project: {
          title: data.title,
          funding_agency: data.funding_agency,
          grant_sanctioned: data.grant_sanctioned ? parseFloat(data.grant_sanctioned) : null,
          grant_received: data.grant_received ? parseFloat(data.grant_received) : null,
          proj_nature: data.proj_nature,
          duration: data.duration,
          status: data.status,
          start_date: data.start_date,
          proj_level: data.proj_level,
          grant_year: data.grant_year ? parseInt(data.grant_year) : null,
          grant_sealed: data.grant_sealed,
          Pdf: data.Pdf || null,
        },
      }

      const url = "/api/teacher/research"
      const method = selectedProject ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save research project")
      }

      toast({
        title: "Success",
        description: "Research project updated successfully",
      })

      // Close modal and refresh
      setIsEditModalOpen(false)
      setSelectedProject(null)
      
      // Reload projects by refetching
      const refreshRes = await fetch(`/api/teacher/research?teacherId=${user?.role_id}&type=projects`)
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const formattedProjects = Array.isArray(refreshData.researchProjects)
          ? refreshData.researchProjects
          : [refreshData.researchProjects]
        const mapped = formattedProjects.map((proj: any) => ({
          projid: proj.projid,
          title: proj.title,
          funding_agency: proj.funding_agency,
          funding_agency_name: proj.FundingAgencyName || "Unknown Agency",
          grant_sanctioned: proj.grant_sanctioned,
          grant_received: proj.grant_received,
          grant_year: proj.grant_year || null,
          grant_sealed: proj.grant_sealed || false,
          document: proj.Pdf,
          proj_nature: proj.proj_nature,
          proj_nature_name: proj.ResearchProjectNature || "N/A",
          duration: proj.duration,
          status: proj.status,
          status_name: proj.ResearchProjectStatus || "Unknown",
          start_date: proj.start_date,
          proj_level: proj.proj_level,
          proj_level_name: proj.ResearchProjectLevel || "Unknown Level",
        }))
        setProjects(mapped)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save research project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
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
            <SearchableSelect
              options={[
                { value: "all", label: "All Status" },
                ...projectStatusOptions.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={statusFilter === "all" ? "all" : statusFilter}
              onValueChange={(val) => setStatusFilter(val === "all" ? "all" : Number(val))}
              placeholder="Filter by Status"
            />
            <SearchableSelect
              options={[
                { value: "all", label: "All Levels" },
                ...projectLevelOptions.map((l) => ({ value: l.id, label: l.name })),
              ]}
              value={levelFilter === "all" ? "all" : levelFilter}
              onValueChange={(val) => setLevelFilter(val === "all" ? "all" : Number(val))}
              placeholder="Filter by Level"
            />
            <SearchableSelect
              options={[
                { value: "all", label: "All Agencies" },
                ...fundingAgencyOptions.map((a) => ({ value: a.id, label: a.name })),
              ]}
              value={agencyFilter === "all" ? "all" : agencyFilter}
              onValueChange={(val) => setAgencyFilter(val === "all" ? "all" : Number(val))}
              placeholder="Filter by Agency"
            />
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
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {project.title || "Untitled Research Project"}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {project.status_name && (
                    <Badge className={getStatusColor(project.status_name)}>
                      {project.status_name}
                    </Badge>
                  )}
                  {project.proj_level_name && (
                    <Badge className={getLevelColor(project.proj_level_name)}>
                      {project.proj_level_name}
                    </Badge>
                  )}
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

                {project.grant_sealed !== undefined && (
                  <div>
                    <p className="text-gray-500">Grant Sealed</p>
                    <p className="font-medium">{project.grant_sealed ? "Yes" : "No"}</p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(project)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>

                {project.document && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(project)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Document
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(project)}
                  disabled={isDeleting && projectToDelete === project.projid}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting && projectToDelete === project.projid ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  Delete
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
              <p className="text-muted-foreground mt-2">
                Try adjusting your search criteria or add a new project.
              </p>
              <Button className="mt-4" onClick={() => router.push("/teacher/research/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditModalOpen(false)
          setSelectedProject(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Research Project</DialogTitle>
            <DialogDescription>
              Update the research project details below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <Label htmlFor="title">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="title"
                  rules={{ required: "Project title is required" }}
                  render={({ field }) => (
                    <Input {...field} id="title" placeholder="Enter project title" />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Funding Agency */}
              <div>
                <Label htmlFor="funding_agency">
                  Funding Agency <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="funding_agency"
                  rules={{ required: "Funding agency is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={fundingAgencyOptions.map((a) => ({
                        value: a.id,
                        label: a.name,
                      }))}
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                      placeholder="Select funding agency"
                      emptyMessage="No funding agency found"
                    />
                  )}
                />
                {errors.funding_agency && (
                  <p className="text-sm text-red-500 mt-1">{errors.funding_agency.message}</p>
                )}
              </div>

              {/* Project Nature - Note: This might need a separate dropdown if available */}
              <div>
                <Label htmlFor="proj_nature">
                  Project Nature <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="proj_nature"
                  rules={{ required: "Project nature is required" }}
                  render={({ field }) => {
                    const { value, onChange, ...restField } = field
                    return (
                      <Input
                        {...restField}
                        id="proj_nature"
                        type="number"
                        placeholder="Enter project nature ID"
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    )
                  }}
                />
                {errors.proj_nature && (
                  <p className="text-sm text-red-500 mt-1">{errors.proj_nature.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="status"
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={projectStatusOptions.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                      placeholder="Select status"
                      emptyMessage="No status found"
                    />
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Project Level */}
              <div>
                <Label htmlFor="proj_level">Project Level</Label>
                <Controller
                  control={control}
                  name="proj_level"
                  render={({ field }) => (
                    <SearchableSelect
                      options={projectLevelOptions.map((l) => ({
                        value: l.id,
                        label: l.name,
                      }))}
                      value={field.value || ""}
                      onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                      placeholder="Select project level"
                      emptyMessage="No level found"
                    />
                  )}
                />
              </div>

              {/* Start Date */}
              <div>
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="start_date"
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <Input {...field} id="start_date" type="date" />
                  )}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (months)</Label>
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="duration"
                      type="number"
                      placeholder="Enter duration in months"
                    />
                  )}
                />
              </div>

              {/* Grant Sanctioned */}
              <div>
                <Label htmlFor="grant_sanctioned">Grant Sanctioned (₹)</Label>
                <Controller
                  control={control}
                  name="grant_sanctioned"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="grant_sanctioned"
                      type="number"
                      placeholder="Enter sanctioned amount"
                      min="0"
                      step="0.01"
                    />
                  )}
                />
              </div>

              {/* Grant Received */}
              <div>
                <Label htmlFor="grant_received">Grant Received (₹)</Label>
                <Controller
                  control={control}
                  name="grant_received"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="grant_received"
                      type="number"
                      placeholder="Enter received amount"
                      min="0"
                      step="0.01"
                    />
                  )}
                />
              </div>

              {/* Grant Year */}
              <div>
                <Label htmlFor="grant_year">Grant Year</Label>
                <Controller
                  control={control}
                  name="grant_year"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="grant_year"
                      type="number"
                      placeholder="Enter grant year"
                      min="2000"
                      max="2030"
                    />
                  )}
                />
              </div>

              {/* Grant Sealed */}
              <div className="md:col-span-2 flex items-center space-x-2">
                <Controller
                  control={control}
                  name="grant_sealed"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="grant_sealed"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  )}
                />
                <Label htmlFor="grant_sealed" className="cursor-pointer">
                  Grant Sealed
                </Label>
              </div>

              {/* Document URL */}
              <div className="md:col-span-2">
                <Label htmlFor="Pdf">Document URL (S3 path)</Label>
                <Controller
                  control={control}
                  name="Pdf"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="Pdf"
                      placeholder="Document URL (will be set from S3 upload)"
                      readOnly
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedProject(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={isDocViewerOpen} onOpenChange={setIsDocViewerOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Viewer</DialogTitle>
            <DialogDescription>View research project document</DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <DocumentViewer
              documentUrl={selectedDocument.url}
              documentName={selectedDocument.name}
              documentType={selectedDocument.type}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the research project
              <strong className="block mt-2 text-base">
                "{projectToDeleteConfirm?.title}"
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
