"use client"

import React, { useMemo } from "react"
import { Controller } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Trash2, Save, X, Loader2 } from "lucide-react"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"
import { formatDateForInput } from "./utils"
import { ExperienceSectionProps } from "./types"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { ExperienceEntry } from "@/types/interfaces"

export function ExperienceDetailsSection({
  teacherId,
  experienceForm,
  experienceFields,
  experienceEditingIds,
  isSavingExperience,
  hasAnyEditMode,
  hasAnyRecordEditing = false,
  onAddEntry,
  onSaveRow,
  onCancelRow,
  onDeleteRow,
  onToggleEdit,
  onRefresh,
}: ExperienceSectionProps) {
  const { toast } = useToast()
  const { confirm, DialogComponent: UnsavedChangesDialog } = useConfirmationDialog()

  const handleCancel = async (index: number, id: number) => {
    const hasChanges = experienceForm.formState.dirtyFields.experiences?.[index]
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
  }

  const handleDelete = async (index: number, id: number) => {
    const entry = experienceFields[index]
    const employerName = entry?.Employeer || "this experience entry"
    
    const shouldDelete = await confirm({
      title: "Delete Experience Entry?",
      description: `Are you sure you want to delete the experience entry for "${employerName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    
    if (!shouldDelete) return

    try {
      // Call the parent's delete handler (it handles API call, cache invalidation, and form refresh)
      await onDeleteRow(index, id)
      
      // Show success toast only if deletion succeeded (no error thrown)
      toast({
        title: "Experience Deleted",
        description: `Experience entry for "${employerName}" has been deleted successfully.`,
      })
    } catch (error: any) {
      // Error toast is already shown by parent's onDeleteRow
      // Just log the error, don't show another toast
      console.error('Error deleting experience:', error)
    }
  }

  // Prepare table data with index for reference
  const tableData = useMemo(() => {
    return experienceFields.map((field: any, index: number) => ({
      ...field,
      _index: index, // Store index for reference
    }))
  }, [experienceFields])

  // Define columns with inline editing
  const columns = useMemo<ColumnDef<ExperienceEntry & { _index: number }>[]>(() => [
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
      accessorKey: "Employeer",
      header: () => (
        <span>
          Employer <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.Employeer`}
            rules={{
              required: rowEditing ? "Employer is required" : false,
              minLength: {
                value: 2,
                message: "Employer name must be at least 2 characters"
              },
              maxLength: {
                value: 200,
                message: "Employer name must be less than 200 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Employer is required"
                  }
                  if (!/^[A-Za-z0-9\s.,'-]+$/.test(value)) {
                    return "Employer name contains invalid characters"
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
                  readOnly={!rowEditing || isSavingExperience[field.Id]}
                  disabled={isSavingExperience[field.Id]}
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
      size: 300,
      meta: {
        className: "min-w-[300px]",
      },
    },
    {
      accessorKey: "currente",
      header: () => (
        <span>
          Currently Employed? <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.currente`}
            render={({ field: formField }) => {
              const currentValue = formField.value === true || (typeof formField.value === 'number' && formField.value === 1)
              return (
                <Select
                  value={currentValue ? "yes" : "no"}
                  onValueChange={(value: string) => {
                    const boolValue = value === "yes"
                    formField.onChange(boolValue)
                    if (boolValue) {
                      experienceForm.setValue(`experiences.${index}.End_Date`, "")
                    }
                    setTimeout(() => {
                      experienceForm.trigger(`experiences.${index}.End_Date`, { shouldFocus: false })
                    }, 0)
                  }}
                  disabled={!rowEditing || isSavingExperience[field.Id]}
                >
                  <SelectTrigger className="w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              )
            }}
          />
        )
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const valA = rowA.original.currente === true || (typeof rowA.original.currente === 'number' && rowA.original.currente === 1)
        const valB = rowB.original.currente === true || (typeof rowB.original.currente === 'number' && rowB.original.currente === 1)
        return valA === valB ? 0 : valA ? 1 : -1
      },
      size: 140,
    },
    {
      accessorKey: "desig",
      header: () => (
        <span>
          Designation <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.desig`}
            rules={{
              required: rowEditing ? "Designation is required" : false,
              maxLength: {
                value: 100,
                message: "Designation must be less than 100 characters"
              },
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Designation is required"
                  }
                  if (value.length < 2) {
                    return "Designation must be at least 2 characters"
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
                  readOnly={!rowEditing || isSavingExperience[field.Id]}
                  disabled={isSavingExperience[field.Id]}
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
      size: 250,
      meta: {
        className: "min-w-[250px]",
      },
    },
    {
      accessorKey: "Start_Date",
      header: () => (
        <span>
          Date of Joining <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.Start_Date`}
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
                        experienceForm.trigger(`experiences.${index}.End_Date`)
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
      header: "Date of Relieving",
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.End_Date`}
            rules={{
              validate: (value) => {
                if (!rowEditing) return true
                
                const currenteRaw = experienceForm.watch(`experiences.${index}.currente`)
                const currenteValue = currenteRaw === true || (typeof currenteRaw === 'number' && currenteRaw === 1)
                
                if (currenteValue) {
                  return true
                }
                
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                  return "End date is required when currently employed is No"
                }
                
                const endDate = new Date(value)
                if (isNaN(endDate.getTime())) {
                  return "Please enter a valid end date"
                }
                
                const startDate = experienceForm.watch(`experiences.${index}.Start_Date`)
                
                const today = new Date()
                today.setHours(23, 59, 59, 999)
                if (endDate > today) {
                  return "End date cannot be in the future if not currently employed"
                }
                
                if (startDate) {
                  const start = new Date(startDate)
                  if (!isNaN(start.getTime())) {
                    if (endDate < start) {
                      return "End date must be after start date"
                    }
                  }
                }
                
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => {
              const currenteRaw = experienceForm.watch(`experiences.${index}.currente`)
              const currenteValue = currenteRaw === true || (typeof currenteRaw === 'number' && currenteRaw === 1)
              return (
                <div>
                  <Input
                    {...formField}
                    type="date"
                    value={formatDateForInput(formField.value)}
                    onChange={(e) => formField.onChange(e.target.value)}
                    max={currenteValue ? undefined : new Date().toISOString().split('T')[0]}
                    className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                    readOnly={!rowEditing || currenteValue}
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
        const dateA = rowA.original.End_Date ? new Date(rowA.original.End_Date).getTime() : 0
        const dateB = rowB.original.End_Date ? new Date(rowB.original.End_Date).getTime() : 0
        return dateA - dateB
      },
      size: 140,
    },
    {
      accessorKey: "Nature",
      header: () => (
        <span>
          Nature of Job <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.Nature`}
            rules={{
              required: rowEditing ? "Nature of job is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Nature of job is required"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Select
                  value={formField.value || ""}
                  onValueChange={formField.onChange}
                  disabled={!rowEditing || isSavingExperience[field.Id]}
                >
                  <SelectTrigger className={`w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default ${error ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Industrial Work">Industrial Work</SelectItem>
                    <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
      accessorKey: "UG_PG",
      header: () => (
        <span>
          Type of Teaching <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
        return (
          <Controller
            control={experienceForm.control}
            name={`experiences.${index}.UG_PG`}
            rules={{
              required: rowEditing ? "Teaching type is required" : false,
              validate: (value) => {
                if (rowEditing) {
                  if (!value || (typeof value === 'string' && value.trim() === '')) {
                    return "Teaching type is required"
                  }
                }
                return true
              }
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Select
                  value={formField.value || ""}
                  onValueChange={formField.onChange}
                  disabled={!rowEditing || isSavingExperience[field.Id]}
                >
                  <SelectTrigger className={`w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default ${error ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG">UG</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="UG & PG">UG & PG</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {error && rowEditing && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}
          />
        )
      },
      enableSorting: true,
      size: 130,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const index = row.original._index
        const field = experienceFields[index]
        const rowEditing = experienceEditingIds.has(field.Id)
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
                  onClick={() => onSaveRow(index, field.Id)}
                  disabled={isSavingExperience[field.Id]}
                  className="flex items-center gap-1 h-7 text-xs px-2"
                >
                  {isSavingExperience[field.Id] ? (
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
                  disabled={isSavingExperience[field.Id]}
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
  ], [experienceForm, experienceFields, experienceEditingIds, isSavingExperience, hasAnyRecordEditing, onToggleEdit, onSaveRow, onDeleteRow, handleCancel, handleDelete])

  return (
    <>
      <UnsavedChangesDialog />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Experience Details</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your professional work experience</CardDescription>
            </div>
            <Button 
              onClick={onAddEntry} 
              size="sm" 
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={hasAnyRecordEditing}
              title={hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Add Experience"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Experience</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <EnhancedDataTable
            columns={columns}
            data={tableData}
            loading={false}
            pageSize={1000}
            exportable={false}
            enableGlobalFilter={true}
            emptyMessage="No experience entries found. Click 'Add Experience' to get started."
            wrapperClassName="rounded-md border overflow-x-auto"
            className="w-full"
          />
        </CardContent>
      </Card>
    </>
  )
}
