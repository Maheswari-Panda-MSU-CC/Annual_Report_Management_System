"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResearchProjectFormData } from "@/types/interfaces"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useResearchMutations } from "@/hooks/use-teacher-mutations"
import { useQuery } from "@tanstack/react-query"
import { teacherQueryKeys } from "@/hooks/use-teacher-data"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard"
import { useFormCancelHandler } from "@/hooks/use-form-cancel-handler"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"

export default function EditResearchPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | null>(null)
  const { updateResearch } = useResearchMutations()
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  const {
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    projectNatureOptions,
  } = useDropDowns()

  const form = useForm<ResearchProjectFormData>({
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

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = form

  // Watch grant_sealed to enable/disable grant_year
  const grantSealed = watch("grant_sealed")

  // Use auto-fill hook for document analysis data - watches context changes
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
    clearData: clearAutoFillData,
  } = useAutoFillData({
    formType: "research", // Explicit form type
    dropdownOptions: {
      funding_agency: fundingAgencyOptions,
      proj_nature: projectNatureOptions,
      proj_level: projectLevelOptions,
      status: projectStatusOptions,
    },
    onlyFillEmpty: false, // REPLACE existing data with new extracted data
    onAutoFill: (fields) => {
      console.log("EDIT PAGE: Auto-fill triggered with fields", fields)
      // REPLACE all form fields with extracted data (even if they already have values)
      // This ensures new extraction replaces existing data
      
      // Title - replace if exists in extraction
      if (fields.title !== undefined) {
        setValue("title", fields.title ? String(fields.title) : "")
      }
      
      // Funding Agency - replace if exists in extraction
      if (fields.funding_agency !== undefined) {
        if (fields.funding_agency !== null && fields.funding_agency !== undefined) {
          // The hook already provides the ID, but we need to verify it exists in options
          const matchingAgency = fundingAgencyOptions.find(
            (a) => a.id === Number(fields.funding_agency)
          )
          if (matchingAgency) {
            setValue("funding_agency", matchingAgency.id)
          } else {
            setValue("funding_agency", null)
          }
        } else {
          setValue("funding_agency", null)
        }
      }
      
      // Handle grant_sanctioned - remove commas if present, replace if exists
      if (fields.grant_sanctioned !== undefined) {
        if (fields.grant_sanctioned) {
          const grantValue = String(fields.grant_sanctioned).replace(/[,\s]/g, '')
          setValue("grant_sanctioned", grantValue)
        } else {
          setValue("grant_sanctioned", "")
        }
      }
      
      // Handle grant_received - remove commas if present, replace if exists
      if (fields.grant_received !== undefined) {
        if (fields.grant_received) {
          const grantValue = String(fields.grant_received).replace(/[,\s]/g, '')
          setValue("grant_received", grantValue)
        } else {
          setValue("grant_received", "")
        }
      }
      
      // Project Nature - replace if exists in extraction
      if (fields.proj_nature !== undefined) {
        if (fields.proj_nature !== null && fields.proj_nature !== undefined) {
          const matchingNature = projectNatureOptions.find(
            (n) => n.id === Number(fields.proj_nature)
          )
          if (matchingNature) {
            setValue("proj_nature", matchingNature.id)
          } else {
            setValue("proj_nature", null)
          }
        } else {
          setValue("proj_nature", null)
        }
      }
      
      // Handle duration - extract number from "9 months" format, replace if exists
      if (fields.duration !== undefined) {
        if (fields.duration !== null) {
          let durationValue = 0
          if (typeof fields.duration === 'number') {
            durationValue = fields.duration
          } else {
            const durationStr = String(fields.duration)
            const match = durationStr.match(/(\d+)/)
            if (match) {
              durationValue = parseInt(match[1]) || 0
            } else {
              durationValue = parseInt(durationStr) || 0
            }
          }
          setValue("duration", durationValue)
        } else {
          setValue("duration", 0)
        }
      }
      
      // Status - replace if exists in extraction
      if (fields.status !== undefined) {
        if (fields.status !== null && fields.status !== undefined) {
          const matchingStatus = projectStatusOptions.find(
            (s) => s.id === Number(fields.status)
          )
          if (matchingStatus) {
            setValue("status", matchingStatus.id)
          } else {
            setValue("status", null)
          }
        } else {
          setValue("status", null)
        }
      }
      
      // Start Date - replace if exists in extraction
      if (fields.start_date !== undefined) {
        setValue("start_date", fields.start_date ? String(fields.start_date) : "")
      }
      
      // Project Level - replace if exists in extraction
      if (fields.proj_level !== undefined) {
        if (fields.proj_level !== null && fields.proj_level !== undefined) {
          const matchingLevel = projectLevelOptions.find(
            (l) => l.id === Number(fields.proj_level)
          )
          if (matchingLevel) {
            setValue("proj_level", matchingLevel.id)
          } else {
            setValue("proj_level", null)
          }
        } else {
          setValue("proj_level", null)
        }
      }
      
      // Grant Year - replace if exists in extraction
      if (fields.grant_year !== undefined) {
        setValue("grant_year", fields.grant_year ? String(fields.grant_year) : "")
      }
      
      // Grant Sealed - replace if exists in extraction
      if (fields.grant_sealed !== undefined) {
        setValue("grant_sealed", Boolean(fields.grant_sealed))
      }
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Unsaved changes guard
  const { DialogComponent: NavigationDialog } = useUnsavedChangesGuard({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    clearAutoFillData: clearAutoFillData,
    enabled: true,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cancel handler
  const { handleCancel, DialogComponent: CancelDialog } = useFormCancelHandler({
    form,
    clearDocumentData: () => {
      clearDocumentData()
      clearAutoFillData()
    },
    redirectPath: "/teacher/research",
    skipWarning: false,
    message: "Are you sure to discard the unsaved changes?",
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear document data when leaving the page
      if (hasDocumentData) {
        clearDocumentData()
        clearAutoFillData()
      }
    }
  }, [hasDocumentData, clearDocumentData, clearAutoFillData])

  // Note: Dropdown data is already available from Context, no need to fetch

  // Format date for input helper
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

  // Use React Query to fetch research projects - always fetch fresh data for edit pages
  const { data: researchData, isLoading: isLoadingResearch } = useQuery({
    queryKey: teacherQueryKeys.research(teacherId),
    queryFn: async () => {
      const res = await fetch(`/api/teacher/research?teacherId=${teacherId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch research projects")
      }
      return res.json()
    },
    enabled: !!params.id && !!teacherId && teacherId > 0,
    staleTime: 0, // Always fetch fresh data for edit pages
    gcTime: 0, // Don't cache for edit pages
    refetchOnMount: true, // Always refetch when component mounts
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (!researchData || !params.id) return

    const formattedProjects = Array.isArray(researchData.researchProjects)
      ? researchData.researchProjects
      : [researchData.researchProjects]

    const project = formattedProjects.find((p: any) => p.projid.toString() === params.id)

    if (!project) {
      toast({
        title: "Project not found",
        description: "The research project you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/teacher/research")
      return
    }

    // Reset form with project data
    const formData = {
      title: project.title || "",
      funding_agency: project.funding_agency || null,
      grant_sanctioned: project.grant_sanctioned?.toString() || "",
      grant_received: project.grant_received?.toString() || "",
      proj_nature: project.proj_nature || null,
      duration: project.duration?.toString() || "",
      status: project.status || null,
      start_date: formatDateForInput(project.start_date),
      proj_level: project.proj_level || null,
      grant_year: project.grant_year?.toString() || "",
      grant_sealed: project.grant_sealed || false,
      Pdf: project.Pdf || "",
    }

    reset(formData)
    setDocumentUrl(project.Pdf || null)
    setExistingDocumentUrl(project.Pdf || null)
  }, [researchData, params.id, reset, router, toast])

  const isLoading = isLoadingResearch || !researchData

  // Handle extracted fields from DocumentUpload - REPLACE existing data with new extracted data
  const handleExtractedFields = useCallback((fields: Record<string, any>) => {
    let fieldsPopulated = 0

    // REPLACE all fields - set values even if they're empty/null in extracted data
    // This ensures existing data is replaced with new extracted data
    
    // Title - replace if exists in extraction, otherwise keep existing
    if (fields.title !== undefined) {
      setValue("title", fields.title || "")
      if (fields.title) fieldsPopulated++
    }
    
    // Funding Agency - replace if exists in extraction
    if (fields.fundingAgency !== undefined) {
      if (fields.fundingAgency) {
        const matchingAgency = fundingAgencyOptions.find(
          (a) => a.name.toLowerCase().includes(fields.fundingAgency.toLowerCase()) || 
                 fields.fundingAgency.toLowerCase().includes(a.name.toLowerCase())
        )
        if (matchingAgency) {
          setValue("funding_agency", matchingAgency.id)
          fieldsPopulated++
        } else {
          setValue("funding_agency", null)
        }
      } else {
        setValue("funding_agency", null)
      }
    }
    
    // Grant Sanctioned - replace if exists in extraction
    if (fields.totalGrantSanctioned !== undefined) {
      setValue("grant_sanctioned", fields.totalGrantSanctioned ? fields.totalGrantSanctioned.toString() : "")
      if (fields.totalGrantSanctioned) fieldsPopulated++
    }
    
    // Grant Received - replace if exists in extraction
    if (fields.totalGrantReceived !== undefined) {
      setValue("grant_received", fields.totalGrantReceived ? fields.totalGrantReceived.toString() : "")
      if (fields.totalGrantReceived) fieldsPopulated++
    }
    
    // Project Nature - replace if exists in extraction
    if (fields.projectNature !== undefined) {
      setValue("proj_nature", typeof fields.projectNature === 'number' ? fields.projectNature : null)
      if (fields.projectNature) fieldsPopulated++
    }
    
    // Level - replace if exists in extraction
    if (fields.level !== undefined) {
      if (fields.level) {
        const matchingLevel = projectLevelOptions.find(
          (l) => l.name.toLowerCase().includes(fields.level.toLowerCase()) ||
                 fields.level.toLowerCase().includes(l.name.toLowerCase())
        )
        if (matchingLevel) {
          setValue("proj_level", matchingLevel.id)
          fieldsPopulated++
        } else {
          setValue("proj_level", null)
        }
      } else {
        setValue("proj_level", null)
      }
    }
    
    // Duration - replace if exists in extraction
    if (fields.duration !== undefined) {
      setValue("duration", fields.duration ? fields.duration.toString() : "0")
      if (fields.duration) fieldsPopulated++
    }
    
    // Status - replace if exists in extraction
    if (fields.status !== undefined) {
      if (fields.status) {
        const matchingStatus = projectStatusOptions.find(
          (s) => s.name.toLowerCase().includes(fields.status.toLowerCase()) ||
                 fields.status.toLowerCase().includes(s.name.toLowerCase())
        )
        if (matchingStatus) {
          setValue("status", matchingStatus.id)
          fieldsPopulated++
        } else {
          setValue("status", null)
        }
      } else {
        setValue("status", null)
      }
    }
    
    // Start Date - replace if exists in extraction
    if (fields.startDate !== undefined) {
      setValue("start_date", fields.startDate || "")
      if (fields.startDate) fieldsPopulated++
    }
    
    // Seed Grant - replace if exists in extraction
    if (fields.seedGrant !== undefined) {
      setValue("grant_sanctioned", fields.seedGrant ? fields.seedGrant.toString() : "")
      if (fields.seedGrant) fieldsPopulated++
    }
    
    // Seed Grant Year - replace if exists in extraction
    if (fields.seedGrantYear !== undefined) {
      setValue("grant_year", fields.seedGrantYear ? fields.seedGrantYear.toString() : "")
      if (fields.seedGrantYear) fieldsPopulated++
    }

    if (fieldsPopulated > 0) {
      toast({
        title: "Information Extracted Successfully",
        description: `${fieldsPopulated} fields replaced with new extracted data`,
      })
    } else {
      toast({
        title: "Extraction Complete",
        description: "Data fields have been updated (some fields may be empty)",
      })
    }
  }, [setValue, toast, fundingAgencyOptions, projectLevelOptions, projectStatusOptions])

  const onSubmit = async (data: ResearchProjectFormData) => {
    const projectId = params.id as string

    if (!teacherId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!data.title?.trim() || !data.funding_agency || !data.proj_nature || !data.status || !data.start_date || !data.duration || !data.proj_level || !data.grant_sanctioned || !data.grant_received) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Funding Agency, Project Nature, Status, Start Date, Duration, Project Level, Grant Sanctioned, Grant Received)",
        variant: "destructive",
      })
      return
    }

    // Validate numeric fields
    const grantSanctioned = data.grant_sanctioned?.trim() ? parseFloat(data.grant_sanctioned.replace(/[,\s]/g, '')) : null
    const grantReceived = data.grant_received?.trim() ? parseFloat(data.grant_received.replace(/[,\s]/g, '')) : null
    const duration = data.duration && data.duration > 0 ? Math.floor(data.duration) : null

    if (!grantSanctioned || isNaN(grantSanctioned) || grantSanctioned < 0) {
      toast({
        title: "Validation Error",
        description: "Grant Sanctioned is required and must be a valid positive number",
        variant: "destructive",
      })
      return
    }

    if (!grantReceived || isNaN(grantReceived) || grantReceived < 0) {
      toast({
        title: "Validation Error",
        description: "Grant Received is required and must be a valid positive number",
        variant: "destructive",
      })
      return
    }

    if (!duration || duration <= 0) {
      toast({
        title: "Validation Error",
        description: "Duration is required and must be a positive number",
        variant: "destructive",
      })
      return
    }

    // Grant Year: only set if grant_sealed is checked, otherwise null
    let grantYear = null
    if (data.grant_sealed && data.grant_year?.trim()) {
      // Validate it's exactly 4 digits
      if (!/^\d{4}$/.test(data.grant_year.trim())) {
        toast({
          title: "Validation Error",
          description: "Grant Year must be exactly 4 digits",
          variant: "destructive",
        })
        return
      }
      const yearValue = parseInt(data.grant_year)
      if (!isNaN(yearValue) && yearValue >= 2000 && yearValue <= 2100) {
        grantYear = yearValue
      } else {
        toast({
          title: "Validation Error",
          description: "Grant Year must be a valid year between 2000 and 2100",
          variant: "destructive",
        })
        return
      }
    }

    // Handle document upload to S3 if a new document was uploaded
    let pdfPath = existingDocumentUrl || data.Pdf || ""

    // If documentUrl is a new upload (starts with /uploaded-document/), upload to S3
    if (documentUrl && documentUrl.startsWith("/uploaded-document/")) {
      try {
        // Extract fileName from local URL
        const fileName = documentUrl.split("/").pop()
        
        if (fileName) {
          // Upload to S3 using the file in /public/uploaded-document/
          const s3Response = await fetch("/api/shared/s3", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: fileName,
            }),
          })

          if (!s3Response.ok) {
            const s3Error = await s3Response.json()
            throw new Error(s3Error.error || "Failed to upload document to S3")
          }

          const s3Data = await s3Response.json()
          pdfPath = s3Data.url // Use S3 URL for database storage

          // Delete local file after successful S3 upload
          await fetch("/api/shared/local-document-upload", {
            method: "DELETE",
          })
        }
      } catch (docError: any) {
        console.error("Document upload error:", docError)
        toast({
          title: "Document Upload Error",
          description: docError.message || "Failed to upload document. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (documentUrl && !documentUrl.startsWith("/uploaded-document/")) {
      // Keep existing document URL if it's not a new upload
      pdfPath = documentUrl
    }

    const projectData = {
      title: data.title.trim(),
      funding_agency: data.funding_agency,
      grant_sanctioned: grantSanctioned,
      grant_received: grantReceived,
      proj_nature: data.proj_nature,
      duration: duration,
      status: data.status,
      start_date: data.start_date,
      proj_level: data.proj_level,
      grant_year: grantYear,
      grant_sealed: data.grant_sealed,
      Pdf: pdfPath,
    }

    // Use mutation instead of direct fetch
    updateResearch.mutate(
      { projectId: parseInt(projectId), projectData },
      {
        onSuccess: () => {
          // Clear document data on successful submission
          clearDocumentData()
          clearAutoFillData()
          router.push("/teacher/research")
        },
      }
    )
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading research project...</p>
          </div>
        </div>
    )
  }

  return (
    <>
      {NavigationDialog && <NavigationDialog />}
      {CancelDialog && <CancelDialog />}
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
          </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Research Project</h1>
        </div>

              <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Research Project Details</CardTitle>
                </CardHeader>
        <CardContent>
          {/* Document Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <Label className="text-lg font-semibold mb-3 block">Step 1: Supporting Document</Label>
            <DocumentUpload
              documentUrl={documentUrl || undefined}
              category="Research & Consultancy"
              subCategory="Research Projects"
              onChange={(url) => {
                setDocumentUrl(url)
                setValue("Pdf", url)
              }}
              onExtract={handleExtractedFields}
              className="w-full"
              isEditMode={true}
              onClearFields={() => {
                // Clear all form fields when document is cleared in edit mode
                reset()
              }}
            />
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-lg font-semibold mb-4 block">Step 2: Update Project Details</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
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
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                {/* Funding Agency */}
                <div className="space-y-2">
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

                {/* Project Nature */}
                <div className="space-y-2">
                  <Label htmlFor="proj_nature">
                    Project Nature <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="proj_nature"
                    rules={{ required: "Project nature is required" }}
                    render={({ field }) => (
                      <SearchableSelect
                        options={projectNatureOptions.map((n) => ({
                          value: n.id,
                          label: n.name,
                        }))}
                        value={field.value || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder="Select project nature"
                        emptyMessage="No project nature found"
                      />
                    )}
                  />
                  {errors.proj_nature && (
                    <p className="text-sm text-red-500 mt-1">{errors.proj_nature.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
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
                  {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                  </div>


                {/* Start Date */}
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (months) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="duration"
                    rules={{ 
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 month" }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="duration"
                        type="number"
                        placeholder="Enter duration in months"
                        min="1"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      />
                    )}
                  />
                  {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>}
                  </div>

                {/* Grant Sanctioned */}
                <div className="space-y-2">
                  <Label htmlFor="grant_sanctioned">
                    Grant Sanctioned (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="grant_sanctioned"
                    rules={{ 
                      required: "Grant Sanctioned is required",
                      min: { value: 0, message: "Grant Sanctioned must be a positive number" }
                    }}
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
                  {errors.grant_sanctioned && <p className="text-sm text-red-500 mt-1">{errors.grant_sanctioned.message}</p>}
                  </div>

                {/* Grant Received */}
                <div className="space-y-2">
                  <Label htmlFor="grant_received">
                    Grant Received (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="grant_received"
                    rules={{ 
                      required: "Grant Received is required",
                      min: { value: 0, message: "Grant Received must be a positive number" }
                    }}
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
                  {errors.grant_received && <p className="text-sm text-red-500 mt-1">{errors.grant_received.message}</p>}
                    </div>

                {/* Project Level */}
                <div className="space-y-2">
                  <Label htmlFor="proj_level">
                    Project Level <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="proj_level"
                    rules={{ required: "Project Level is required" }}
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
                  {errors.proj_level && <p className="text-sm text-red-500 mt-1">{errors.proj_level.message}</p>}
                  </div>

                {/* Grant Sealed Checkbox */}
                <div className="md:col-span-2 flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="grant_sealed"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="grant_sealed"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          // Clear grant_year when unchecked
                          if (!e.target.checked) {
                            setValue("grant_year", "")
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    )}
                  />
                  <Label htmlFor="grant_sealed" className="cursor-pointer">
                    Whether this Project is under University Grant Seed
                  </Label>
                </div>

                {/* Grant Year - Only enabled when grant_sealed is checked */}
                <div className="space-y-2">
                  <Label htmlFor="grant_year">Grant Year</Label>
                  <Controller
                    control={control}
                    name="grant_year"
                    rules={{
                      validate: (value) => {
                        if (grantSealed && !value?.trim()) {
                          return "Grant Year is required when University Grant Seed is selected"
                        }
                        if (grantSealed && value?.trim()) {
                          // Check if it's exactly 4 digits
                          if (!/^\d{4}$/.test(value.trim())) {
                            return "Grant Year must be exactly 4 digits"
                          }
                          const yearValue = parseInt(value)
                          if (isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
                            return "Grant Year must be between 2000 and 2100"
                          }
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="grant_year"
                        type="number"
                        placeholder="Enter grant year (YYYY)"
                        min="2000"
                        max="2100"
                        maxLength={4}
                        disabled={!grantSealed}
                        className={!grantSealed ? "bg-gray-100 cursor-not-allowed" : ""}
                        onChange={(e) => {
                          // Limit to 4 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                  {errors.grant_year && <p className="text-sm text-red-500 mt-1">{errors.grant_year.message}</p>}
                </div>
                    </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
                <Button type="submit" disabled={updateResearch.isPending}>
                  {updateResearch.isPending ? (
                <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                </>
              ) : (
                <>
                      <Save className="mr-2 h-4 w-4" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
          </div>
        </CardContent>
      </Card>

      </div>
    </>
  )
}
