import { useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDepartmentEventsMutations } from "@/hooks/use-department-events-mutations"
import { useS3DocumentHandler } from "./use-s3-document-handler"
import { formatDateForInput } from "../utils"

export function useStudentBodyEventsHandlers(
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
      title: item.title || "",
      date: formatDateForInput(item.date),
      place: item.place || "",
      level: item.levelid || null,
      participants_num: item.participants_num || 0,
      days: item.days || null,
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
        folderName: "dept event student body",
        originalDocUrl: originalDocumentUrlRef.current,
        currentDocUrl: values.Image,
        recordId: editingItem.id,
      })
      
      // Ensure level is null if it's 0, empty string, or undefined
      const levelValue = values.level && values.level !== "" && values.level !== 0 
        ? Number(values.level) 
        : null
      
      updateData = {
        deptid: user.dept_id,
        title: values.title,
        date: values.date,
        place: values.place || null,
        level: levelValue,
        participants_num: values.participants_num || null,
        fid: null,
        days: values.days || null,
        speaker_name: values.speaker_name || null,
        Image: docUrl,
        // Pass flag to indicate if S3 upload actually happened
        _s3Uploaded: wasUploaded,
      }
      
      await mutations.updateStudentBodyEvent.mutateAsync({
        studentBodyEventId: editingItem.id,
        eventData: updateData,
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
      title: "",
      date: "",
      place: "",
      level: null,
      participants_num: null,
      days: null,
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
        folderName: "dept event student body",
        currentDocUrl: formValues.Image,
      })
      
      // Ensure level is null if it's 0, empty string, or undefined
      const levelValue = formValues.level && formValues.level !== "" && formValues.level !== 0 
        ? Number(formValues.level) 
        : null
      
      const eventData = {
        deptid: user.dept_id,
        title: formValues.title,
        date: formValues.date,
        place: formValues.place || null,
        level: levelValue,
        participants_num: formValues.participants_num || null,
        fid: null,
        days: formValues.days || null,
        speaker_name: formValues.speaker_name || null,
        Image: docUrl,
      }
      
      await mutations.createStudentBodyEvent.mutateAsync(eventData)
      
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

