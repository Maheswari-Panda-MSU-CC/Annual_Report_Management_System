"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/api/auth/auth-provider"
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Lightbulb,
  FileText,
  Monitor,
  Briefcase,
  UserCheck,
  Plane,
  IndianRupee,
  Users,
  GraduationCap,
  Copyright,
  Save,
  Calendar,
  Loader2,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal"
import { PatentForm } from "@/components/forms/PatentForm"
import { useForm } from "react-hook-form"
import { useDropDowns } from "@/hooks/use-dropdowns"
import PolicyForm from "@/components/forms/PolicyForm"
import { EContentForm } from "@/components/forms/EcontentForm"
import { ConsultancyForm } from "@/components/forms/ConsultancyForm"
import { CollaborationForm } from "@/components/forms/CollaborationForm"
import { AcademicVisitForm } from "@/components/forms/AcademicVisitForm"
import { FinancialForm } from "@/components/forms/FinancialFom"
import { JrfSrfForm } from "@/components/forms/JrfSrfForm"
import { PhdGuidanceForm } from "@/components/forms/PhdGuidanceForm"
import { CopyrightForm } from "@/components/forms/CopyrightForm"
import { fetchSectionData, deleteSectionData } from "./utils/api-helpers"
import { SECTION_ROUTES, API_ENDPOINTS, type SectionId } from "./utils/research-contributions-config"
import { createUpdateMapper, UPDATE_REQUEST_BODIES, UPDATE_SUCCESS_MESSAGES } from "./utils/update-mappers"

// Initial data structure
const initialData = {
  patents: [],
  policy: [],
  econtent: [],
  consultancy: [],
  collaborations: [],
  visits: [],
  financial: [],
  jrfSrf: [],
  phd: [],
  copyrights: [],
}

const sections = [
  {
    id: "patents",
    title: "Patents",
    icon: Lightbulb,
    columns: [
      "Sr No.",
      "Title",
      "Level",
      "Status",
      "Date",
      "Transfer of Technology with Licence",
      "Earning Generated (Rupees)",
      "Patent Application/Publication/Grant No.",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "policy",
    title: "Policy Documents",
    icon: FileText,
    columns: ["Sr No.", "Title", "Level", "Organisation", "Date", "Supporting Document", "Actions"],
  },
  {
    id: "econtent",
    title: "E-Content",
    icon: Monitor,
    columns: [
      "Sr No.",
      "Title",
      "Type of E-Content Platform",
      "Brief Details",
      "Quadrant",
      "Publishing Date",
      "Publishing Authorities",
      "Link",
      "Type of E Content",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "consultancy",
    title: "Consultancy Undertaken",
    icon: Briefcase,
    columns: [
      "Sr No.",
      "Title",
      "Collaborating Institute / Industry",
      "Address",
      "Start Date",
      "Duration(in Months)",
      "Amount(Rs.)",
      "Details / Outcome",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "collaborations",
    title: "Collaborations/MOUs/Linkages",
    icon: UserCheck,
    columns: [
      "Sr No.",
      "Category",
      "Collaborating Institute",
      "Name of Collaborator",
      "QS/THE Ranking",
      "Address",
      "Details",
      "Collaboration Outcome",
      "Status",
      "Starting Date",
      "Duration(months)",
      "Level",
      "No. of Beneficiary",
      "MOU Signed?",
      "Signing Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "visits",
    title: "Academic/Research Visits",
    icon: Plane,
    columns: [
      "Sr No.",
      "Institute/Industry Visited",
      "Duration of Visit(days)",
      "Role",
      "Sponsored By",
      "Remarks",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "financial",
    title: "Financial Support/Aid",
    icon: IndianRupee,
    columns: [
      "Sr No.",
      "Name Of Support",
      "Type",
      "Supporting Agency",
      "Grant Received",
      "Details Of Event",
      "Purpose Of Grant",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "jrfSrf",
    title: "JRF/SRF Details",
    icon: Users,
    columns: [
      "Sr No.",
      "Name Of Fellow",
      "Type",
      "Project Title",
      "Duration [in months]",
      "Monthly Stipend",
      "Date",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "phd",
    title: "PhD Guidance",
    icon: GraduationCap,
    columns: [
      "Sr No.",
      "Reg No",
      "Name of Student",
      "Date of Registration",
      "Topic",
      "Status",
      "Year of Completion",
      "Supporting Document",
      "Actions",
    ],
  },
  {
    id: "copyrights",
    title: "Copyrights",
    icon: Copyright,
    columns: ["Sr No.", "Title", "Reference No.", "Publication Date", "Link", "Supporting Document", "Actions"],
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

export default function ResearchContributionsPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("patents")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [data, setData] = useState(initialData)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    patents: false,
    policy: false,
    econtent: false,
    consultancy: false,
    collaborations: false,
    visits: false,
    financial: false,
    jrfSrf: false,
    phd: false,
    copyrights: false,
  })
  // Track which sections have been fetched to avoid re-fetching
  const [fetchedSections, setFetchedSections] = useState<Set<SectionId>>(new Set())
  // Use ref to track sections currently being fetched to prevent duplicate requests
  const fetchingRef = useRef<Set<SectionId>>(new Set())
  // Track which dropdowns have been fetched to prevent re-fetching
  const fetchedDropdownsRef = useRef<Set<string>>(new Set())
  // Track dropdowns currently being fetched to prevent duplicate requests
  const fetchingDropdownsRef = useRef<Set<string>>(new Set())
  const router = useRouter()
  
  const form=useForm();
  const [isExtracting,setIsExtracting]=useState(false);
  
  const [isSubmitting,setIsSubmitting]=useState(false);
  
  // Fetch dropdowns at page level
  const { 
    resPubLevelOptions, 
    patentStatusOptions, 
    eContentTypeOptions, 
    typeEcontentValueOptions,
    collaborationsLevelOptions,
    collaborationsOutcomeOptions,
    collaborationsTypeOptions,
    academicVisitRoleOptions,
    financialSupportTypeOptions,
    jrfSrfTypeOptions,
    phdGuidanceStatusOptions,
    fetchResPubLevels, 
    fetchPatentStatuses, 
    fetchEContentTypes, 
    fetchTypeEcontentValues,
    fetchCollaborationsLevels,
    fetchCollaborationsOutcomes,
    fetchCollaborationsTypes,
    fetchAcademicVisitRoles,
    fetchFinancialSupportTypes,
    fetchJrfSrfTypes,
    fetchPhdGuidanceStatuses
  } = useDropDowns()
  
  // Mapping of tabs to their required dropdowns (memoized to prevent recreation)
  const tabDropdownMap = useMemo<Record<string, Array<{ key: string; check: () => boolean; fetch: () => Promise<void> }>>>(() => ({
    patents: [
      { key: 'patentStatusOptions', check: () => patentStatusOptions.length === 0, fetch: fetchPatentStatuses },
      { key: 'resPubLevelOptions', check: () => resPubLevelOptions.length === 0, fetch: fetchResPubLevels },
    ],
    policy: [
      { key: 'resPubLevelOptions', check: () => resPubLevelOptions.length === 0, fetch: fetchResPubLevels },
    ],
    econtent: [
      { key: 'eContentTypeOptions', check: () => eContentTypeOptions.length === 0, fetch: fetchEContentTypes },
      { key: 'typeEcontentValueOptions', check: () => typeEcontentValueOptions.length === 0, fetch: fetchTypeEcontentValues },
    ],
    consultancy: [], // No dropdowns needed
    collaborations: [
      { key: 'collaborationsLevelOptions', check: () => collaborationsLevelOptions.length === 0, fetch: fetchCollaborationsLevels },
      { key: 'collaborationsOutcomeOptions', check: () => collaborationsOutcomeOptions.length === 0, fetch: fetchCollaborationsOutcomes },
      { key: 'collaborationsTypeOptions', check: () => collaborationsTypeOptions.length === 0, fetch: fetchCollaborationsTypes },
    ],
    visits: [
      { key: 'academicVisitRoleOptions', check: () => academicVisitRoleOptions.length === 0, fetch: fetchAcademicVisitRoles },
    ],
    financial: [
      { key: 'financialSupportTypeOptions', check: () => financialSupportTypeOptions.length === 0, fetch: fetchFinancialSupportTypes },
    ],
    jrfSrf: [
      { key: 'jrfSrfTypeOptions', check: () => jrfSrfTypeOptions.length === 0, fetch: fetchJrfSrfTypes },
    ],
    phd: [
      { key: 'phdGuidanceStatusOptions', check: () => phdGuidanceStatusOptions.length === 0, fetch: fetchPhdGuidanceStatuses },
    ],
    copyrights: [], // No dropdowns needed
  }), [
    patentStatusOptions.length,
    resPubLevelOptions.length,
    eContentTypeOptions.length,
    typeEcontentValueOptions.length,
    collaborationsLevelOptions.length,
    collaborationsOutcomeOptions.length,
    collaborationsTypeOptions.length,
    academicVisitRoleOptions.length,
    financialSupportTypeOptions.length,
    jrfSrfTypeOptions.length,
    phdGuidanceStatusOptions.length,
    fetchPatentStatuses,
    fetchResPubLevels,
    fetchEContentTypes,
    fetchTypeEcontentValues,
    fetchCollaborationsLevels,
    fetchCollaborationsOutcomes,
    fetchCollaborationsTypes,
    fetchAcademicVisitRoles,
    fetchFinancialSupportTypes,
    fetchJrfSrfTypes,
    fetchPhdGuidanceStatuses,
  ])
  
  // Function to fetch dropdowns for a specific tab (memoized with useCallback)
  const fetchDropdownsForTab = useCallback((tab: string) => {
    const dropdowns = tabDropdownMap[tab] || []
    
    const dropdownsToFetch = dropdowns
      .filter(d => {
        // Only fetch if not already fetched and not currently fetching
        const isNotFetched = !fetchedDropdownsRef.current.has(d.key)
        const isNotFetching = !fetchingDropdownsRef.current.has(d.key)
        const needsFetch = d.check()
        return isNotFetched && isNotFetching && needsFetch
      })
      .map(d => {
        // Mark as currently fetching
        fetchingDropdownsRef.current.add(d.key)
        return d.fetch()
          .then(() => {
            // Mark as fetched after successful load
            fetchedDropdownsRef.current.add(d.key)
          })
          .catch(error => {
            console.error(`Error fetching dropdown ${d.key}:`, error)
          })
          .finally(() => {
            // Remove from fetching set
            fetchingDropdownsRef.current.delete(d.key)
          })
      })
    
    if (dropdownsToFetch.length > 0) {
      Promise.all(dropdownsToFetch).catch(error => {
        console.error(`Error fetching dropdowns for tab ${tab}:`, error)
      })
    }
  }, [tabDropdownMap])
  
  // Fetch dropdowns for active tab on initial load and when activeTab changes
  useEffect(() => {
    if (activeTab) {
      fetchDropdownsForTab(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  
  // Fetch active tab data on initial load and when activeTab changes
  useEffect(() => {
    if (user?.role_id && activeTab) {
      const sectionId = activeTab as SectionId
      
      // Only fetch if not already fetched and not currently fetching
      if (!fetchedSections.has(sectionId) && !fetchingRef.current.has(sectionId)) {
        // Mark as currently fetching to prevent duplicate requests
        fetchingRef.current.add(sectionId)
        setLoadingStates(prev => ({ ...prev, [sectionId]: true }))
        
        fetchSectionData(sectionId, user.role_id, setData, toast, resPubLevelOptions)
          .then(() => {
            // Mark as fetched after successful load
            setFetchedSections(prev => new Set([...prev, sectionId]))
          })
          .catch(error => {
            console.error(`Error fetching ${sectionId}:`, error)
          })
          .finally(() => {
            // Remove from fetching set and update loading state
            fetchingRef.current.delete(sectionId)
            setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role_id, activeTab, resPubLevelOptions])

  // Individual fetch functions for refresh after operations
  // These also update the fetchedSections state to mark as fetched
  const fetchPatents = async () => {
    await fetchSectionData('patents', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'patents']))
  }
  const fetchPolicies = async () => {
    await fetchSectionData('policy', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'policy']))
  }
  const fetchEContent = async () => {
    await fetchSectionData('econtent', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'econtent']))
  }
  const fetchConsultancy = async () => {
    await fetchSectionData('consultancy', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'consultancy']))
  }
  const fetchCollaborations = async () => {
    await fetchSectionData('collaborations', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'collaborations']))
  }
  const fetchVisits = async () => {
    await fetchSectionData('visits', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'visits']))
  }
  const fetchFinancialSupport = async () => {
    await fetchSectionData('financial', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'financial']))
  }
  const fetchJrfSrf = async () => {
    await fetchSectionData('jrfSrf', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'jrfSrf']))
  }
  const fetchPhdGuidance = async () => {
    await fetchSectionData('phd', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'phd']))
  }
  const fetchCopyrights = async () => {
    await fetchSectionData('copyrights', user?.role_id || 0, setData, toast, resPubLevelOptions)
    setFetchedSections(prev => new Set([...prev, 'copyrights']))
  }

  // Handle URL tab parameter on initial load
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && sections.find((s) => s.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes and fetch data if not already fetched
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
    
    // Fetch dropdowns for the new tab
    fetchDropdownsForTab(value)
    
    // Fetch data for the new tab if not already fetched and not currently fetching
    const sectionId = value as SectionId
    if (user?.role_id && !fetchedSections.has(sectionId) && !fetchingRef.current.has(sectionId)) {
      // Mark as currently fetching to prevent duplicate requests
      fetchingRef.current.add(sectionId)
      setLoadingStates(prev => ({ ...prev, [sectionId]: true }))
      
      fetchSectionData(sectionId, user.role_id, setData, toast, resPubLevelOptions)
        .then(() => {
          // Mark as fetched after successful load
          setFetchedSections(prev => new Set([...prev, sectionId]))
        })
        .catch(error => {
          console.error(`Error fetching ${sectionId}:`, error)
        })
        .finally(() => {
          // Remove from fetching set and update loading state
          fetchingRef.current.delete(sectionId)
          setLoadingStates(prev => ({ ...prev, [sectionId]: false }))
        })
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files)
  }

  // Refresh functions map for delete operations
  const refreshFunctions: Record<SectionId, () => Promise<void>> = {
    patents: fetchPatents,
    policy: fetchPolicies,
    econtent: fetchEContent,
    consultancy: fetchConsultancy,
    collaborations: fetchCollaborations,
    visits: fetchVisits,
    financial: fetchFinancialSupport,
    jrfSrf: fetchJrfSrf,
    phd: fetchPhdGuidance,
    copyrights: fetchCopyrights,
  }

  const handleDelete = async (sectionId: string, itemId: number) => {
    try {
      const section = sectionId as SectionId
      const refreshFn = refreshFunctions[section]
      
      if (refreshFn) {
        await deleteSectionData(section, itemId, refreshFn, toast)
      } else {
        // Fallback for unknown sections
        setData((prevData) => ({
          ...prevData,
          [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).filter((item: any) => item.id !== itemId),
        }))
        toast({
          title: "Success",
          description: "Item deleted successfully.",
          duration: 3000,
        })
      }
    } catch (error: any) {
      // Error is already handled in deleteSectionData
    }
  }


  const handleEdit = (sectionId: string, item: any) => {
    setEditingItem({ ...item, sectionId })
    setFormData({ ...item })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async (data?: any) => {
    if (!editingItem) {
      toast({
        title: "Error",
        description: "No item selected for editing.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const submitData = data || formData
    const sectionId = editingItem.sectionId as SectionId
    const refreshFn = refreshFunctions[sectionId]

    if (!refreshFn) {
      // Fallback for unknown sections
      setData((prevData) => ({
        ...prevData,
        [sectionId]: (prevData[sectionId as keyof typeof prevData] || []).map((item: any) =>
          item.id === editingItem.id ? { ...item, ...submitData } : item,
        ),
      }))
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setSelectedFiles(null)
      form.reset()
      toast({
        title: "Success",
        description: "Item updated successfully!",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create update payload using mapper
      const updateData = createUpdateMapper(
        sectionId,
        submitData,
        editingItem,
        selectedFiles,
        {
          resPubLevelOptions,
          collaborationsTypeOptions,
        }
      )

      // Get request body using configuration
      const requestBody = UPDATE_REQUEST_BODIES[sectionId](
        editingItem.id,
        user.role_id,
        updateData
      )

      // Make API call
      const res = await fetch(API_ENDPOINTS[sectionId], {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || `Failed to update ${sectionId} record`)
      }

      toast({
        title: "Success",
        description: UPDATE_SUCCESS_MESSAGES[sectionId],
        duration: 3000,
      })

      setIsEditDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      setSelectedFiles(null)
      form.reset()

      // Refresh data
      await refreshFn()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${sectionId} record. Please try again.`,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (sectionId: string, itemId: number) => {
    if (selectedFiles && selectedFiles.length > 0) {
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
        title: "Success",
        description: "Supporting documents uploaded successfully!",
        duration: 3000,
      })
    }
  }

  const renderTableData = (section: any, item: any) => {
    switch (section.id) {
      case "patents":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.level}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.status?.toLowerCase() === "granted" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{item.status}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date}</span>
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.Tech_Licence ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                {item.Tech_Licence || "No"}
              </Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">₹ {Number.parseInt(item.Earnings_Generate || "0").toLocaleString()}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.PatentApplicationNo}</TableCell>
          </>
        )
      case "policy":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[150px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.level}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.organisation}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date}</span>
              </div>
            </TableCell>
          </>
        )
      case "econtent":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.e_content_type_name || ""}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.Brief_Details}>
                {item.Brief_Details}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.Quadrant}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.Publishing_date}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.Publishing_Authorities}</TableCell>
            <TableCell className="px-2 sm:px-4">
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm">
                  Link
                </a>
              )}
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.type_econtent_name || ""}</TableCell>
          </>
        )
      case "consultancy":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title || item.name}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.collaboratingInstitute || item.collaborating_inst}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.address}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.startDate || item.Start_Date}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.amount ? `₹ ${Number(item.amount).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.detailsOutcome || item.outcome}>
                {item.detailsOutcome || item.outcome || "-"}
              </div>
            </TableCell>
          </>
        )
      case "collaborations":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.category}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.collaboratingInstitute}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.nameOfCollaborator || item.collab_name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.qsTheRanking || item.collab_rank || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.address || "-"}</TableCell>
            <TableCell className="max-w-[80px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.details}>
                {item.details || "-"}
              </div>
            </TableCell>
            <TableCell className="max-w-[80px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.collaborationOutcome}>
                {item.collaborationOutcome || "-"}
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{item.status || "-"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.startingDate || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.levelName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.noOfBeneficiary || item.beneficiary_num || "-"}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant={item.mouSigned === "Yes" ? "default" : "secondary"} className="text-[10px] sm:text-xs">{item.mouSigned || "No"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.signingDate || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "visits":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.instituteVisited || item.Institute_visited || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.durationOfVisit || item.duration ? `${item.durationOfVisit || item.duration} days` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.roleName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.sponsoredBy || item.Sponsored_by || "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.remarks}>
                {item.remarks || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "financial":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfSupport || item.name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.typeName || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 max-w-[100px] sm:max-w-none truncate">{item.supportingAgency || item.support || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.grantReceived || item.grant_received ? `₹ ${Number(item.grantReceived || item.grant_received).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.detailsOfEvent || item.details}>
                {item.detailsOfEvent || item.details || "-"}
              </div>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.purposeOfGrant || item.purpose}>
                {item.purposeOfGrant || item.purpose || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "jrfSrf":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfFellow || item.name || "-"}</TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant="outline" className="text-[10px] sm:text-xs">{item.typeName || "-"}</Badge>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.projectTitle || item.title}>
                {item.projectTitle || item.title || "-"}
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.duration ? `${item.duration} months` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.monthlyStipend || item.stipend ? `₹ ${Number(item.monthlyStipend || item.stipend).toLocaleString()}` : "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.date || "-"}</span>
              </div>
            </TableCell>
          </>
        )
      case "phd":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.regNo || item.regno || "-"}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.nameOfStudent || item.name || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.dateOfRegistration || item.start_date || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-[100px] sm:max-w-xs px-2 sm:px-4">
              <div className="truncate text-xs sm:text-sm" title={item.topic}>
                {item.topic || "-"}
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              <Badge variant="outline" className="text-[10px] sm:text-xs">{item.statusName || "-"}</Badge>
            </TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.yearOfCompletion || item.year_of_completion || "-"}</TableCell>
          </>
        )
      case "copyrights":
        return (
          <>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.srNo}</TableCell>
            <TableCell className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate">{item.title || item.Title || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">{item.referenceNo || item.RefNo || "-"}</TableCell>
            <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span>{item.publicationDate || item.PublicationDate || "-"}</span>
              </div>
            </TableCell>
            <TableCell className="px-2 sm:px-4">
              {item.link || item.Link ? (
                <a 
                  href={item.link || item.Link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-xs sm:text-sm"
                >
                  Link
                </a>
              ) : (
                "-"
              )}
            </TableCell>
          </>
        )
      default:
        return null
    }
  }

  const handleExtractInfo = async () => {
          if (!selectedFiles || selectedFiles.length === 0) {
            toast({
              title: "Error",
              description: "Please upload a document first.",
              variant: "destructive",
              duration: 3000,
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
                form.setValue(key, value)
              })
      
              toast({
                title: "Success",
                description: `Form auto-filled with ${extracted_fields} fields (${Math.round(
                  confidence * 100
                )}% confidence)`,
                duration: 3000,
              })
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to auto-fill form.",
              variant: "destructive",
              duration: 3000,
            })
          } finally {
            setIsExtracting(false)
          }
        }
      
  // This handleSubmit is only used for the edit dialog form submission
  // For add page, use the handleSubmit in patents/add/page.tsx
  const handleSubmit = async (data: any) => {
    if (!user?.role_id) {
      toast({
        title: "Error",
        description: "User information not available. Please refresh the page.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Handle dummy document upload
      let docUrl = null
      if (selectedFiles && selectedFiles.length > 0) {
        docUrl = `https://dummy-document-url-${Date.now()}.pdf`
      }

      const patentData = {
        title: data.title,
        level: data.level,
        status: data.status,
        date: data.date,
        Tech_Licence: data.Tech_Licence || "",
        Earnings_Generate: data.Earnings_Generate ? Number(data.Earnings_Generate) : null,
        PatentApplicationNo: data.PatentApplicationNo || "",
        doc: docUrl,
      }

      const res = await fetch("/api/teacher/research-contributions/patents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.role_id,
          patent: patentData,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to add patent")
      }

      toast({
        title: "Success",
        description: "Patent added successfully!",
        duration: 3000,
      })
      
      // Navigate back to main page
      router.push("/teacher/research-contributions?tab=patents")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add patent. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      setSelectedFiles(null)
      form.reset()
    }
  }

      
      
  const renderForm = (sectionId: string, isEdit = false) => {
    const currentData = isEdit ? formData : {}    
        
    switch (sectionId) {
      case "patents":
        return (
          <PatentForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
            patentStatusOptions={patentStatusOptions}
          />
        )
      case "policy":
        return (
          <PolicyForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            resPubLevelOptions={resPubLevelOptions}
          />
        )
      case "econtent":
        return (
          <EContentForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
            eContentTypeOptions={eContentTypeOptions}
            typeEcontentValueOptions={typeEcontentValueOptions}
          />
        )
      case "consultancy":
        return (
          <ConsultancyForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={isEdit}
            editData={currentData}
          />
        )
      case "collaborations":
        return (
          <CollaborationForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            collaborationsLevelOptions={collaborationsLevelOptions}
            collaborationsOutcomeOptions={collaborationsOutcomeOptions}
            collaborationsTypeOptions={collaborationsTypeOptions}
          />
        )
      case "visits":
        return (
          <AcademicVisitForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            academicVisitRoleOptions={academicVisitRoleOptions}
          />
        )
      case "financial":
        return (
          <FinancialForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            financialSupportTypeOptions={financialSupportTypeOptions}
          />
        )
      case "jrfSrf":
        return (
          <JrfSrfForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            jrfSrfTypeOptions={jrfSrfTypeOptions}
          />
        )
      case "phd":
        return (
          <PhdGuidanceForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
            phdGuidanceStatusOptions={phdGuidanceStatusOptions}
          />
        )
      case "copyrights":
        return (
          <CopyrightForm
            form={form}
            onSubmit={handleSaveEdit}
            isSubmitting={isSubmitting}
            isExtracting={isExtracting}
            selectedFiles={selectedFiles}
            handleFileSelect={handleFileSelect}
            handleExtractInfo={handleExtractInfo}
            isEdit={true}
            editData={currentData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Research & Academic Contributions</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your research contributions, patents, and academic activities</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-3 sm:space-y-4">
        <div className="border-b mb-3 sm:mb-4">
          <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0 px-2 sm:px-0">
            <TabsList className="inline-flex min-w-max w-full">
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                >
                  <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <section.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  {section.title}
                </CardTitle>
                <Button
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                  onClick={() => {
                    const route = SECTION_ROUTES[section.id as SectionId]
                    router.push(route || "/teacher/research-contributions")
                  }}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add </span>
                  {section.title}
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="rounded-md border overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={column} className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4">
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
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                              <span className="text-xs sm:text-sm">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : !data[section.id as keyof typeof data] ||
                        data[section.id as keyof typeof data].length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.columns.length}
                            className="h-24 text-center text-muted-foreground text-xs sm:text-sm px-2 sm:px-4"
                          >
                            No {section.title.toLowerCase()} found. Click "Add {section.title}" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data[section.id as keyof typeof data].map((item: any) => (
                          <TableRow key={item.id}>
                            {renderTableData(section, item)}
                            <TableCell className="px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {item.supportingDocument && item.supportingDocument.length > 0 ? (
                                  <>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="View Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent
                                        className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                                        style={{ display: "flex", flexDirection: "column" }}
                                      >
                                        <DialogHeader className="p-3 sm:p-4 border-b">
                                          <DialogTitle className="text-sm sm:text-base">View Document</DialogTitle>
                                        </DialogHeader>

                                        {/* Scrollable Content */}
                                        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                                          <div className="w-full h-full">
                                            <DocumentViewer
                                              documentUrl={item.supportingDocument[0]}
                                              documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                      {item.supportingDocument.length} file(s)
                                    </Badge>
                                  </>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" title="Upload Document" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[95vw] sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle className="text-sm sm:text-base">Upload Supporting Documents</DialogTitle>
                                      </DialogHeader>
                                      <FileUpload onFileSelect={handleFileSelect} />
                                      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                        <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
                                        <Button onClick={() => handleFileUpload(section.id, item.id)} className="w-full sm:w-auto text-xs sm:text-sm">
                                          Upload Files
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>



                            <TableCell className="px-2 sm:px-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(section.id, item)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>

                                <ConfirmDeleteModal
                                  itemName={item.title}
                                  trigger={<Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>}
                                  onConfirm={() => handleDelete(section.id, item.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-2 sm:p-4 md:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg">
              Edit {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 sm:pr-2 -mx-2 sm:mx-0 px-2 sm:px-0">
            {editingItem && renderForm(editingItem.sectionId, true)}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (editingItem?.sectionId === "patents" || editingItem?.sectionId === "policy" || editingItem?.sectionId === "econtent" || editingItem?.sectionId === "consultancy" || editingItem?.sectionId === "collaborations" || editingItem?.sectionId === "visits" || editingItem?.sectionId === "financial" || editingItem?.sectionId === "jrfSrf" || editingItem?.sectionId === "phd" || editingItem?.sectionId === "copyrights") {
                  // Use form.handleSubmit to trigger validation and get form data
                  form.handleSubmit(handleSaveEdit)()
                } else {
                  handleSaveEdit()
                }
              }}
              disabled={isSubmitting}
              className="transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="text-xs sm:text-sm">Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Update {editingItem ? sections.find((s) => s.id === editingItem.sectionId)?.title : "Item"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

