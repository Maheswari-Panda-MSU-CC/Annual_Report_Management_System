"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/api/auth/auth-provider"
import { Save, Edit, User, Loader2, Plus, Trash2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { cn } from "@/lib/utils"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import type { ColumnDef } from "@tanstack/react-table"
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

interface DepartmentProfileData {
  id?: number
  intro: string | null
  exam_reforms: string | null
  innovative_processes: string | null
  dept_lib: string | null
  dept_lab: string | null
  submit_date?: string
  year: number | null
  deptid: number
}

interface DepartmentProfileFormData {
  year: number | null
  introduction: string
  examinationReforms: string
  innovativeProcesses: string
  newEquipmentBooks: string
  newLaboratories: string
}

interface FundingRecord {
  Id: number
  DeptId: number
  FundingAgency: string
  DateofRecog: string
  Funds_Sancttioned: number | string
  Details: string | null
  _index?: number
}

interface FundingFormData {
  fundingRecords: FundingRecord[]
}

// Hardcoded funding agency options
const FUNDING_AGENCY_OPTIONS = [
  { value: "UGC-SAP", label: "UGC-SAP" },
  { value: "CAS", label: "CAS" },
  { value: "DST-FIST", label: "DST-FIST" },
  { value: "DPE", label: "DPE" },
  { value: "DBT Scheme", label: "DBT Scheme" },
  { value: "Any other funding agency", label: "Any other funding agency" },
]

// Utility function to format date to dd-mm-yyyy for display
const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return "-"
  }
}

// Utility function to format date for HTML date input (YYYY-MM-DD)
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  } catch {
    return ""
  }
}

export default function DepartmentProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { reportYearsOptions } = useDropDowns()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deptDetails, setDeptDetails] = useState<DepartmentProfileData | null>(null)
  
  // Funding table state
  const [fundingRecords, setFundingRecords] = useState<FundingRecord[]>([])
  const [fundingLoading, setFundingLoading] = useState(true)
  const [fundingEditingIds, setFundingEditingIds] = useState<Set<number>>(new Set())
  const [isSavingFunding, setIsSavingFunding] = useState<Record<number, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; itemName: string } | null>(null)
  const [isDeletingFunding, setIsDeletingFunding] = useState(false)
  const isInitialLoad = useRef(true)
  const isYearAutoSelected = useRef(false)
  
  // Store original data for cancel functionality
  const originalDeptDetails = useRef<DepartmentProfileFormData | null>(null)
  const originalFundingRecords = useRef<FundingRecord[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<DepartmentProfileFormData>({
    defaultValues: {
      year: null,
      introduction: "",
      examinationReforms: "",
      innovativeProcesses: "",
      newEquipmentBooks: "",
      newLaboratories: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const watchedYear = watch("year")

  // Funding form
  const fundingForm = useForm<FundingFormData>({
    defaultValues: { fundingRecords: [] },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { fields: fundingFields, append: appendFunding, remove: removeFunding, update: updateFunding, replace: replaceFunding } = useFieldArray({
    control: fundingForm.control,
    name: "fundingRecords",
  })

  // Fetch profile data on component mount - get latest record (without year)
  useEffect(() => {
    const fetchLatestProfileData = async () => {
      if (!user?.dept_id) {
        setLoading(false)
        return
      }

        try {
          setLoading(true)
          // Fetch latest record without year parameter (with cache-busting)
          const response = await fetch(`/api/department/profile?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch profile data: ${response.statusText}`)
          }

        const data = await response.json()
        const fetchedDeptDetails = data.deptDetails

        // Store the full deptDetails object for display purposes
        setDeptDetails(fetchedDeptDetails || null)

        if (fetchedDeptDetails) {
          // Auto-select the year from the fetched record
          isYearAutoSelected.current = true
          const formData = {
            year: fetchedDeptDetails.year || null,
            introduction: fetchedDeptDetails.intro || "",
            examinationReforms: fetchedDeptDetails.exam_reforms || "",
            innovativeProcesses: fetchedDeptDetails.innovative_processes || "",
            newEquipmentBooks: fetchedDeptDetails.dept_lib || "",
            newLaboratories: fetchedDeptDetails.dept_lab || "",
          }
          reset(formData, { keepDefaultValues: false })
          // Store original data for cancel
          originalDeptDetails.current = { ...formData }
          // Reset flag after a short delay to allow year to be set
          setTimeout(() => {
            isYearAutoSelected.current = false
            isInitialLoad.current = false
          }, 100)
        } else {
          // If no data found, reset to defaults
          setDeptDetails(null)
          isInitialLoad.current = false
          const defaultData = {
            year: null,
            introduction: "",
            examinationReforms: "",
            innovativeProcesses: "",
            newEquipmentBooks: "",
            newLaboratories: "",
          }
          reset(defaultData, { keepDefaultValues: false })
          originalDeptDetails.current = { ...defaultData }
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        isInitialLoad.current = false
        toast({
          title: "Error",
          description: "Failed to load department profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isInitialLoad.current) {
      fetchLatestProfileData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.dept_id])

  // Fetch profile data when year is manually changed (not on initial load)
  useEffect(() => {
    // Skip if this is the initial load or year is being auto-selected
    if (isInitialLoad.current || isYearAutoSelected.current || !watchedYear) {
      return
    }

    const fetchProfileDataByYear = async () => {
      if (!user?.dept_id || !watchedYear) {
        return
      }

      try {
        setLoading(true)
        // Fetch data for the selected year (with cache-busting)
        const response = await fetch(`/api/department/profile?year=${watchedYear}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile data: ${response.statusText}`)
        }

        const data = await response.json()
        const fetchedDeptDetails = data.deptDetails

        // Store the full deptDetails object for display purposes
        setDeptDetails(fetchedDeptDetails || null)

        if (fetchedDeptDetails) {
          const formData = {
            year: fetchedDeptDetails.year || null,
            introduction: fetchedDeptDetails.intro || "",
            examinationReforms: fetchedDeptDetails.exam_reforms || "",
            innovativeProcesses: fetchedDeptDetails.innovative_processes || "",
            newEquipmentBooks: fetchedDeptDetails.dept_lib || "",
            newLaboratories: fetchedDeptDetails.dept_lab || "",
          }
          reset(formData, { keepDefaultValues: false })
          // Store original data for cancel
          originalDeptDetails.current = { ...formData }
        } else {
          // If no data found for selected year, reset to defaults but keep the selected year
          setDeptDetails(null)
          const defaultData = {
            year: watchedYear || null,
            introduction: "",
            examinationReforms: "",
            innovativeProcesses: "",
            newEquipmentBooks: "",
            newLaboratories: "",
          }
          reset(defaultData, { keepDefaultValues: false })
          originalDeptDetails.current = { ...defaultData }
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        toast({
          title: "Error",
          description: "Failed to load department profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileDataByYear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedYear])

  // Navigation guard - warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      const hasUnsavedChanges = isEditing || fundingEditingIds.size > 0 || isDirty || fundingForm.formState.isDirty
      
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
  }, [isEditing, fundingEditingIds.size, isDirty, fundingForm.formState.isDirty])

  const onSubmit = async (data: DepartmentProfileFormData) => {
    if (!user?.dept_id) {
      toast({
        title: "Error",
        description: "Department ID is missing. Please log in again.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch("/api/department/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deptid: user.dept_id,
          year: data.year,
          intro: data.introduction || null,
          exam_reforms: data.examinationReforms || null,
          innovative_processes: data.innovativeProcesses || null,
          dept_lib: data.newEquipmentBooks || null,
          dept_lab: data.newLaboratories || null,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile")
      }

      // Refetch the profile data to show the updated values (same pattern as teacher module)
      if (data.year) {
        // Wait a bit for the data to refresh, then update the form (same as teacher module)
        // Use a longer delay to ensure database transaction is committed
        setTimeout(async () => {
          try {
            // Add cache-busting to ensure fresh data
            const refreshResponse = await fetch(`/api/department/profile?year=${data.year}&_t=${Date.now()}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              const updatedDeptDetails = refreshData.deptDetails

              // Update the stored deptDetails
              setDeptDetails(updatedDeptDetails || null)

              if (updatedDeptDetails) {
                const formData = {
                  year: updatedDeptDetails.year || null,
                  introduction: updatedDeptDetails.intro || "",
                  examinationReforms: updatedDeptDetails.exam_reforms || "",
                  innovativeProcesses: updatedDeptDetails.innovative_processes || "",
                  newEquipmentBooks: updatedDeptDetails.dept_lib || "",
                  newLaboratories: updatedDeptDetails.dept_lab || "",
                }
                reset(formData, { keepDefaultValues: false })
                // Update original data after successful save
                originalDeptDetails.current = { ...formData }
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing profile data after save:', refreshError)
          }
        }, 200)
      }

      toast({
        title: "Success",
        description: "Department profile has been successfully updated.",
      })

      setIsEditing(false)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Restore original data
    if (originalDeptDetails.current) {
      reset(originalDeptDetails.current, { keepDefaultValues: false })
    } else {
      // If no original data, reload from server
      if (user?.dept_id && watchedYear) {
        const fetchData = async () => {
          try {
            const response = await fetch(`/api/department/profile?year=${watchedYear}&_t=${Date.now()}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            if (response.ok) {
              const data = await response.json()
              const fetchedDeptDetails = data.deptDetails
              
              setDeptDetails(fetchedDeptDetails || null)
              
              if (fetchedDeptDetails) {
                const formData = {
                  year: fetchedDeptDetails.year || null,
                  introduction: fetchedDeptDetails.intro || "",
                  examinationReforms: fetchedDeptDetails.exam_reforms || "",
                  innovativeProcesses: fetchedDeptDetails.innovative_processes || "",
                  newEquipmentBooks: fetchedDeptDetails.dept_lib || "",
                  newLaboratories: fetchedDeptDetails.dept_lab || "",
                }
                reset(formData, { keepDefaultValues: false })
                originalDeptDetails.current = { ...formData }
              } else {
                setDeptDetails(null)
                const defaultData = {
                  year: watchedYear || null,
                  introduction: "",
                  examinationReforms: "",
                  innovativeProcesses: "",
                  newEquipmentBooks: "",
                  newLaboratories: "",
                }
                reset(defaultData, { keepDefaultValues: false })
                originalDeptDetails.current = { ...defaultData }
              }
            }
          } catch (err) {
            console.error("Error reloading data:", err)
          }
        }
        fetchData()
      } else if (!watchedYear) {
        const defaultData = {
          year: null,
          introduction: "",
          examinationReforms: "",
          innovativeProcesses: "",
          newEquipmentBooks: "",
          newLaboratories: "",
        }
        reset(defaultData, { keepDefaultValues: false })
        originalDeptDetails.current = { ...defaultData }
      }
    }
    setIsEditing(false)
  }

  // Fetch funding records
  const fetchFundingRecords = useCallback(async () => {
    if (!user?.dept_id) {
      setFundingLoading(false)
      return
    }

    try {
      setFundingLoading(true)
      // Add cache-busting to ensure fresh data (same pattern as teacher module)
      const response = await fetch(`/api/department/profile/funding?deptId=${user.dept_id}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch funding data: ${response.statusText}`)
      }

      const data = await response.json()
      const records = (data.fundingRecords || []).map((record: any, index: number) => ({
        ...record,
        _index: index,
      }))
      
      setFundingRecords(records)
      // Replace all fields in the form array - this ensures immediate update
      replaceFunding(records)
      // Store original data for cancel functionality
      originalFundingRecords.current = records.map((r: FundingRecord) => ({ ...r }))
    } catch (err: any) {
      console.error("Error fetching funding records:", err)
      toast({
        title: "Error",
        description: "Failed to load funding records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFundingLoading(false)
    }
  }, [user?.dept_id, toast, replaceFunding])

  // Fetch funding on mount
  useEffect(() => {
    fetchFundingRecords()
  }, [fetchFundingRecords])

  // Add new funding entry
  const addFundingEntry = () => {
    // Disable if any edit mode is on (dept details or funding)
    if (isEditing || fundingEditingIds.size > 0) {
      toast({
        title: "Cannot Add",
        description: "Please save or cancel the currently editing record before adding a new one.",
        variant: "default",
      })
      return
    }

    const newEntry: FundingRecord = {
      Id: Date.now(),
      DeptId: user?.dept_id || 0,
      FundingAgency: "",
      DateofRecog: "",
      Funds_Sancttioned: "",
      Details: "",
      _index: fundingFields.length,
    }
    appendFunding(newEntry)
    setFundingEditingIds(prev => new Set([...prev, newEntry.Id]))
  }

  // Save funding row
  const handleSaveFundingRow = async (index: number, id: number) => {
    setIsSavingFunding(prev => ({ ...prev, [id]: true }))
    try {
      if (!user?.dept_id) {
        toast({ title: "Error", description: "Department ID not found.", variant: "destructive" })
        return
      }

      // Validate all fields
      const fieldsToValidate = [
        `fundingRecords.${index}.FundingAgency`,
        `fundingRecords.${index}.DateofRecog`,
        `fundingRecords.${index}.Funds_Sancttioned`,
      ]

      const validationResults = await Promise.all(
        fieldsToValidate.map(field => fundingForm.trigger(field as any))
      )

      if (!validationResults.every(result => result === true)) {
        const errors = fundingForm.formState.errors
        const fieldErrors: string[] = []

        const agencyError = errors.fundingRecords?.[index]?.FundingAgency?.message
        if (agencyError) fieldErrors.push(`Funding Agency: ${agencyError}`)

        const dateError = errors.fundingRecords?.[index]?.DateofRecog?.message
        if (dateError) fieldErrors.push(`Date: ${dateError}`)

        const fundsError = errors.fundingRecords?.[index]?.Funds_Sancttioned?.message
        if (fundsError) fieldErrors.push(`Funds: ${fundsError}`)

        toast({
          title: "Validation Failed",
          description: fieldErrors.join(". ") || "Please fill all required fields correctly.",
          variant: "destructive",
        })
        return
      }

      const entry = fundingForm.getValues(`fundingRecords.${index}`)
      const isNewEntry = !entry.Id || entry.Id > 2147483647

      const payload = {
        id: isNewEntry ? undefined : entry.Id,
        deptId: user.dept_id,
        fundingAgency: entry.FundingAgency.trim(),
        dateofRecog: entry.DateofRecog,
        fundsSancttioned: Number(entry.Funds_Sancttioned),
        details: entry.Details?.trim() || null,
      }

      const response = await fetch("/api/department/profile/funding", {
        method: isNewEntry ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save funding record")
      }

      // Exit edit mode first
      setFundingEditingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      // Refresh data after successful save (same pattern as teacher module)
      // Invalidate and refresh data - wait a bit for the data to refresh, then update the form
      setTimeout(async () => {
        try {
          const refreshRes = await fetch(`/api/department/profile/funding?deptId=${user.dept_id}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            const records = (refreshData.fundingRecords || []).map((record: any, idx: number) => ({
              ...record,
              _index: idx,
            }))
            // Update state first, then form array to ensure re-render
            setFundingRecords(records)
            replaceFunding(records)
            // Update original data after successful save
            originalFundingRecords.current = records.map((r: FundingRecord) => ({ ...r }))
          }
        } catch (refreshError) {
          console.error('Error refreshing funding records after save:', refreshError)
        }
      }, 200)

      toast({
        title: "Success",
        description: result.message || "Funding record saved successfully.",
      })
    } catch (error: any) {
      console.error("Save funding error:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Could not save funding record.",
        variant: "destructive",
      })
    } finally {
      setIsSavingFunding(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  // Cancel funding row edit
  const handleCancelFundingRow = async (index: number, id: number) => {
    setFundingEditingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

    // Restore original data
    if (originalFundingRecords.current.length > 0) {
      const restoredRecords = originalFundingRecords.current.map((r, idx) => ({
        ...r,
        _index: idx,
      }))
      setFundingRecords(restoredRecords)
      replaceFunding(restoredRecords)
    } else {
      // If no original data, refetch from server
      if (user?.dept_id) {
        try {
          const response = await fetch(`/api/department/profile/funding?deptId=${user.dept_id}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          if (response.ok) {
            const data = await response.json()
            const records = (data.fundingRecords || []).map((record: any, idx: number) => ({
              ...record,
              _index: idx,
            }))
            setFundingRecords(records)
            replaceFunding(records)
            originalFundingRecords.current = records.map((r: FundingRecord) => ({ ...r }))
          }
        } catch (err) {
          console.error("Error resetting funding form:", err)
        }
      }
    }
  }

  // Delete funding record
  const handleDeleteFunding = (index: number, id: number) => {
    const record = fundingRecords.find(r => r.Id === id)
    const itemName = record?.FundingAgency || `Funding record #${id}`
    setDeleteConfirm({ id, itemName })
  }

  const confirmDeleteFunding = async () => {
    if (!deleteConfirm || !user?.dept_id) return

    try {
      setIsDeletingFunding(true)
      const response = await fetch(
        `/api/department/profile/funding?id=${deleteConfirm.id}&deptId=${user.dept_id}`,
        { method: "DELETE" }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete funding record")
      }

      // Remove from form array first
      const index = fundingRecords.findIndex(r => r.Id === deleteConfirm.id)
      if (index !== -1) {
        removeFunding(index)
      }

      // Refresh data after successful delete (same pattern as teacher module)
      // Invalidate and refresh data - wait a bit for the data to refresh, then update the form
      setTimeout(async () => {
        try {
          const refreshRes = await fetch(`/api/department/profile/funding?deptId=${user.dept_id}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          })
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            const records = (refreshData.fundingRecords || []).map((record: any, idx: number) => ({
              ...record,
              _index: idx,
            }))
            // Update state first, then form array
            setFundingRecords(records)
            replaceFunding(records)
            // Update original data after successful delete
            originalFundingRecords.current = records.map((r: FundingRecord) => ({ ...r }))
          }
        } catch (refreshError) {
          console.error('Error refreshing funding records after delete:', refreshError)
        }
      }, 200)

      toast({
        title: "Success",
        description: result.message || "Funding record deleted successfully.",
      })

      setDeleteConfirm(null)
    } catch (error: any) {
      console.error("Delete funding error:", error)
      toast({
        title: "Delete Failed",
        description: error.message || "Could not delete funding record.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingFunding(false)
    }
  }

  // Toggle funding row edit
  const toggleFundingRowEdit = (id: number) => {
    // Disable if dept details edit mode is on
    if (isEditing) {
      toast({
        title: "Cannot Edit",
        description: "Please save or cancel the department details edit before editing funding records.",
        variant: "default",
      })
      return
    }
    
    const isCurrentlyEditing = fundingEditingIds.has(id)
    if (!isCurrentlyEditing && fundingEditingIds.size > 0) {
      toast({
        title: "Cannot Edit",
        description: "Please save or cancel the currently editing record before editing another.",
        variant: "default",
      })
      return
    }
    
    // Store original data when entering edit mode
    if (!isCurrentlyEditing) {
      originalFundingRecords.current = fundingRecords.map((r: FundingRecord) => ({ ...r }))
    }
    
    setFundingEditingIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Department Profile
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Loading...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Department Profile
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your department information and details
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => {
                // Store original data when entering edit mode
                const currentValues = {
                  year: watchedYear,
                  introduction: watch("introduction") || "",
                  examinationReforms: watch("examinationReforms") || "",
                  innovativeProcesses: watch("innovativeProcesses") || "",
                  newEquipmentBooks: watch("newEquipmentBooks") || "",
                  newLaboratories: watch("newLaboratories") || "",
                }
                originalDeptDetails.current = { ...currentValues }
                setIsEditing(true)
              }} 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              disabled={fundingEditingIds.size > 0}
              title={fundingEditingIds.size > 0 ? "Please save or cancel the currently editing funding record first" : "Edit Profile"}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Department Details</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Update your department information and academic details
              </CardDescription>
            </div>
            {deptDetails?.submit_date && (
              <div className="text-xs sm:text-sm text-gray-500">
                Last updated: {new Date(deptDetails.submit_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!loading && !watchedYear && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Please select a year to view or edit department details.
              </p>
            </div>
          )}
          {!loading && watchedYear && !deptDetails && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                No department details found for the selected year. Click "Edit Profile" to add new details.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="departmentName" className="text-sm sm:text-base">
                  Department Name
                </Label>
                <Input
                  id="departmentName"
                  value={user?.department || ""}
                  readOnly
                  placeholder="Department name"
                  className="text-sm sm:text-base bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyName" className="text-sm sm:text-base">
                  Faculty Name
                </Label>
                <Input
                  id="facultyName"
                  value={user?.faculty || ""}
                  readOnly
                  placeholder="Faculty name"
                  className="text-sm sm:text-base bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm sm:text-base">
                  Year <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="year"
                  control={control}
                  rules={{
                    required: "Year is required",
                    validate: (v) => (v !== null && v !== undefined && v !== 0) || "Year is required"
                  }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={reportYearsOptions.map((year) => ({
                        value: year.id.toString(),
                        label: year.name,
                      }))}
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : null)
                      }}
                      placeholder="Select year"
                      emptyMessage="No year found"
                      disabled={!isEditing || saving}
                    />
                  )}
                />
                {errors.year && (
                  <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>
                )}
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <Label htmlFor="introduction" className="text-sm sm:text-base">
                Introduction
              </Label>
              <Textarea
                id="introduction"
                {...register("introduction")}
                readOnly={!isEditing || saving}
                placeholder="Enter department introduction..."
                rows={4}
                className={cn(
                  "text-sm sm:text-base resize-none min-h-[100px]",
                  !isEditing && "bg-gray-50",
                  errors.introduction && "border-red-500"
                )}
              />
              {errors.introduction && (
                <p className="text-sm text-red-500 mt-1">{errors.introduction.message}</p>
              )}
            </div>

            {/* Examination Reforms */}
            <div className="space-y-2">
              <Label htmlFor="examinationReforms" className="text-sm sm:text-base">
                Examination Reforms
              </Label>
              <Textarea
                id="examinationReforms"
                {...register("examinationReforms")}
                readOnly={!isEditing || saving}
                placeholder="Enter examination reforms details..."
                rows={4}
                className={cn(
                  "text-sm sm:text-base resize-none min-h-[100px]",
                  !isEditing && "bg-gray-50",
                  errors.examinationReforms && "border-red-500"
                )}
              />
              {errors.examinationReforms && (
                <p className="text-sm text-red-500 mt-1">{errors.examinationReforms.message}</p>
              )}
            </div>

            {/* Innovative Processes */}
            <div className="space-y-2">
              <Label htmlFor="innovativeProcesses" className="text-sm sm:text-base">
                Innovative Processes in Teaching/Learning
              </Label>
              <Textarea
                id="innovativeProcesses"
                {...register("innovativeProcesses")}
                readOnly={!isEditing || saving}
                placeholder="Enter innovative processes in teaching/learning..."
                rows={4}
                className={cn(
                  "text-sm sm:text-base resize-none min-h-[100px]",
                  !isEditing && "bg-gray-50",
                  errors.innovativeProcesses && "border-red-500"
                )}
              />
              {errors.innovativeProcesses && (
                <p className="text-sm text-red-500 mt-1">{errors.innovativeProcesses.message}</p>
              )}
            </div>

            {/* New Equipment and Books */}
            <div className="space-y-2">
              <Label htmlFor="newEquipmentBooks" className="text-sm sm:text-base">
                New Equipment and Books in the Departmental Library
              </Label>
              <Textarea
                id="newEquipmentBooks"
                {...register("newEquipmentBooks")}
                readOnly={!isEditing || saving}
                placeholder="Enter details about new equipment and books..."
                rows={4}
                className={cn(
                  "text-sm sm:text-base resize-none min-h-[100px]",
                  !isEditing && "bg-gray-50",
                  errors.newEquipmentBooks && "border-red-500"
                )}
              />
              {errors.newEquipmentBooks && (
                <p className="text-sm text-red-500 mt-1">{errors.newEquipmentBooks.message}</p>
              )}
            </div>

            {/* New Laboratories */}
            <div className="space-y-2">
              <Label htmlFor="newLaboratories" className="text-sm sm:text-base">
                New Laboratories/Seminar/Conference Rooms
              </Label>
              <Textarea
                id="newLaboratories"
                {...register("newLaboratories")}
                readOnly={!isEditing || saving}
                placeholder="Enter details about new laboratories, seminar and conference rooms..."
                rows={4}
                className={cn(
                  "text-sm sm:text-base resize-none min-h-[100px]",
                  !isEditing && "bg-gray-50",
                  errors.newLaboratories && "border-red-500"
                )}
              />
              {errors.newLaboratories && (
                <p className="text-sm text-red-500 mt-1">{errors.newLaboratories.message}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Funding Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Department Funding</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage funding records for the department
              </CardDescription>
            </div>
            <Button
              onClick={addFundingEntry}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={isEditing || fundingEditingIds.size > 0}
              title={isEditing ? "Please save or cancel the department details edit first" : fundingEditingIds.size > 0 ? "Please save or cancel the currently editing record first" : "Add Funding"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Funding</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <FundingTable
            fundingForm={fundingForm}
            fundingFields={fundingFields}
            fundingEditingIds={fundingEditingIds}
            isSavingFunding={isSavingFunding}
            fundingLoading={fundingLoading}
            isEditing={isEditing}
            onSaveRow={handleSaveFundingRow}
            onCancelRow={handleCancelFundingRow}
            onDeleteRow={handleDeleteFunding}
            onToggleEdit={toggleFundingRowEdit}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog - Consistent with teacher module */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the record
              <strong className="block mt-2 text-base">
                "{deleteConfirm?.itemName}"
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeletingFunding} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFunding}
              disabled={isDeletingFunding}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeletingFunding ? (
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
  )
}

// Funding Table Component
function FundingTable({
  fundingForm,
  fundingFields,
  fundingEditingIds,
  isSavingFunding,
  fundingLoading,
  isEditing,
  onSaveRow,
  onCancelRow,
  onDeleteRow,
  onToggleEdit,
}: {
  fundingForm: any
  fundingFields: any[]
  fundingEditingIds: Set<number>
  isSavingFunding: Record<number, boolean>
  fundingLoading: boolean
  isEditing: boolean
  onSaveRow: (index: number, id: number) => void
  onCancelRow: (index: number, id: number) => void
  onDeleteRow: (index: number, id: number) => void
  onToggleEdit: (id: number) => void
}) {
  const hasAnyRecordEditing = fundingEditingIds.size > 0

  const tableData = useMemo(() => {
    return fundingFields.map((field, index) => ({
      ...field,
      _index: index,
    }))
  }, [fundingFields])

  const columns = useMemo<ColumnDef<FundingRecord>[]>(() => [
    {
      accessorKey: "FundingAgency",
      header: () => (
        <span>
          Funding Agency <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index ?? 0
        const field = fundingFields[index]
        const rowEditing = fundingEditingIds.has(field.Id)
        const value = row.original.FundingAgency || ""
        const displayValue = FUNDING_AGENCY_OPTIONS.find(opt => opt.value === value)?.label || value

        if (!rowEditing) {
          return (
            <div className="text-xs sm:text-sm text-gray-900 py-1">
              {displayValue || "-"}
            </div>
          )
        }

        return (
          <Controller
            control={fundingForm.control}
            name={`fundingRecords.${index}.FundingAgency`}
            rules={{
              required: rowEditing ? "Funding agency is required" : false,
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <SearchableSelect
                  options={FUNDING_AGENCY_OPTIONS}
                  value={formField.value || ""}
                  onValueChange={formField.onChange}
                  placeholder="Select funding agency"
                  emptyMessage="No agency found"
                  disabled={!rowEditing || isSavingFunding[field.Id]}
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
      size: 200,
    },
    {
      accessorKey: "DateofRecog",
      header: () => (
        <span>
          Date of Recognition <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index ?? 0
        const field = fundingFields[index]
        const rowEditing = fundingEditingIds.has(field.Id)
        const value = row.original.DateofRecog || ""

        if (!rowEditing) {
          return (
            <div className="text-xs sm:text-sm text-gray-900 py-1">
              {formatDateForDisplay(value)}
            </div>
          )
        }

        return (
          <Controller
            control={fundingForm.control}
            name={`fundingRecords.${index}.DateofRecog`}
            rules={{
              required: rowEditing ? "Date of recognition is required" : false,
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  type="date"
                  value={formatDateForInput(formField.value)}
                  onChange={(e) => formField.onChange(e.target.value)}
                  disabled={!rowEditing || isSavingFunding[field.Id]}
                  className={cn(
                    "w-full text-xs sm:text-sm",
                    error && "border-red-500"
                  )}
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
      size: 180,
    },
    {
      accessorKey: "Funds_Sancttioned",
      header: () => (
        <span>
          Funds Sanctioned <span className="text-red-500">*</span>
        </span>
      ),
      cell: ({ row }) => {
        const index = row.original._index ?? 0
        const field = fundingFields[index]
        const rowEditing = fundingEditingIds.has(field.Id)
        const value = row.original.Funds_Sancttioned

        if (!rowEditing) {
          const formattedAmount = value
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(value))
            : "-"
          return (
            <div className="text-xs sm:text-sm text-gray-900 py-1">
              {formattedAmount}
            </div>
          )
        }

        return (
          <Controller
            control={fundingForm.control}
            name={`fundingRecords.${index}.Funds_Sancttioned`}
            rules={{
              required: rowEditing ? "Funds sanctioned is required" : false,
              validate: (v) => {
                if (rowEditing) {
                  if (!v || v === "" || Number(v) <= 0) {
                    return "Funds sanctioned must be a positive number"
                  }
                }
                return true
              },
            }}
            render={({ field: formField, fieldState: { error } }) => (
              <div>
                <Input
                  type="number"
                  value={formField.value || ""}
                  onChange={(e) => formField.onChange(e.target.value)}
                  disabled={!rowEditing || isSavingFunding[field.Id]}
                  placeholder="Enter amount"
                  className={cn(
                    "w-full text-xs sm:text-sm",
                    error && "border-red-500"
                  )}
                  min="0"
                  step="1"
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
      size: 180,
    },
    {
      accessorKey: "Details",
      header: "Details",
      cell: ({ row }) => {
        const index = row.original._index ?? 0
        const field = fundingFields[index]
        const rowEditing = fundingEditingIds.has(field.Id)
        const value = row.original.Details || ""

        if (!rowEditing) {
          return (
            <div className="text-xs sm:text-sm text-gray-900 py-1 max-w-[250px]">
              {value || "-"}
            </div>
          )
        }

        return (
          <Controller
            control={fundingForm.control}
            name={`fundingRecords.${index}.Details`}
            render={({ field: formField }) => (
              <Textarea
                value={formField.value || ""}
                onChange={(e) => formField.onChange(e.target.value)}
                disabled={!rowEditing || isSavingFunding[field.Id]}
                placeholder="Enter details"
                rows={2}
                className={cn(
                  "w-full text-xs sm:text-sm resize-none"
                )}
              />
            )}
          />
        )
      },
      enableSorting: false,
      size: 250,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const index = row.original._index ?? 0
        const field = fundingFields[index]
        const rowEditing = fundingEditingIds.has(field.Id)
        return (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            {!rowEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onToggleEdit(field.Id)}
                  className="h-7 w-7 p-0"
                  disabled={hasAnyRecordEditing || isEditing}
                  title={isEditing ? "Please save or cancel the department details edit first" : hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Edit"}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteRow(index, field.Id)}
                  className="h-7 w-7 p-0"
                  disabled={hasAnyRecordEditing || isEditing}
                  title={isEditing ? "Please save or cancel the department details edit first" : hasAnyRecordEditing ? "Please save or cancel the currently editing record first" : "Delete"}
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
                  disabled={isSavingFunding[field.Id]}
                  className="flex items-center gap-1 h-7 text-xs px-2"
                >
                  {isSavingFunding[field.Id] ? (
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
                  onClick={() => onCancelRow(index, field.Id)}
                  disabled={isSavingFunding[field.Id] || Object.values(isSavingFunding).some(v => v)}
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
  ], [fundingForm, fundingFields, fundingEditingIds, isSavingFunding, hasAnyRecordEditing, isEditing, onToggleEdit, onSaveRow, onDeleteRow, onCancelRow, formatDateForDisplay, formatDateForInput])

  if (fundingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <EnhancedDataTable
      columns={columns}
      data={tableData}
      loading={false}
      pageSize={25}
      exportable={true}
      enableGlobalFilter={true}
      emptyMessage="No funding records found. Click 'Add Funding' to get started."
      wrapperClassName="rounded-md border overflow-x-auto"
      className="w-full"
    />
  )
}
