"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { ConsultancyFormProps } from "@/types/interfaces"

export function ConsultancyForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
}: ConsultancyFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const formData = watch()

  // Set initial values when in edit mode - optimized to reset and set all values at once
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      // Reset form first to clear any previous values
      form.reset()
      
      // Prepare all form values
      const formValues: any = {}
      
      if (editData.name) formValues.title = editData.name
      if (editData.collaborating_inst) formValues.collaboratingInstitute = editData.collaborating_inst
      if (editData.address) formValues.address = editData.address
      if (editData.Start_Date) formValues.startDate = editData.Start_Date
      if (editData.duration !== undefined && editData.duration !== null) formValues.duration = editData.duration
      if (editData.amount) formValues.amount = editData.amount
      if (editData.outcome) formValues.detailsOutcome = editData.outcome
      if (editData.supportingDocument) formValues.supportingDocument = editData.supportingDocument
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Consultancy Document</Label>
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
        <Label className="text-lg font-semibold mb-4 block">Step 2: Fill Consultancy Details</Label>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter consultancy project title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="collaboratingInstitute">Collaborating Institute *</Label>
            <Input
              id="collaboratingInstitute"
              placeholder="Enter institute/industry name"
              {...register("collaboratingInstitute", { required: "Collaborating Institute is required" })}
            />
            {errors.collaboratingInstitute && (
              <p className="text-sm text-red-600 mt-1">{errors.collaboratingInstitute.message?.toString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="Enter address"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate", { required: "Start date is required" })}
            />
            {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="duration">Duration (in Months)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration"
              {...register("duration")}
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              {...register("amount")}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="detailsOutcome">Details / Outcome</Label>
          <Textarea
            id="detailsOutcome"
            placeholder="Enter details about the consultancy project and its outcomes"
            rows={4}
            {...register("detailsOutcome")}
          />
        </div>

        {isEdit && (
          <div className="mt-4">
            {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
              <div className="mt-4">
                <Label>Supporting Document</Label>
                <div className="mt-2 border rounded-lg p-4">
                  <DocumentViewer
                    documentUrl={formData.supportingDocument[0]}
                    documentType={formData.supportingDocument[0]?.split('.').pop()?.toLowerCase() || 'pdf'}
                    documentName={formData.title || "Document"}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!isEdit && (
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/research-contributions?tab=consultancy")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Consultancy" : "Add Consultancy"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
