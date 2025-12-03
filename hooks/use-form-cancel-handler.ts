"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { UseFormReturn } from "react-hook-form"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

interface UseFormCancelHandlerOptions {
  form: UseFormReturn<any>
  clearDocumentData: () => void
  redirectPath: string
  skipWarning?: boolean
  onCancel?: () => void
  message?: string
}

export function useFormCancelHandler({
  form,
  clearDocumentData,
  redirectPath,
  skipWarning = false,
  onCancel,
  message = "Are you sure to discard the unsaved changes?",
}: UseFormCancelHandlerOptions) {
  const router = useRouter()
  const { confirm, DialogComponent } = useConfirmationDialog()
  
  const handleCancel = useCallback(async () => {
    const isDirty = form.formState.isDirty
    const formValues = form.getValues()
    // Check for document in Pdf field or supportingDocument field
    const hasDocument = formValues.Pdf || formValues.supportingDocument?.[0] || false
    const hasUnsavedChanges = isDirty || hasDocument
    
    // Skip warning for Smart Document Analyzer navigation
    if (skipWarning) {
      form.reset()
      clearDocumentData()
      if (onCancel) onCancel()
      router.push(redirectPath)
      return
    }
    
    // Show dialog if there are unsaved changes
    if (hasUnsavedChanges) {
      const shouldLeave = await confirm({
        title: "Discard Changes?",
        description: message,
        confirmText: "Discard",
        cancelText: "Cancel",
      })
      if (!shouldLeave) {
        return  // User cancelled
      }
    }
    
    // Cleanup and navigate
    form.reset()
    clearDocumentData()
    if (onCancel) onCancel()
    router.push(redirectPath)
  }, [form, clearDocumentData, redirectPath, skipWarning, onCancel, router, message, confirm])
  
  return { handleCancel, DialogComponent }
}

