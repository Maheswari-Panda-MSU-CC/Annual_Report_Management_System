"use client"

import { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { useEffect, useState } from "react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface AcademicBodiesFormProps {
    form: UseFormReturn<any>
    onSubmit: (data: any) => void
    isSubmitting: boolean
    isExtracting?: boolean
    selectedFiles?: FileList | null
    handleFileSelect?: (files: FileList | null) => void
    handleExtractInfo?: () => void
    isEdit?: boolean
    editData?: Record<string, any>
    reportYearsOptions?: DropdownOption[]
}

export function AcademicBodiesForm({
    form,
    onSubmit,
    isSubmitting,
    isExtracting = false,
    selectedFiles = null,
    handleFileSelect = () => {},
    handleExtractInfo = () => {},
    isEdit = false,
    editData = {},
    reportYearsOptions = [],
}: AcademicBodiesFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                <DocumentUpload
                    documentUrl={documentUrl}
                    category="talks-events"
                    subCategory="academic-bodies"
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
                        <Label htmlFor="acad_body">Academic Body *</Label>
                        <Input 
                            id="acad_body" 
                            placeholder="Enter academic body"
                            maxLength={500}
                            {...register("acad_body", { 
                                required: "Academic body is required",
                                minLength: { value: 2, message: "Academic body must be at least 2 characters" },
                                maxLength: { value: 500, message: "Academic body must not exceed 500 characters" },
                                validate: (value) => {
                                    if (value && value.trim().length < 2) {
                                        return "Academic body cannot be only whitespace"
                                    }
                                    return true
                                }
                            })} 
                        />
                        {errors.acad_body && <p className="text-sm text-red-600 mt-1">{errors.acad_body.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="place">Place *</Label>
                        <Input 
                            id="place" 
                            placeholder="Enter location"
                            maxLength={150}
                            {...register("place", { 
                                required: "Place is required",
                                minLength: { value: 2, message: "Place must be at least 2 characters" },
                                maxLength: { value: 150, message: "Place must not exceed 150 characters" },
                                validate: (value) => {
                                    if (value && value.trim().length < 2) {
                                        return "Place cannot be only whitespace"
                                    }
                                    return true
                                }
                            })} 
                        />
                        {errors.place && <p className="text-sm text-red-600 mt-1">{errors.place.message?.toString()}</p>}
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


                {!isEdit && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/teacher/research-contributions?tab=academic-bodies")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Add Academic Body
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
