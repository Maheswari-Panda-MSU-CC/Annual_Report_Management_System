"use client"

import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "../document-viewer"
import { EContentFormProps } from "@/types/interfaces"

export function EContentForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  eContentTypeOptions: propEContentTypeOptions,
  typeEcontentValueOptions: propTypeEcontentValueOptions,
  initialDocumentUrl,
}: EContentFormProps & { initialDocumentUrl?: string }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(
    initialDocumentUrl || // Use initial document URL from auto-fill first
    (isEdit && editData?.supportingDocument?.[0] ? editData.supportingDocument[0] : undefined)
  )

  // Update documentUrl when initialDocumentUrl changes
  // Always update if initialDocumentUrl is provided and different from current value
  // This handles cases where autoFillDocumentUrl becomes available after component mount
  // CRITICAL: Also update form field for validation
  useEffect(() => {
    if (initialDocumentUrl) {
      // Always update documentUrl if it's different
      if (documentUrl !== initialDocumentUrl) {
        setDocumentUrl(initialDocumentUrl)
      }
      // CRITICAL FIX: Check form field value, not just state comparison
      // On initial mount, documentUrl === initialDocumentUrl, so we need to check form field
      const currentFormValue = form.getValues("supportingDocument")
      const formValueIsEmpty = !currentFormValue || 
                             (Array.isArray(currentFormValue) && currentFormValue.length === 0) ||
                             (Array.isArray(currentFormValue) && !currentFormValue[0])
      
      if (formValueIsEmpty) {
        setValue("supportingDocument", [initialDocumentUrl], { shouldValidate: false, shouldDirty: false })
      }
    }
  }, [initialDocumentUrl, documentUrl, setValue, form])

  // Use props if provided, otherwise fetch from hook
  const { eContentTypeOptions: hookEContentTypeOptions, typeEcontentValueOptions: hookTypeEcontentValueOptions, fetchEContentTypes, fetchTypeEcontentValues } = useDropDowns()
  
  const eContentTypeOptions = propEContentTypeOptions || hookEContentTypeOptions
  const typeEcontentValueOptions = propTypeEcontentValueOptions || hookTypeEcontentValueOptions

  // Only fetch if props are not provided and options are empty
  useEffect(() => {
    if (!propEContentTypeOptions && hookEContentTypeOptions.length === 0) {
      fetchEContentTypes()
    }
    if (!propTypeEcontentValueOptions && hookTypeEcontentValueOptions.length === 0) {
      fetchTypeEcontentValues()
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
      if (editData.Brief_Details) formValues.briefDetails = editData.Brief_Details
      if (editData.Quadrant !== undefined && editData.Quadrant !== null) formValues.quadrant = Number(editData.Quadrant)
      if (editData.Publishing_date) formValues.publishingDate = editData.Publishing_date
      if (editData.Publishing_Authorities) formValues.publishingAuthorities = editData.Publishing_Authorities
      if (editData.link) formValues.link = editData.link
      if (editData.e_content_type !== undefined && editData.e_content_type !== null) {
        formValues.typeOfEContentPlatform = editData.e_content_type
      }
      if (editData.type_econtent !== undefined && editData.type_econtent !== null) {
        formValues.typeOfEContent = editData.type_econtent
      }
      if (editData.supportingDocument) {
        formValues.supportingDocument = editData.supportingDocument
        setDocumentUrl(Array.isArray(editData.supportingDocument) ? editData.supportingDocument[0] : editData.supportingDocument)
      }
      
      // Set all values at once
      Object.keys(formValues).forEach((key) => {
        setValue(key, formValues[key], { shouldValidate: false, shouldDirty: false })
      })
    }
  }, [isEdit, editData, setValue, form])

  // Handle extracted fields from DocumentUpload
  const handleExtractedFields = (fields: Record<string, any>) => {
    if (handleExtractInfo) {
      handleExtractInfo()
    }
    if (fields.title) setValue("title", fields.title)
    if (fields.briefDetails) setValue("briefDetails", fields.briefDetails)
    if (fields.quadrant) setValue("quadrant", fields.quadrant)
    if (fields.publishingDate) setValue("publishingDate", fields.publishingDate)
    if (fields.publishingAuthorities) setValue("publishingAuthorities", fields.publishingAuthorities)
    if (fields.link) setValue("link", fields.link)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 mb-4 sm:mb-6">
        <Label className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 block">Step 1: Upload Document *</Label>
        <DocumentUpload
          documentUrl={documentUrl || initialDocumentUrl || undefined}
          category="research-contributions"
          subCategory="econtent"
          onChange={(url) => {
            setDocumentUrl(url)
            setValue("supportingDocument", url ? [url] : [])
          }}
          onExtract={handleExtractedFields}
          className="w-full"
        />
      </div>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-4 sm:space-y-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Step 2: Fill E-Content Info</Label>

        <div>
          <Label htmlFor="title" className="text-sm sm:text-base">Title *</Label>
          <Input
            id="title"
            placeholder="Enter e-content title"
            className="text-sm sm:text-base h-9 sm:h-10 mt-1"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="typeOfEContentPlatform" className="text-sm sm:text-base">Platform (E-Content Type) *</Label>
            <Controller
              control={control}
              name="typeOfEContentPlatform"
              rules={{ required: "Platform is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={eContentTypeOptions.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  placeholder="Select platform"
                  emptyMessage="No platform found"
                />
              )}
            />
            {errors.typeOfEContentPlatform && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.typeOfEContentPlatform.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="quadrant" className="text-sm sm:text-base">Quadrant *</Label>
            <Controller
              control={control}
              name="quadrant"
              rules={{ required: "Quadrant is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 3, label: "3" },
                    { value: 4, label: "4" },
                    { value: 5, label: "5" },
                    { value: 6, label: "6" },
                  ]}
                  value={field.value || ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  placeholder="Select quadrant"
                  emptyMessage="No quadrant found"
                />
              )}
            />
            {errors.quadrant && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.quadrant.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="briefDetails" className="text-sm sm:text-base">Brief Details *</Label>
          <Textarea
            id="briefDetails"
            placeholder="Enter brief details"
            className="text-sm sm:text-base mt-1"
            {...register("briefDetails", { required: "Brief details are required" })}
          />
          {errors.briefDetails && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.briefDetails.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="publishingDate" className="text-sm sm:text-base">Publishing Date *</Label>
            <Input
              id="publishingDate"
              type="date"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("publishingDate", { required: "Publishing date is required" })}
            />
            {errors.publishingDate && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publishingDate.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="publishingAuthorities" className="text-sm sm:text-base">Publishing Authorities *</Label>
            <Input
              id="publishingAuthorities"
              placeholder="Enter publishing authorities"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("publishingAuthorities", { required: "Publishing authorities are required" })}
            />
            {errors.publishingAuthorities && <p className="text-xs sm:text-sm text-red-600 mt-1">{errors.publishingAuthorities.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
          <div>
            <Label htmlFor="link" className="text-sm sm:text-base">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="Enter link"
              className="text-sm sm:text-base h-9 sm:h-10 mt-1"
              {...register("link")}
            />
          </div>

          <div>
            <Label htmlFor="typeOfEContent" className="text-sm sm:text-base">Type of E-Content (Type Econtent Value)</Label>
            <Controller
              control={control}
              name="typeOfEContent"
              render={({ field }) => (
                <SearchableSelect
                  options={typeEcontentValueOptions.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={field.value || ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  placeholder="Select type"
                  emptyMessage="No type found"
                />
              )}
            />
          </div>
        </div>


       {!isEdit &&
         <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t">
         <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=econtent")} className="w-full sm:w-auto text-xs sm:text-sm">
           Cancel
         </Button>
         <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm">
           {isSubmitting ? "Submitting..." : (
             <>
               <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
               {isEdit ? "Update E-Content" : "Add E-Content"}
             </>
           )}
         </Button>
       </div>
       }
      </div>
    </form>
  )
}
