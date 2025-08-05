"use client"

import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import FileUpload from "../shared/FileUpload"
import { DocumentViewer } from "../document-viewer"
import { Save, Brain, Loader2 } from "lucide-react"

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
}: AcademicTalkFormProps) {
    const router = useRouter()
    const { register, handleSubmit, setValue, watch, formState: { errors } } = form
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
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="programme">Programme *</Label>
                        <Select
                            value={formData.programme}
                            onValueChange={(value) => setValue("programme", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select programme type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Guest Lecture">Guest Lecture</SelectItem>
                                <SelectItem value="Keynote Speech">Keynote Speech</SelectItem>
                                <SelectItem value="Invited Talk">Invited Talk</SelectItem>
                                <SelectItem value="Panel Discussion">Panel Discussion</SelectItem>
                                <SelectItem value="Workshop">Workshop</SelectItem>
                                <SelectItem value="Seminar">Seminar</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="place">Place *</Label>
                        <Input
                            id="place"
                            placeholder="Enter place of talk"
                            {...register("place", { required: "Place is required" })}
                        />
                        {errors.place && <p className="text-sm text-red-600">{errors.place.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="talkDate">Talk Date *</Label>
                        <Input
                            id="talkDate"
                            type="date"
                            {...register("talkDate", { required: "Talk date is required" })}
                        />
                        {errors.talkDate && <p className="text-sm text-red-600">{errors.talkDate.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="titleOfEvent">Title of Event/Talk *</Label>
                        <Input
                            id="titleOfEvent"
                            placeholder="Enter title"
                            {...register("titleOfEvent", { required: "Title is required" })}
                        />
                        {errors.titleOfEvent && <p className="text-sm text-red-600">{errors.titleOfEvent.message?.toString()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="participatedAs">Participated As *</Label>
                        <Select
                            value={formData.participatedAs}
                            onValueChange={(value) => setValue("participatedAs", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Speaker">Speaker</SelectItem>
                                <SelectItem value="Keynote Speaker">Keynote Speaker</SelectItem>
                                <SelectItem value="Guest Speaker">Guest Speaker</SelectItem>
                                <SelectItem value="Invited Speaker">Invited Speaker</SelectItem>
                                <SelectItem value="Panelist">Panelist</SelectItem>
                                <SelectItem value="Moderator">Moderator</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
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
