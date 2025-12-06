"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UseConfirmationDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<UseConfirmationDialogOptions>({})
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: UseConfirmationDialogOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || "Confirm Action",
        description: options.description || "Are you sure you want to proceed?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      })
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (config.onConfirm) {
      config.onConfirm()
    }
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
  }, [config, resolvePromise])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    if (config.onCancel) {
      config.onCancel()
    }
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
  }, [config, resolvePromise])

  const DialogComponent = useCallback(() => {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config.title || "Confirm Action"}</DialogTitle>
            <DialogDescription>{config.description || "Are you sure you want to proceed?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {config.cancelText || "Cancel"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm}>
              {config.confirmText || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }, [isOpen, config, handleCancel, handleConfirm])

  return {
    confirm,
    DialogComponent,
  }
}

