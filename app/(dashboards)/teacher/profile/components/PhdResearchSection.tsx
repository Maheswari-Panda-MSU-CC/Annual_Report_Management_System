"use client"

import React, { useMemo, useCallback, useRef } from "react"
import { Controller } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Plus, Trash2, Save, X, Loader2, Upload, FileText, Eye } from "lucide-react"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "@/components/document-viewer"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { formatDateForInput } from "./utils"
import { PhdResearchSectionProps } from "./types"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { PostDocEntry } from "@/types/interfaces"

export function PhdResearchSection({
  teacherId,
  postDocForm,
  postDocFields,
  postDocEditingIds,
  isSavingPostDoc,
  phdDocumentUrls,
  phdDialogOpen,
  phdViewDialogOpen,
  hasAnyRecordEditing = false,
  onAddEntry,
  onSaveRow,
  onCancelRow,
  onDeleteRow,
  onToggleEdit,
  onDocumentUrlChange,
  onDialogOpenChange,
  onViewDialogOpenChange,
  onRefresh,
}: PhdResearchSectionProps) {
  const { toast } = useToast()
  const { confirm, DialogComponent: UnsavedChangesDialog } = useConfirmationDialog()

  const handleDocumentSave = useCallback(async (index: number, id: number) => {
    const entry = postDocForm.getValues(`researches.${index}`)
    const currentUrl = phdDocumentUrls[id] || entry.doc
    const originalDocPath = entry.doc // Track original path
    
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
        if (currentUrl !== originalDocPath) {
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
  }, [postDocForm, phdDocumentUrls, onDocumentUrlChange, onDialogOpenChange, toast])

  const handleCancel = useCallback(async (index: number, id: number) => {
    const hasChanges = postDocForm.formState.dirtyFields.researches?.[index] || phdDocumentUrls[id]
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
  }, [postDocForm, phdDocumentUrls, confirm, onCancelRow])

  const handleDelete = useCallback(async (index: number, id: number) => {
    const entry = postDocFields[index]
    const instituteName = entry?.Institute || "this post-doc entry"
    const docPath = entry?.doc || null
    
    const shouldDelete = await confirm({
      title: "Delete Post-Doc Entry?",
      description: `Are you sure you want to delete the post-doc entry for "${instituteName}"?${docPath && docPath.startsWith("upload/") ? " This will also delete the associated document from S3." : ""} This action cannot be undone.`,
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
      console.error('Error deleting post-doc:', error)
    }
  }, [postDocFields, confirm, onDeleteRow, toast])

  // Handle save with document upload to S3
  const handleSaveWithDocument = useCallback(async (index: number, id: number) => {
    try {
      const entry = postDocForm.getValues(`researches.${index}`)
      const localDocumentUrl = phdDocumentUrls[id]
      const originalDocPath = entry.doc // Get original document path from form
      
      // Only upload if there's a NEW local document URL (not an existing S3 path)
      // This ensures we only upload when user actually uploaded a new document
      const hasNewUpload = localDocumentUrl && localDocumentUrl.startsWith('/uploaded-document/')
      
      if (hasNewUpload) {
        try {
          // Use the proper S3 upload helper to get virtual path starting with "upload/"
          const { uploadDocumentToS3 } = await import("@/lib/s3-upload-helper")
          
          // Determine record ID - use existing ID if available, otherwise use temp ID
          const recordId = entry.Id && entry.Id <= 2147483647 ? entry.Id : id
          
          // Upload to S3 and get virtual path (starts with "upload/")
          const virtualPath = await uploadDocumentToS3(
            localDocumentUrl,
            teacherId,
            recordId,
            "PostDocResearch" // Folder name for post-doc research documents
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
          postDocForm.setValue(`researches.${index}.doc`, virtualPath)
          
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
        if (localDocumentUrl !== originalDocPath) {
          postDocForm.setValue(`researches.${index}.doc`, localDocumentUrl)
        }
      } else if (!localDocumentUrl && originalDocPath) {
        // Document was cleared - keep original path (don't clear it on save)
        // User must explicitly delete the record to remove the document
        // Just proceed with save using original path
      }

      // Now call the parent's save handler (it will save the entry with the S3 path in doc field)
      await onSaveRow(index, id)
    } catch (error: any) {
      // Error is already handled by parent's onSaveRow
      console.error('Error saving post-doc:', error)
    }
  }, [postDocForm, phdDocumentUrls, onDocumentUrlChange, onSaveRow, toast, teacherId])

  // Create stable callback maps to prevent re-renders
  const viewDialogCallbacks = useMemo(() => {
    const callbacks: Record<number, (open: boolean) => void> = {}
    postDocFields.forEach((field: any) => {
      callbacks[field.Id] = (open: boolean) => onViewDialogOpenChange(field.Id, open)
    })
    return callbacks
  }, [postDocFields, onViewDialogOpenChange])

  const editDialogCallbacks = useMemo(() => {
    const callbacks: Record<number, (open: boolean) => void> = {}
    postDocFields.forEach((field: any) => {
      callbacks[field.Id] = (open: boolean) => onDialogOpenChange(field.Id, open)
    })
    return callbacks
  }, [postDocFields, onDialogOpenChange])

  const documentChangeCallbacks = useMemo(() => {
    const callbacks: Record<number, (url: string | null) => void> = {}
    postDocFields.forEach((field: any) => {
      callbacks[field.Id] = (url: string | null) => {
        if (url) {
          onDocumentUrlChange(field.Id, url)
        }
      }
    })
    return callbacks
  }, [postDocFields, onDocumentUrlChange])

  const documentClearCallbacks = useMemo(() => {
    const callbacks: Record<number, () => void> = {}
    postDocFields.forEach((field: any) => {
      callbacks[field.Id] = () => onDocumentUrlChange(field.Id, null)
    })
    return callbacks
  }, [postDocFields, onDocumentUrlChange])

  const documentSaveCallbacks = useMemo(() => {
    const callbacks: Record<string, () => void> = {}
    postDocFields.forEach((field: any, index: number) => {
      callbacks[`${index}_${field.Id}`] = () => handleDocumentSave(index, field.Id)
    })
    return callbacks
  }, [postDocFields, handleDocumentSave])

  const dialogCloseCallbacks = useMemo(() => {
    const callbacks: Record<number, () => void> = {}
    postDocFields.forEach((field: any) => {
      callbacks[field.Id] = () => onDialogOpenChange(field.Id, false)
    })
    return callbacks
  }, [postDocFields, onDialogOpenChange])

  // Use ref to track stable document URLs to prevent unnecessary re-renders
  const stableDocumentUrlsRef = useRef<Record<number, string | undefined>>({})
  const previousMemoizedRef = useRef<Record<number, string | undefined>>({})
  
  // Memoize document URLs per field - only update when URL actually changes
  // This prevents DocumentUpload from re-rendering when the prop value hasn't changed
  const memoizedDocumentUrls = useMemo(() => {
    const urls: Record<number, string | undefined> = {}
    let hasChanged = false
    
    postDocFields.forEach((field: any) => {
      const phdUrl = phdDocumentUrls[field.Id]
      const entryDoc = field.doc
      const currentUrl = phdUrl || entryDoc || undefined
      const stableUrl = stableDocumentUrlsRef.current[field.Id]
      
      // Only update if URL actually changed
      if (currentUrl !== stableUrl) {
        urls[field.Id] = currentUrl
        stableDocumentUrlsRef.current[field.Id] = currentUrl
        hasChanged = true
      } else {
        // Use stable reference to prevent re-renders
        urls[field.Id] = stableUrl !== undefined ? stableUrl : undefined
      }
    })
    
    // Update the ref with current values
    stableDocumentUrlsRef.current = { ...urls }
    
    // If no URLs actually changed, return previous memoized object to maintain referential equality
    if (!hasChanged && Object.keys(previousMemoizedRef.current).length > 0) {
      // Verify all fields are still present
      const allFieldsPresent = postDocFields.every((field: any) => 
        previousMemoizedRef.current.hasOwnProperty(field.Id)
      )
      if (allFieldsPresent && postDocFields.length === Object.keys(previousMemoizedRef.current).length) {
        return previousMemoizedRef.current
      }
    }
    
    // Store current result for next comparison
    previousMemoizedRef.current = urls
    return urls
  }, [postDocFields, phdDocumentUrls])

  const memoizedEditModes = useMemo(() => {
    const modes: Record<number, boolean> = {}
    postDocFields.forEach((field: any) => {
      modes[field.Id] = !!field.doc
    })
    return modes
  }, [postDocFields])

  // Prepare table data with index for reference
  const tableData = useMemo(() => {
    return postDocFields.map((field: any, index: number) => ({
      ...field,
      _index: index, // Store index for reference
    }))
  }, [postDocFields])

  // Define columns with inline editing
  const columns = useMemo<ColumnDef<PostDocEntry & { _index: number }>[]>(() => [
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
      accessorKey: "Institute",
      header: () => (
        <span>
          Institute / Industry <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <Controller
            control={postDocForm.control}
            name={`researches.${index}.Institute`}
            rules={{
              required: rowEditing ? "Institute is required" : false,
              minLength: {
                value: 2,
                message: "Institute name must be at least 2 characters"
              },
              maxLength: {
                value: 200,
                message: "Institute name must be less than 200 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Institute is required"
                  }
                  if (value.trim().length < 2) {
                    return "Institute name must be at least 2 characters"
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
                  readOnly={!rowEditing || isSavingPostDoc[field.Id]}
                  disabled={isSavingPostDoc[field.Id]}
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
      size: 280,
      meta: {
        className: "min-w-[280px]",
      },
    },
    {
      accessorKey: "Start_Date",
      header: () => (
        <span>
          Start Date <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <Controller
            control={postDocForm.control}
            name={`researches.${index}.Start_Date`}
            rules={{
              required: rowEditing ? "Start date is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Start date is required"
                  }
                  const startDate = new Date(value)
                  if (isNaN(startDate.getTime())) {
                    return "Please enter a valid start date"
                  }
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  if (startDate > today) {
                    return "Start date cannot be in the future"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  type="date"
                  value={formatDateForInput(formField.value)}
                  onChange={(e) => {
                    formField.onChange(e.target.value)
                    if (rowEditing) {
                      setTimeout(() => {
                        postDocForm.trigger(`researches.${index}.End_Date`)
                      }, 100)
                    }
                  }}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  readOnly={!rowEditing}
                  max={new Date().toISOString().split('T')[0]}
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
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.Start_Date ? new Date(rowA.original.Start_Date).getTime() : 0
        const dateB = rowB.original.Start_Date ? new Date(rowB.original.Start_Date).getTime() : 0
        return dateA - dateB
      },
      size: 140,
    },
    {
      accessorKey: "End_Date",
      header: () => (
        <span>
          End Date <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <Controller
            control={postDocForm.control}
            name={`researches.${index}.End_Date`}
            rules={{
              required: rowEditing ? "End date is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "End date is required"
                  }
                  const endDate = new Date(value)
                  if (isNaN(endDate.getTime())) {
                    return "Please enter a valid end date"
                  }
                  const today = new Date()
                  today.setHours(23, 59, 59, 999)
                  if (endDate > today) {
                    return "End date cannot be in the future"
                  }
                  // Get start date from form values - getValues always returns current state
                  const startDate = postDocForm.getValues(`researches.${index}.Start_Date`)
                  if (startDate) {
                    const start = new Date(startDate)
                    if (!isNaN(start.getTime())) {
                      if (endDate < start) {
                        return "End date must be after start date"
                      }
                    }
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  {...formField}
                  type="date"
                  value={formatDateForInput(formField.value)}
                  onChange={(e) => formField.onChange(e.target.value)}
                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                  readOnly={!rowEditing}
                  max={new Date().toISOString().split('T')[0]}
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
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.End_Date ? new Date(rowA.original.End_Date).getTime() : 0
        const dateB = rowB.original.End_Date ? new Date(rowB.original.End_Date).getTime() : 0
        return dateA - dateB
      },
      size: 140,
    },
    {
      accessorKey: "SponsoredBy",
      header: "Sponsored By",
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <Controller
            control={postDocForm.control}
            name={`researches.${index}.SponsoredBy`}
            rules={{
              maxLength: {
                value: 200,
                message: "Sponsored by must be less than 200 characters"
              },
              validate: (value) => {
                if (value && typeof value === 'string' && value.trim() !== '') {
                  if (value.trim().length < 2) {
                    return "If provided, must be at least 2 characters"
                  }
                }
                return true
              }
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                className="w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default"
                placeholder="e.g., UGC, CSIR"
                readOnly={!rowEditing}
              />
            )}
          />
        )
      },
      enableSorting: true,
      size: 300,
      meta: {
        className: "min-w-[300px]",
      },
    },
    {
      accessorKey: "QS_THE",
      header: "QS / THE World University Ranking",
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <Controller
            control={postDocForm.control}
            name={`researches.${index}.QS_THE`}
            rules={{
              maxLength: {
                value: 100,
                message: "QS/THE ranking must be less than 100 characters"
              },
              validate: (value) => {
                if (value && typeof value === 'string' && value.trim() !== '') {
                  if (!/^[A-Za-z0-9\s:.-]+$/.test(value)) {
                    return "QS/THE ranking contains invalid characters"
                  }
                }
                return true
              }
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                className="w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default"
                placeholder="e.g., QS Ranking: 172"
                readOnly={!rowEditing}
              />
            )}
          />
        )
      },
      enableSorting: true,
      size: 100,
      meta: {
        className: "min-w-[100px]",
      },
    },
    {
      id: "document",
      header: "Supporting Document",
      cell: ({ row }) => {
        const index = row.original._index
        const field = postDocFields[index]
        // Use field.doc directly to avoid re-renders from getValues()
        const entryDoc = field.doc
        const rowEditing = postDocEditingIds.has(field.Id)
        const viewDialogCallback = viewDialogCallbacks[field.Id]
        const editDialogCallback = editDialogCallbacks[field.Id]
        const docChangeCallback = documentChangeCallbacks[field.Id]
        const docClearCallback = documentClearCallbacks[field.Id]
        const docSaveCallback = documentSaveCallbacks[`${index}_${field.Id}`]
        const dialogCloseCallback = dialogCloseCallbacks[field.Id]
        
        if (!rowEditing && entryDoc) {
          return (
            <Dialog 
              open={phdViewDialogOpen[field.Id] || false}
              onOpenChange={viewDialogCallback}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Document">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>View Supporting Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <DocumentViewer
                    documentUrl={entryDoc}
                    documentName="Supporting Document"
                    documentType={entryDoc.split('.').pop()?.toLowerCase() || 'pdf'}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )
        } else if (rowEditing) {
          // Get current document URL - use memoized value for stability
          const currentDocUrl = memoizedDocumentUrls[field.Id]
          const hasDocument = !!currentDocUrl
          return (
            <Dialog 
              open={phdDialogOpen[field.Id] || false}
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
                  <DialogTitle>{hasDocument ? "Update Supporting Document" : "Upload Supporting Document"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <DocumentUpload
                    documentUrl={currentDocUrl}
                    onChange={docChangeCallback}
                    onClear={docClearCallback}
                    hideExtractButton={true}
                    isEditMode={memoizedEditModes[field.Id]}
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
                      disabled={!phdDocumentUrls[field.Id] && !entryDoc}
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
        const field = postDocFields[index]
        const rowEditing = postDocEditingIds.has(field.Id)
        return (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            {!rowEditing ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onToggleEdit(field.Id)} 
                  className="h-7 w-7 p-0"
                  disabled={hasAnyRecordEditing}
                  title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Edit"}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(index, field.Id)} 
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
                  onClick={() => handleSaveWithDocument(index, field.Id)}
                  disabled={isSavingPostDoc[field.Id]}
                  className="flex items-center gap-1 h-7 text-xs px-2"
                >
                  {isSavingPostDoc[field.Id] ? (
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
                  onClick={() => handleCancel(index, field.Id)}
                  disabled={isSavingPostDoc[field.Id]}
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
  ], [postDocForm, postDocFields, postDocEditingIds, isSavingPostDoc, hasAnyRecordEditing, phdDialogOpen, phdViewDialogOpen, onToggleEdit, handleCancel, handleDelete, handleSaveWithDocument, viewDialogCallbacks, editDialogCallbacks, documentChangeCallbacks, documentClearCallbacks, documentSaveCallbacks, dialogCloseCallbacks, memoizedDocumentUrls, memoizedEditModes])

  return (
    <>
      <UnsavedChangesDialog />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Post Doctoral Research Experience</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your post-doctoral research positions</CardDescription>
            </div>
            <Button 
              onClick={onAddEntry} 
              size="sm" 
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={hasAnyRecordEditing}
              title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Add Post-Doc"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Post-Doc</span>
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
              emptyMessage="No post-doc entries found. Click 'Add Post-Doc' to get started."
              wrapperClassName="rounded-md border overflow-x-auto"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
