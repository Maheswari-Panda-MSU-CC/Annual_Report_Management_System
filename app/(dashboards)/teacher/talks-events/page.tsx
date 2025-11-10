"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Users,
  Building,
  Presentation,
  Save,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import { RefresherOrientationForm } from "@/components/forms/RefresherOrientationForm"
import { useForm } from "react-hook-form"
import { DocumentViewer } from "@/components/document-viewer"
import { AcademicProgramForm } from "@/components/forms/AcademicProgramForm"
import { AcademicBodiesForm } from "@/components/forms/AcademicBodiesForm"
import { UniversityCommitteeParticipationForm } from "@/components/forms/UniversityComitteeParticipationForm"
import { AcademicTalkForm } from "@/components/forms/AcademicTalkForm"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useDropDowns } from "@/hooks/use-dropdowns"

// Sample data for each section - Updated to match add-event page structure
const initialSampleData = {
  refresher: [],
  "academic-programs": [],
  "academic-bodies": [],
  committees: [],
  talks: [],
}

const sections = [
  {
    id: "refresher",
    title: "Refresher/Orientation",
    icon: FileText,
    columns: [
      "Sr No.",
      "Name",
      "Course Type",
      "Start Date",
      "End Date",
      "Organizing University",
      "Organizing Institute",
      "Organizing Department",
      "Centre",
      "Documents",
      "Actions",
    ],
  },
  {
    id: "academic-programs",
    title: "Academic Programs",
    icon: Users,
    columns: ["Sr No.", "Name", "Programme", "Place", "Date", "Year", "Participated As", "Documents", "Actions"],
  },
  {
    id: "academic-bodies",
    title: "Academic Bodies",
    icon: Building,
    columns: ["Sr No.", "Name", "Academic Body", "Place", "Participated As", "Submit Date", "Year", "Documents", "Actions"],
  },
  {
    id: "committees",
    title: "University Committees",
    icon: Users,
    columns: ["Sr No.", "Name", "Committee Name", "Level", "Participated As", "Submit Date", "Year", "Documents", "Actions"],
  },
  {
    id: "talks",
    title: "Academic Talks",
    icon: Presentation,
    columns: [
      "Sr No.",
      "Name",
      "Programme",
      "Place",
      "Talk Date",
      "Title of Event",
      "Participated As",
      "Documents",
      "Actions",
    ],
  },
]

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void
  acceptedTypes?: string
  multiple?: boolean
}

function FileUpload({ onFileSelect, acceptedTypes = ".pdf,.jpg,.jpeg,.png", multiple = true }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">Upload files or drag and drop</span>
          <span className="mt-1 block text-xs text-gray-500">PDF, JPG, PNG up to 10MB each</span>
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

export default function TalksEventsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("refresher")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialSampleData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ sectionId: string; itemId: number; itemName: string } | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    refresher: false,
    "academic-programs": false,
    "academic-bodies": false,
    committees: false,
    talks: false,
  })
  const [fetchedSections, setFetchedSections] = useState<Set<string>>(new Set())
  const fetchingRef = useRef<Set<string>>(new Set())
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())
  const form = useForm()
  const router = useRouter()
  
  // Fetch dropdowns
  const { 
    refresherTypeOptions,
    fetchRefresherTypes,
    academicProgrammeOptions,
    participantTypeOptions,
    fetchAcademicProgrammes,
    fetchParticipantTypes,
    reportYearsOptions,
    fetchReportYears,
    committeeLevelOptions,
    fetchCommitteeLevels,
    talksProgrammeTypeOptions,
    talksParticipantTypeOptions,
    fetchTalksProgrammeTypes,
    fetchTalksParticipantTypes
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
    if (tab === "refresher") {
      if (!fetchedDropdownsRef.current.has("refresherTypeOptions") && 
          !fetchingDropdownsRef.current.has("refresherTypeOptions") &&
          refresherTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("refresherTypeOptions")
        fetchRefresherTypes()
          .then(() => {
            fetchedDropdownsRef.current.add("refresherTypeOptions")
          })
          .catch(error => {
            console.error("Error fetching refresher types:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("refresherTypeOptions")
          })
      }
    } else if (tab === "academic-programs") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("academicProgrammeOptions") && 
          !fetchingDropdownsRef.current.has("academicProgrammeOptions") &&
          academicProgrammeOptions.length === 0) {
        fetchingDropdownsRef.current.add("academicProgrammeOptions")
        dropdownsToFetch.push(
          fetchAcademicProgrammes()
            .then(() => {
              fetchedDropdownsRef.current.add("academicProgrammeOptions")
            })
            .catch(error => {
              console.error("Error fetching academic programmes:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("academicProgrammeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("participantTypeOptions") && 
          !fetchingDropdownsRef.current.has("participantTypeOptions") &&
          participantTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("participantTypeOptions")
        dropdownsToFetch.push(
          fetchParticipantTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("participantTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching participant types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("participantTypeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        dropdownsToFetch.push(
          fetchReportYears()
            .then(() => {
              fetchedDropdownsRef.current.add("reportYearsOptions")
            })
            .catch(error => {
              console.error("Error fetching report years:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("reportYearsOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for academic-programs:", error)
        })
      }
    } else if (tab === "academic-bodies") {
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        fetchReportYears()
          .then(() => {
            fetchedDropdownsRef.current.add("reportYearsOptions")
          })
          .catch(error => {
            console.error("Error fetching report years:", error)
          })
          .finally(() => {
            fetchingDropdownsRef.current.delete("reportYearsOptions")
          })
      }
    } else if (tab === "committees") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("reportYearsOptions") && 
          !fetchingDropdownsRef.current.has("reportYearsOptions") &&
          reportYearsOptions.length === 0) {
        fetchingDropdownsRef.current.add("reportYearsOptions")
        dropdownsToFetch.push(
          fetchReportYears()
            .then(() => {
              fetchedDropdownsRef.current.add("reportYearsOptions")
            })
            .catch(error => {
              console.error("Error fetching report years:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("reportYearsOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("committeeLevelOptions") && 
          !fetchingDropdownsRef.current.has("committeeLevelOptions") &&
          committeeLevelOptions.length === 0) {
        fetchingDropdownsRef.current.add("committeeLevelOptions")
        dropdownsToFetch.push(
          fetchCommitteeLevels()
            .then(() => {
              fetchedDropdownsRef.current.add("committeeLevelOptions")
            })
            .catch(error => {
              console.error("Error fetching committee levels:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("committeeLevelOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for committees:", error)
        })
      }
    } else if (tab === "talks") {
      const dropdownsToFetch = []
      
      if (!fetchedDropdownsRef.current.has("talksProgrammeTypeOptions") && 
          !fetchingDropdownsRef.current.has("talksProgrammeTypeOptions") &&
          talksProgrammeTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("talksProgrammeTypeOptions")
        dropdownsToFetch.push(
          fetchTalksProgrammeTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("talksProgrammeTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching talks programme types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("talksProgrammeTypeOptions")
            })
        )
      }
      
      if (!fetchedDropdownsRef.current.has("talksParticipantTypeOptions") && 
          !fetchingDropdownsRef.current.has("talksParticipantTypeOptions") &&
          talksParticipantTypeOptions.length === 0) {
        fetchingDropdownsRef.current.add("talksParticipantTypeOptions")
        dropdownsToFetch.push(
          fetchTalksParticipantTypes()
            .then(() => {
              fetchedDropdownsRef.current.add("talksParticipantTypeOptions")
            })
            .catch(error => {
              console.error("Error fetching talks participant types:", error)
            })
            .finally(() => {
              fetchingDropdownsRef.current.delete("talksParticipantTypeOptions")
            })
        )
      }
      
      if (dropdownsToFetch.length > 0) {
        Promise.all(dropdownsToFetch).catch(error => {
          console.error("Error fetching dropdowns for talks:", error)
        })
      }
    }
  }, [refresherTypeOptions.length, academicProgrammeOptions.length, participantTypeOptions.length, reportYearsOptions.length, committeeLevelOptions.length, talksProgrammeTypeOptions.length, talksParticipantTypeOptions.length, fetchRefresherTypes, fetchAcademicProgrammes, fetchParticipantTypes, fetchReportYears, fetchCommitteeLevels, fetchTalksProgrammeTypes, fetchTalksParticipantTypes])

  // Fetch dropdowns when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchDropdownsForTab(activeTab)
    }
  }, [activeTab, fetchDropdownsForTab])

  // Fetch refresher details from API
  const fetchRefresherDetails = useCallback(async () => {
    if (!user?.role_id || activeTab !== "refresher") return
    
    const sectionId = "refresher"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const currentYear = new Date().getFullYear()
      const res = await fetch(`/api/teacher/talks-events/refresher-details?teacherId=${user.role_id}&year=${currentYear}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch refresher details")
      }

      // Map API response to UI format
      const mappedData = (result.refresherDetails || []).map((item: any, index: number) => ({
        id: item.Id,
        srNo: index + 1,
        name: item.name || "",
        courseType: item.Refresher_Course_Type_Name || "",
        courseTypeId: item.Refresher_Course_Type_Id,
        startDate: item.startdate ? new Date(item.startdate).toISOString().split('T')[0] : "",
        endDate: item.enddate ? new Date(item.enddate).toISOString().split('T')[0] : "",
        organizingUniversity: item.university || "",
        organizingInstitute: item.institute || "",
        organizingDepartment: item.department || "",
        centre: item.centre || "",
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        refresher_type: item.Refresher_Course_Type_Id,
        startdate: item.startdate ? new Date(item.startdate).toISOString().split('T')[0] : "",
        enddate: item.enddate ? new Date(item.enddate).toISOString().split('T')[0] : "",
        university: item.university || "",
        institute: item.institute || "",
        department: item.department || "",
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))

      setData((prev: any) => ({
        ...prev,
        refresher: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching refresher details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load refresher details",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab])

  // Fetch academic contributions from API
  const fetchAcademicContributions = useCallback(async () => {
    if (!user?.role_id || activeTab !== "academic-programs") return
    
    const sectionId = "academic-programs"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/talks-events/academic-contri?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch academic contributions")
      }

      // Map API response to UI format
      const mappedData = (result.academicContributions || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        programme: item.programme || "",
        programmeId: item.programme,
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        participatedAs: item.participated_as || "",
        participated_as: item.participated_as,
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))

      setData((prev: any) => ({
        ...prev,
        "academic-programs": mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching academic contributions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load academic contributions",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch academic bodies participation from API
  const fetchAcademicBodiesParticipation = useCallback(async () => {
    if (!user?.role_id || activeTab !== "academic-bodies") return
    
    const sectionId = "academic-bodies"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/talks-events/acad-bodies-parti?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch academic bodies participation")
      }

      // Map API response to UI format
      const mappedData = (result.academicBodiesParticipation || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        courseTitle: item.name || "", // For backward compatibility with table
        acad_body: item.acad_body || "",
        academicBody: item.acad_body || "", // For backward compatibility with table
        place: item.place || "",
        participated_as: item.participated_as || "",
        participatedAs: item.participated_as || "", // For backward compatibility with table
        submit_date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "", // For backward compatibility
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))

      setData((prev: any) => ({
        ...prev,
        "academic-bodies": mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching academic bodies participation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load academic bodies participation",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch teacher talks from API
  const fetchTeacherTalks = useCallback(async () => {
    if (!user?.role_id || activeTab !== "talks") return
    
    const sectionId = "talks"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/talks-events/teacher-talks?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch teacher talks")
      }

      // Map API response to UI format
      const mappedData = (result.teacherTalks || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        programme: item.teacher_talks_prog_name || "",
        programmeId: item.programme,
        place: item.place || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        talkDate: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        title: item.title || "",
        titleOfEvent: item.title || "",
        participated_as: item.participated_as,
        participatedAs: item.teacher_talks_parti_name || "",
        Image: item.Image || "http://localhost:3000/assets/demo_document.pdf",
        supportingDocument: item.Image ? [item.Image] : [],
      }))

      setData((prev: any) => ({
        ...prev,
        talks: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching teacher talks:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load teacher talks",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      fetchingRef.current.delete(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
    }
  }, [user?.role_id, activeTab, toast])

  // Fetch university committees from API
  const fetchUniversityCommittees = useCallback(async () => {
    if (!user?.role_id || activeTab !== "committees") return
    
    const sectionId = "committees"
    if (fetchedSections.has(sectionId) || fetchingRef.current.has(sectionId)) return

    fetchingRef.current.add(sectionId)
    setLoadingStates(prev => ({ ...prev, [sectionId]: true }))

    try {
      const res = await fetch(`/api/teacher/talks-events/parti-university-committes?teacherId=${user.role_id}`)
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch university committees")
      }

      // Map API response to UI format
      const mappedData = (result.universityCommittees || []).map((item: any, index: number) => ({
        id: item.id,
        srNo: index + 1,
        name: item.name || "",
        committeeName: item.committee_name || "",
        committee_name: item.committee_name || "",
        level: item.level || "",
        levelId: item.level,
        participated_as: item.participated_as || "",
        participatedAs: item.participated_as || "",
        submit_date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        date: item.submit_date ? new Date(item.submit_date).toISOString().split('T')[0] : "",
        year: item.year_name?.toString() || "",
        year_name: item.year_name || new Date().getFullYear(),
        BOS: item.BOS || false,
        FB: item.FB || false,
        CDC: item.CDC || false,
        supportingDocument: item.supporting_doc ? [item.supporting_doc] : [],
        supporting_doc: item.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
      }))

      setData((prev: any) => ({
        ...prev,
        committees: mappedData,
      }))
      setFetchedSections(prev => new Set([...prev, sectionId]))
    } catch (error: any) {
      console.error("Error fetching university committees:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load university committees",
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
    if (user?.role_id && activeTab === "refresher") {
      fetchRefresherDetails()
    } else if (user?.role_id && activeTab === "academic-programs") {
      fetchAcademicContributions()
    } else if (user?.role_id && activeTab === "academic-bodies") {
      fetchAcademicBodiesParticipation()
    } else if (user?.role_id && activeTab === "committees") {
      fetchUniversityCommittees()
    } else if (user?.role_id && activeTab === "talks") {
      fetchTeacherTalks()
    }
  }, [user?.role_id, activeTab, fetchRefresherDetails, fetchAcademicContributions, fetchAcademicBodiesParticipation, fetchUniversityCommittees, fetchTeacherTalks])

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

    if (sectionId === "refresher") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/talks-events/refresher-details?refresherDetailId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete refresher detail")
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
        console.error("Error deleting refresher detail:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete refresher detail",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "academic-programs") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/talks-events/academic-contri?academicContriId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete academic contribution")
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
        console.error("Error deleting academic contribution:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete academic contribution",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "academic-bodies") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/talks-events/acad-bodies-parti?partiAcadsId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete academic bodies participation")
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
        console.error("Error deleting academic bodies participation:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete academic bodies participation",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "committees") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/talks-events/parti-university-committes?partiCommiId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete university committee participation")
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
        console.error("Error deleting university committee participation:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete university committee participation",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else if (sectionId === "talks") {
      try {
        setIsDeleting(true)
        const res = await fetch(`/api/teacher/talks-events/teacher-talks?teacherTalkId=${itemId}`, {
          method: "DELETE",
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to delete teacher talk")
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
        console.error("Error deleting teacher talk:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete teacher talk",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsDeleting(false)
      }
    } else {
      // Handle other sections (keep existing logic for now)
      setIsDeleting(true)
      try {
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
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    // Map UI format to form format
    let formItem: any = {}
    
    if (sectionId === "refresher") {
      formItem = {
        ...item,
        refresher_type: item.courseTypeId || item.refresher_type,
        startdate: item.startDate || item.startdate,
        enddate: item.endDate || item.enddate,
        university: item.organizingUniversity || item.university,
        institute: item.organizingInstitute || item.institute,
        department: item.organizingDepartment || item.department,
      }
    } else if (sectionId === "academic-programs") {
      formItem = {
        ...item,
        programme: item.programmeId || item.programme,
        date: item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        participated_as: item.participated_as || item.participatedAs,
      }
    } else if (sectionId === "academic-bodies") {
      formItem = {
        ...item,
        name: item.name || item.courseTitle,
        acad_body: item.acad_body || item.academicBody,
        participated_as: item.participated_as || item.participatedAs,
        submit_date: item.submit_date || item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
      }
    } else if (sectionId === "committees") {
      formItem = {
        ...item,
        committee_name: item.committee_name || item.committeeName,
        level: item.levelId || item.level,
        participated_as: item.participated_as || item.participatedAs,
        submit_date: item.submit_date || item.date,
        year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
        BOS: item.BOS || false,
        FB: item.FB || false,
        CDC: item.CDC || false,
      }
    } else if (sectionId === "talks") {
      formItem = {
        ...item,
        programme: item.programmeId || item.programme,
        date: item.date || item.talkDate,
        title: item.title || item.titleOfEvent,
        participated_as: item.participated_as || item.participatedAs,
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

    if (editingItem.sectionId === "refresher") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          refresherDetailId: editingItem.id,
          teacherId: user.role_id,
          refresherDetail: {
            name: formValues.name,
            refresher_type: formValues.refresher_type,
            startdate: formValues.startdate,
            enddate: formValues.enddate || null,
            university: formValues.university,
            institute: formValues.institute,
            department: formValues.department,
            centre: formValues.centre || null,
            supporting_doc: formValues.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
          },
        }

        const res = await fetch("/api/teacher/talks-events/refresher-details", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update refresher detail")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("refresher")
          return newSet
        })
        await fetchRefresherDetails()

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
        console.error("Error updating refresher detail:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update refresher detail",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "academic-programs") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          academicContriId: editingItem.id,
          teacherId: user.role_id,
          academicContri: {
            name: formValues.name,
            programme: formValues.programme,
            place: formValues.place,
            date: formValues.date,
            participated_as: formValues.participated_as,
            supporting_doc: formValues.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
            year_name: formValues.year_name || new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/academic-contri", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update academic contribution")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("academic-programs")
          return newSet
        })
        await fetchAcademicContributions()

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
        console.error("Error updating academic contribution:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update academic contribution",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "academic-bodies") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          partiAcadsId: editingItem.id,
          teacherId: user.role_id,
          partiAcads: {
            name: formValues.name,
            acad_body: formValues.acad_body,
            place: formValues.place,
            participated_as: formValues.participated_as,
            submit_date: formValues.submit_date,
            supporting_doc: formValues.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
            year_name: formValues.year_name || new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/acad-bodies-parti", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update academic bodies participation")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("academic-bodies")
          return newSet
        })
        await fetchAcademicBodiesParticipation()

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
        console.error("Error updating academic bodies participation:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update academic bodies participation",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "committees") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          partiCommiId: editingItem.id,
          teacherId: user.role_id,
          partiCommi: {
            name: formValues.name,
            committee_name: formValues.committee_name,
            level: formValues.level,
            participated_as: formValues.participated_as,
            submit_date: formValues.submit_date,
            supporting_doc: formValues.supporting_doc || "http://localhost:3000/assets/demo_document.pdf",
            BOS: formValues.BOS || false,
            FB: formValues.FB || false,
            CDC: formValues.CDC || false,
            year_name: formValues.year_name || new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/parti-university-committes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update university committee participation")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("committees")
          return newSet
        })
        await fetchUniversityCommittees()

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
        console.error("Error updating university committee participation:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update university committee participation",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else if (editingItem.sectionId === "talks") {
      try {
        setIsSubmitting(true)
        
        const formValues = form.getValues()
        const payload = {
          teacherTalkId: editingItem.id,
          teacherId: user.role_id,
          teacherTalk: {
            name: formValues.name,
            programme: formValues.programme,
            place: formValues.place,
            date: formValues.date,
            title: formValues.title,
            participated_as: formValues.participated_as,
            Image: formValues.Image || "http://localhost:3000/assets/demo_document.pdf",
          },
        }

        const res = await fetch("/api/teacher/talks-events/teacher-talks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update teacher talk")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("talks")
          return newSet
        })
        await fetchTeacherTalks()

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
        console.error("Error updating teacher talk:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update teacher talk",
          variant: "destructive",
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Handle other sections (keep existing logic for now)
      setData((prevData) => ({
        ...prevData,
        [editingItem.sectionId]: (prevData[editingItem.sectionId as keyof typeof prevData] || []).map((item: any) =>
          item.id === editingItem.id ? { ...item, ...formData } : item,
        ),
      }))

      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      toast({
        title: "Success",
        description: "Item updated successfully!",
        duration: 2000,
      })
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

    if (sectionId === "refresher") {
      try {
        // Update document URL with dummy URL
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        
        const item: any = data.refresher.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          refresherDetailId: itemId,
          teacherId: user?.role_id,
          refresherDetail: {
            name: item.name,
            refresher_type: item.refresher_type || item.courseTypeId,
            startdate: item.startdate || item.startDate,
            enddate: item.enddate || item.endDate || null,
            university: item.university || item.organizingUniversity,
            institute: item.institute || item.organizingInstitute,
            department: item.department || item.organizingDepartment,
            centre: item.centre || null,
            supporting_doc: dummyUrl,
          },
        }

        const res = await fetch("/api/teacher/talks-events/refresher-details", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("refresher")
          return newSet
        })
        await fetchRefresherDetails()

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
    } else if (sectionId === "academic-programs") {
      try {
        // Update document URL with dummy URL
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        
        const item: any = data["academic-programs"].find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          academicContriId: itemId,
          teacherId: user?.role_id,
          academicContri: {
            name: item.name,
            programme: item.programmeId || item.programme,
            place: item.place,
            date: item.date,
            participated_as: item.participated_as || item.participatedAs,
            supporting_doc: dummyUrl,
            year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/academic-contri", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("academic-programs")
          return newSet
        })
        await fetchAcademicContributions()

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
    } else if (sectionId === "academic-bodies") {
      try {
        // Update document URL with dummy URL
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        
        const item: any = data["academic-bodies"].find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          partiAcadsId: itemId,
          teacherId: user?.role_id,
          partiAcads: {
            name: item.name,
            acad_body: item.acad_body || item.academicBody,
            place: item.place,
            participated_as: item.participated_as || item.participatedAs,
            submit_date: item.submit_date || item.date,
            supporting_doc: dummyUrl,
            year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/acad-bodies-parti", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("academic-bodies")
          return newSet
        })
        await fetchAcademicBodiesParticipation()

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
    } else if (sectionId === "committees") {
      try {
        // Update document URL with dummy URL
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        
        const item: any = data.committees.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          partiCommiId: itemId,
          teacherId: user?.role_id,
          partiCommi: {
            name: item.name,
            committee_name: item.committee_name || item.committeeName,
            level: item.levelId || item.level,
            participated_as: item.participated_as || item.participatedAs,
            submit_date: item.submit_date || item.date,
            supporting_doc: dummyUrl,
            BOS: item.BOS || false,
            FB: item.FB || false,
            CDC: item.CDC || false,
            year_name: item.year_name || item.year ? parseInt(item.year) : new Date().getFullYear(),
          },
        }

        const res = await fetch("/api/teacher/talks-events/parti-university-committes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("committees")
          return newSet
        })
        await fetchUniversityCommittees()

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
    } else if (sectionId === "talks") {
      try {
        // Update document URL with dummy URL
        const dummyUrl = "http://localhost:3000/assets/demo_document.pdf"
        
        const item: any = data.talks.find((r: any) => r.id === itemId)
        if (!item) {
          throw new Error("Item not found")
        }

        const payload = {
          teacherTalkId: itemId,
          teacherId: user?.role_id,
          teacherTalk: {
            name: item.name,
            programme: item.programmeId || item.programme,
            place: item.place,
            date: item.date || item.talkDate,
            title: item.title || item.titleOfEvent,
            participated_as: item.participated_as || item.participatedAs,
            Image: dummyUrl,
          },
        }

        const res = await fetch("/api/teacher/talks-events/teacher-talks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update document")
        }

        // Refresh data
        setFetchedSections(prev => {
          const newSet = new Set(prev)
          newSet.delete("talks")
          return newSet
        })
        await fetchTeacherTalks()

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
    } else {
      // Handle other sections (keep existing logic for now)
      const fileNames = Array.from(selectedFiles).map((f) => f.name)
      setData((prevData) => ({
        ...prevData,
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).map((item: any) =>
          item.id === itemId
            ? { ...item, supportingDocument: [...(item.supportingDocument || []), ...fileNames] }
            : item,
        ),
      }))
      toast({
        title: "Files Uploaded",
        description: "Supporting documents uploaded successfully!",
        duration: 2000,
      })
    }
  }

  const handleExtractInfo = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    try {
      const res = await fetch("/api/llm/get-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab }),
      })
      const { category } = await res.json()

      const res2 = await fetch("/api/llm/get-formfields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, type: activeTab }),
      })
      const { data, success, extracted_fields, confidence } = await res2.json()

      if (success) {
        Object.entries(data).forEach(([key, value]) => {
          formData.setValue(key, value)
        })

        toast({
          title: "Success",
          description: `Form auto-filled with ${extracted_fields} fields (${Math.round(
            confidence * 100
          )}% confidence)`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fill form.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "refresher":
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.courseType}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.startDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.endDate}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingUniversity}>
                {item.organizingUniversity}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingInstitute}>
                {item.organizingInstitute}
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.organizingDepartment}>
                {item.organizingDepartment}
              </div>
            </TableCell>
            <TableCell>{item.centre}</TableCell>
          </>
        )
      case "academic-programs":
        const programmeName = academicProgrammeOptions.find(p => p.id === item.programmeId || p.id === item.programme)?.name || item.programme || "N/A"
        const participantName = participantTypeOptions.find(p => p.id === item.participated_as || p.id === item.participatedAs)?.name || item.participatedAs || "N/A"
        const yearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{programmeName}</Badge>
            </TableCell>
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
            <TableCell>{yearName}</TableCell>
            <TableCell>
              <Badge variant="secondary">{participantName}</Badge>
            </TableCell>
          </>
        )
      case "academic-bodies":
        const academicBodiesYearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name || item.courseTitle}</TableCell>
            <TableCell>{item.acad_body || item.academicBody}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.participated_as || item.participatedAs}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.submit_date || item.date}</span>
              </div>
            </TableCell>
            <TableCell>{academicBodiesYearName}</TableCell>
          </>
        )
      case "committees":
        const levelName = committeeLevelOptions.find(l => l.id === item.levelId || l.id === item.level)?.name || item.level || "N/A"
        const committeeYearName = reportYearsOptions.find(y => y.id === item.year_name || y.id === parseInt(item.year))?.name || item.year || item.year_name || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.committee_name || item.committeeName}</TableCell>
            <TableCell>
              <Badge variant="outline">{levelName}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{item.participated_as || item.participatedAs}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.submit_date || item.date}</span>
              </div>
            </TableCell>
            <TableCell>{committeeYearName}</TableCell>
          </>
        )
      case "talks":
        const talksProgrammeName = talksProgrammeTypeOptions.find(p => p.id === item.programmeId || p.id === item.programme)?.name || item.programme || "N/A"
        const talksParticipantName = talksParticipantTypeOptions.find(p => p.id === item.participated_as || p.id === item.participatedAs)?.name || item.participatedAs || "N/A"
        return (
          <>
            <TableCell>{item.srNo}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{talksProgrammeName}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.place}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{item.date || item.talkDate}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-xs">
              <div className="truncate" title={item.title || item.titleOfEvent}>
                {item.title || item.titleOfEvent}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{talksParticipantName}</Badge>
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
      case "refresher":
        return (
          <RefresherOrientationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            refresherTypeOptions={refresherTypeOptions}
          />
        )
      case "academic-programs":
        return (
          <AcademicProgramForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            academicProgrammeOptions={academicProgrammeOptions}
            participantTypeOptions={participantTypeOptions}
            reportYearsOptions={reportYearsOptions}
          />
        )
      case "academic-bodies":
        return (
          <AcademicBodiesForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            reportYearsOptions={reportYearsOptions}
          />
        )
      case "committees":
        return (
          <UniversityCommitteeParticipationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            committeeLevelOptions={committeeLevelOptions}
            reportYearsOptions={reportYearsOptions}
          />
        )
      case "talks":
        return (
          <AcademicTalkForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            talksProgrammeTypeOptions={talksProgrammeTypeOptions}
            talksParticipantTypeOptions={talksParticipantTypeOptions}
            />
          )
      default:
        return (
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Supporting Document (PDF or Image Only)</Label>
              <FileUpload onFileSelect={handleFileSelect} acceptedTypes=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        )
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Talks & Events</h1>
          <p className="text-muted-foreground">
            Manage your academic talks, events, and professional development activities
          </p>
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
                      router.push(`/teacher/talks-events/add?tab=${section.id}`)
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
                                              documentUrl={item.supportingDocument}
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
                                    onClick={() => handleDeleteClick(section.id, item.id, item.name || "this record")}
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
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
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
