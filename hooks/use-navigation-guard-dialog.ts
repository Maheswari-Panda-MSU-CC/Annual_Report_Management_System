"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { UseFormReturn } from "react-hook-form"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"

interface UseNavigationGuardDialogOptions {
  form: UseFormReturn<any>
  clearDocumentData: () => void
  clearAutoFillData?: () => void
  skipWarning?: boolean
  enabled?: boolean
  message?: string
}

export function useNavigationGuardDialog({
  form,
  clearDocumentData,
  clearAutoFillData,
  skipWarning = false,
  enabled = true,
  message = "Are you sure to discard the unsaved changes?",
}: UseNavigationGuardDialogOptions) {
  const pathname = usePathname()
  const router = useRouter()
  const skipWarningRef = useRef(skipWarning)
  const previousPathnameRef = useRef<string | null>(null)
  const { confirm, DialogComponent } = useConfirmationDialog()
  const [isNavigating, setIsNavigating] = useState(false)
  const pendingNavigationRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)
  const navigationBlockedRef = useRef(false)
  
  // Update skip warning ref
  useEffect(() => {
    skipWarningRef.current = skipWarning
  }, [skipWarning])
  
  // Track form dirty state - use getValues to avoid re-renders
  const isDirty = form.formState.isDirty
  const formValuesRef = useRef<any>(null)
  formValuesRef.current = form.getValues()
  // Check for document in Pdf field or supportingDocument field
  const hasDocumentData = formValuesRef.current?.Pdf || formValuesRef.current?.supportingDocument?.[0] || false
  const hasUnsavedChanges = isDirty || hasDocumentData
  
  // Store hasUnsavedChanges in ref to use in navigation effect
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges)
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges
  }, [hasUnsavedChanges])
  
  // Browser beforeunload handler (keep native browser warning for page close/refresh)
  useEffect(() => {
    if (!enabled || skipWarningRef.current) return
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isProcessingRef.current) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }
    
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [enabled, hasUnsavedChanges, message])
  
  // Handle navigation confirmation
  const handleNavigationConfirmation = useCallback(async (targetPath: string, previousPath: string) => {
    if (skipWarningRef.current || !hasUnsavedChangesRef.current) {
      clearDocumentData()
      if (clearAutoFillData) {
        clearAutoFillData()
      }
      return true
    }

    isProcessingRef.current = true
    setIsNavigating(true)
    navigationBlockedRef.current = true
    
    const shouldLeave = await confirm({
      title: "Discard Changes?",
      description: message,
      confirmText: "Discard",
      cancelText: "Cancel",
    })

    isProcessingRef.current = false
    setIsNavigating(false)
    navigationBlockedRef.current = false

    if (shouldLeave) {
      clearDocumentData()
      if (clearAutoFillData) {
        clearAutoFillData()
      }
      return true
    }
    
    // User cancelled - prevent navigation by going back to previous path
    router.replace(previousPath)
    return false
  }, [confirm, message, clearDocumentData, clearAutoFillData, router])

  // Intercept pathname changes (catches all navigation including Link clicks, router.push, browser back/forward)
  useEffect(() => {
    if (!enabled) {
      previousPathnameRef.current = pathname
      return
    }

    const currentPath = pathname
    const previousPath = previousPathnameRef.current

    // Skip on initial mount
    if (!previousPath) {
      previousPathnameRef.current = currentPath
      return
    }

    // Skip if we're processing a navigation confirmation
    if (isProcessingRef.current || navigationBlockedRef.current) {
      return
    }

    // If pathname changed
    if (previousPath !== currentPath) {
      const wasOnAddEditPage = previousPath.includes("/add") || previousPath.includes("/edit")
      const isOnAddEditPage = currentPath.includes("/add") || currentPath.includes("/edit")

      // If we were on add/edit page and navigated away
      if (wasOnAddEditPage && !isOnAddEditPage) {
        // Check if we should show confirmation - use ref to get latest value
        const currentHasUnsavedChanges = hasUnsavedChangesRef.current
        
        if (currentHasUnsavedChanges && !skipWarningRef.current) {
          // Store the target path
          pendingNavigationRef.current = currentPath
          
          // Prevent navigation by going back to previous path immediately
          router.replace(previousPath)
          navigationBlockedRef.current = true
          isProcessingRef.current = true
          
          // Use requestAnimationFrame and setTimeout to ensure navigation is blocked before showing dialog
          requestAnimationFrame(() => {
            setTimeout(() => {
              // Show confirmation dialog
              handleNavigationConfirmation(currentPath, previousPath).then((shouldProceed) => {
                isProcessingRef.current = false
                navigationBlockedRef.current = false
                if (shouldProceed) {
                  // User confirmed, navigate to target path
                  previousPathnameRef.current = currentPath
                  router.push(currentPath)
                } else {
                  // User cancelled, stay on previous path (already done via replace above)
                  previousPathnameRef.current = previousPath
                }
                pendingNavigationRef.current = null
              })
            }, 150)
          })
          return
        } else {
          // No unsaved changes, just clear data and allow navigation
          clearDocumentData()
          if (clearAutoFillData) {
            clearAutoFillData()
          }
          previousPathnameRef.current = currentPath
        }
      } else {
        // Not leaving add/edit page, just update pathname
        previousPathnameRef.current = currentPath
      }
    } else {
      // Pathname didn't change, just update ref
      previousPathnameRef.current = currentPath
    }
  }, [pathname, enabled, router, clearDocumentData, clearAutoFillData, handleNavigationConfirmation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear document data when component unmounts (if leaving add/edit page)
      const currentPath = pathname
      const isOnAddEditPage = currentPath.includes("/add") || currentPath.includes("/edit")
      if (!isOnAddEditPage && hasDocumentData && !skipWarningRef.current) {
        clearDocumentData()
      }
    }
  }, [pathname, hasDocumentData, clearDocumentData])
  
  return {
    hasUnsavedChanges,
    isDirty,
    DialogComponent,
    isNavigating,
  }
}
