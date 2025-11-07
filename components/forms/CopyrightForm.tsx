"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"

interface CopyrightFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
}

export function CopyrightForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: CopyrightFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const formData = watch()

  useEffect(() => {
    if (isEdit && editData) {
      // Map database fields to form fields
      if (editData.Title) setValue("title", editData.Title)
      if (editData.RefNo) setValue("referenceNo", editData.RefNo)
      if (editData.PublicationDate) {
        const date = new Date(editData.PublicationDate)
        setValue("publicationDate", date.toISOString().split('T')[0])
      }
      if (editData.Link) setValue("link", editData.Link)
      if (editData.doc) setValue("doc", editData.doc)
      if (editData.supportingDocument) setValue("supportingDocument", editData.supportingDocument)
    }
  }, [isEdit, editData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Copyright Document</Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExtractInfo}
              disabled={isExtracting}
            >
              {isExtracting ? "Extracting..." : "Extract Information"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Copyright Information</Label>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter copyright title"
            {...register("title", { 
              required: "Copyright title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters long"
              }
            })}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="referenceNo">Reference Number *</Label>
            <Input
              id="referenceNo"
              placeholder="Enter reference number"
              {...register("referenceNo", { 
                required: "Reference number is required",
                minLength: {
                  value: 2,
                  message: "Reference number must be at least 2 characters long"
                }
              })}
            />
            {errors.referenceNo && (
              <p className="text-sm text-red-600 mt-1">{errors.referenceNo.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="publicationDate">Publication Date</Label>
            <Input
              id="publicationDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("publicationDate", {
                validate: (value) => {
                  if (value && new Date(value) > new Date()) {
                    return "Publication date cannot be in the future"
                  }
                  return true
                }
              })}
            />
            {errors.publicationDate && (
              <p className="text-sm text-red-600 mt-1">{errors.publicationDate.message?.toString()}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            placeholder="Enter registry link (optional)"
            {...register("link", {
              validate: (value) => {
                if (value && value.trim() !== "") {
                  try {
                    new URL(value)
                    return true
                  } catch {
                    return "Please enter a valid URL"
                  }
                }
                return true
              }
            })}
          />
          {errors.link && (
            <p className="text-sm text-red-600 mt-1">{errors.link.message?.toString()}</p>
          )}
        </div>

        {isEdit && Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
          <div className="mt-4">
            <DocumentViewer
              documentUrl={formData.supportingDocument[0]}
              documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ""}
            />
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/research-contributions?tab=copyrights")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Copyright
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
