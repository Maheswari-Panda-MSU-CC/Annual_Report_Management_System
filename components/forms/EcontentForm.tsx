"use client"

import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useDropDowns } from "@/hooks/use-dropdowns"
import FileUpload from "../shared/FileUpload"
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
}: EContentFormProps) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

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
        <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Document</Label>
        <FileUpload onFileSelect={handleFileSelect} />
        {selectedFiles && (
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
        <Label className="text-lg font-semibold mb-4 block">Step 2: Fill E-Content Info</Label>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter e-content title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="typeOfEContentPlatform">Platform (E-Content Type) *</Label>
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
            {errors.typeOfEContentPlatform && <p className="text-sm text-red-600 mt-1">{errors.typeOfEContentPlatform.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="quadrant">Quadrant *</Label>
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
            {errors.quadrant && <p className="text-sm text-red-600 mt-1">{errors.quadrant.message?.toString()}</p>}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="briefDetails">Brief Details *</Label>
          <Textarea
            id="briefDetails"
            placeholder="Enter brief details"
            {...register("briefDetails", { required: "Brief details are required" })}
          />
          {errors.briefDetails && <p className="text-sm text-red-600 mt-1">{errors.briefDetails.message?.toString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="publishingDate">Publishing Date *</Label>
            <Input
              id="publishingDate"
              type="date"
              {...register("publishingDate", { required: "Publishing date is required" })}
            />
            {errors.publishingDate && <p className="text-sm text-red-600 mt-1">{errors.publishingDate.message?.toString()}</p>}
          </div>

          <div>
            <Label htmlFor="publishingAuthorities">Publishing Authorities *</Label>
            <Input
              id="publishingAuthorities"
              placeholder="Enter publishing authorities"
              {...register("publishingAuthorities", { required: "Publishing authorities are required" })}
            />
            {errors.publishingAuthorities && <p className="text-sm text-red-600 mt-1">{errors.publishingAuthorities.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="Enter link"
              {...register("link")}
            />
          </div>

          <div>
            <Label htmlFor="typeOfEContent">Type of E-Content (Type Econtent Value)</Label>
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

       {!isEdit &&
         <div className="flex justify-end gap-4 mt-6">
         <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=econtent")}>
           Cancel
         </Button>
         <Button type="submit" disabled={isSubmitting}>
           {isSubmitting ? "Submitting..." : (
             <>
               <Save className="h-4 w-4 mr-2" />
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
