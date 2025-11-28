"use client"

import { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { Save, Brain, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface CommitteeFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  committeeLevelOptions?: DropdownOption[]
  reportYearsOptions?: DropdownOption[]
}

export function UniversityCommitteeParticipationForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  committeeLevelOptions = [],
  reportYearsOptions = [],
}: CommitteeFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const formData = watch()
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.supporting_doc ? editData.supporting_doc : undefined
  )

  useEffect(() => {
    if (isEdit && editData) {
      Object.entries(editData).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: false }) // Don't validate on initial load
      })
      // Set document URL if exists
      if (editData.supporting_doc) {
        setDocumentUrl(editData.supporting_doc)
        setValue("supporting_doc", editData.supporting_doc, { shouldValidate: false })
      }
    }
  }, [isEdit, editData, setValue])

  // Sync documentUrl with form state (for auto-fill from smart document analyzer)
  // Only sync if the document URL exists and is not empty
  useEffect(() => {
    const formDocUrl = formData.supporting_doc
    if (formDocUrl && formDocUrl.trim() !== "" && formDocUrl !== documentUrl) {
      setDocumentUrl(formDocUrl)
    } else if (!formDocUrl || formDocUrl.trim() === "") {
      // Clear document URL if form state is empty
      if (documentUrl) {
        setDocumentUrl(undefined)
      }
    }
  }, [formData.supporting_doc, documentUrl])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
        <DocumentUpload
          documentUrl={documentUrl}
          category="Academic Programs"
          subCategory="Participation in Committees of University"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supporting_doc", url, { shouldValidate: true })
          }}
          onExtract={(fields) => {
            Object.entries(fields).forEach(([key, value]) => {
              setValue(key, value)
            })
            if (handleExtractInfo) {
              handleExtractInfo()
            }
          }}
          allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
          maxFileSize={5 * 1024 * 1024} // 5MB
          className="w-full"
        />
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register("supporting_doc", {
            required: "Supporting document is required",
            validate: (value) => {
              if (!value || (typeof value === 'string' && value.trim() === '')) {
                return "Please upload a supporting document"
              }
              // Check if it's a valid URL or local path
              if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/') || value.startsWith('uploaded-document'))) {
                return true
              }
              return "Invalid document URL"
            }
          })}
        />
        {errors.supporting_doc && (
          <p className="text-sm text-red-600 mt-1">{errors.supporting_doc.message?.toString()}</p>
        )}
      </div>

      {/* Step 2: Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Details</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              placeholder="Enter name"
              maxLength={100}
              {...register("name", { 
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 100, message: "Name must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Name cannot be only whitespace"
                  }
                  return true
                }
              })} 
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="committee_name">Committee Name *</Label>
            <Input 
              id="committee_name" 
              placeholder="Enter committee name"
              maxLength={500}
              {...register("committee_name", { 
                required: "Committee name is required",
                minLength: { value: 2, message: "Committee name must be at least 2 characters" },
                maxLength: { value: 500, message: "Committee name must not exceed 500 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Committee name cannot be only whitespace"
                  }
                  return true
                }
              })} 
            />
            {errors.committee_name && <p className="text-sm text-red-600 mt-1">{errors.committee_name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Controller
              name="level"
              control={control}
              rules={{ 
                required: "Level is required",
                validate: (value) => {
                  if (!value || value === "" || value === null || value === undefined) {
                    return "Level is required"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <SearchableSelect
                  options={committeeLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Clear error when value is selected
                    if (value) {
                      form.clearErrors("level")
                    }
                  }}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="participated_as">Participated As *</Label>
            <Input 
              id="participated_as" 
              placeholder="e.g., Member, Chairman, Secretary"
              maxLength={100}
              {...register("participated_as", { 
                required: "Participated As is required",
                minLength: { value: 2, message: "Participated As must be at least 2 characters" },
                maxLength: { value: 100, message: "Participated As must not exceed 100 characters" },
                validate: (value) => {
                  if (value && value.trim().length < 2) {
                    return "Participated As cannot be only whitespace"
                  }
                  return true
                }
              })} 
            />
            {errors.participated_as && <p className="text-sm text-red-600 mt-1">{errors.participated_as.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="submit_date">Submit Date *</Label>
            <Input 
              id="submit_date" 
              type="date" 
              max={new Date().toISOString().split('T')[0]}
              {...register("submit_date", { 
                required: "Submit date is required",
                validate: (value) => {
                  if (!value) {
                    return "Submit date is required"
                  }
                  const date = new Date(value)
                  const today = new Date()
                  today.setHours(23, 59, 59, 999)
                  
                  if (date > today) {
                    return "Submit date cannot be in the future"
                  }
                  if (date.getFullYear() < 1900) {
                    return "Submit date must be after 1900"
                  }
                  return true
                }
              })} 
            />
            {errors.submit_date && <p className="text-sm text-red-600 mt-1">{errors.submit_date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year_name">Year *</Label>
            <Controller
              name="year_name"
              control={control}
              rules={{ 
                required: "Year is required",
                validate: (value) => {
                  if (!value || value === "" || value === null || value === undefined) {
                    return "Year is required"
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <SearchableSelect
                  options={reportYearsOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Clear error when value is selected
                    if (value) {
                      form.clearErrors("year_name")
                    }
                  }}
                  placeholder="Select year"
                  emptyMessage="No year found"
                />
              )}
            />
            {errors.year_name && <p className="text-sm text-red-600 mt-1">{errors.year_name.message?.toString()}</p>}
          </div>
        </div>

        {/* Checkboxes for BOS, FB, CDC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="BOS"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="BOS"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="BOS" className="font-normal cursor-pointer">BOS</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="FB"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="FB"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="FB" className="font-normal cursor-pointer">FB</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="CDC"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="CDC"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="CDC" className="font-normal cursor-pointer">CDC</Label>
          </div>
        </div>


        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push("/teacher/academic-contributions?tab=committees")}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Committee Info" : "Add Committee Info"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
