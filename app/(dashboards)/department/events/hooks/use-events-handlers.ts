import { useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDepartmentEventsMutations } from "@/hooks/use-department-events-mutations"
import { useS3DocumentHandler } from "./use-s3-document-handler"
import { formatDateForInput } from "../utils"

export function useEventsHandlers(
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
      ename: item.ename || "",
      description: item.description || "",
      date: formatDateForInput(item.date),
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
        folderName: "dept events",
        originalDocUrl: originalDocumentUrlRef.current,
        currentDocUrl: values.Image,
        recordId: editingItem.eid,
      })
      
      updateData = {
        deptid: user.dept_id,
        ename: values.ename,
        description: values.description || null,
        date: values.date,
        place: values.place || null,
        fid: values.fid || null,
        Type_Prog: values.Type_Prog || null,
        Level_Prog: values.Level_Prog || null,
        Spo_Name: values.Spo_Name || null,
        Spo_Level: values.Spo_Level || null,
        No_Participant: values.No_Participant || null,
        no_of_days: values.no_of_days || null,
        speaker_name: values.speaker_name || null,
        Image: docUrl,
        // Pass flag to indicate if S3 upload actually happened
        _s3Uploaded: wasUploaded,
      }
      
      await mutations.updateEvent.mutateAsync({
        eventId: editingItem.eid,
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
      ename: "",
      description: "",
      date: "",
      place: "",
      fid: "",
      Type_Prog: "",
      Level_Prog: "",
      Spo_Name: "",
      Spo_Level: "",
      No_Participant: null,
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
        folderName: "dept events",
        currentDocUrl: formValues.Image,
      })
      
      const eventData = {
        deptid: user.dept_id,
        ename: formValues.ename,
        description: formValues.description || null,
        date: formValues.date,
        place: formValues.place || null,
        fid: formValues.fid || null,
        Type_Prog: formValues.Type_Prog || null,
        Level_Prog: formValues.Level_Prog || null,
        Spo_Name: formValues.Spo_Name || null,
        Spo_Level: formValues.Spo_Level || null,
        No_Participant: formValues.No_Participant || null,
        no_of_days: formValues.no_of_days || null,
        speaker_name: formValues.speaker_name || null,
        Image: docUrl,
      }
      
      await mutations.createEvent.mutateAsync(eventData)
      
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

