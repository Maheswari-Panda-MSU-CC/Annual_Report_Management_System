"use client"

import React, { useMemo, useCallback, useRef } from "react"
import { Controller } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Edit, Plus, Trash2, Save, X, Loader2, Upload, FileText, Eye } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "@/components/document-viewer"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { EducationSectionProps } from "./types"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { EducationEntry } from "@/types/interfaces"

export function EducationDetailsSection({
  teacherId,
  educationForm,
  educationFields,
  educationEditingIds,
  isSavingEducation,
  educationDocumentUrls,
  educationDialogOpen,
  educationViewDialogOpen,
  hasAnyRecordEditing = false,
  onAddEntry,
  onSaveRow,
  onCancelRow,
  onDeleteRow,
  onToggleEdit,
  onDocumentUrlChange,
  onDialogOpenChange,
  onViewDialogOpenChange,
  degreeTypeOptions,
}: EducationSectionProps) {
  const { toast } = useToast()
  const { confirm, DialogComponent: UnsavedChangesDialog } = useConfirmationDialog()

  const handleDocumentSave = useCallback(async (index: number, id: number) => {
    const entry = educationForm.getValues(`educations.${index}`)
    const currentUrl = educationDocumentUrls[id] || entry.Image
    const originalImagePath = entry.Image // Track original path
    
    if (currentUrl) {
      // Only store local path - NO S3 upload here
      // S3 upload will happen when user clicks "Save" on the row
      if (currentUrl.startsWith('/uploaded-document/')) {
        // New document uploaded - store it for S3 upload on row save
        onDocumentUrlChange(id, currentUrl)
        onDialogOpenChange(id, false)
        toast({
          title: "Document Ready",
          description: "Document is ready. Click 'Save' on the row to upload to S3 and save the record.",
          duration: 3000,
        })
      } else if (currentUrl.startsWith("upload/")) {
        // Already an S3 path - only update state if it's different from original
        // This prevents unnecessary state updates when document hasn't changed
        if (currentUrl !== originalImagePath) {
          onDocumentUrlChange(id, currentUrl)
        }
        onDialogOpenChange(id, false)
      } else {
        toast({
          title: "Error",
          description: "Invalid document path.",
          variant: "destructive",
        })
      }
    }
  }, [educationForm, educationDocumentUrls, onDocumentUrlChange, onDialogOpenChange, toast])

  const handleCancel = useCallback(async (index: number, id: number) => {
    const hasChanges = educationForm.formState.dirtyFields.educations?.[index] || educationDocumentUrls[id]
    if (hasChanges) {
      const shouldDiscard = await confirm({
        title: "Discard Changes?",
        description: "You have unsaved changes. Are you sure you want to discard them?",
        confirmText: "Discard",
        cancelText: "Cancel",
      })
      if (!shouldDiscard) return
    }
    onCancelRow(index, id)
  }, [educationForm, educationDocumentUrls, confirm, onCancelRow])

  const handleDelete = useCallback(async (index: number, id: number) => {
    const entry = educationFields[index]
    const universityName = entry?.university_name || "this education entry"
    const docPath = entry?.Image || null
    
    const shouldDelete = await confirm({
      title: "Delete Education Entry?",
      description: `Are you sure you want to delete the education entry for "${universityName}"?${docPath && docPath.startsWith("upload/") ? " This will also delete the associated document from S3." : ""} This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    
    if (!shouldDelete) return

    try {
      // Call the parent's delete handler
      // The backend DELETE endpoint handles S3 deletion first, then database deletion
      // The parent component (page.tsx) shows detailed toasts for S3 and DB deletion
      await onDeleteRow(index, id)
    } catch (error: any) {
      // Error toast is already shown by parent's onDeleteRow
      // Just log the error, don't show another toast
      console.error('Error deleting education:', error)
    }
  }, [educationFields, confirm, onDeleteRow])

  // Handle save with document upload to S3
  const handleSaveWithDocument = useCallback(async (index: number, id: number) => {
    try {
      const entry = educationForm.getValues(`educations.${index}`)
      const localDocumentUrl = educationDocumentUrls[id]
      const originalImagePath = entry.Image // Get original document path from form
      
      // Only upload if there's a NEW local document URL (not an existing S3 path)
      // This ensures we only upload when user actually uploaded a new document
      const hasNewUpload = localDocumentUrl && localDocumentUrl.startsWith('/uploaded-document/')
      
      if (hasNewUpload) {
        try {
          // Use the proper S3 upload helper to get virtual path starting with "upload/"
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // Determine record ID - use existing ID if available, otherwise use temp ID
          const recordId = entry.gid && entry.gid <= 2147483647 ? entry.gid : id
          
          // Upload to S3 and get virtual path (starts with "upload/")
          const virtualPath = await uploadDocumentToS3(
            localDocumentUrl,
            teacherId,
            recordId,
            "Grad_Details" // Folder name for education documents
          )

          // Verify we got a valid S3 virtual path
          if (!virtualPath || !virtualPath.startsWith("upload/")) {
            // Check if it's a dummy URL (S3 not configured)
            if (virtualPath.includes("dummy_document") || virtualPath.includes("localhost") || 
                virtualPath.includes("http://") || virtualPath.includes("https://")) {
              throw new Error("S3 upload failed: Document was not uploaded successfully. Please check S3 configuration.")
            }
            throw new Error("S3 upload failed: Invalid virtual path returned. Please try uploading again.")
          }

          // Update the form value with S3 virtual path
          educationForm.setValue(`educations.${index}.Image`, virtualPath)
          
          // Update the document URL state
          onDocumentUrlChange(id, virtualPath)

          toast({
            title: "Document Uploaded",
            description: "Document uploaded to S3 successfully. Saving record...",
          })
        } catch (uploadError: any) {
          console.error('Error uploading document to S3:', uploadError)
          toast({
            title: "Document Upload Failed",
            description: uploadError.message || "Failed to upload document to S3. Record will be saved without document.",
            variant: "destructive",
          })
          // Don't continue with save if upload fails - user should retry
          return
        }
      } else if (localDocumentUrl && localDocumentUrl.startsWith("upload/")) {
        // Already an S3 path - only update form if it's different from original
        if (localDocumentUrl !== originalImagePath) {
          educationForm.setValue(`educations.${index}.Image`, localDocumentUrl)
        }
      } else if (!localDocumentUrl && originalImagePath) {
        // Document was cleared - keep original path (don't clear it on save)
        // User must explicitly delete the record to remove the document
        // Just proceed with save using original path
      }

      // Now call the parent's save handler (it will save the entry with the S3 path in Image field)
      await onSaveRow(index, id)
    } catch (error: any) {
      // Error is already handled by parent's onSaveRow
      console.error('Error saving education:', error)
    }
  }, [educationForm, educationDocumentUrls, onDocumentUrlChange, onSaveRow, toast, teacherId])

  // Create stable callback maps to prevent re-renders
  const viewDialogCallbacks = useMemo(() => {
    const callbacks: Record<number, (open: boolean) => void> = {}
    educationFields.forEach((field: any) => {
      callbacks[field.gid] = (open: boolean) => onViewDialogOpenChange(field.gid, open)
    })
    return callbacks
  }, [educationFields, onViewDialogOpenChange])

  const editDialogCallbacks = useMemo(() => {
    const callbacks: Record<number, (open: boolean) => void> = {}
    educationFields.forEach((field: any) => {
      callbacks[field.gid] = (open: boolean) => onDialogOpenChange(field.gid, open)
    })
    return callbacks
  }, [educationFields, onDialogOpenChange])

  const documentChangeCallbacks = useMemo(() => {
    const callbacks: Record<number, (url: string | null) => void> = {}
    educationFields.forEach((field: any) => {
      callbacks[field.gid] = (url: string | null) => {
        if (url) {
          onDocumentUrlChange(field.gid, url)
        }
      }
    })
    return callbacks
  }, [educationFields, onDocumentUrlChange])

  const documentClearCallbacks = useMemo(() => {
    const callbacks: Record<number, () => void> = {}
    educationFields.forEach((field: any) => {
      callbacks[field.gid] = () => onDocumentUrlChange(field.gid, null)
    })
    return callbacks
  }, [educationFields, onDocumentUrlChange])

  const documentSaveCallbacks = useMemo(() => {
    const callbacks: Record<string, () => void> = {}
    educationFields.forEach((field: any, index: number) => {
      callbacks[`${index}_${field.gid}`] = () => handleDocumentSave(index, field.gid)
    })
    return callbacks
  }, [educationFields, handleDocumentSave])

  const dialogCloseCallbacks = useMemo(() => {
    const callbacks: Record<number, () => void> = {}
    educationFields.forEach((field: any) => {
      callbacks[field.gid] = () => onDialogOpenChange(field.gid, false)
    })
    return callbacks
  }, [educationFields, onDialogOpenChange])

  // Use ref to track stable document URLs to prevent unnecessary re-renders
  const stableDocumentUrlsRef = useRef<Record<number, string | undefined>>({})
  const previousMemoizedRef = useRef<Record<number, string | undefined>>({})
  
  // Memoize document URLs per field - only update when URL actually changes
  // This prevents DocumentUpload from re-rendering when the prop value hasn't changed
  const memoizedDocumentUrls = useMemo(() => {
    const urls: Record<number, string | undefined> = {}
    let hasChanged = false
    
    educationFields.forEach((field: any) => {
      const eduUrl = educationDocumentUrls[field.gid]
      const entryImage = field.Image
      const currentUrl = eduUrl || entryImage || undefined
      const stableUrl = stableDocumentUrlsRef.current[field.gid]
      
      // Only update if URL actually changed
      if (currentUrl !== stableUrl) {
        urls[field.gid] = currentUrl
        stableDocumentUrlsRef.current[field.gid] = currentUrl
        hasChanged = true
      } else {
        // Use stable reference to prevent re-renders
        urls[field.gid] = stableUrl !== undefined ? stableUrl : undefined
      }
    })
    
    // Update the ref with current values
    stableDocumentUrlsRef.current = { ...urls }
    
    // If no URLs actually changed, return previous memoized object to maintain referential equality
    if (!hasChanged && Object.keys(previousMemoizedRef.current).length > 0) {
      // Verify all fields are still present
      const allFieldsPresent = educationFields.every((field: any) => 
        previousMemoizedRef.current.hasOwnProperty(field.gid)
      )
      if (allFieldsPresent && educationFields.length === Object.keys(previousMemoizedRef.current).length) {
        return previousMemoizedRef.current
      }
    }
    
    // Store current result for next comparison
    previousMemoizedRef.current = urls
    return urls
  }, [educationFields, educationDocumentUrls])

  const memoizedEditModes = useMemo(() => {
    const modes: Record<number, boolean> = {}
    educationFields.forEach((field: any) => {
      modes[field.gid] = !!field.Image
    })
    return modes
  }, [educationFields])

  // Prepare table data with index for reference
  const tableData = useMemo(() => {
    return educationFields.map((field: any, index: number) => ({
      ...field,
      _index: index, // Store index for reference
    }))
  }, [educationFields])

  // Define columns with inline editing
  const columns = useMemo<ColumnDef<EducationEntry & { _index: number }>[]>(() => [
    {
      accessorKey: "_index",
      header: "Sr No.",
      cell: ({ row }) => {
        const index = row.original._index
        return <div className="text-center text-xs sm:text-sm">{index + 1}</div>
      },
      enableSorting: false,
      size: 60,
    },
    {
      accessorKey: "degree_type",
      header: () => (
        <span>
          Degree Type <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.degree_type`}
            rules={{
              required: rowEditing ? "Degree type is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || value === 0) {
                    return "Degree type is required"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <SearchableSelect
                  options={degreeTypeOptions.map((degreeType) => ({
                    value: degreeType.id,
                    label: degreeType.name,
                  }))}
                  value={formField.value}
                  onValueChange={(value: string | number) => formField.onChange(Number(value))}
                  placeholder="Select degree type"
                  disabled={!rowEditing || isSavingEducation[field.gid]}
                  emptyMessage="No degree type found."
                  className={`w-full ${error ? 'border-red-500' : ''}`}
                />
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 150,
      meta: {
        className: "min-w-[150px]",
      },
    },
    {
      accessorKey: "university_name",
      header: () => (
        <span>
          University <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.university_name`}
            rules={{
              required: rowEditing ? "University name is required" : false,
              minLength: {
                value: 3,
                message: "University name must be at least 3 characters"
              },
              maxLength: {
                value: 200,
                message: "University name must be less than 200 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "University name is required"
                  }
                  if (!/^[A-Za-z0-9\s.,'-]+$/.test(value)) {
                    return "University name contains invalid characters"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  readOnly={!rowEditing || isSavingEducation[field.gid]}
                  disabled={isSavingEducation[field.gid]}
                />
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 200,
      meta: {
        className: "min-w-[200px]",
      },
    },
    {
      accessorKey: "state",
      header: () => (
        <span>
          State <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.state`}
            rules={{
              required: rowEditing ? "State is required" : false,
              maxLength: {
                value: 50,
                message: "State must be less than 50 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "State is required"
                  }
                  if (value.trim().length < 2) {
                    return "State must be at least 2 characters"
                  }
                  if (!/^[A-Za-z\s]+$/.test(value)) {
                    return "State should only contain letters and spaces"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  placeholder="Enter state"
                  readOnly={!rowEditing}
                />
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 120,
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "year_of_passing",
      header: () => (
        <span>
          Year of Passing <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.year_of_passing`}
            rules={{
              required: rowEditing ? "Year of passing is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Year of passing is required"
                  }
                  let yearStr = ''
                  if (typeof value === 'string' && value.includes('-')) {
                    const date = new Date(value)
                    if (!isNaN(date.getTime())) {
                      yearStr = date.getFullYear().toString()
                    }
                  } else {
                    yearStr = String(value).trim().replace(/\D/g, '').slice(0, 4)
                  }
                  if (yearStr.length !== 4) {
                    return "Year must be 4 digits"
                  }
                  const year = parseInt(yearStr)
                  const currentYear = new Date().getFullYear()
                  if (isNaN(year) || year < 1950 || year > currentYear) {
                    return `Year must be between 1950 and ${currentYear}`
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => {
              let yearValue = ""
              if (formField.value) {
                const valueStr = String(formField.value)
                if (valueStr.includes('-')) {
                  try {
                    const date = new Date(valueStr)
                    if (!isNaN(date.getTime())) {
                      yearValue = date.getFullYear().toString()
                    }
                  } catch (e) {
                    yearValue = ""
                  }
                } else {
                  yearValue = valueStr.replace(/\D/g, "").slice(0, 4)
                }
              }
              
              return (
                <div>
                  <Input
                    type="text"
                    value={yearValue}
                    onChange={(e) => {
                      const inputValue = e.target.value
                      const year = inputValue.replace(/\D/g, "").slice(0, 4)
                      
                      if (year.length === 4) {
                        formField.onChange(`${year}-01-01`)
                      } else if (year.length > 0) {
                        formField.onChange(year)
                      } else {
                        formField.onChange("")
                      }
                    }}
                    onBlur={(e) => {
                      const year = e.target.value.replace(/\D/g, "").slice(0, 4)
                      if (year.length === 4) {
                        formField.onChange(`${year}-01-01`)
                      }
                      formField.onBlur()
                    }}
                    name={formField.name}
                    ref={formField.ref}
                    className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                    placeholder="YYYY"
                    readOnly={!rowEditing}
                  />
                  {error && rowEditing && (
                    <p className="text-xs text-red-500 mt-1">{error.message}</p>
                  )}
                </div>
              )
            }}
          />
        )
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const yearA = rowA.original.year_of_passing ? new Date(rowA.original.year_of_passing).getFullYear() : 0
        const yearB = rowB.original.year_of_passing ? new Date(rowB.original.year_of_passing).getFullYear() : 0
        return yearA - yearB
      },
      size: 140,
      meta: {
        className: "min-w-[140px]",
      },
    },
    {
      accessorKey: "subject",
      header: () => (
        <span>
          Specialization <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.subject`}
            rules={{
              required: rowEditing ? "Specialization is required" : false,
              maxLength: {
                value: 200,
                message: "Specialization must be less than 200 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Specialization is required"
                  }
                  if (value.trim().length < 2) {
                    return "Specialization must be at least 2 characters"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  value={formField.value || ""}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  readOnly={!rowEditing}
                />
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 200,
      meta: {
        className: "min-w-[200px]",
      },
    },
    {
      accessorKey: "QS_Ranking",
      header: () => (
        <span>
          QS Ranking <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <Controller
            control={educationForm.control}
            name={`educations.${index}.QS_Ranking`}
            rules={{
              required: rowEditing ? "QS Ranking is required" : false,
              maxLength: {
                value: 50,
                message: "QS Ranking must be less than 50 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "QS Ranking is required"
                  }
                  if (!/^[A-Za-z0-9\s:.-]+$/.test(value)) {
                    return "QS Ranking contains invalid characters"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  value={formField.value || ""}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  placeholder="e.g., QS Ranking: 172"
                  readOnly={!rowEditing}
                />
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 150,
      meta: {
        className: "min-w-[150px]",
      },
    },
    {
      id: "document",
      header: "Image",
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        // Use field.Image directly to avoid re-renders from getValues()
        const entryImage = field.Image
        const rowEditing = educationEditingIds.has(field.gid)
        const viewDialogCallback = viewDialogCallbacks[field.gid]
        const editDialogCallback = editDialogCallbacks[field.gid]
        const docChangeCallback = documentChangeCallbacks[field.gid]
        const docClearCallback = documentClearCallbacks[field.gid]
        const docSaveCallback = documentSaveCallbacks[`${index}_${field.gid}`]
        const dialogCloseCallback = dialogCloseCallbacks[field.gid]
        
        if (!rowEditing && entryImage) {
          return (
            <Dialog 
              open={educationViewDialogOpen[field.gid] || false}
              onOpenChange={viewDialogCallback}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Document">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>View Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <DocumentViewer
                    documentUrl={entryImage}
                    documentName="Education Document"
                    documentType={entryImage.split('.').pop()?.toLowerCase() || 'pdf'}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )
        } else if (rowEditing) {
          // Get current document URL - use memoized value for stability
          const currentDocUrl = memoizedDocumentUrls[field.gid]
          const hasDocument = !!currentDocUrl
          return (
            <Dialog 
              open={educationDialogOpen[field.gid] || false}
              onOpenChange={editDialogCallback}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={hasDocument ? "Update Document" : "Upload Document"}>
                  {hasDocument ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{hasDocument ? "Update Document" : "Upload Document"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <DocumentUpload
                    documentUrl={currentDocUrl}
                    onChange={docChangeCallback}
                    onClear={docClearCallback}
                    hideExtractButton={true}
                    isEditMode={memoizedEditModes[field.gid]}
                  />
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button 
                      variant="outline"
                      onClick={dialogCloseCallback}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      className="cursor-pointer"
                      onClick={docSaveCallback}
                      disabled={!educationDocumentUrls[field.gid] && !entryImage}
                    >
                      Save Document
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        } else {
          return <span className="text-xs text-gray-400">No document</span>
        }
      },
      enableSorting: false,
      size: 140,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const index = row.original._index
        const field = educationFields[index]
        const rowEditing = educationEditingIds.has(field.gid)
        return (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            {!rowEditing ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onToggleEdit(field.gid)} 
                  className="h-7 w-7 p-0"
                  disabled={hasAnyRecordEditing}
                  title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Edit"}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(index, field.gid)} 
                  className="h-7 w-7 p-0"
                  disabled={hasAnyRecordEditing}
                  title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Delete"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleSaveWithDocument(index, field.gid)}
                  disabled={isSavingEducation[field.gid]}
                  className="flex items-center gap-1 h-7 text-xs px-2"
                >
                  {isSavingEducation[field.gid] ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleCancel(index, field.gid)}
                  disabled={isSavingEducation[field.gid]}
                  className="flex items-center gap-1 h-7 text-xs px-2"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </>
            )}
          </div>
        )
      },
      enableSorting: false,
      size: 120,
    },
  ], [educationForm, educationFields, educationEditingIds, isSavingEducation, hasAnyRecordEditing, educationDialogOpen, educationViewDialogOpen, onToggleEdit, handleCancel, handleDelete, handleSaveWithDocument, viewDialogCallbacks, editDialogCallbacks, documentChangeCallbacks, documentClearCallbacks, documentSaveCallbacks, dialogCloseCallbacks, memoizedDocumentUrls, memoizedEditModes, degreeTypeOptions])

  return (
    <>
      <UnsavedChangesDialog />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Education Details</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your academic qualifications</CardDescription>
            </div>
            <Button 
              onClick={onAddEntry} 
              size="sm" 
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={hasAnyRecordEditing}
              title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Add Education"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Education</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="overflow-x-auto custom-scrollbar w-full max-w-full">
            <EnhancedDataTable
              columns={columns}
              data={tableData}
              loading={false}
              pageSize={1000}
              exportable={false}
              enableGlobalFilter={true}
              emptyMessage="No education entries found. Click 'Add Education' to get started."
              wrapperClassName="rounded-md border overflow-x-auto"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
