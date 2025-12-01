"use client"

import type React from "react"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useForm, Controller } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResearchProjectFormData } from "@/types/interfaces"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useResearchMutations } from "@/hooks/use-teacher-mutations"
import { useAutoFillData } from "@/hooks/use-auto-fill-data"

export default function AddResearchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { createResearch } = useResearchMutations()

  const {
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    projectNatureOptions,
  } = useDropDowns()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
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

  // Watch grant_sealed to enable/disable grant_year
  const grantSealed = watch("grant_sealed")

  // Note: Dropdown data is already available from Context, no need to fetch

  // Use auto-fill hook for document analysis data
  const { 
    documentUrl: autoFillDocumentUrl, 
    dataFields: autoFillDataFields,
    hasData: hasAutoFillData,
  } = useAutoFillData({
    formType: "research", // Explicit form type
    dropdownOptions: {
      funding_agency: fundingAgencyOptions,
      proj_nature: projectNatureOptions,
      proj_level: projectLevelOptions,
      status: projectStatusOptions,
    },
    onlyFillEmpty: true, // Only fill empty fields to prevent overwriting user input
    getFormValues: () => watch(), // Pass current form values to check if fields are empty
    onAutoFill: (fields) => {
      console.log("RESEARCH PROJECTS fields", fields)
      // Auto-fill form fields from document analysis
      if (fields.title) setValue("title", String(fields.title))
      if (fields.funding_agency !== undefined && fields.funding_agency !== null) setValue("funding_agency", Number(fields.funding_agency))
      
      // Handle grant_sanctioned - remove commas if present
      if (fields.grant_sanctioned) {
        const grantValue = String(fields.grant_sanctioned).replace(/[,\s]/g, '')
        setValue("grant_sanctioned", grantValue)
      }
      
      // Handle grant_received - remove commas if present
      if (fields.grant_received) {
        const grantValue = String(fields.grant_received).replace(/[,\s]/g, '')
        setValue("grant_received", grantValue)
      }
      
      if (fields.proj_nature !== undefined && fields.proj_nature !== null) setValue("proj_nature", Number(fields.proj_nature))
      
      // Handle duration - extract number from "9 months" format
      if (fields.duration !== undefined && fields.duration !== null) {
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
        if (durationValue > 0) {
          setValue("duration", durationValue)
        }
      }
      
      if (fields.status !== undefined && fields.status !== null) setValue("status", Number(fields.status))
      if (fields.start_date) setValue("start_date", String(fields.start_date))
      if (fields.proj_level !== undefined && fields.proj_level !== null) setValue("proj_level", Number(fields.proj_level))
      if (fields.grant_year) setValue("grant_year", String(fields.grant_year))
      if (fields.grant_sealed !== undefined) setValue("grant_sealed", Boolean(fields.grant_sealed))
      
      // Show toast notification
      const filledCount = Object.keys(fields).filter(
        k => fields[k] !== null && fields[k] !== undefined && fields[k] !== ""
      ).length
      if (filledCount > 0) {
        toast({
          title: "Form Auto-filled",
          description: `Populated ${filledCount} field(s) from document analysis.`,
        })
      }
    },
    clearAfterUse: false, // Keep data for manual editing
  })

  // Update Pdf field when auto-fill document URL is available
  useEffect(() => {
    if (autoFillDocumentUrl) {
      setValue("Pdf", autoFillDocumentUrl)
    }
  }, [autoFillDocumentUrl, setValue])

  // Handle extracted fields from DocumentUpload component
  const handleExtractFields = useCallback((fields: Record<string, any>) => {
    let fieldsPopulated = 0

    // Map extracted fields to form fields
    if (fields.title) {
      setValue("title", fields.title)
      fieldsPopulated++
    }
    if (fields.fundingAgency || fields.funding_agency) {
      const agencyName = fields.fundingAgency || fields.funding_agency
      // Try to find matching funding agency
      const matchingAgency = fundingAgencyOptions.find(
        (a) => a.name.toLowerCase().includes(agencyName.toLowerCase()) || 
               agencyName.toLowerCase().includes(a.name.toLowerCase())
      )
      if (matchingAgency) {
        setValue("funding_agency", matchingAgency.id)
        fieldsPopulated++
      }
    }
    if (fields.totalGrantSanctioned || fields.grant_sanctioned) {
      const value = fields.totalGrantSanctioned || fields.grant_sanctioned
      // Remove commas and convert to string for the form field
      const cleanedValue = String(value).replace(/[,\s]/g, '')
      setValue("grant_sanctioned", cleanedValue)
      fieldsPopulated++
    }
    if (fields.totalGrantReceived || fields.grant_received) {
      const value = fields.totalGrantReceived || fields.grant_received
      // Remove commas and convert to string for the form field
      const cleanedValue = String(value).replace(/[,\s]/g, '')
      setValue("grant_received", cleanedValue)
      fieldsPopulated++
    }
    if (fields.projectNature || fields.proj_nature || fields["Project Nature"]) {
      const value = fields.projectNature || fields.proj_nature || fields["Project Nature"]
      // Try dropdown matching first
      if (typeof value === 'string') {
        const matchingNature = projectNatureOptions.find(
          (n) => n.name.toLowerCase().includes(value.toLowerCase()) ||
                 value.toLowerCase().includes(n.name.toLowerCase())
        )
        if (matchingNature) {
          setValue("proj_nature", matchingNature.id)
          fieldsPopulated++
        } else if (typeof value === 'number') {
          setValue("proj_nature", value)
          fieldsPopulated++
        }
      } else if (typeof value === 'number') {
        setValue("proj_nature", value)
        fieldsPopulated++
      }
    }
    if (fields.level || fields.proj_level || fields.projectNatureLevel || fields["Project Nature Level"]) {
      const levelName = fields.level || fields.proj_level || fields.projectNatureLevel || fields["Project Nature Level"]
      const levelNameStr = String(levelName)
      const matchingLevel = projectLevelOptions.find(
        (l) => l.name.toLowerCase().includes(levelNameStr.toLowerCase()) ||
               levelNameStr.toLowerCase().includes(l.name.toLowerCase())
      )
      if (matchingLevel) {
        setValue("proj_level", matchingLevel.id)
        fieldsPopulated++
      }
    }
    if (fields.duration) {
      let durationValue = 0
      if (typeof fields.duration === 'number') {
        durationValue = fields.duration
      } else {
        // Extract number from string like "9 months" or "9"
        const durationStr = String(fields.duration)
        const match = durationStr.match(/(\d+)/)
        if (match) {
          durationValue = parseInt(match[1]) || 0
        } else {
          durationValue = parseInt(durationStr) || 0
        }
      }
      if (durationValue > 0) {
        setValue("duration", durationValue)
        fieldsPopulated++
      }
    }
    if (fields.status || fields["Status"]) {
      const statusValue = fields.status || fields["Status"]
      const statusStr = String(statusValue)
      const matchingStatus = projectStatusOptions.find(
        (s) => s.name.toLowerCase().includes(statusStr.toLowerCase()) ||
               statusStr.toLowerCase().includes(s.name.toLowerCase())
      )
      if (matchingStatus) {
        setValue("status", matchingStatus.id)
        fieldsPopulated++
      }
    }
    if (fields.startDate || fields.start_date) {
      const dateValue = fields.startDate || fields.start_date
      setValue("start_date", dateValue)
      fieldsPopulated++
    }
    if (fields.seedGrant) {
      setValue("grant_sanctioned", fields.seedGrant.toString())
      fieldsPopulated++
    }
    if (fields.seedGrantYear || fields.grant_year) {
      const yearValue = fields.seedGrantYear || fields.grant_year
      setValue("grant_year", yearValue.toString())
      fieldsPopulated++
    }

    toast({
      title: "Information Extracted Successfully",
      description: `${fieldsPopulated} fields populated from document analysis`,
    })
  }, [setValue, toast, fundingAgencyOptions, projectLevelOptions, projectStatusOptions])

  const onSubmit = async (data: ResearchProjectFormData) => {
    const teacherId = user?.role_id
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

    // Validate document is uploaded
    if (!data.Pdf || !data.Pdf.trim()) {
      toast({
        title: "Validation Error",
        description: "Supporting document is required. Please upload a document.",
        variant: "destructive",
      })
      return
    }

    // Handle document upload to S3 if a document exists
    let pdfPath = data.Pdf || null
    
    if (pdfPath && pdfPath.startsWith("/uploaded-document/")) {
      try {
        // Extract fileName from local URL
        const fileName = pdfPath.split("/").pop()
        
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
      grant_sealed: data.grant_sealed ?? false,
      Pdf: pdfPath,
    }

    // Use mutation instead of direct fetch
    createResearch.mutate(projectData, {
      onSuccess: () => {
        router.push("/teacher/research")
      },
    })
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight w-full sm:w-auto">Add Research Project</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Research Project Details</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Document Upload Section */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
            <Label className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 block">
              Step 1: Upload Supporting Document <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="Pdf"
              rules={{ 
                required: "Supporting document is required",
                validate: (value) => {
                  if (!value || !value.trim()) {
                    return "Please upload a supporting document"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <div>
                  <DocumentUpload
                    documentUrl={field.value || autoFillDocumentUrl || undefined}
                    category="Research & Consultancy"
                    subCategory="Research Projects"
                    onChange={(url) => {
                      field.onChange(url)
                    }}
                    onExtract={handleExtractFields}
                    allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
                    maxFileSize={1 * 1024 * 1024}
                    className="w-full"
                  />
                  {errors.Pdf && <p className="text-xs sm:text-sm text-red-500 mt-2">{errors.Pdf.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <Label className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Verify/Complete Project Details</Label>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-xs sm:text-sm">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="title"
                    rules={{ required: "Project title is required" }}
                    render={({ field }) => (
                      <Input {...field} id="title" placeholder="Enter project title" className="h-8 sm:h-10 text-xs sm:text-sm" />
                    )}
                  />
                  {errors.title && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Funding Agency */}
                <div className="space-y-2">
                  <Label htmlFor="funding_agency" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.funding_agency && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.funding_agency.message}</p>
                  )}
                </div>

                {/* Project Nature */}
                <div className="space-y-2">
                  <Label htmlFor="proj_nature" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.proj_nature && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.proj_nature.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.status && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.status.message}</p>}
                </div>

                {/* Project Level */}
                <div className="space-y-2">
                  <Label htmlFor="proj_level" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.proj_level && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.proj_level.message}</p>}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-xs sm:text-sm">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="start_date"
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <Input {...field} id="start_date" type="date" className="h-8 sm:h-10 text-xs sm:text-sm" />
                    )}
                  />
                  {errors.start_date && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-xs sm:text-sm">
                    Duration (months) <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="duration"
                    rules={{ 
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 month" }
                    }}
                    render={({ field }) => {
                      const { value, onChange, ...restField } = field
                      return (
                        <Input
                          {...restField}
                          id="duration"
                          type="number"
                          placeholder="Enter duration in months"
                          min="1"
                          value={value ?? ""}
                          onChange={(e) => {
                            const numValue = e.target.value === "" ? "" : Number(e.target.value)
                            onChange(numValue)
                          }}
                          className="h-8 sm:h-10 text-xs sm:text-sm"
                        />
                      )
                    }}
                  />
                  {errors.duration && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.duration.message}</p>}
                </div>

                {/* Grant Sanctioned */}
                <div className="space-y-2">
                  <Label htmlFor="grant_sanctioned" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.grant_sanctioned && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.grant_sanctioned.message}</p>}
                </div>

                {/* Grant Received */}
                <div className="space-y-2">
                  <Label htmlFor="grant_received" className="text-xs sm:text-sm">
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
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    )}
                  />
                  {errors.grant_received && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.grant_received.message}</p>}
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
                        className="rounded border-gray-300 h-4 w-4"
                      />
                    )}
                  />
                  <Label htmlFor="grant_sealed" className="cursor-pointer text-xs sm:text-sm">
                    Whether this Project is under University Grant Seed
                  </Label>
                </div>

                {/* Grant Year - Only enabled when grant_sealed is checked */}
                <div className="space-y-2">
                  <Label htmlFor="grant_year" className="text-xs sm:text-sm">Grant Year</Label>
                  <Controller
                    control={control}
                    name="grant_year"
                    rules={{
                      validate: (value) => {
                        if (grantSealed && !value?.trim()) {
                          return "Grant Year is required when University Grant Seed is selected"
                        }
                        if (grantSealed && value?.trim()) {
                          const yearValue = parseInt(value)
                          // Check if it's exactly 4 digits
                          if (!/^\d{4}$/.test(value.trim())) {
                            return "Grant Year must be exactly 4 digits"
                          }
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
                        className={`h-8 sm:h-10 text-xs sm:text-sm ${!grantSealed ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        onChange={(e) => {
                          // Limit to 4 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                  {errors.grant_year && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.grant_year.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-2 sm:pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={createResearch.isPending} className="w-full sm:w-auto" size="sm">
                  {createResearch.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Adding Project...</span>
                      <span className="sm:hidden">Adding...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Add Research Project</span>
                      <span className="sm:hidden">Add Project</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
