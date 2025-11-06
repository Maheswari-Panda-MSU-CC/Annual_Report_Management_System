"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { Save } from "lucide-react"
import FileUpload from "../shared/FileUpload"
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
      if (editData.supportingDocument) formValues.supportingDocument = editData.supportingDocument
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form, resPubLevelOptions])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Policy Document</Label>
                    <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.doc,.docx" />
                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-green-600">{selectedFiles[0].name}</p>
                            <Button type="button" variant="outline" size="sm" onClick={handleExtractInfo} disabled={isExtracting}>
                                {isExtracting ? "Extracting..." : "Extract Information"}
                            </Button>
                            </div>
                        )}
            </div>
      

      <div className="bg-gray-50 p-4 rounded-lg space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="Enter policy title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="level">Level *</Label>
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
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="organisation">Organisation *</Label>
            <Input id="organisation" placeholder="Enter organisation" {...register("organisation", { required: "Organisation is required" })} />
            {errors.organisation && <p className="text-sm text-red-600 mt-1">{errors.organisation.message?.toString()}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...register("date", { required: "Date is required" })} />
          {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
        </div>

        {/* Optional: Show document viewer in edit mode */}
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

       {
        !isEdit && 
        <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/research-contributions?tab=policy")}
          disabled={isSubmitting || isExtracting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? "Update Policy" : "Add Policy Document"}
        </Button>
      </div>
       }
      </div>
    </form>
  )
}
