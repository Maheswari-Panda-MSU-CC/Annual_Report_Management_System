"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface BooksFormProps {
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
  bookTypeOptions?: DropdownOption[]
}

const currencyOptions = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
]

export function BooksForm({
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
  bookTypeOptions = [],
}: BooksFormProps) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
  const formData = watch()

  const editDataString = JSON.stringify(editData || {})
  
  useEffect(() => {
    if (isEdit && editData && Object.keys(editData).length > 0) {
      const data = JSON.parse(editDataString)
      Object.entries(data).forEach(([key, value]) => {
        setValue(key, value, { shouldDirty: false, shouldValidate: false })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editDataString, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-lg font-semibold mb-4 block">
          {isEdit ? "Edit Book Details" : "Book Details"}
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter book title"
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
            <Label htmlFor="authors">Author(s)</Label>
            <Input
              id="authors"
              placeholder="Enter author names"
              {...register("authors")}
            />
            {errors.authors && <p className="text-sm text-red-600 mt-1">{errors.authors.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN (Without -)</Label>
            <Input
              id="isbn"
              placeholder="Enter ISBN without dashes"
              maxLength={1000}
              {...register("isbn", {
                maxLength: { value: 1000, message: "ISBN must not exceed 1000 characters" },
                validate: {
                  noDashes: (value) => {
                    if (!value) return true // Allow empty
                    if (value.includes("-")) {
                      return "ISBN should not contain dashes. Please remove all dashes."
                    }
                    return true
                  },
                },
              })}
              onChange={(e) => {
                // Remove dashes on input
                const value = e.target.value.replace(/-/g, "")
                if (value !== e.target.value) {
                  e.target.value = value
                  form.setValue("isbn", value, { shouldValidate: true })
                }
              }}
            />
            {errors.isbn && <p className="text-sm text-red-600 mt-1">{errors.isbn.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher_name">Publisher Name</Label>
            <Input
              id="publisher_name"
              placeholder="Enter publisher name"
              maxLength={3000}
              {...register("publisher_name", {
                maxLength: { value: 3000, message: "Publisher name must not exceed 3000 characters" },
              })}
            />
            {errors.publisher_name && <p className="text-sm text-red-600 mt-1">{errors.publisher_name.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishing_level">Publishing Level</Label>
            <Controller
              name="publishing_level"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={resPubLevelOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select publishing level"
                  emptyMessage="No level found"
                />
              )}
            />
            {errors.publishing_level && <p className="text-sm text-red-600 mt-1">{errors.publishing_level.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book_type">Book Type</Label>
            <Controller
              name="book_type"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={bookTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select book type"
                  emptyMessage="No book type found"
                />
              )}
            />
            {errors.book_type && <p className="text-sm text-red-600 mt-1">{errors.book_type.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edition">Edition</Label>
            <Input
              id="edition"
              placeholder="e.g., 3rd Edition"
              maxLength={10}
              {...register("edition", {
                maxLength: { value: 10, message: "Edition must not exceed 10 characters" },
              })}
            />
            {errors.edition && <p className="text-sm text-red-600 mt-1">{errors.edition.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Input
              id="volume"
              placeholder="Enter volume"
              maxLength={10}
              {...register("volume", {
                maxLength: { value: 10, message: "Volume must not exceed 10 characters" },
              })}
            />
            {errors.volume && <p className="text-sm text-red-600 mt-1">{errors.volume.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication_date">Publication Date</Label>
            <Input
              id="publication_date"
              type="date"
              {...register("publication_date")}
            />
            {errors.publication_date && <p className="text-sm text-red-600 mt-1">{errors.publication_date.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ebook">EBook</Label>
            <Input
              id="ebook"
              placeholder="Enter ebook information"
              maxLength={1000}
              {...register("ebook", {
                maxLength: { value: 1000, message: "EBook must not exceed 1000 characters" },
              })}
            />
            {errors.ebook && <p className="text-sm text-red-600 mt-1">{errors.ebook.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="digital_media">Digital Media (If any provided like Pendrive, CD/DVD)</Label>
            <Input
              id="digital_media"
              placeholder="e.g., USB Drive, CD/DVD"
              maxLength={300}
              {...register("digital_media", {
                maxLength: { value: 300, message: "Digital media must not exceed 300 characters" },
              })}
            />
            {errors.digital_media && <p className="text-sm text-red-600 mt-1">{errors.digital_media.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="approx_price">Approx. Price</Label>
            <Input
              id="approx_price"
              type="number"
              step="0.001"
              placeholder="Enter approximate price"
              {...register("approx_price", {
                min: { value: 0, message: "Price must be non-negative" },
              })}
            />
            {errors.approx_price && <p className="text-sm text-red-600 mt-1">{errors.approx_price.message?.toString()}</p>}
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

          <div className="space-y-2">
            <Label htmlFor="book_category">Book Category</Label>
            <Input
              id="book_category"
              placeholder="Enter book category"
              maxLength={30}
              {...register("book_category", {
                maxLength: { value: 30, message: "Book category must not exceed 30 characters" },
              })}
            />
            {errors.book_category && <p className="text-sm text-red-600 mt-1">{errors.book_category.message?.toString()}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposed_ay">Proposed AY</Label>
            <Input
              id="proposed_ay"
              placeholder="Enter proposed academic year"
              maxLength={20}
              {...register("proposed_ay", {
                maxLength: { value: 20, message: "Proposed AY must not exceed 20 characters" },
              })}
            />
            {errors.proposed_ay && <p className="text-sm text-red-600 mt-1">{errors.proposed_ay.message?.toString()}</p>}
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
                Save Book
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

