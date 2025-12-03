"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { UseFormReturn } from "react-hook-form"
import { useNavigationGuardDialog } from "@/hooks/use-navigation-guard-dialog"

interface UseUnsavedChangesGuardOptions {
  form: UseFormReturn<any>
  clearDocumentData: () => void
  clearAutoFillData?: () => void
  skipWarning?: boolean
  enabled?: boolean
  message?: string
}

export function useUnsavedChangesGuard({
  form,
  clearDocumentData,
  clearAutoFillData,
  skipWarning = false,
  enabled = true,
  message = "Are you sure to discard the unsaved changes?",
}: UseUnsavedChangesGuardOptions) {
  const navigationGuard = useNavigationGuardDialog({
    form,
    clearDocumentData,
    clearAutoFillData,
    skipWarning,
    enabled,
    message,
  })
  
  return {
    hasUnsavedChanges: navigationGuard.hasUnsavedChanges,
    isDirty: navigationGuard.isDirty,
    DialogComponent: navigationGuard.DialogComponent,
  }
}

