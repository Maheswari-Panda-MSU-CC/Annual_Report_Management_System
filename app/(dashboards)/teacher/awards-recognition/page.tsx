"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Upload, BarChart3, Users, Save, Calendar, Trophy, FileText, Loader2, MapPin } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { useForm } from "react-hook-form"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { PerformanceTeacherForm } from "@/components/forms/PerformanceTeacherForm"
import { AwardsFellowshipForm } from "@/components/forms/AwardsFellowshipForm"
import { ExtensionActivityForm } from "@/components/forms/ExtensionActivityForm"

// Sample data for each section
const initialSampleData = {
  performance: [],
  awards: [],
  extension: [],
}

const sections = [
  {
    id: "performance",
    title: "Performance by Individual/Group",
    icon: BarChart3,
    columns: [
      "Sr No.",
      "Title of Performance",
      "Place",
      "Performance Date",
      "Nature of Performance",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "awards",
    title: "Awards/Fellowship/Recognition",
    icon: Trophy,
    columns: [
      "Sr No.",
      "Name of Award / Fellowship",
      "Details",
      "Name of Awarding Agency",
      "Address of Awarding Agency",
      "Date of Award",
      "Level",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
  {
    id: "extension",
    title: "Extension",
    icon: Users,
    columns: [
      "Sr No.",
      "Name of Activity",
      "Nature of Activity",
      "Level",
      "Sponsored By",
      "Place",
      "Date",
      "Image (JPEG/BMP/PNG) OR PDF",
      "Actions",
    ],
  },
]

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png,.bmp", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, JPEG, PNG, BMP up to 10MB each</span>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </div>
    </div>
  )
}

export default function AwardsRecognitionPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("performance")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialSampleData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    performance: false,
    awards: false,
    extension: false,
  })
  const [fetchedSections, setFetchedSections] = useState<Set<string>>(new Set())
  const fetchingRef = useRef<Set<string>>(new Set())
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())
  const form = useForm()

  // Fetch dropdowns
  const { 
    awardFellowLevelOptions,
    sponserNameOptions,
    fetchAwardFellowLevels,
    fetchSponserNames
  } = useDropDowns()

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch dropdowns for tabs
  const fetchDropdownsForTab = useCallback((tab: string) => {
    if (tab === "awards") {
      if (!fetchedDropdownsRef.current.has("awardFellowLevelOptions") && 
          !fetchingDropdownsRef.current.has("awardFellowLevelOptions") &&
          awardFellowLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("awardFellowLevelOptions")
        fetchAwardFellowLevels()
          .then(() => {
            fetchedDropdownsRef.current.add("awardFellowLevelOptions")
          })
          .catch(error => {
            console.error("Error fetching award fellow levels:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("awardFellowLevelOptions")
          })
      }
    } else if (tab === "extension") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("awardFellowLevelOptions") && 
          !fetchingDropdownsRef.current.has("awardFellowLevelOptions") &&
          awardFellowLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("awardFellowLevelOptions")
        dropdownsToFetch.push(
          fetchAwardFellowLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("awardFellowLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching award fellow levels:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("awardFellowLevelOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("sponserNameOptions") && 
          !fetchingDropdownsRef.current.has("sponserNameOptions") &&
          sponserNameOptions.length === 0) {
        fetchingDropdownsRef.current.add("sponserNameOptions")
        dropdownsToFetch.push(
          fetchSponserNames()
            .then(() => {
              fetchedDropdownsRef.current.add("sponserNameOptions")
            })
            .catch(error => {
              console.error("Error fetching sponser names:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("sponserNameOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for extension:", error)
        })
      }
    }
  }, [awardFellowLevelOptions.length, sponserNameOptions.length, fetchAwardFellowLevels, fetchSponserNames])

  // Fetch dropdowns when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchDropdownsForTab(activeTab)
    }
  }, [activeTab, fetchDropdownsForTab])

  // Fetch performance teacher from API
  const fetchPerformanceTeacher = useCallback(async () => {
    if (!user?.role_id || activeTab !== "performance") return
    
    const sectionId = "performance"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/awards-recognition/performance-teacher?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch performance teacher")
      }

      // Map API response to UI format
      const mappedData = (result.performanceTeacher || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        titleOfPerformance: item.name || "",
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        performanceDate: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        perf_nature: item.perf_nature || "",
        natureOfPerformance: item.perf_nature || "",
        Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
        supportingDocument: item.Image ? [item.Image] : [],
      }))

      setData((prev: any) => ({
        ...prev,
        performance: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching performance teacher:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load performance teacher",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch awards/fellows from API
  const fetchAwardsFellows = useCallback(async () => {
    if (!user?.role_id || activeTab !== "awards") return
    
    const sectionId = "awards"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/awards-recognition/awards-fellow?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch awards/fellows")
      }

      // Map API response to UI format
      const mappedData = (result.awardsFellows || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        nameOfAwardFellowship: item.name || "",
        details: item.details || "",
        organization: item.organization || "",
        nameOfAwardingAgency: item.organization || "",
        address: item.address || "",
        addressOfAwardingAgency: item.address || "",
        date_of_award: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
        dateOfAward: item.date_of_award ? new Date(item.date_of_award).toISOString().split('T')[0] : "",
        level: item.level || "",
        levelId: item.level,
        Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
        supportingDocument: item.Image ? [item.Image] : [],
      }))

      setData((prev: any) => ({
        ...prev,
        awards: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching awards/fellows:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load awards/fellows",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch extension activities from API
  const fetchExtensionActivities = useCallback(async () => {
    if (!user?.role_id || activeTab !== "extension") return
    
    const sectionId = "extension"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/awards-recognition/extensions?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch extension activities")
      }

      // Map API response to UI format
      const mappedData = (result.extensionActivities || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        names: item.names || "",
        nameOfActivity: item.name_of_activity || "",
        natureOfActivity: item.names || "",
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        sponsered: item.sponsered || "",
        sponseredId: item.sponsered,
        sponsoredBy: item.sponsered_name || "",
        level: item.level || "",
        levelId: item.level,
        levelName: item.Awards_Fellows_Level_name || "",
        Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
        supportingDocument: item.Image ? [item.Image] : [],
      }))

      setData((prev: any) => ({
        ...prev,
        extension: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching extension activities:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load extension activities",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch data when tab changes
  useEffect(() => {
    if (user?.role_id && activeTab === "performance") {
      fetchPerformanceTeacher()
    } else if (user?.role_id && activeTab === "awards") {
      fetchAwardsFellows()
    } else if (user?.role_id && activeTab === "extension") {
      fetchExtensionActivities()
    }
  }, [user?.role_id, activeTab, fetchPerformanceTeacher, fetchAwardsFellows, fetchExtensionActivities])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  const handleDeleteClick = (sectionId: string, itemId: number, itemName: string) => {
    setDeleteConfirm({ sectionId, itemId, itemName })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { sectionId, itemId } = deleteConfirm

    if (sectionId === "performance") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/awards-recognition/performance-teacher?perfTeacherId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete performance teacher")
        }

        setData((prevData: any) => ({
          ...prevData,
          [sectionId]: (prevData[sectionId] || []).filter((item: any) => item.id !== itemId),
        }))
        
        toast({
          title: "Success",
          description: `"${deleteConfirm.itemName}" has been deleted successfully!`,
          duration: 3000,
        })
        
        setDeleteConfirm(null)
      } catch (error: any) {
        console.error("Error deleting performance teacher:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete performance teacher",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "awards") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/awards-recognition/awards-fellow?awardsFellowId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete awards/fellows")
        }

        setData((prevData: any) => ({
          ...prevData,
          [sectionId]: (prevData[sectionId] || []).filter((item: any) => item.id !== itemId),
        }))
        
        toast({
          title: "Success",
          description: `"${deleteConfirm.itemName}" has been deleted successfully!`,
          duration: 3000,
        })
        
        setDeleteConfirm(null)
      } catch (error: any) {
        console.error("Error deleting awards/fellows:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete awards/fellows",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "extension") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/awards-recognition/extensions?extensionActId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete extension activity")
        }

        setData((prevData: any) => ({
          ...prevData,
          [sectionId]: (prevData[sectionId] || []).filter((item: any) => item.id !== itemId),
        }))
        
        toast({
          title: "Success",
          description: `"${deleteConfirm.itemName}" has been deleted successfully!`,
          duration: 3000,
        })
        
        setDeleteConfirm(null)
      } catch (error: any) {
        console.error("Error deleting extension activity:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete extension activity",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "performance") {
      formItem = {
        name: item.name || item.titleOfPerformance,
        place: item.place,
        date: item.date || item.performanceDate,
        perf_nature: item.perf_nature || item.natureOfPerformance,
      }
    } else if (sectionId === "awards") {
      formItem = {
        name: item.name || item.nameOfAwardFellowship,
        details: item.details || "",
        organization: item.organization || item.nameOfAwardingAgency,
        address: item.address || item.addressOfAwardingAgency || "",
        date_of_award: item.date_of_award || item.dateOfAward,
        level: item.levelId || item.level,
      }
    } else if (sectionId === "extension") {
      formItem = {
        names: item.names || item.natureOfActivity,
        name_of_activity: item.nameOfActivity || item.name_of_activity,
        place: item.place,
        date: item.date,
        sponsered: item.sponseredId || item.sponsered,
        level: item.levelId || item.level,
      }
    } else {
      formItem = { ...item }
    }
    
    setFormData(formItem)
    form.reset(formItem)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !user?.role_id) return

    if (editingItem.sectionId === "performance") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          perfTeacherId: editingItem.id,
          teacherId: user.role_id,
          perfTeacher: {
            name: formValues.name,
            place: formValues.place,
            date: formValues.date,
            perf_nature: formValues.perf_nature,
            Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/performance-teacher", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update performance teacher")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("performance")
          return newSet
        })
        await fetchPerformanceTeacher()

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
        
        toast({
          title: "Success",
          description: `"${formValues.name}" has been updated successfully!`,
          duration: 3000,
        })
      } catch (error: any) {
        console.error("Error updating performance teacher:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update performance teacher",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "awards") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          awardsFellowId: editingItem.id,
          teacherId: user.role_id,
          awardsFellow: {
            name: formValues.name,
            details: formValues.details || "",
            organization: formValues.organization,
            address: formValues.address || "",
            date_of_award: formValues.date_of_award,
            level: formValues.level,
            Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/awards-fellow", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update awards/fellows")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("awards")
          return newSet
        })
        await fetchAwardsFellows()

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
        
        toast({
          title: "Success",
          description: `"${formValues.name}" has been updated successfully!`,
          duration: 3000,
        })
      } catch (error: any) {
        console.error("Error updating awards/fellows:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update awards/fellows",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "extension") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          extensionActId: editingItem.id,
          teacherId: user.role_id,
          extensionAct: {
            names: formValues.names,
            place: formValues.place,
            date: formValues.date,
            name_of_activity: formValues.name_of_activity,
            sponsered: formValues.sponsered,
            level: formValues.level,
            Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/extensions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update extension activity")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("extension")
          return newSet
        })
        await fetchExtensionActivities()

        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({})
        form.reset()
        
        toast({
          title: "Success",
          description: `"${formValues.name_of_activity}" has been updated successfully!`,
          duration: 3000,
        })
      } catch (error: any) {
        console.error("Error updating extension activity:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update extension activity",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFileUpload = async (sectionId: string, itemId: number) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      })
      return
    }

    if (sectionId === "performance") {
      try {
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        const item: any = data.performance.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          perfTeacherId: itemId,
          teacherId: user?.role_id,
          perfTeacher: {
            name: item.name || item.titleOfPerformance,
            place: item.place,
            date: item.date || item.performanceDate,
            perf_nature: item.perf_nature || item.natureOfPerformance,
            Image: dummyUrl,
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/performance-teacher", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("performance")
          return newSet
        })
        await fetchPerformanceTeacher()

        toast({
          title: "Success",
          description: "Document updated successfully!",
          duration: 2000,
        })
      } catch (error: any) {
        console.error("Error updating document:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update document",
          variant: "destructive",
          duration: 3000,
        })
      }
    } else if (sectionId === "awards") {
      try {
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        const item: any = data.awards.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          awardsFellowId: itemId,
          teacherId: user?.role_id,
          awardsFellow: {
            name: item.name || item.nameOfAwardFellowship,
            details: item.details || "",
            organization: item.organization || item.nameOfAwardingAgency,
            address: item.address || item.addressOfAwardingAgency || "",
            date_of_award: item.date_of_award || item.dateOfAward,
            level: item.levelId || item.level,
            Image: dummyUrl,
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/awards-fellow", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("awards")
          return newSet
        })
        await fetchAwardsFellows()

        toast({
          title: "Success",
          description: "Document updated successfully!",
          duration: 2000,
        })
      } catch (error: any) {
        console.error("Error updating document:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update document",
          variant: "destructive",
          duration: 3000,
        })
      }
    } else if (sectionId === "extension") {
      try {
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        const item: any = data.extension.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          extensionActId: itemId,
          teacherId: user?.role_id,
          extensionAct: {
            names: item.names || item.natureOfActivity,
            place: item.place,
            date: item.date,
            name_of_activity: item.nameOfActivity || item.name_of_activity,
            sponsered: item.sponseredId || item.sponsered,
            level: item.levelId || item.level,
            Image: dummyUrl,
          },
        }

        const res = await fetch("/api/teacher/awards-recognition/extensions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("extension")
          return newSet
        })
        await fetchExtensionActivities()

        toast({
          title: "Success",
          description: "Document updated successfully!",
          duration: 2000,
        })
      } catch (error: any) {
        console.error("Error updating document:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update document",
          variant: "destructive",
          duration: 3000,
        })
      }
    }
  }

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "performance":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.titleOfPerformance}</TableCell>
            <TableCell>{item.place}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.performanceDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfPerformance}</Badge>
            </TableCell>
          </>
        )
      case "awards":
        const awardLevelName = awardFellowLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.level || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfAwardFellowship || item.name}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.details}>
                {item.details}
              </div>
            </TableCell>
            <TableCell>{item.nameOfAwardingAgency || item.organization}</TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.addressOfAwardingAgency || item.address}>
                {item.addressOfAwardingAgency || item.address}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.dateOfAward || item.date_of_award}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{awardLevelName}</Badge>
            </TableCell>
          </>
        )
      case "extension":
        const extensionLevelName = awardFellowLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.levelName || item.level || "N/A"
        const sponserName = sponserNameOptions.find(s => s.id === item.sponseredId || s.id === item.sponsered)?.name || item.sponsoredBy || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.nameOfActivity || item.name_of_activity}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.natureOfActivity || item.names}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{extensionLevelName}</Badge>
            </TableCell>
            <TableCell>{sponserName}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}

    switch (sectionId) {
      case "performance":
        return (
          <PerformanceTeacherForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      case "awards":
        return (
          <AwardsFellowshipForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
          />
        )
      case "extension":
        return (
          <ExtensionActivityForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={false}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={() => {}}
            isEdit={isEdit}
            editData={currentData}
            awardFellowLevelOptions={awardFellowLevelOptions}
            sponserNameOptions={sponserNameOptions}
          />
        )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label>Image (JPEG/BMP/PNG) OR PDF</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png,.bmp" />
            </div>
          </div>
        )
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Awards & Recognition</h1>
          <p className="text-muted-foreground">Manage your awards, recognitions, and extension activities</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="border-b mb-4">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex min-w-max w-full">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-xs">{section.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      router.push(`/teacher/awards-recognition/add?tab=${section.id}`)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {section.title}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={column} className="whitespace-nowrap">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingStates[section.id] ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : !data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={section.columns.length}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data[section.id as keyof typeof data].map((item: any) => (
                            <TableRow key={item.id}>
                              {renderTableData(section, item)}
                             <TableCell>
                              <div className="flex items-center gap-2">
                                {item.supportingDocument && item.supportingDocument.length > 0 ? (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="View Document">
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent
                                        className="w-[90vw] max-w-4xl h-[80vh] p-0 overflow-hidden"
                                        style={{ display: "flex", flexDirection: "column" }}
                                      >
                                        <DialogHeader className="p-4 border-b">
                                          <DialogTitle>View Document</DialogTitle>
                                        </DialogHeader>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                          <div className="w-full h-full">
                                            <DocumentViewer
                                              documentUrl={item.supportingDocument[0]}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document">
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)}>
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(section.id, item.id, item.name || item.nameOfAwardFellowship || item.nameOfActivity || "this record")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] pr-2">
              {editingItem && renderForm(editingItem.sectionId, true)}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Trigger form submission
                  form.handleSubmit(handleSaveEdit)()
                }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the record
                <strong className="block mt-2 text-base">
                  "{deleteConfirm?.itemName}"
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
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
  )
}

