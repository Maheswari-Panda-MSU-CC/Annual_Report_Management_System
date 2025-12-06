"use client"

import { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { Save, Brain, Loader2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DropdownOption } from "@/hooks/use-dropdowns"

interface AcademicTalkFormProps {
    form: UseFormReturn<any>
    onSubmit: (data: any) => void
    isSubmitting: boolean
    isExtracting?: boolean
    selectedFiles?: FileList | null
    handleFileSelect?: (files: FileList | null) => void
    handleExtractInfo?: () => void
    isEdit?: boolean
    editData?: Record<string, any>
    talksProgrammeTypeOptions?: DropdownOption[]
    talksParticipantTypeOptions?: DropdownOption[]
    onClearFields?: () => void
    onCancel?: () => void
}

export function AcademicTalkForm({
    form,
    onSubmit,
    isSubmitting,
    isExtracting = false,
    selectedFiles = null,
    handleFileSelect = () => { },
    handleExtractInfo = () => { },
    isEdit = false,
    editData = {},
    talksProgrammeTypeOptions = [],
    talksParticipantTypeOptions = [],
    onClearFields,
    onCancel,
}: AcademicTalkFormProps) {
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
            // Set document URL if exists (talks uses Image field)
            if (editData.Image || editData.supporting_doc) {
                const docUrl = editData.Image || editData.supporting_doc
                setDocumentUrl(docUrl)
                setValue("supporting_doc", docUrl, { shouldValidate: false })
                setValue("Image", docUrl, { shouldValidate: false })
            }
        }
    }, [isEdit, editData, setValue])

    // Sync documentUrl with form state (for auto-fill from smart document analyzer)
    // Talks uses both supporting_doc and Image fields
    // Only sync if the document URL exists and is not empty
    useEffect(() => {
        const formDocUrl = formData.supporting_doc || formData.Image
        if (formDocUrl && formDocUrl.trim() !== "" && formDocUrl !== documentUrl) {
            setDocumentUrl(formDocUrl)
        } else if ((!formData.supporting_doc || formData.supporting_doc.trim() === "") && 
                   (!formData.Image || formData.Image.trim() === "")) {
            // Clear document URL if both form state fields are empty
            if (documentUrl) {
                setDocumentUrl(undefined)
            }
        }
    }, [formData.supporting_doc, formData.Image, documentUrl])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
                <DocumentUpload
                    documentUrl={documentUrl}
                    category="Talks"
                    subCategory="Talks of Academic/Research Nature"
                    onChange={(url) => {
                        setDocumentUrl(url)
                        setValue("supporting_doc", url, { shouldValidate: true })
                        setValue("Image", url, { shouldValidate: true }) // Talks uses Image field
                    }}
                    onExtract={(fields) => {
                        // DocumentUpload already handles extraction and stores data in context
                        // useAutoFillData hook will automatically fill the form
                        // We just need to set the extracted values directly here
                        Object.entries(fields).forEach(([key, value]) => {
                            setValue(key, value)
                        })
                        // Don't call handleExtractInfo - it uses old API and causes false errors
                    }}
                    allowedFileTypes={["pdf", "jpg", "jpeg", "png"]}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    className="w-full"
                    isEditMode={isEdit}
                    onClearFields={onClearFields}
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
                <input
                    type="hidden"
                    {...register("Image", {
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
                {errors.Image && (
                    <p className="text-sm text-red-600 mt-1">{errors.Image.message?.toString()}</p>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Details</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input 
                            id="name" 
                            placeholder="Enter your name"
                            maxLength={1000}
                            {...register("name", { 
                                required: "Name is required",
                                minLength: { value: 2, message: "Name must be at least 2 characters" },
                                maxLength: { value: 1000, message: "Name must not exceed 1000 characters" },
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
                        <Label htmlFor="programme">Programme *</Label>
                        <Controller
                            name="programme"
                            control={control}
                            rules={{ 
                                required: "Programme is required",
                                validate: (value) => {
                                    if (!value || value === "" || value === null || value === undefined) {
                                        return "Programme is required"
                                    }
                                    return true
                                }
                            }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={talksProgrammeTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear error when value is selected
                                        if (value) {
                                            form.clearErrors("programme")
                                        }
                                    }}
                                    placeholder="Select programme type"
                                    emptyMessage="No programme type found"
                                />
                            )}
                        />
                        {errors.programme && <p className="text-sm text-red-600 mt-1">{errors.programme.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="place">Place *</Label>
                        <Input 
                            id="place" 
                            placeholder="Enter place of talk"
                            maxLength={1000}
                            {...register("place", { 
                                required: "Place is required",
                                minLength: { value: 2, message: "Place must be at least 2 characters" },
                                maxLength: { value: 1000, message: "Place must not exceed 1000 characters" },
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
                        <Label htmlFor="date">Talk Date *</Label>
                        <Input 
                            id="date" 
                            type="date" 
                            max={new Date().toISOString().split('T')[0]}
                            {...register("date", { 
                                required: "Talk date is required",
                                validate: (value) => {
                                    if (!value) {
                                        return "Talk date is required"
                                    }
                                    const date = new Date(value)
                                    const today = new Date()
                                    today.setHours(23, 59, 59, 999)
                                    
                                    if (date > today) {
                                        return "Talk date cannot be in the future"
                                    }
                                    if (date.getFullYear() < 1900) {
                                        return "Talk date must be after 1900"
                                    }
                                    return true
                                }
                            })} 
                        />
                        {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title of Event/Talk *</Label>
                        <Input 
                            id="title" 
                            placeholder="Enter title"
                            maxLength={1000}
                            {...register("title", { 
                                required: "Title is required",
                                minLength: { value: 2, message: "Title must be at least 2 characters" },
                                maxLength: { value: 1000, message: "Title must not exceed 1000 characters" },
                                validate: (value) => {
                                    if (value && value.trim().length < 2) {
                                        return "Title cannot be only whitespace"
                                    }
                                    return true
                                }
                            })} 
                        />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="participated_as">Participated As *</Label>
                        <Controller
                            name="participated_as"
                            control={control}
                            rules={{ 
                                required: "Participated As is required",
                                validate: (value) => {
                                    if (!value || value === "" || value === null || value === undefined) {
                                        return "Participated As is required"
                                    }
                                    return true
                                }
                            }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={talksParticipantTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear error when value is selected
                                        if (value) {
                                            form.clearErrors("participated_as")
                                        }
                                    }}
                                    placeholder="Select role"
                                    emptyMessage="No role found"
                                />
                            )}
                        />
                        {errors.participated_as && <p className="text-sm text-red-600 mt-1">{errors.participated_as.message?.toString()}</p>}
                    </div>
                </div>


                {!isEdit && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/teacher/research-contributions?tab=academic-talks"))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Add Academic Talk
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </form>
    )
}
