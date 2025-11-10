"use client"

import { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
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
}: AcademicTalkFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form
    const formData = watch()

    useEffect(() => {
        if (isEdit && editData) {
            Object.entries(editData).forEach(([key, value]) => {
                setValue(key, value)
            })
        }
    }, [isEdit, editData, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <Label className="text-lg font-semibold mb-3 block">Step 1: Upload Supporting Document</Label>
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
                            className="flex items-center gap-2"
                        >
                            {isExtracting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Extracting...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4" />
                                    Extract Information
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-lg font-semibold mb-4 block">Step 2: Verify/Complete Details</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input 
                            id="name" 
                            placeholder="Enter your name"
                            {...register("name", { 
                                required: "Name is required",
                                minLength: { value: 2, message: "Name must be at least 2 characters" },
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
                            rules={{ required: "Programme is required" }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={talksProgrammeTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
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
                                    if (value && new Date(value) > new Date()) {
                                        return "Talk date cannot be in the future"
                                    }
                                    if (value && new Date(value).getFullYear() < 1900) {
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
                            {...register("title", { 
                                required: "Title is required",
                                minLength: { value: 2, message: "Title must be at least 2 characters" },
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
                            rules={{ required: "Participated As is required" }}
                            render={({ field }) => (
                                <SearchableSelect
                                    options={talksParticipantTypeOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select role"
                                    emptyMessage="No role found"
                                />
                            )}
                        />
                        {errors.participated_as && <p className="text-sm text-red-600 mt-1">{errors.participated_as.message?.toString()}</p>}
                    </div>
                </div>

                {isEdit && (
                    <div className="mt-6">
                        {Array.isArray(formData.supportingDocument) && formData.supportingDocument.length > 0 && (
                            <DocumentViewer
                                documentUrl={formData.supportingDocument[0]}
                                documentType={formData.supportingDocument[0].split('.').pop()?.toLowerCase() || ''}
                            />
                        )}
                    </div>
                )}

                {!isEdit && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.push("/teacher/research-contributions?tab=academic-talks")}>
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
