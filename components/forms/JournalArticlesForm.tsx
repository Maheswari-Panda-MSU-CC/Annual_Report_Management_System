"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface JournalArticlesFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  resPubLevelOptions?: DropdownOption[]
  journalEditedTypeOptions?: DropdownOption[]
}

const currencyOptions = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
]

export function JournalArticlesForm({
  form,
  onSubmit,
  isSubmitting,
  isExtracting = false,
  selectedFiles = null,
  handleFileSelect = () => {},
  handleExtractInfo = () => {},
  isEdit = false,
  editData = {},
  resPubLevelOptions = [],
  journalEditedTypeOptions = [],
}: JournalArticlesFormProps) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

  const editDataString = JSON.stringify(editData || {})
  
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      const data = JSON.parse(editDataString)
      
      // Check if we need to wait for dropdowns
      const hasTypeValue = data.type !== null && data.type !== undefined
      const hasLevelValue = data.level !== null && data.level !== undefined
      const needsTypeDropdown = hasTypeValue && journalEditedTypeOptions.length === 0
      const needsLevelDropdown = hasLevelValue && resPubLevelOptions.length === 0
      
      // If we have dropdown values but dropdowns aren't loaded, wait
      if (needsTypeDropdown || needsLevelDropdown) {
        return // Don't set values yet, wait for dropdowns
      }
      
      // Set all values, ensuring type and level are numbers
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'type' || key === 'level') {
          // Ensure these are numbers for dropdown matching
          const numValue = value !== null && value !== undefined ? Number(value) : null
          setValue(key, numValue, { shouldDirty: false, shouldValidate: false, shouldTouch: false })
        } else {
          setValue(key, value, { shouldDirty: false, shouldValidate: false, shouldTouch: false })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editDataString, setValue, journalEditedTypeOptions.length, resPubLevelOptions.length])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Journal Article Details" : "Journal Article Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter journal title"
              maxLength={1000}
              {...register("title", {
                required: "Title is required",
                minLength: { value: 2, message: "Title must be at least 2 characters" },
                maxLength: { value: 1000, message: "Title must not exceed 1000 characters" },
              })}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issn">ISSN (Without -)</Label>
            <Input
              id="issn"
              placeholder="Enter ISSN without dashes"
              maxLength={100}
              {...register("issn", {
                maxLength: { value: 100, message: "ISSN must not exceed 100 characters" },
              })}
            />
            {errors.issn && <p className="text-sm text-red-600 mt-1">{errors.issn.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eISSN">E-ISSN (Without -)</Label>
            <Input
              id="eISSN"
              placeholder="Enter E-ISSN without dashes"
              maxLength={100}
              {...register("eISSN", {
                maxLength: { value: 100, message: "E-ISSN must not exceed 100 characters" },
              })}
            />
            {errors.eISSN && <p className="text-sm text-red-600 mt-1">{errors.eISSN.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume_num">Volume No.</Label>
            <Input
              id="volume_num"
              type="number"
              placeholder="Enter volume number"
              {...register("volume_num", {
                min: { value: 1, message: "Volume number must be at least 1" },
              })}
            />
            {errors.volume_num && <p className="text-sm text-red-600 mt-1">{errors.volume_num.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisherName">Publisher's Name</Label>
            <Input
              id="publisherName"
              placeholder="Enter publisher name"
              maxLength={1000}
              {...register("publisherName", {
                maxLength: { value: 1000, message: "Publisher name must not exceed 1000 characters" },
              })}
            />
            {errors.publisherName && <p className="text-sm text-red-600 mt-1">{errors.publisherName.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Controller
              name="type"
              control={control}
              rules={{
                required: "Type is required",
                validate: (value) => {
                  if (value === null || value === undefined) {
                    return "Type is required"
                  }
                  // Verify the option exists in the options array
                  const optionExists = journalEditedTypeOptions.some(opt => opt.id === Number(value))
                  if (!optionExists && journalEditedTypeOptions.length > 0) {
                    return "Please select a valid type"
                  }
                  return true
                }
              }}
              render={({ field }) => {
                // Convert value to number and find the matching option
                const fieldValue = field.value !== null && field.value !== undefined ? Number(field.value) : null
                
                // Find the selected option from journalEditedTypeOptions to ensure it exists
                const selectedOption = journalEditedTypeOptions.find(opt => opt.id === fieldValue)
                
                // Use the option's id if found, otherwise use null/undefined
                const valueToPass = selectedOption ? selectedOption.id : (fieldValue !== null ? fieldValue : undefined)
                
                return (
                  <SearchableSelect
                    options={journalEditedTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                    value={valueToPass}
                    onValueChange={(val) => {
                      const numValue = val !== null && val !== undefined ? Number(val) : null
                      field.onChange(numValue)
                    }}
                    placeholder="Select type"
                    emptyMessage="No type found"
                  />
                )
              }}
            />
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={resPubLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peer_reviewed">Peer Reviewed?</Label>
            <Controller
              name="peer_reviewed"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="peer_reviewed"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="peer_reviewed" className="font-normal">Yes</Label>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="h_index">H Index</Label>
            <Input
              id="h_index"
              type="number"
              step="0.0001"
              placeholder="Enter H Index"
              {...register("h_index", {
                min: { value: 0, message: "H Index must be non-negative" },
              })}
            />
            {errors.h_index && <p className="text-sm text-red-600 mt-1">{errors.h_index.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact_factor">Impact Factor</Label>
            <Input
              id="impact_factor"
              type="number"
              step="0.0001"
              placeholder="Enter impact factor"
              {...register("impact_factor", {
                min: { value: 0, message: "Impact factor must be non-negative" },
              })}
            />
            {errors.impact_factor && <p className="text-sm text-red-600 mt-1">{errors.impact_factor.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doi">DOI</Label>
            <Input
              id="doi"
              placeholder="Enter DOI"
              {...register("doi")}
            />
            {errors.doi && <p className="text-sm text-red-600 mt-1">{errors.doi.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noofIssuePerYr">No. of Issues per Year</Label>
            <Input
              id="noofIssuePerYr"
              type="number"
              placeholder="Enter number of issues per year"
              {...register("noofIssuePerYr", {
                min: { value: 1, message: "Number of issues must be at least 1" },
                max: { value: 255, message: "Number of issues must not exceed 255" },
              })}
            />
            {errors.noofIssuePerYr && <p className="text-sm text-red-600 mt-1">{errors.noofIssuePerYr.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              placeholder="Enter price"
              {...register("price", {
                min: { value: 0, message: "Price must be non-negative" },
              })}
            />
            {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={currencyOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select currency"
                  emptyMessage="No currency found"
                />
              )}
            />
            {errors.currency && <p className="text-sm text-red-600 mt-1">{errors.currency.message?.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <Controller
              name="in_scopus"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="in_scopus"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="in_scopus" className="font-normal">In Scopus?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="in_ugc"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="in_ugc"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="in_ugc" className="font-normal">In UGC CARE?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="in_clarivate"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="in_clarivate"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="in_clarivate" className="font-normal">In CLARIVATE?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="in_oldUGCList"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="in_oldUGCList"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="in_oldUGCList" className="font-normal">In Old UGC List?</Label>
          </div>
        </div>
      </div>

      {!isEdit && (
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Journal Article
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

