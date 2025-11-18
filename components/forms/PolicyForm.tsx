"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "../document-viewer"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PolicyFormProps } from "@/types/interfaces"

export default function PolicyForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  resPubLevelOptions: propResPubLevelOptions,
}: PolicyFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    isEdit && editData?.supportingDocument?.[0] ? editData.supportingDocument[0] : undefined
  )

  // Use props if provided, otherwise fetch from hook
  const { resPubLevelOptions: hookResPubLevelOptions, fetchResPubLevels } = useDropDowns()
  
  const resPubLevelOptions = propResPubLevelOptions || hookResPubLevelOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propResPubLevelOptions && hookResPubLevelOptions.length === 0) {
      fetchResPubLevels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Set initial values when in edit mode - optimized to reset and set all values at once
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      // Reset form first to clear any previous values
      form.reset()
      
      // Prepare all form values
      const formValues: any = {}
      
      if (editData.title) formValues.title = editData.title
      if (editData.levelId !== undefined && editData.levelId !== null) {
        formValues.level = editData.levelId
      } else if (editData.level) {
        // If level is a string, find matching ID
        const levelOption = resPubLevelOptions.find(l => l.name === editData.level)
        if (levelOption) formValues.level = levelOption.id
      }
      if (editData.organisation) formValues.organisation = editData.organisation
      if (editData.date) formValues.date = editData.date
      if (editData.supportingDocument) {
        formValues.supportingDocument = editData.supportingDocument
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form, resPubLevelOptions])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (handleExtractInfo) {
      handleExtractInfo()
    }
    if (fields.title) setValue("title", fields.title)
    if (fields.level) setValue("level", fields.level)
    if (fields.organisation) setValue("organisation", fields.organisation)
    if (fields.date) setValue("date", fields.date)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
              <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Policy Document *</Label>
              <DocumentUpload
                documentUrl={documentUrl}
                category="research-contributions"
                subCategory="policy"
                onChange={(url) => {
                  setDocumentUrl(url)
                  setValue("supportingDocument", url ? [url] : [])
                }}
                onExtract={handleExtractedFields}
                className="w-full"
              />
            </div>
      

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input id="title" placeholder="Enter policy title" className="text-sm sm:text-base h-9 sm:h-10 mt-1" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="level" className="text-sm sm:text-base">Level *</Label>
            <Controller
              control={control}
              name="level"
              rules={{ required: "Level is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={resPubLevelOptions.map((l) => ({
                    value: l.id,
                    label: l.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.level && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="organisation" className="text-sm sm:text-base">Organisation *</Label>
            <Input id="organisation" placeholder="Enter organisation" className="text-sm sm:text-base h-9 sm:h-10 mt-1" {...register("organisation", { required: "Organisation is required" })} />
            {errors.organisation && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.organisation.message?.toString()}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="text-sm sm:text-base">Date *</Label>
          <Input id="date" type="date" className="text-sm sm:text-base h-9 sm:h-10 mt-1" {...register("date", { required: "Date is required" })} />
          {errors.date && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
        </div>


       {
        !isEdit && 
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/research-contributions?tab=policy")}
          disabled={isSubmitting || isExtracting}
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
          <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {isEdit ? "Update Policy" : "Add Policy Document"}
        </Button>
      </div>
       }
      </div>
    </form>
  )
}
