"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Loader2, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDepartmentEvents } from "@/hooks/use-department-events-data"
import { useDepartmentEventsMutations } from "@/hooks/use-department-events-mutations"
import { useDepartmentStudentAcademicActivities } from "@/hooks/use-department-student-academic-activities-data"
import { useDepartmentStudentBodyEvents } from "@/hooks/use-department-student-body-events-data"
import { EventForm } from "@/components/forms/department/DeptEventForm"
import { DeptStudentAcademicAct } from "@/components/forms/department/DeptStudentAcademicAct"
import { DeptStudentBodyEventForm } from "@/components/forms/department/DeptStudentBodyEventForm"
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"
import { useDocumentAnalysis } from "@/contexts/document-analysis-context"
import { EventsTab } from "./components/EventsTab"
import { ActivitiesTab } from "./components/ActivitiesTab"
import { StudentBodyEventsTab } from "./components/StudentBodyEventsTab"
import { useEventsHandlers } from "./hooks/use-events-handlers"
import { useActivitiesHandlers } from "./hooks/use-activities-handlers"
import { useStudentBodyEventsHandlers } from "./hooks/use-student-body-events-handlers"

export default function DepartmentEvents() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("events")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ eventId?: number; activityId?: number; studentBodyEventId?: number; itemName: string; item?: any; type?: 'event' | 'activity' | 'studentBodyEvent' } | null>(null)
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set())
  
  // Track original document URL to detect changes (only in edit mode)
  const originalDocumentUrlRef = useRef<string | null>(null)

  const [formData, setFormData] = useState<any>({})
  const form = useForm({
    mode: "onBlur", // Validate on blur to detect errors before submit
    reValidateMode: "onChange",
  })

  // React Query hooks
  const {  data: queryData, isLoading: eventsLoading } = useDepartmentEvents()
  const {  data: activitiesQueryData, isLoading: activitiesLoading } = useDepartmentStudentAcademicActivities()
  const {  data: studentBodyEventsQueryData, isLoading: studentBodyEventsLoading } = useDepartmentStudentBodyEvents()

  // Mutation hooks - all from single merged hook
  const mutations = useDepartmentEventsMutations()

  // Derive submitting state from mutations
  const isSubmitting = mutations.createEvent.isPending || mutations.updateEvent.isPending || 
                       mutations.createActivity.isPending || mutations.updateActivity.isPending ||
                       mutations.createStudentBodyEvent.isPending || mutations.updateStudentBodyEvent.isPending
  
  // Derive deleting state from mutations
  const isDeleting = mutations.deleteEvent.isPending || mutations.deleteActivity.isPending || mutations.deleteStudentBodyEvent.isPending

  // Document analysis context
  const { clearDocumentData, hasDocumentData } = useDocumentAnalysis()
  const { confirm, DialogComponent: ConfirmDialog } = useConfirmationDialog()
  const cancelHandlerRef = useRef(false)

  // Helper functions for auto-fill highlighting
  const isAutoFilled = useCallback((fieldName: string): boolean => {
    return autoFilledFields.has(fieldName)
  }, [autoFilledFields])

  const clearAutoFillHighlight = useCallback((fieldName: string) => {
    setAutoFilledFields((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fieldName)
      return newSet
    })
  }, [])

  // Map API data to UI format
  const data = useMemo(() => {
    const eventsData = (queryData?.events || []).map((item: any, index: number) => ({
      eid: item.eid,
      srNo: index + 1,
      ename: item.ename || "",
      description: item.description || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      place: item.place || "",
      fid: item.fid || "",
      Type_Prog: item.Type_Prog || "",
      Level_Prog: item.Level_Prog || "",
      Spo_Name: item.Spo_Name || "",
      Spo_Level: item.Spo_Level || "",
      No_Participant: item.No_Participant || 0,
      no_of_days: item.no_of_days || null,
      speaker_name: item.speaker_name || "",
      Image: item.Image || null,
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const activitiesData = (activitiesQueryData?.activities || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      activity: item.activity || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      place: item.place || "",
      participatants_num: item.participatants_num || 0,
      no_of_days: item.no_of_days || null,
      speaker_name: item.speaker_name || "",
      Image: item.Image || null,
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    const studentBodyEventsData = (studentBodyEventsQueryData?.events || []).map((item: any, index: number) => ({
      id: item.id,
      srNo: index + 1,
      title: item.title || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      place: item.place || "",
      levelid: item.levelid || null,
      Events_Stud_Body_Level_Name: item.Events_Stud_Body_Level_Name || null,
      participants_num: item.participants_num || 0,
      days: item.days || null,
      speaker_name: item.speaker_name || "",
      Image: item.Image || null,
      supportingDocument: item.Image ? [item.Image] : [],
    }))

    return {
      events: eventsData,
      activities: activitiesData,
      studentBodyEvents: studentBodyEventsData,
    }
  }, [queryData, activitiesQueryData, studentBodyEventsQueryData])

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && (tab === "events" || tab === "activities" || tab === "seminars")) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  // Navigation guard - warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      const hasUnsavedChanges = isEditDialogOpen && (form.formState.isDirty || hasDocumentData)
      
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isEditDialogOpen, form.formState.isDirty, hasDocumentData])

  const handleDeleteClick = useCallback((eventId: number, itemName: string, item?: any) => {
    setDeleteConfirm({ eventId, itemName, item, type: 'event' })
  }, [])

  const handleActivityDeleteClick = useCallback((activityId: number, itemName: string, item?: any) => {
    setDeleteConfirm({ activityId, itemName, item, type: 'activity' })
  }, [])

  const handleStudentBodyEventDeleteClick = useCallback((eventId: number, itemName: string, item?: any) => {
    setDeleteConfirm({ studentBodyEventId: eventId, itemName, item, type: 'studentBodyEvent' })
  }, [])

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { eventId, activityId, studentBodyEventId, item, type } = deleteConfirm

    try {
      // Get doc path from item
      let docPath: string | null = null
      if (item) {
        docPath = item.Image || null
      }
      
      if (type === 'activity' && activityId) {
        await mutations.deleteActivity.mutateAsync({ 
          activityId, 
          docPath,
          deptId: user?.dept_id || 0
        })
      } else if (type === 'event' && eventId) {
        await mutations.deleteEvent.mutateAsync({ 
          eventId, 
          docPath,
          deptId: user?.dept_id || 0
        })
      } else if (type === 'studentBodyEvent' && studentBodyEventId) {
        await mutations.deleteStudentBodyEvent.mutateAsync({ 
          studentBodyEventId, 
          docPath,
          deptId: user?.dept_id || 0
        })
      }
      setDeleteConfirm(null)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  // Use handlers hooks
  const eventsHandlers = useEventsHandlers(
    form,
    setEditingItem,
    setFormData,
    setAutoFilledFields,
    setIsEditDialogOpen,
    originalDocumentUrlRef
  )

  const activitiesHandlers = useActivitiesHandlers(
    form,
    setEditingItem,
    setFormData,
    setAutoFilledFields,
    setIsEditDialogOpen,
    originalDocumentUrlRef
  )

  const studentBodyEventsHandlers = useStudentBodyEventsHandlers(
    form,
    setEditingItem,
    setFormData,
    setAutoFilledFields,
    setIsEditDialogOpen,
    originalDocumentUrlRef
  )

  // Cancel handler for edit modal
  const handleModalCancel = async (event?: React.MouseEvent) => {
    if (event) {
      const target = event.target as HTMLElement
      if (target.closest('[data-sonner-toast]') || target.closest('[role="status"]') || target.closest('.toast')) {
        return false
      }
    }
    
    if (cancelHandlerRef.current) {
      return false
    }
    
    cancelHandlerRef.current = true
    
    try {
      const isDirty = form.formState.isDirty
      const formValues = form.getValues()
      const hasDocument = formValues.Image || false
      const hasUnsavedChanges = isDirty || hasDocument || hasDocumentData
      
      if (hasUnsavedChanges) {
        const shouldLeave = await confirm({
          title: "Discard Changes?",
          description: "Are you sure to discard the unsaved changes?",
          confirmText: "Discard",
          cancelText: "Cancel",
        })
        if (!shouldLeave) {
          return false
        }
      }
      
      form.reset()
      clearDocumentData()
      setAutoFilledFields(new Set())
      setIsEditDialogOpen(false)
    setEditingItem(null)
    setFormData({})
      return true
    } finally {
      setTimeout(() => {
        cancelHandlerRef.current = false
      }, 100)
    }
  }

  // Handle dialog close attempt
  const handleDialogOpenChange = async (open: boolean) => {
    if (!open && isEditDialogOpen) {
      const shouldClose = await handleModalCancel()
      if (!shouldClose) {
        return
      }
    }
    setIsEditDialogOpen(open)
  }



  return (
    <>
      {ConfirmDialog && <ConfirmDialog />}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Events</h1>
          <p className="text-muted-foreground">Manage department events and activities</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="flex flex-wrap min-w-max w-full sm:w-auto">
                <TabsTrigger
                  value="events"
                  className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Events</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Student Academic Activities</span>
                </TabsTrigger>
                <TabsTrigger
                  value="seminars"
                  className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-xs sm:text-sm"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Seminars/Conferences/Workshops</span>
                </TabsTrigger>
          </TabsList>
            </div>
          </div>

          <TabsContent value="events">
            <EventsTab
                  data={data.events || []}
              isLoading={eventsLoading}
              onAdd={eventsHandlers.handleAdd}
              onEdit={eventsHandlers.handleEdit}
              onDelete={handleDeleteClick}
            />
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesTab
              data={data.activities || []}
              isLoading={activitiesLoading}
              onAdd={activitiesHandlers.handleAdd}
              onEdit={activitiesHandlers.handleEdit}
              onDelete={handleActivityDeleteClick}
            />
          </TabsContent>

          <TabsContent value="seminars">
            <StudentBodyEventsTab
              data={data.studentBodyEvents || []}
              isLoading={studentBodyEventsLoading}
              onAdd={studentBodyEventsHandlers.handleAdd}
              onEdit={studentBodyEventsHandlers.handleEdit}
              onDelete={handleStudentBodyEventDeleteClick}
            />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog - Fully Responsive */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4">
            <DialogHeader className="pb-0 sm:pb-2 shrink-0">
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                {activeTab === "activities" 
                  ? (editingItem ? "Edit Activity" : "Add Activity")
                  : activeTab === "seminars"
                  ? (editingItem ? "Edit Event" : "Add Event")
                  : (editingItem ? "Edit Event" : "Add Event")
                }
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:mr-0 min-h-0">
              {activeTab === "activities" ? (
                <DeptStudentAcademicAct
                  form={form}
                  onSubmit={editingItem ? (formValues?: any) => activitiesHandlers.handleSaveEdit(editingItem, formValues) : activitiesHandlers.handleSaveAdd}
                  isSubmitting={isSubmitting}
                  isEdit={!!editingItem}
                  editData={formData}
                  onClearFields={() => {
                    form.reset()
                    setAutoFilledFields(new Set())
                  }}
                  onCancel={handleModalCancel}
                  isAutoFilled={isAutoFilled}
                  onFieldChange={clearAutoFillHighlight}
                />
              ) : activeTab === "seminars" ? (
                <DeptStudentBodyEventForm
                  form={form}
                  onSubmit={editingItem ? (formValues?: any) => studentBodyEventsHandlers.handleSaveEdit(editingItem, formValues) : studentBodyEventsHandlers.handleSaveAdd}
                  isSubmitting={isSubmitting}
                  isEdit={!!editingItem}
                  editData={formData}
                  onClearFields={() => {
                    form.reset()
                    setAutoFilledFields(new Set())
                  }}
                  onCancel={handleModalCancel}
                  isAutoFilled={isAutoFilled}
                  onFieldChange={clearAutoFillHighlight}
                />
              ) : (
              <EventForm
                form={form}
                  onSubmit={editingItem ? (formValues?: any) => eventsHandlers.handleSaveEdit(editingItem, formValues) : eventsHandlers.handleSaveAdd}
                isSubmitting={isSubmitting}
                isEdit={!!editingItem}
                editData={formData}
                onClearFields={() => {
                  form.reset()
                  setAutoFilledFields(new Set())
                }}
                onCancel={handleModalCancel}
                isAutoFilled={isAutoFilled}
                onFieldChange={clearAutoFillHighlight}
              />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                This action cannot be undone. This will permanently delete the {deleteConfirm?.type === 'activity' ? 'activity' : deleteConfirm?.type === 'studentBodyEvent' ? 'event' : 'event'}
                <strong className="block mt-2 text-base">
                  "{deleteConfirm?.itemName}"
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
