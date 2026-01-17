import { useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDepartmentEventsMutations } from "@/hooks/use-department-events-mutations"
import { useS3DocumentHandler } from "./use-s3-document-handler"
import { formatDateForInput } from "../utils"

export function useActivitiesHandlers(
  form: UseFormReturn<any>,
  setEditingItem: (item: any) => void,
  setFormData: (data: any) => void,
  setAutoFilledFields: (fields: Set<string>) => void,
  setIsEditDialogOpen: (open: boolean) => void,
  originalDocumentUrlRef: React.MutableRefObject<string | null>
) {
  const { user } = useAuth()
  const mutations = useDepartmentEventsMutations()
  const { handleDocumentUpload, handleDocumentUploadForNew } = useS3DocumentHandler()

  const handleEdit = useCallback((item: any) => {
    setEditingItem(item)
    setAutoFilledFields(new Set())
    
    const formItem: any = {
      activity: item.activity || "",
      date: formatDateForInput(item.date),
      place: item.place || "",
      participatants_num: item.participatants_num || 0,
      no_of_days: item.no_of_days || null,
      speaker_name: item.speaker_name || "",
      Image: item.Image || null,
    }
    
    if (item.Image) {
      originalDocumentUrlRef.current = item.Image
    } else {
      originalDocumentUrlRef.current = null
    }
    
    setFormData(formItem)
    form.reset(formItem)
    setIsEditDialogOpen(true)
  }, [form, setEditingItem, setFormData, setAutoFilledFields, setIsEditDialogOpen, originalDocumentUrlRef])

  const handleSaveEdit = useCallback(async (editingItem: any, formValues?: any) => {
    if (!editingItem || !user?.dept_id) return

    const values = formValues || form.getValues()
    let updateData: any = {}

    try {
      const { docUrl, wasUploaded } = await handleDocumentUpload({
        deptId: user.dept_id,
        folderName: "dept student academic",
        originalDocUrl: originalDocumentUrlRef.current,
        currentDocUrl: values.Image,
        recordId: editingItem.id,
      })
      
      updateData = {
        deptid: user.dept_id,
        activity: values.activity,
        date: values.date,
        place: values.place || null,
        participatants_num: values.participatants_num || null,
        fid: null,
        no_of_days: values.no_of_days || null,
        speaker_name: values.speaker_name || null,
        Image: docUrl,
        // Pass flag to indicate if S3 upload actually happened
        _s3Uploaded: wasUploaded,
      }
      
      await mutations.updateActivity.mutateAsync({
        activityId: editingItem.id,
        activityData: updateData,
      })
      
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setAutoFilledFields(new Set())
    } catch (error: any) {
      console.error("Error updating record:", error)
    }
  }, [form, user, handleDocumentUpload, mutations, setEditingItem, setFormData, setAutoFilledFields, setIsEditDialogOpen, originalDocumentUrlRef])

  const handleAdd = useCallback(() => {
    setEditingItem(null)
    setAutoFilledFields(new Set())
    setFormData({})
    originalDocumentUrlRef.current = null
    form.reset({
      activity: "",
      date: "",
      place: "",
      participatants_num: null,
      no_of_days: null,
      speaker_name: "",
      Image: "",
    })
    setIsEditDialogOpen(true)
  }, [form, setEditingItem, setFormData, setAutoFilledFields, setIsEditDialogOpen, originalDocumentUrlRef])

  const handleSaveAdd = useCallback(async (formValues: any) => {
    if (!user?.dept_id) return

    try {
      const docUrl = await handleDocumentUploadForNew({
        deptId: user.dept_id,
        folderName: "dept student academic",
        currentDocUrl: formValues.Image,
      })
      
      const activityData = {
        deptid: user.dept_id,
        activity: formValues.activity,
        date: formValues.date,
        place: formValues.place || null,
        participatants_num: formValues.participatants_num || null,
        fid: null,
        no_of_days: formValues.no_of_days || null,
        speaker_name: formValues.speaker_name || null,
        Image: docUrl,
      }
      
      await mutations.createActivity.mutateAsync(activityData)
      
      setIsEditDialogOpen(false)
      setFormData({})
      setAutoFilledFields(new Set())
      form.reset()
    } catch (error: any) {
      console.error("Error adding record:", error)
    }
  }, [user, handleDocumentUploadForNew, mutations, setFormData, setAutoFilledFields, setIsEditDialogOpen, form])

  return {
    handleEdit,
    handleSaveEdit,
    handleAdd,
    handleSaveAdd,
  }
}

