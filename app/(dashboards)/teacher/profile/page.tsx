"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/api/auth/auth-provider"
import { FileText } from "lucide-react"
import { TeacherInfo, ExperienceEntry, PostDocEntry, EducationEntry, TeacherData, Faculty, Department, Designation, FacultyOption, DepartmentOption, DesignationOption, DegreeTypeOption } from "@/types/interfaces"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { useTeacherProfile, useInvalidateTeacherData } from "@/hooks/use-teacher-data"
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"
import { PersonalInfoSection } from "./components/PersonalInfoSection"
import { ExperienceDetailsSection } from "./components/ExperienceDetailsSection"
import { PhdResearchSection } from "./components/PhdResearchSection"
import { EducationDetailsSection } from "./components/EducationDetailsSection"



// Utility function to format dates for HTML date inputs
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

// ICT labels used in UI and for storing in ICT_Details (comma-separated)
const ICT_LABELS = {
  smartBoard: 'Smart Board',
  powerPoint: 'PowerPoint Presentation',
  ictTools: 'ICT Tools',
  eLearningTools: 'E-Learning Tools',
  onlineCourse: 'Online Course',
  others: 'Others',
} as const;

// Editing data type
type EditingData = {
  // Personal Information
  salutation: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  panNo: string
  // Academic Information
  designation: string
  faculty: string
  department: string
  dateOfJoining: string
  teachingStatus: string
  // Qualification Information
  netQualified: boolean
  netYear: string
  gateQualified: boolean
  gateYear: string
  // Registration Information
  registeredGuide: boolean
  registrationYear: string
  // ICT Information
  ictSmartBoard: boolean
  ictPowerPoint: boolean
  ictTools: boolean
  ictELearningTools: boolean
  ictOnlineCourse: boolean
  ictOthers: boolean
  ictOthersSpecify: string
  // Research Metrics
  H_INDEX: string
  i10_INDEX: string
  CITIATIONS: string
  ORCHID_ID: string
  RESEARCHER_ID: string
}

// Build a comma separated ICT_Details string from current editingData
const buildIctDetails = (state: EditingData): string => {
  const parts: string[] = [];
  if (state.ictSmartBoard) parts.push(ICT_LABELS.smartBoard);
  if (state.ictPowerPoint) parts.push(ICT_LABELS.powerPoint);
  if (state.ictTools) parts.push(ICT_LABELS.ictTools);
  if (state.ictELearningTools) parts.push(ICT_LABELS.eLearningTools);
  if (state.ictOnlineCourse) parts.push(ICT_LABELS.onlineCourse);
  if (state.ictOthers) {
    parts.push(`${ICT_LABELS.others}${state.ictOthersSpecify ? `: ${state.ictOthersSpecify}` : ''}`.trim());
  }
  return parts.join(', ');
};

// Helper to create the default editing data structure
const initialEditingData: EditingData = {
  // Personal Information
  salutation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  panNo: "",

  // Academic Information
  designation: "",
  faculty: "",
  department: "",
  dateOfJoining: "",
  teachingStatus: "",

  // Qualification Information
  netQualified: false,
  netYear: "",
  gateQualified: false,
  gateYear: "",

  // Registration Information
  registeredGuide: false,
  registrationYear: "",

  // ICT Information
  ictSmartBoard: false,
  ictPowerPoint: false,
  ictTools: false,
  ictELearningTools: false,
  ictOnlineCourse: false,
  ictOthers: false,
  ictOthersSpecify: "",

  // Research Metrics
  H_INDEX: "",
  i10_INDEX: "",
  CITIATIONS: "",
  ORCHID_ID: "",
  RESEARCHER_ID: "",
};


export default function ProfilePage() {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const isAuthenticated = user !== null;
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false) // Only for personal details
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null) // Store file for S3 upload on save
  // Loading states for save operations
  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingExperience, setSavingExperience] = useState<Record<number, boolean>>({})
  const [isSavingPostDoc, setSavingPostDoc] = useState<Record<number, boolean>>({})
  const [isSavingEducation, setSavingEducation] = useState<Record<number, boolean>>({})
  const [isSavingAcademicYears, setIsSavingAcademicYears] = useState(false)
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [facultyData, setFacultyData] = useState<Faculty | null>(null);
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [designationData, setDesignationData] = useState<Designation | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  // Row-level edit state for tables
  const [experienceEditingIds, setExperienceEditingIds] = useState<Set<number>>(new Set());
  const [postDocEditingIds, setPostDocEditingIds] = useState<Set<number>>(new Set());
  const [educationEditingIds, setEducationEditingIds] = useState<Set<number>>(new Set());
  // Document upload state for each entry
  const [phdDocumentUrls, setPhdDocumentUrls] = useState<Record<number, string>>({});
  const [educationDocumentUrls, setEducationDocumentUrls] = useState<Record<number, string>>({});
  // Dialog open state for document upload/view
  const [phdDialogOpen, setPhdDialogOpen] = useState<Record<number, boolean>>({});
  const [educationDialogOpen, setEducationDialogOpen] = useState<Record<number, boolean>>({});
  // Dialog open state for document viewing (read-only)
  const [phdViewDialogOpen, setPhdViewDialogOpen] = useState<Record<number, boolean>>({});
  const [educationViewDialogOpen, setEducationViewDialogOpen] = useState<Record<number, boolean>>({});


  const { facultyOptions, departmentOptions, degreeTypeOptions, permanentDesignationOptions, temporaryDesignationOptions, fetchFaculties, fetchDepartments, fetchDegreeTypes, fetchParmanentDesignations, fetchTemporaryDesignations } = useDropDowns()

  // Form data for editing (only used for temporary editing state)
  const [editingData, setEditingData] = useState({ ...initialEditingData })

  // react-hook-form for Personal Details
  const { control, register, reset, handleSubmit, getValues, watch, setValue, trigger, formState: { errors, touchedFields, isDirty: isPersonalDirty } } = useForm<any>({
    defaultValues: {},
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  // react-hook-form for Experience Details
  const experienceForm = useForm<{ experiences: ExperienceEntry[] }>({
    defaultValues: { experiences: [] },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { fields: experienceFields, append: appendExperience, remove: removeExperience, update: updateExperience } = useFieldArray({
    control: experienceForm.control,
    name: 'experiences',
  })
  const { formState: { isDirty: isExperienceDirty } } = experienceForm

  // react-hook-form for Post-Doctoral Research
  const postDocForm = useForm<{ researches: PostDocEntry[] }>({
    defaultValues: { researches: [] },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { fields: postDocFields, append: appendPostDoc, remove: removePostDoc, update: updatePostDoc } = useFieldArray({
    control: postDocForm.control,
    name: 'researches',
  })
  const { formState: { isDirty: isPostDocDirty } } = postDocForm

  // react-hook-form for Education Details
  const educationForm = useForm<{ educations: EducationEntry[] }>({
    defaultValues: { educations: [] },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { fields: educationFields, append: appendEducation, remove: removeEducation, update: updateEducationField } = useFieldArray({
    control: educationForm.control,
    name: 'educations',
  })
  const { formState: { isDirty: isEducationDirty } } = educationForm

  // Keep original data for cancel/reset
  const initialDataRef = useRef<{
    teacherInfo: TeacherInfo | null
    experiences: ExperienceEntry[]
    researches: PostDocEntry[]
    educations: EducationEntry[]
    profileImagePath: string | null
    facultyId: number | null
    ictDetails: string
    facultyData: Faculty | null
    departmentData: Department | null
  } | null>(null)

  // Track if we just set the profile image to prevent useEffect from overwriting it
  const justSetProfileImageRef = useRef<string | null>(null)


  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      fetchFaculties();
      fetchParmanentDesignations();
      fetchTemporaryDesignations();
      fetchDegreeTypes();

    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  // Fetch departments by faculty id
  const fetchDepartmentsByFaculty = async (fid: number) => {
    try {
      fetchDepartments(fid);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
    }
  };

  // Use React Query for data fetching with automatic caching
  // IMPORTANT: These hooks MUST be called unconditionally before any early returns
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useTeacherProfile()
  const { invalidateProfile } = useInvalidateTeacherData()
  
  // Ensure all hooks are called before any conditional logic or early returns

  // Fetch profile image URL from API
  const fetchProfileImageUrl = async (imagePath: string | null | undefined) => {
    if (!imagePath) {
      setProfileImage(null)
      return
    }

    try {
      const response = await fetch("/api/teacher/profile/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: imagePath }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          setProfileImage(data.url)
        } else {
          // File not found or error - show default icon
          setProfileImage(null)
        }
      } else {
        // 404 or other error - file doesn't exist, show default icon
        const errorData = await response.json().catch(() => ({}))
        console.warn("Profile image not found:", errorData.error || "File not found")
        setProfileImage(null)
      }
    } catch (error) {
      console.error("Error fetching profile image URL:", error)
      // On error, show default icon
      setProfileImage(null)
    }
  }

  // Initialize forms when data is loaded
  useEffect(() => {
    if (profileData) {
      const data: TeacherData = profileData as any
      setTeacherInfo(data.teacherInfo)
      // Store initial snapshot for resets
      initialDataRef.current = {
        teacherInfo: data.teacherInfo,
        experiences: data.teacherExperience || [],
        researches: data.postDoctoralExp || [],
        educations: data.graduationDetails || [],
        profileImagePath: data.teacherInfo?.ProfileImage || null,
        facultyId: data.faculty?.Fid ?? null,
        ictDetails: data.teacherInfo?.ICT_Details || '',
        facultyData: data.faculty || null,
        departmentData: data.department || null,
      }
      
      // Fetch profile image URL if ProfileImage exists
      // But skip if we just set it (to prevent overwriting just-uploaded image)
      if (data.teacherInfo?.ProfileImage) {
        const currentImagePath = data.teacherInfo.ProfileImage
        // Only fetch if we didn't just set this image
        if (justSetProfileImageRef.current !== currentImagePath) {
          fetchProfileImageUrl(currentImagePath)
      } else {
          // Clear the ref after a short delay to allow normal behavior next time
          setTimeout(() => {
            justSetProfileImageRef.current = null
          }, 2000)
        }
      } else {
        // Only clear if we don't have a pending image
        if (!pendingProfileImageFile) {
        setProfileImage(null)
        }
      }
      
      // Initialize react-hook-form arrays
      const normalizedExperiences = (data.teacherExperience || []).map((exp: any) => ({
        ...exp,
        currente: exp.currente === 1 || exp.currente === true ? true : false // Normalize 0/1 to boolean
      }))
      experienceForm.reset({ experiences: normalizedExperiences })
      postDocForm.reset({ researches: data.postDoctoralExp || [] })
      educationForm.reset({ educations: data.graduationDetails || [] })
      setFacultyData(data.faculty)
      const facultyId = data.faculty?.Fid ?? null
      setSelectedFacultyId(facultyId)
      setDepartmentData(data.department)
      setDesignationData(data.designation)
      
      // Fetch departments for the selected faculty
      if (facultyId) {
        fetchDepartmentsByFaculty(facultyId)
      }
      
      // Initialize react-hook-form with fetched personal details
      reset({
        Abbri: data.teacherInfo?.Abbri || '',
        fname: data.teacherInfo?.fname || '',
        mname: data.teacherInfo?.mname || '',
        lname: data.teacherInfo?.lname || '',
        email_id: data.teacherInfo?.email_id || '',
        phone_no: data.teacherInfo?.phone_no || '',
        // Dates must be in YYYY-MM-DD for <input type="date">
        DOB: formatDateForInput(data.teacherInfo?.DOB),
        recruit_date: formatDateForInput(data.teacherInfo?.recruit_date),
        PAN_No: data.teacherInfo?.PAN_No || '',
        gender: data.teacherInfo?.gender || '',
        // Teaching status and designations
        perma_or_tenure: data.teacherInfo?.perma_or_tenure ?? false,
        desig_perma: data.teacherInfo?.desig_perma ?? undefined,
        desig_tenure: data.teacherInfo?.desig_tenure ?? undefined,
        // Faculty and Department - IMPORTANT: Set these in form state
        faculty: facultyId ?? undefined,
        deptid: data.teacherInfo?.deptid ?? undefined,
        // Exams/guide fields
        NET: data.teacherInfo?.NET || false,
        NET_year: data.teacherInfo?.NET_year || '',
        GATE: data.teacherInfo?.GATE || false,
        GATE_year: data.teacherInfo?.GATE_year || '',
        PHDGuide: data.teacherInfo?.PHDGuide || false,
        Guide_year: data.teacherInfo?.Guide_year || '',
        // Research Metrics - Add these new fields
        H_INDEX: data.teacherInfo?.H_INDEX || '',
        i10_INDEX: data.teacherInfo?.i10_INDEX || '',
        CITIATIONS: data.teacherInfo?.CITIATIONS || '',
        ORCHID_ID: data.teacherInfo?.ORCHID_ID || '',
        RESEARCHER_ID: data.teacherInfo?.RESEARCHER_ID || '',
      })
      // Initialize ICT selection from teacherInfo.ICT_Details
      const details = (data.teacherInfo?.ICT_Details || '').split(',').map(s => s.trim()).filter(Boolean)
      const othersEntry = details.find(d => d.toLowerCase().startsWith('others'))
      setEditingData(prev => ({
        ...prev,
        ictSmartBoard: details.includes(ICT_LABELS.smartBoard),
        ictPowerPoint: details.includes(ICT_LABELS.powerPoint),
        ictTools: details.includes(ICT_LABELS.ictTools),
        ictELearningTools: details.includes(ICT_LABELS.eLearningTools),
        ictOnlineCourse: details.includes(ICT_LABELS.onlineCourse),
        ictOthers: Boolean(othersEntry),
        ictOthersSpecify: othersEntry?.split(':')?.[1]?.trim() || '',
      }))
      setIsLoading(false)
    }
  }, [profileData])

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/teacher/dashboard")
    } else if (isAuthenticated) {
      fetchDropdownData()
    }
  }, [isAuthenticated, router])

  // When faculty selection changes, fetch departments for that faculty
  // MUST be before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (selectedFacultyId && !Number.isNaN(selectedFacultyId)) {
      fetchDepartmentsByFaculty(selectedFacultyId)
    }
  }, [selectedFacultyId])

  // Sync selectedFacultyId with form field value
  const facultyFormValue = watch('faculty');
  useEffect(() => {
    if (facultyFormValue && facultyFormValue !== selectedFacultyId) {
      setSelectedFacultyId(facultyFormValue);
    }
  }, [facultyFormValue, selectedFacultyId])

  // Show loading state - AFTER all hooks
  // All hooks must be called before any early returns to follow Rules of Hooks
  if (profileLoading || isLoading) {
    return <PageLoadingSkeleton />
  }

  if (profileError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          <p>Error loading profile. Please try again.</p>
        </div>
      </div>
    )
  }
  
  // Remove duplicate isLoading check that was after hooks




  const handleCheckboxChange = (field: string, checked: boolean) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const addExperienceEntry = () => {
    if (hasAnyRecordEditing) {
      toast({
        title: "Cannot Add",
        description: "Please save or cancel the currently editing record before adding a new one.",
        variant: "default",
      })
      return
    }
    const newEntry: ExperienceEntry = {
      Id: Date.now(),
      Tid: 1,
      upload: null,
      Employeer: "",
      currente: false,
      desig: "",
      Start_Date: "",
      End_Date: "",
      Nature: "",
      UG_PG: "",
    }
    appendExperience(newEntry)
    // Auto-enable edit mode for new entry
    setExperienceEditingIds(prev => new Set([...prev, newEntry.Id]))
  }

  const removeExperienceEntry = async (index: number, id: number) => {
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (id && id <= 2147483647) {
        const res = await fetch(`/api/teacher/profile/experience?teacherId=${teacherId}&id=${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Delete failed' }))
          toast({ title: "Delete Failed", description: errorData.error || "Could not delete experience.", variant: "destructive" })
          throw new Error(errorData.error || "Could not delete experience.")
        }
      }
      
      // Remove from form array
      removeExperience(index)
      setExperienceEditingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      
      // Invalidate cache immediately to prevent showing stale data
      await invalidateProfile()
      
      // Refresh form data
      setTimeout(async () => {
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          experienceForm.reset({ experiences: refreshData.teacherExperience || [] })
        }
      }, 100)
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete experience.", variant: "destructive" })
      throw e // Re-throw so component can handle it
    }
  }

  const addPostDocEntry = () => {
    if (hasAnyRecordEditing) {
      toast({
        title: "Cannot Add",
        description: "Please save or cancel the currently editing record before adding a new one.",
        variant: "default",
      })
      return
    }
    const newEntry: PostDocEntry = {
      Id: Date.now(),
      Tid: 1,
      Institute: "",
      Start_Date: "",
      End_Date: "",
      SponsoredBy: "",
      QS_THE: "",
      doc: "",
    }
    appendPostDoc(newEntry)
    // Auto-enable edit mode for new entry
    setPostDocEditingIds(prev => new Set([...prev, newEntry.Id]))
  }

  const removePostDocEntry = async (index: number, id: number) => {
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ title: "Delete Failed", description: "Teacher ID not found.", variant: "destructive" })
        throw new Error("Teacher ID not found.")
      }

      // Get the entry to retrieve document path for S3 deletion
      const entry = postDocForm.getValues(`researches.${index}`)
      const docPath = entry?.doc || null

      if (id && id <= 2147483647) {
        // Pass document path in request body so backend can delete S3 file first
        const deleteUrl = `/api/teacher/profile/phd-research?teacherId=${teacherId}&id=${id}`
        const res = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: docPath }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Delete failed' }))
          toast({ title: "Delete Failed", description: errorData.error || "Could not delete post-doc entry.", variant: "destructive" })
          throw new Error(errorData.error || "Could not delete post-doc entry.")
        }

        // Check response for S3 deletion status
        const result = await res.json().catch(() => ({}))
        
        // Show toast for S3 deletion status
        if (docPath && docPath.startsWith('upload/')) {
          if (result.s3DeleteMessage) {
            if (result.warning) {
              // S3 deletion failed but database deletion succeeded
              toast({
                title: "S3 Document Deletion",
                description: result.s3DeleteMessage || "S3 document deletion had issues.",
                variant: "destructive",
              })
            } else {
              // S3 deletion succeeded
              toast({
                title: "S3 Document Deleted",
                description: result.s3DeleteMessage || "Document deleted from S3 successfully.",
              })
            }
          }
        }
        
        // Show toast for database deletion (always succeeds if we reach here)
        toast({
          title: "Record Deleted",
          description: "Post-doc entry deleted from database successfully.",
        })
      }
      
      // Remove from form array
      removePostDoc(index)
      setPostDocEditingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      
      // Invalidate cache immediately to prevent showing stale data
      await invalidateProfile()
      
      // Refresh form data
      setTimeout(async () => {
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          postDocForm.reset({ researches: refreshData.postDoctoralExp || [] })
        }
      }, 100)
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete post-doc entry.", variant: "destructive" })
      throw e // Re-throw so component can handle it
    }
  }

  const addEducationEntry = () => {
    if (hasAnyRecordEditing) {
      toast({
        title: "Cannot Add",
        description: "Please save or cancel the currently editing record before adding a new one.",
        variant: "default",
      })
      return
    }
    const newEntry: EducationEntry = {
      gid: Date.now(),
      tid: 1,
      Image: null,
      QS_Ranking: "",
      degree_name: "",
      degree_type: 1,
      university_name: "",
      state: "",
      year_of_passing: "", // Empty string for new entries - will be converted to date format on input
      subject: "",
    }
    appendEducation(newEntry)
    // Auto-enable edit mode for new entry
    setEducationEditingIds(prev => new Set([...prev, newEntry.gid]))
  }

  // Check if any record in any section is currently being edited
  const hasAnyRecordEditing = isEditingPersonal || 
    experienceEditingIds.size > 0 || 
    postDocEditingIds.size > 0 || 
    educationEditingIds.size > 0

  // Row-level edit toggles - prevent editing if another section is already editing
  const toggleExperienceRowEdit = (id: number) => {
    // Allow toggling off (canceling) even if other sections are editing
    const isCurrentlyEditing = experienceEditingIds.has(id)
    if (!isCurrentlyEditing && hasAnyRecordEditing) {
      toast({
        title: "Cannot Edit",
        description: "Please save or cancel the currently editing record before editing another.",
        variant: "default",
      })
      return
    }
    setExperienceEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const togglePostDocRowEdit = (id: number) => {
    // Allow toggling off (canceling) even if other sections are editing
    const isCurrentlyEditing = postDocEditingIds.has(id)
    if (!isCurrentlyEditing && hasAnyRecordEditing) {
      toast({
        title: "Cannot Edit",
        description: "Please save or cancel the currently editing record before editing another.",
        variant: "default",
      })
      return
    }
    setPostDocEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Cancel post-doc row edit
  const handleCancelPostDocRow = async (index: number, id: number) => {
    togglePostDocRowEdit(id)
    // Reset form to original values on cancel
    const teacherId = user?.role_id || teacherInfo?.Tid
    if (teacherId) {
      try {
        const res = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (res.ok) {
          const data: TeacherData = await res.json()
          postDocForm.reset({ researches: data.postDoctoralExp || [] })
        }
      } catch (e) {
        console.error('Error resetting post-doc form:', e)
      }
    }
  }
  const toggleEducationRowEdit = (id: number) => {
    // Allow toggling off (canceling) even if other sections are editing
    const isCurrentlyEditing = educationEditingIds.has(id)
    if (!isCurrentlyEditing && hasAnyRecordEditing) {
      toast({
        title: "Cannot Edit",
        description: "Please save or cancel the currently editing record before editing another.",
        variant: "default",
      })
      return
    }
    setEducationEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const removeEducationEntry = async (index: number, id: number) => {
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ title: "Delete Failed", description: "Teacher ID not found.", variant: "destructive" })
        throw new Error("Teacher ID not found.")
      }

      // Get the entry to retrieve document path for S3 deletion
      const entry = educationForm.getValues(`educations.${index}`)
      const docPath = entry?.Image || null

      if (id && id <= 2147483647) {
        // Pass document path in request body so backend can delete S3 file first
        // Use 'Image' field name to match education API expectations
        const deleteUrl = `/api/teacher/profile/graduation?teacherId=${teacherId}&gid=${id}`
        const res = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Image: docPath }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Delete failed' }))
          toast({ title: "Delete Failed", description: errorData.error || "Could not delete education entry.", variant: "destructive" })
          throw new Error(errorData.error || "Could not delete education entry.")
        }

        // Check response for S3 deletion status
        const result = await res.json().catch(() => ({}))
        
        // Show toast for S3 deletion status
        if (docPath && docPath.startsWith('upload/')) {
          if (result.s3DeleteMessage) {
            if (result.warning) {
              // S3 deletion failed but database deletion succeeded
              toast({
                title: "S3 Document Deletion",
                description: result.s3DeleteMessage || "S3 document deletion had issues.",
                variant: "destructive",
              })
            } else {
              // S3 deletion succeeded
              toast({
                title: "S3 Document Deleted",
                description: result.s3DeleteMessage || "Document deleted from S3 successfully.",
              })
            }
          }
        }
        
        // Show toast for database deletion (always succeeds if we reach here)
        toast({
          title: "Record Deleted",
          description: "Education entry deleted from database successfully.",
        })
      }
      
      // Remove from form array
      removeEducation(index)
      setEducationEditingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      
      // Invalidate cache immediately to prevent showing stale data
      await invalidateProfile()
      
      // Refresh form data
      setTimeout(async () => {
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          educationForm.reset({ educations: refreshData.graduationDetails || [] })
        }
      }, 100)
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete education entry.", variant: "destructive" })
      throw e // Re-throw so component can handle it
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type - only JPG/JPEG
    if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
      toast({
        title: "Invalid File Type",
        description: "Only JPG or JPEG images are allowed",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 1MB",
        variant: "destructive"
      })
      return
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Please refresh the page.",
        variant: "destructive"
      })
      return
    }

    // Do NOT upload immediately. Only prepare preview and pending file.
    let previewUrl: string | null = null
    try {
      setPendingProfileImageFile(file)
      previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)

      toast({
        title: "Image Selected",
        description: "Image ready. Click 'Save Changes' to upload to S3 and update profile.",
      })
    } catch (error: any) {
      console.error("Error creating preview URL:", error)
      // Cleanup on error
      setPendingProfileImageFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      toast({
        title: "Error",
        description: "Failed to preview image. Please try again.",
        variant: "destructive"
      })
      return
    }
    
    // Reset file input
    const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const triggerImageUpload = () => {
    const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
    fileInput?.click()
  }

  // Download profile image from S3
  const handleDownloadProfileImage = async () => {
    if (!teacherInfo?.ProfileImage) {
      toast({
        title: "No Image",
        description: "No profile image available to download.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploadingImage(true)
      
      // Use GET endpoint with download=true to avoid CORS issues
      // Server will fetch from S3 and stream to client
      const response = await fetch(`/api/teacher/profile/image?path=${encodeURIComponent(teacherInfo.ProfileImage)}&download=true`, {
        method: "GET",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Download failed" }))
        
        // More specific error messages
        let errorMessage = errorData.error || "Failed to download image"
        if (response.status === 404) {
          errorMessage = "Image not found. It may have been deleted."
        } else if (response.status === 500) {
          errorMessage = "Server error while downloading image. Please try again."
        } else if (response.status === 0 || !response.ok) {
          errorMessage = "Network error. Please check your connection and try again."
        }
        
        throw new Error(errorMessage)
      }

      // Get the blob from response with error handling
      let blob: Blob
      try {
        blob = await response.blob()
      } catch (blobError: any) {
        console.error("Error creating blob from response:", blobError)
        throw new Error("Failed to process image data. The file may be corrupted.")
      }
      
      // Extract filename from path (format: upload/Profile/email.extension)
      const fileName = teacherInfo.ProfileImage.split("/").pop() || `profile-${user?.email || "image"}.jpg`
      
      // Create download link with error handling
      let downloadUrl: string | null = null
      try {
        downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = fileName
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Download Started",
          description: "Profile image download started successfully.",
        })
      } catch (linkError: any) {
        console.error("Error creating download link:", linkError)
        throw new Error("Failed to initiate download. Please try again.")
      } finally {
        // Always cleanup blob URL
        if (downloadUrl) {
          window.URL.revokeObjectURL(downloadUrl)
        }
      }
    } catch (error: any) {
      console.error("Error downloading profile image:", error)
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download profile image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Remove profile image
  const handleRemoveProfileImage = async () => {
    if (!teacherInfo?.ProfileImage) {
      toast({
        title: "No Image",
        description: "No profile image to remove.",
        variant: "destructive"
      })
      return
    }

    let deleteSucceeded = false

    try {
      setIsUploadingImage(true)

      // Delete image from S3 or local storage
      const response = await fetch(`/api/teacher/profile/image?path=${encodeURIComponent(teacherInfo.ProfileImage)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Delete failed" }))
        
        // More specific error messages
        let errorMessage = errorData.error || "Failed to delete image"
        if (response.status === 404) {
          errorMessage = "Image not found. It may have already been deleted."
        } else if (response.status === 500) {
          errorMessage = "Server error while deleting image. Please try again."
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to delete image")
      }

      deleteSucceeded = true

      // Update teacher info to remove profile image path
      const teacherId = user?.role_id || teacherInfo?.Tid
      if (!teacherId) {
        throw new Error("Teacher ID not found")
      }

      const updatedPayload: TeacherInfo = {
        ...teacherInfo,
        ProfileImage: null,
      }

      // Update in database
      const updateResponse = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update profile. Image was deleted but profile not updated.")
      }

      const updateResult = await updateResponse.json()
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update profile. Image was deleted but profile not updated.")
      }

      // Update local state
      setTeacherInfo(updatedPayload)
      setProfileImage(null)
      setPendingProfileImageFile(null)

      // Update auth context - same pattern as successful profile save
      const authUpdates: any = {
        profilePicture: undefined
      }
      updateUser(authUpdates)

      // Invalidate cache
      await invalidateProfile()

      // Dispatch custom event to notify header component to refresh profile image
      // Same pattern as successful profile save
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("profileImageUpdated", {
            detail: { 
              profilePicture: undefined,
              timestamp: Date.now()
            }
          }))
        }, 100) // Small delay to ensure AuthContext has updated
      }

      toast({
        title: "Image Removed",
        description: "Profile image has been removed successfully.",
      })
    } catch (error: any) {
      console.error("Error removing profile image:", error)
      
      // If delete succeeded but update failed, update local state to null
      // This way the UI reflects the deletion, and when user clicks "Save Changes",
      // the null value will be saved to backend
      if (deleteSucceeded) {
        // Update local state to reflect deletion (even though backend update failed)
        const updatedPayload: TeacherInfo = {
          ...teacherInfo,
          ProfileImage: null,
        }
        setTeacherInfo(updatedPayload)
        setProfileImage(null)
        setPendingProfileImageFile(null)

        // Update auth context - same pattern as successful profile save
        // This ensures the UI and header reflect the deletion
        const authUpdates: any = {
          profilePicture: undefined
        }
        updateUser(authUpdates)

        // Dispatch custom event to notify header component
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("profileImageUpdated", {
              detail: { 
                profilePicture: undefined,
                timestamp: Date.now()
              }
            }))
          }, 100)
        }

        toast({
          title: "Image Deleted",
          description: "Image was deleted from storage. Click 'Save Changes' to update your profile and sync the change.",
          variant: "default"
        })
      } else {
        toast({
          title: "Remove Failed",
          description: error.message || "Failed to remove profile image. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setIsUploadingImage(false)
    }
  }


  // Wrapper to handle validation errors
  const handlePersonalSubmit = handleSubmit(
    // Success callback - validation passed
    async (data: any) => {
      await onSubmitPersonal(data);
    },
    // Error callback - validation failed
    (validationErrors) => {
      const errorMessages: string[] = [];
      
      Object.entries(validationErrors).forEach(([key, error]: [string, any]) => {
        if (error?.message) {
          const fieldLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          errorMessages.push(`${fieldLabel}: ${error.message}`);
        }
      });

      if (errorMessages.length > 0) {
        toast({ 
          title: "Validation Failed", 
          description: errorMessages.join('. ') || "Please fix the validation errors before submitting.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Validation Failed", 
          description: "Please fix the validation errors before submitting.", 
          variant: "destructive" 
        });
      }
    }
  );

  const onSubmitPersonal = async (data: any) => {
    setIsSavingPersonal(true)
    try {
      // Use validated data from handleSubmit, but also get current form values for fields not in validation
      const values = { ...getValues(), ...data };
      const newIctDetails = buildIctDetails(editingData);
      
      // Ensure we have the teacher ID
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ 
          title: "Update Failed", 
          description: "Teacher ID not found. Please refresh the page and try again.", 
          variant: "destructive" 
        });
        return;
      }

      // Build payload with proper data types and ensure all required fields
      // Note: phone_no needs to be a number (not BigInt) for JSON serialization
      const phoneNoValue = values.phone_no 
        ? (typeof values.phone_no === 'string' ? parseInt(values.phone_no) : values.phone_no)
        : (teacherInfo?.phone_no ? Number(teacherInfo.phone_no) : 0);
      
      // Extract faculty field (not part of TeacherInfo, only used for validation)
      const { faculty, ...restValues } = values;
      
      const payload: TeacherInfo = {
        ...(teacherInfo || {}),
        Tid: teacherId,
        ...restValues,
        // Ensure proper data types
        phone_no: phoneNoValue,
        NET: values.NET ?? teacherInfo?.NET ?? false,
        PET: values.PET ?? teacherInfo?.PET ?? false,
        GATE: values.GATE ?? teacherInfo?.GATE ?? false,
        PHDGuide: values.PHDGuide ?? teacherInfo?.PHDGuide ?? false,
        OtherGuide: values.OtherGuide ?? teacherInfo?.OtherGuide ?? false,
        perma_or_tenure: values.perma_or_tenure ?? teacherInfo?.perma_or_tenure ?? false,
        ICT_Use: editingData.ictSmartBoard || editingData.ictPowerPoint || editingData.ictTools || 
                 editingData.ictELearningTools || editingData.ictOnlineCourse || editingData.ictOthers 
                 ? true : (teacherInfo?.ICT_Use ?? false),
        ICT_Details: newIctDetails || null,
        // Convert empty strings to null for optional fields
        NET_year: values.NET_year && values.NET ? parseInt(values.NET_year) || null : (teacherInfo?.NET_year || null),
        GATE_year: values.GATE_year && values.GATE ? parseInt(values.GATE_year) || null : (teacherInfo?.GATE_year || null),
        Guide_year: values.Guide_year && values.PHDGuide ? parseInt(values.Guide_year) || null : (teacherInfo?.Guide_year || null),
        H_INDEX: values.H_INDEX !== undefined && values.H_INDEX !== '' ? parseInt(values.H_INDEX) || 0 : (teacherInfo?.H_INDEX || 0),
        i10_INDEX: values.i10_INDEX !== undefined && values.i10_INDEX !== '' ? parseInt(values.i10_INDEX) || 0 : (teacherInfo?.i10_INDEX || 0),
        CITIATIONS: values.CITIATIONS !== undefined && values.CITIATIONS !== '' ? parseInt(values.CITIATIONS) || 0 : (teacherInfo?.CITIATIONS || 0),
        ORCHID_ID: values.ORCHID_ID || teacherInfo?.ORCHID_ID || '',
        RESEARCHER_ID: values.RESEARCHER_ID || teacherInfo?.RESEARCHER_ID || '',
        // Preserve other fields
        NILL2016_17: teacherInfo?.NILL2016_17 ?? false,
        NILL2017_18: teacherInfo?.NILL2017_18 ?? false,
        NILL2018_19: teacherInfo?.NILL2018_19 ?? false,
        NILL2019_20: teacherInfo?.NILL2019_20 ?? false,
        NILL2020_21: teacherInfo?.NILL2020_21 ?? false,
        NILL2021_22: teacherInfo?.NILL2021_22 ?? false,
        NILL2022_23: teacherInfo?.NILL2022_23 ?? false,
        NILL2023_24: teacherInfo?.NILL2023_24 ?? false,
        NILL2024_25: teacherInfo?.NILL2024_25 ?? false,
        NILL2025_26: teacherInfo?.NILL2025_26 ?? false,
        Disabled: teacherInfo?.Disabled ?? false,
        Status: teacherInfo?.Status || '',
        ProfileImage: teacherInfo?.ProfileImage || null,
      } as TeacherInfo;

      // If there's a pending profile image, upload it to S3 first
      // pendingProfileImageFile is only set when user selects a NEW file, so if it exists, we need to upload
      if (pendingProfileImageFile && user?.email) {
        try {
          // Delete old S3 image if exists (to prevent orphaned files)
          if (teacherInfo?.ProfileImage && teacherInfo.ProfileImage.startsWith("upload/")) {
            try {
              // Note: We'll implement DELETE endpoint if needed, but for now just log
              console.log("Old S3 image exists:", teacherInfo.ProfileImage)
              // Old image will be overwritten by new upload with same email-based name
            } catch (deleteErr) {
              // Don't fail the upload if old image deletion fails
              console.warn("Note: Old image cleanup skipped:", deleteErr)
            }
          }

          // Upload to S3 (will fallback to local if S3 fails)
          const formData = new FormData()
          formData.append("file", pendingProfileImageFile)
          formData.append("email", user.email)
          formData.append("uploadToS3", "true") // Upload to S3

          const uploadResponse = await fetch("/api/teacher/profile/image", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({ error: "Network error" }))
            throw new Error(errorData.error || "Failed to upload image to S3")
          }

          const uploadResult = await uploadResponse.json()

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "Image upload failed")
          }

          // Verify the path format is correct (upload/Profile/email.extension)
          if (!uploadResult.path || !uploadResult.path.startsWith("upload/Profile/")) {
            console.warn("Unexpected path format:", uploadResult.path)
          }

          // Update payload with final path (always in format: upload/Profile/email.extension)
          payload.ProfileImage = uploadResult.path

          // Handle S3 upload status
          if (!uploadResult.uploadedToS3) {
            // S3 upload failed but file was saved locally
            if (uploadResult.error) {
              toast({
                title: "S3 Upload Failed",
                description: uploadResult.error + " Image saved locally. Profile will be updated with local image path.",
                variant: "destructive"
              })
            } else {
              toast({
                title: "S3 Not Configured",
                description: "S3 is not configured. Image saved locally. Profile will be updated with local image path.",
                variant: "default"
              })
            }
          } else {
            // S3 upload successful
            toast({
              title: "Image Uploaded",
              description: "Profile image uploaded to S3 successfully.",
            })
          }

          // Clear pending file
          setPendingProfileImageFile(null)

          // Fetch the S3 presigned URL for immediate preview
          // Don't append cache-busting params to S3 presigned URLs (breaks signature)
          try {
            const urlResponse = await fetch("/api/teacher/profile/image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: uploadResult.path }),
            })

            if (urlResponse.ok) {
              const urlData = await urlResponse.json()
              if (urlData.success && urlData.url) {
                // Use S3 presigned URL as-is - don't modify it
                console.log("Setting profile image after S3 upload:", urlData.url)
                // Mark that we just set this image path
                justSetProfileImageRef.current = uploadResult.path
                setProfileImage(urlData.url)
              } else {
                // File not found or error getting URL
                console.warn("Failed to get presigned URL after upload:", urlData.error)
                toast({
                  title: "Image Uploaded",
                  description: "Image uploaded successfully, but preview unavailable. Please refresh the page.",
                  variant: "default"
                })
              }
            } else {
              // HTTP error getting URL
              const errorData = await urlResponse.json().catch(() => ({}))
              console.warn("Failed to fetch image URL for preview:", errorData.error || urlResponse.statusText)
              toast({
                title: "Image Uploaded",
                description: "Image uploaded successfully, but preview unavailable. Please refresh the page.",
                variant: "default"
              })
            }
          } catch (urlErr: any) {
            console.error("Error fetching image URL for preview:", urlErr)
            toast({
              title: "Image Uploaded",
              description: "Image uploaded successfully, but preview unavailable. Please refresh the page.",
              variant: "default"
            })
            // Don't fail the save if URL fetch fails
          }
        } catch (imageError: any) {
          console.error("Error uploading profile image to S3:", imageError)
          
          // Cleanup pending file on error
          setPendingProfileImageFile(null)
          
          // Determine error type for better user feedback
          let errorTitle = "S3 Upload Failed"
          let errorDescription = imageError.message || "Failed to upload image to S3. Profile will be saved without image update."
          
          if (imageError.message?.includes("Network") || imageError.message?.includes("fetch")) {
            errorTitle = "Network Error"
            errorDescription = "Network error while uploading to S3. Please check your connection and try again. Profile will be saved without image update."
          } else if (imageError.message?.includes("S3 is not configured")) {
            errorTitle = "S3 Not Configured"
            errorDescription = "S3 is not configured. Image will be saved locally."
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive"
          })
          
          // Continue with profile save - don't update ProfileImage if upload failed
          // This allows user to retry later without losing other profile data
        }
      }

      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check HTTP status first
      if (!response.ok) {
        let errorMessage = "Failed to update profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Server returned ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast({ 
          title: "Update Failed", 
          description: errorMessage, 
          variant: "destructive" 
        });
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state first
        setTeacherInfo(payload);
        
        // Clear pending image file if save was successful
        if (pendingProfileImageFile) {
          setPendingProfileImageFile(null)
        }

        // Sync AuthProvider with latest info (name, faculty, department, profile image path)
        const authUpdates: any = {}

        // Name update
        const newName = payload.fname && payload.lname 
          ? `${payload.fname}${payload.mname ? ` ${payload.mname}` : ''} ${payload.lname}`.trim()
          : payload.fname || payload.lname || user?.name
        if (newName && newName !== user?.name) {
          authUpdates.name = newName
        }

        // Faculty / Department update - prioritize options lookup to get current values
        const currentFacultyId = values.faculty || selectedFacultyId
        const currentDeptId = payload.deptid
        
        // Find faculty name from options first (to get the current selected value)
        let facultyName: string | undefined = undefined
        if (currentFacultyId) {
          const selectedFaculty = facultyOptions.find(f => f.Fid === currentFacultyId)
          if (selectedFaculty) {
            facultyName = selectedFaculty.Fname
          }
        }
        // Fallback to state if not found in options
        if (!facultyName) {
          facultyName = facultyData?.Fname
        }
        
        // Find department name from options first (to get the current selected value)
        let departmentName: string | undefined = undefined
        if (currentDeptId) {
          const selectedDept = departmentOptions.find(d => d.Deptid === currentDeptId)
          if (selectedDept) {
            departmentName = selectedDept.name
          }
        }
        // Fallback to state if not found in options
        if (!departmentName) {
          departmentName = departmentData?.name
        }
        
        // Update auth context with faculty and department
        if (facultyName && facultyName !== user?.faculty) {
          authUpdates.faculty = facultyName
        }
        if (departmentName && departmentName !== user?.department) {
          authUpdates.department = departmentName
        }

        // Profile image path update - ensure S3 presigned URL is set and displayed
        // IMPORTANT: Do this BEFORE invalidateProfile to prevent race condition
        let profileImageUpdated = false
        if (payload.ProfileImage) {
          // Always update auth context with new profile image path
          authUpdates.profilePicture = payload.ProfileImage
          profileImageUpdated = true
          
          // Only fetch URL if we don't already have it set (from S3 upload above)
          // This prevents unnecessary refetch and ensures we keep the presigned URL
          if (!profileImage || !profileImage.includes(payload.ProfileImage.split('/').pop() || '')) {
            try {
              const refreshResponse = await fetch("/api/teacher/profile/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: payload.ProfileImage }),
              })

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json()
                if (refreshData.success && refreshData.url) {
                  // Use S3 presigned URL as-is - don't append parameters (breaks signature)
                  console.log("Setting profile image after profile save:", refreshData.url)
                  // Mark that we just set this image path
                  justSetProfileImageRef.current = payload.ProfileImage
                  setProfileImage(refreshData.url)
                }
              }
            } catch (refreshError) {
              console.error("Error refreshing profile image URL:", refreshError)
            }
          } else {
            // Image already set, just mark the path
            justSetProfileImageRef.current = payload.ProfileImage
          }
        }

        // NOW invalidate cache and refetch data (after image is set)
        // This ensures the image URL is set before the useEffect runs
        await invalidateProfile();

        if (Object.keys(authUpdates).length > 0) {
          updateUser(authUpdates)
          
          // Dispatch custom event to notify header component to refresh profile image
          // Do this after updateUser to ensure state is updated
          // Use setTimeout to ensure the update has propagated
          if (profileImageUpdated && typeof window !== "undefined") {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("profileImageUpdated", {
                detail: { 
                  profilePicture: authUpdates.profilePicture,
                  timestamp: Date.now()
                }
              }))
            }, 100) // Small delay to ensure AuthContext has updated
          }
        }
        
        toast({ 
          title: "Profile Updated", 
          description: result.message || "Your information has been saved successfully." 
        });
        setIsEditingPersonal(false);
      } else {
        toast({ 
          title: "Update Failed", 
          description: result.error || result.message || "Something went wrong while updating your profile.", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage = error?.message || "Network or server error while saving your profile.";
      toast({ 
        title: "Update Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsSavingPersonal(false)
    }
  };


  const handleCancelPersonal = () => {
    setIsEditingPersonal(false)
    if (!initialDataRef.current) return
    const init = initialDataRef.current

    // Reset personal form
    reset({
      Abbri: init.teacherInfo?.Abbri || '',
      fname: init.teacherInfo?.fname || '',
      mname: init.teacherInfo?.mname || '',
      lname: init.teacherInfo?.lname || '',
      email_id: init.teacherInfo?.email_id || '',
      phone_no: init.teacherInfo?.phone_no || '',
      DOB: formatDateForInput(init.teacherInfo?.DOB),
      recruit_date: formatDateForInput(init.teacherInfo?.recruit_date),
      PAN_No: init.teacherInfo?.PAN_No || '',
      perma_or_tenure: init.teacherInfo?.perma_or_tenure ?? false,
      desig_perma: init.teacherInfo?.desig_perma ?? undefined,
      desig_tenure: init.teacherInfo?.desig_tenure ?? undefined,
      faculty: init.facultyId ?? undefined,
      deptid: init.teacherInfo?.deptid ?? undefined,
      NET: init.teacherInfo?.NET || false,
      NET_year: init.teacherInfo?.NET_year || '',
      GATE: init.teacherInfo?.GATE || false,
      GATE_year: init.teacherInfo?.GATE_year || '',
      PHDGuide: init.teacherInfo?.PHDGuide || false,
      Guide_year: init.teacherInfo?.Guide_year || '',
      H_INDEX: init.teacherInfo?.H_INDEX || '',
      i10_INDEX: init.teacherInfo?.i10_INDEX || '',
      CITIATIONS: init.teacherInfo?.CITIATIONS || '',
      ORCHID_ID: init.teacherInfo?.ORCHID_ID || '',
      RESEARCHER_ID: init.teacherInfo?.RESEARCHER_ID || '',
    })

    // Reset faculty/department selections and data snapshots
    setSelectedFacultyId(init.facultyId)
    setFacultyData(init.facultyData)
    setDepartmentData(init.departmentData)

    // Reset arrays and editing markers
    experienceForm.reset({ experiences: init.experiences || [] })
    postDocForm.reset({ researches: init.researches || [] })
    educationForm.reset({ educations: init.educations || [] })
    setExperienceEditingIds(new Set())
    setPostDocEditingIds(new Set())
    setEducationEditingIds(new Set())

    // Reset ICT editing data from ictDetails
    const details = (init.ictDetails || '').split(',').map(s => s.trim()).filter(Boolean)
    const othersEntry = details.find(d => d.toLowerCase().startsWith('others'))
    setEditingData(prev => ({
      ...prev,
      ictSmartBoard: details.includes(ICT_LABELS.smartBoard),
      ictPowerPoint: details.includes(ICT_LABELS.powerPoint),
      ictTools: details.includes(ICT_LABELS.ictTools),
      ictELearningTools: details.includes(ICT_LABELS.eLearningTools),
      ictOnlineCourse: details.includes(ICT_LABELS.onlineCourse),
      ictOthers: Boolean(othersEntry),
      ictOthersSpecify: othersEntry?.split(':')?.[1]?.trim() || '',
    }))

    // Reset image and pending file
    setPendingProfileImageFile(null)
    if (init.profileImagePath) {
      fetchProfileImageUrl(init.profileImagePath)
    } else {
      setProfileImage(null)
    }
  }

  // Cancel experience row edit
  const handleCancelExperienceRow = async (index: number, id: number) => {
    toggleExperienceRowEdit(id)
    // Reset form to original values on cancel
    const teacherId = user?.role_id || teacherInfo?.Tid
    if (teacherId) {
      try {
        const res = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (res.ok) {
          const data: TeacherData = await res.json()
          experienceForm.reset({ experiences: data.teacherExperience || [] })
        }
      } catch (e) {
        console.error('Error resetting experience form:', e)
      }
    }
  }

  // Save single experience row
  const handleSaveExperienceRow = async (index: number, id: number) => {
    setSavingExperience(prev => ({ ...prev, [id]: true }))
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ title: "Error", description: "Teacher ID not found.", variant: "destructive" })
        return
      }

      // Validate all fields in this row individually to get specific error messages
      const fieldsToValidate = [
        `experiences.${index}.Employeer`,
        `experiences.${index}.desig`,
        `experiences.${index}.Start_Date`,
        `experiences.${index}.End_Date`,
        `experiences.${index}.Nature`,
        `experiences.${index}.UG_PG`,
      ]

      const validationResults = await Promise.all(
        fieldsToValidate.map(field => experienceForm.trigger(field as any))
      )

      // Check if all validations passed
      const allValid = validationResults.every(result => result === true)

      if (!allValid) {
        // Get specific field errors
        const errors = experienceForm.formState.errors
        const fieldErrors: string[] = []

        const employerError = errors.experiences?.[index]?.Employeer?.message
        if (employerError) fieldErrors.push(`Employer: ${employerError}`)

        const designationError = errors.experiences?.[index]?.desig?.message
        if (designationError) fieldErrors.push(`Designation: ${designationError}`)

        const startDateError = errors.experiences?.[index]?.Start_Date?.message
        if (startDateError) fieldErrors.push(`Start Date: ${startDateError}`)

        const endDateError = errors.experiences?.[index]?.End_Date?.message
        if (endDateError) fieldErrors.push(`End Date: ${endDateError}`)

        const natureError = errors.experiences?.[index]?.Nature?.message
        if (natureError) fieldErrors.push(`Nature of Job: ${natureError}`)

        const teachingTypeError = errors.experiences?.[index]?.UG_PG?.message
        if (teachingTypeError) fieldErrors.push(`Type of Teaching: ${teachingTypeError}`)

        // Show specific validation errors
        if (fieldErrors.length > 0) {
          toast({ 
            title: "Validation Failed", 
            description: fieldErrors.join('. '), 
            variant: "destructive" 
          })
        } else {
          toast({ 
            title: "Validation Failed", 
            description: "Please fill all required fields correctly.", 
            variant: "destructive" 
          })
        }
        return
      }

      // Additional manual validation for date logic
      const entry = experienceForm.getValues(`experiences.${index}`)
      const currenteValue = entry.currente === true || (typeof entry.currente === 'number' && entry.currente === 1)
      
      // Validate dates
      if (!entry.Start_Date || entry.Start_Date.trim() === '') {
        toast({ 
          title: "Validation Failed", 
          description: "Start Date is required.", 
          variant: "destructive" 
        })
        return
      }

      const startDate = new Date(entry.Start_Date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      if (isNaN(startDate.getTime())) {
        toast({ 
          title: "Validation Failed", 
          description: "Please enter a valid start date.", 
          variant: "destructive" 
        })
        return
      }

      if (startDate > today) {
        toast({ 
          title: "Validation Failed", 
          description: "Start date cannot be in the future.", 
          variant: "destructive" 
        })
        return
      }

      // Validate end date if not currently employed
      if (!currenteValue) {
        if (!entry.End_Date || entry.End_Date.trim() === '') {
          toast({ 
            title: "Validation Failed", 
            description: "End Date is required if not currently employed.", 
            variant: "destructive" 
          })
          return
        }

        const endDate = new Date(entry.End_Date)
        if (isNaN(endDate.getTime())) {
          toast({ 
            title: "Validation Failed", 
            description: "Please enter a valid end date.", 
            variant: "destructive" 
          })
          return
        }

        if (endDate > today) {
          toast({ 
            title: "Validation Failed", 
            description: "End date cannot be in the future if not currently employed.", 
            variant: "destructive" 
          })
          return
        }

        if (endDate < startDate) {
          toast({ 
            title: "Validation Failed", 
            description: "End date must be after start date.", 
            variant: "destructive" 
          })
          return
        }
      }

      const isNewEntry = !entry.Id || entry.Id > 2147483647

      // Convert boolean currente to 0/1 for database
      const experienceData = {
        ...entry,
        currente: (entry.currente === true || (typeof entry.currente === 'number' && entry.currente === 1)) ? 1 : 0
      }

      const res = await fetch('/api/teacher/profile/experience', {
        method: isNewEntry ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, experience: experienceData }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || 'Failed to save')
      }

      const result = await res.json();
      if (result.success) {
        // Exit edit mode
        setExperienceEditingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        
        // Invalidate and refresh data after successful save
        await invalidateProfile()
        
        // Wait a bit for the data to refresh, then update the form
        setTimeout(async () => {
          const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
          if (refreshRes.ok) {
            const refreshData: TeacherData = await refreshRes.json()
            experienceForm.reset({ experiences: refreshData.teacherExperience || [] })
          }
        }, 100)
        
        toast({ 
          title: "Experience Saved", 
          description: result.message || "Experience details saved successfully." 
        })
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (e: any) {
      console.error('Save experience error:', e)
      toast({ title: "Save Failed", description: e.message || "Could not save experience.", variant: "destructive" })
    } finally {
      setSavingExperience(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  // Save single post-doc row
  const handleSavePostDocRow = async (index: number, id: number) => {
    setSavingPostDoc(prev => ({ ...prev, [id]: true }))
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ title: "Error", description: "Teacher ID not found.", variant: "destructive" })
        return
      }

      // Validate all fields in this row individually to get specific error messages
      const fieldsToValidate = [
        `researches.${index}.Institute`,
        `researches.${index}.Start_Date`,
        `researches.${index}.End_Date`,
      ]

      const validationResults = await Promise.all(
        fieldsToValidate.map(field => postDocForm.trigger(field as any))
      )

      // Check if all validations passed
      const allValid = validationResults.every(result => result === true)

      if (!allValid) {
        // Get specific field errors
        const errors = postDocForm.formState.errors
        const fieldErrors: string[] = []

        const instituteError = errors.researches?.[index]?.Institute?.message
        if (instituteError) fieldErrors.push(`Institute: ${instituteError}`)

        const startDateError = errors.researches?.[index]?.Start_Date?.message
        if (startDateError) fieldErrors.push(`Start Date: ${startDateError}`)

        const endDateError = errors.researches?.[index]?.End_Date?.message
        if (endDateError) fieldErrors.push(`End Date: ${endDateError}`)

        // Show specific validation errors
        if (fieldErrors.length > 0) {
          toast({ 
            title: "Validation Failed", 
            description: fieldErrors.join('. '), 
            variant: "destructive" 
          })
        } else {
          toast({ 
            title: "Validation Failed", 
            description: "Please fill all required fields correctly.", 
            variant: "destructive" 
          })
        }
        return
      }

      // Additional manual validation for date logic
      const entry = postDocForm.getValues(`researches.${index}`)
      
      // Validate dates are not empty
      if (!entry.Start_Date || entry.Start_Date.trim() === '') {
        toast({ 
          title: "Validation Failed", 
          description: "Start Date is required.", 
          variant: "destructive" 
        })
        return
      }

      if (!entry.End_Date || entry.End_Date.trim() === '') {
        toast({ 
          title: "Validation Failed", 
          description: "End Date is required.", 
          variant: "destructive" 
        })
        return
      }

      // Validate date ranges
      const startDate = new Date(entry.Start_Date)
      const endDate = new Date(entry.End_Date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      if (isNaN(startDate.getTime())) {
        toast({ 
          title: "Validation Failed", 
          description: "Please enter a valid start date.", 
          variant: "destructive" 
        })
        return
      }

      if (isNaN(endDate.getTime())) {
        toast({ 
          title: "Validation Failed", 
          description: "Please enter a valid end date.", 
          variant: "destructive" 
        })
        return
      }

      if (startDate > today) {
        toast({ 
          title: "Validation Failed", 
          description: "Start date cannot be in the future.", 
          variant: "destructive" 
        })
        return
      }

      if (endDate > today) {
        toast({ 
          title: "Validation Failed", 
          description: "End date cannot be in the future.", 
          variant: "destructive" 
        })
        return
      }

      if (endDate < startDate) {
        toast({ 
          title: "Validation Failed", 
          description: "End date must be after start date.", 
          variant: "destructive" 
        })
        return
      }

      const isNewEntry = !entry.Id || entry.Id > 2147483647

      const res = await fetch('/api/teacher/profile/phd-research', {
        method: isNewEntry ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, research: entry }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || 'Failed to save')
      }

      const result = await res.json();
      if (result.success) {
        // Exit edit mode
        setPostDocEditingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        
        // Invalidate and refresh data after successful save
        await invalidateProfile()
        
        // Wait a bit for the data to refresh, then update the form
        setTimeout(async () => {
          const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
          if (refreshRes.ok) {
            const refreshData: TeacherData = await refreshRes.json()
            postDocForm.reset({ researches: refreshData.postDoctoralExp || [] })
          }
        }, 100)
        
        toast({ 
          title: "Post-Doc Saved", 
          description: result.message || "Post-doctoral details saved successfully." 
        })
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (e: any) {
      console.error('Save post-doc error:', e)
      toast({ title: "Save Failed", description: e.message || "Could not save post-doc details.", variant: "destructive" })
    } finally {
      setSavingPostDoc(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  // Save single education row
  const handleSaveEducationRow = async (index: number, id: number) => {
    setSavingEducation(prev => ({ ...prev, [id]: true }))
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (!teacherId) {
        toast({ title: "Error", description: "Teacher ID not found.", variant: "destructive" })
        return
      }

      // Validate all fields in this row individually to get specific error messages
      const fieldsToValidate = [
        `educations.${index}.degree_type`,
        `educations.${index}.university_name`,
        `educations.${index}.year_of_passing`,
      ]

      const validationResults = await Promise.all(
        fieldsToValidate.map(field => educationForm.trigger(field as any))
      )

      // Check if all validations passed
      const allValid = validationResults.every(result => result === true)

      if (!allValid) {
        // Get specific field errors
        const errors = educationForm.formState.errors
        const fieldErrors: string[] = []

        const degreeTypeError = errors.educations?.[index]?.degree_type?.message
        if (degreeTypeError) fieldErrors.push(`Degree Type: ${degreeTypeError}`)

        const universityError = errors.educations?.[index]?.university_name?.message
        if (universityError) fieldErrors.push(`University: ${universityError}`)

        const stateError = errors.educations?.[index]?.state?.message
        if (stateError) fieldErrors.push(`State: ${stateError}`)

        const yearError = errors.educations?.[index]?.year_of_passing?.message
        if (yearError) fieldErrors.push(`Year of Passing: ${yearError}`)

        const specializationError = errors.educations?.[index]?.subject?.message
        if (specializationError) fieldErrors.push(`Specialization: ${specializationError}`)

        const qsRankingError = errors.educations?.[index]?.QS_Ranking?.message
        if (qsRankingError) fieldErrors.push(`QS Ranking: ${qsRankingError}`)

        // Show specific validation errors
        if (fieldErrors.length > 0) {
          toast({ 
            title: "Validation Failed", 
            description: fieldErrors.join('. '), 
            variant: "destructive" 
          })
        } else {
          toast({ 
            title: "Validation Failed", 
            description: "Please fill all required fields correctly.", 
            variant: "destructive" 
          })
        }
        return
      }

      // Additional manual validation for year
      const entry = educationForm.getValues(`educations.${index}`)
      
      if (!entry.degree_type || entry.degree_type === 0) {
        toast({ 
          title: "Validation Failed", 
          description: "Degree Type is required.", 
          variant: "destructive" 
        })
        return
      }

      if (!entry.university_name || entry.university_name.trim() === '') {
        toast({ 
          title: "Validation Failed", 
          description: "University name is required.", 
          variant: "destructive" 
        })
        return
      }

      if (!entry.year_of_passing || entry.year_of_passing.toString().trim() === '') {
        toast({ 
          title: "Validation Failed", 
          description: "Year of passing is required.", 
          variant: "destructive" 
        })
        return
      }

      // Validate year format and range
      let yearStr = '';
      if (typeof entry.year_of_passing === 'string' && entry.year_of_passing.includes('-')) {
        const date = new Date(entry.year_of_passing);
        if (!isNaN(date.getTime())) {
          yearStr = date.getFullYear().toString();
        }
      } else {
        yearStr = String(entry.year_of_passing).trim().replace(/\D/g, '').slice(0, 4);
      }

      if (yearStr.length !== 4) {
        toast({ 
          title: "Validation Failed", 
          description: "Year must be 4 digits.", 
          variant: "destructive" 
        })
        return
      }

      const year = parseInt(yearStr);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1950 || year > currentYear) {
        toast({ 
          title: "Validation Failed", 
          description: `Year must be between 1950 and ${currentYear}.`, 
          variant: "destructive" 
        })
        return
      }

      const isNewEntry = !entry.gid || entry.gid > 2147483647

      const res = await fetch('/api/teacher/profile/graduation', {
        method: isNewEntry ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, education: entry }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || 'Failed to save')
      }

      const result = await res.json();
      if (result.success) {
        // Exit edit mode
        setEducationEditingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        
        // Invalidate and refresh data after successful save
        await invalidateProfile()
        
        // Wait a bit for the data to refresh, then update the form
        setTimeout(async () => {
          const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
          if (refreshRes.ok) {
            const refreshData: TeacherData = await refreshRes.json()
            educationForm.reset({ educations: refreshData.graduationDetails || [] })
          }
        }, 100)
        
        toast({ 
          title: "Education Saved", 
          description: result.message || "Education details saved successfully." 
        })
      } else {
        throw new Error(result.error || 'Failed');
      }
    } catch (e: any) {
      console.error('Save education error:', e)
      toast({ title: "Save Failed", description: e.message || "Could not save education details.", variant: "destructive" })
    } finally {
      setSavingEducation(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }


  const handleSaveAcademicYears = async () => {
    setIsSavingAcademicYears(true)
    try {
      if (!teacherInfo) {
        toast({ title: "Error", description: "Teacher information not loaded.", variant: "destructive" });
        return;
      }

      const payload = {
        ...teacherInfo,
        NILL2016_17: teacherInfo.NILL2016_17 ?? false,
        NILL2017_18: teacherInfo.NILL2017_18 ?? false,
        NILL2018_19: teacherInfo.NILL2018_19 ?? false,
        NILL2019_20: teacherInfo.NILL2019_20 ?? false,
        NILL2020_21: teacherInfo.NILL2020_21 ?? false,
        NILL2021_22: teacherInfo.NILL2021_22 ?? false,
        NILL2022_23: teacherInfo.NILL2022_23 ?? false,
        NILL2023_24: teacherInfo.NILL2023_24 ?? false,
        NILL2024_25: teacherInfo.NILL2024_25 ?? false,
        NILL2025_26: teacherInfo.NILL2025_26 ?? false,
      };

      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "Success", description: "Academic years information saved successfully." });
      } else {
        toast({ title: "Update Failed", description: result.error || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Update Failed", description: "Network or server error while saving academic years.", variant: "destructive" });
    } finally {
      setIsSavingAcademicYears(false)
    }
  }

  // Loading state is already handled above (line 322) - removed duplicate check to follow Rules of Hooks

  return (
    <div className="w-full max-w-full overflow-x-hidden text-xs sm:text-sm">
      <div className="space-y-3 sm:space-y-4 w-full max-w-full">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">View and manage your personal information</p>
        </div>

        {/* Generate CV Button */}
        <div className="flex justify-start sm:justify-end w-full sm:w-auto">
          <Button
            onClick={() => router.push("/teacher/generate-cv")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Generate CV</span>
            <span className="sm:hidden">CV</span>
          </Button>
        </div>
      </div>


      {/* Personal Information - Using Component */}
      <PersonalInfoSection
        teacherInfo={teacherInfo}
        facultyData={facultyData}
        departmentData={departmentData}
        designationData={designationData}
        profileImage={profileImage}
        isEditingPersonal={isEditingPersonal}
        isSavingPersonal={isSavingPersonal}
        isUploadingImage={isUploadingImage}
        pendingProfileImageFile={pendingProfileImageFile}
        editingData={editingData}
        facultyOptions={facultyOptions}
        departmentOptions={departmentOptions}
        permanentDesignationOptions={permanentDesignationOptions}
        temporaryDesignationOptions={temporaryDesignationOptions}
        selectedFacultyId={selectedFacultyId}
        hasAnyEditMode={isExperienceDirty || isPostDocDirty || isEducationDirty}
        isPersonalDirty={isPersonalDirty}
        hasAnyRecordEditing={hasAnyRecordEditing && !isEditingPersonal}
        onEditClick={() => {
          if (hasAnyRecordEditing && !isEditingPersonal) {
            toast({
              title: "Cannot Edit",
              description: "Please save or cancel the currently editing record before editing personal information.",
              variant: "default",
            })
            return
          }
          setIsEditingPersonal(true)
        }}
        onSave={onSubmitPersonal}
        onCancel={handleCancelPersonal}
        onImageUpload={handleImageUpload}
        onDownloadImage={handleDownloadProfileImage}
        onRemoveImage={handleRemoveProfileImage}
        onCheckboxChange={handleCheckboxChange}
        onEditingDataChange={(field, value) => {
          setEditingData((prev: any) => ({ ...prev, [field]: value }))
        }}
        onSaveAcademicYears={handleSaveAcademicYears}
        isSavingAcademicYears={isSavingAcademicYears}
        onAcademicYearChange={(field, checked) => {
          if (teacherInfo) {
            setTeacherInfo({ ...teacherInfo, [field]: checked } as TeacherInfo)
          }
        }}
        control={control}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        touchedFields={touchedFields}
        handlePersonalSubmit={handlePersonalSubmit}
        handleCancelPersonal={handleCancelPersonal}
        triggerImageUpload={triggerImageUpload}
        setEditingData={(updater) => setEditingData(updater)}
        setTeacherInfo={(updater) => setTeacherInfo(updater)}
      />

      {/* Experience Details - Always Editable */}
      <ExperienceDetailsSection
        teacherId={user?.role_id || teacherInfo?.Tid || 0}
        experienceForm={experienceForm}
        experienceFields={experienceFields}
        experienceEditingIds={experienceEditingIds}
        isSavingExperience={isSavingExperience}
        hasAnyEditMode={isExperienceDirty || isPostDocDirty || isEducationDirty}
        hasAnyRecordEditing={hasAnyRecordEditing && experienceEditingIds.size === 0}
        onAddEntry={addExperienceEntry}
        onSaveRow={handleSaveExperienceRow}
        onCancelRow={handleCancelExperienceRow}
        onDeleteRow={removeExperienceEntry}
        onToggleEdit={toggleExperienceRowEdit}
        onRefresh={invalidateProfile}
      />


      {/* Post Doctoral Research Experience - Always Editable */}
      <PhdResearchSection
        teacherId={user?.role_id || teacherInfo?.Tid || 0}
        postDocForm={postDocForm}
        postDocFields={postDocFields}
        postDocEditingIds={postDocEditingIds}
        isSavingPostDoc={isSavingPostDoc}
        phdDocumentUrls={phdDocumentUrls}
        phdDialogOpen={phdDialogOpen}
        phdViewDialogOpen={phdViewDialogOpen}
        hasAnyEditMode={isExperienceDirty || isPostDocDirty || isEducationDirty}
        hasAnyRecordEditing={hasAnyRecordEditing && postDocEditingIds.size === 0}
        onAddEntry={addPostDocEntry}
        onSaveRow={handleSavePostDocRow}
        onCancelRow={handleCancelPostDocRow}
        onDeleteRow={removePostDocEntry}
        onToggleEdit={togglePostDocRowEdit}
        onDocumentUrlChange={(id, url) => {
          if (url) {
            setPhdDocumentUrls(prev => ({ ...prev, [id]: url }))
          } else {
            setPhdDocumentUrls(prev => {
              const newUrls = { ...prev }
              delete newUrls[id]
              return newUrls
            })
          }
        }}
        onDialogOpenChange={(id, open) => {
          setPhdDialogOpen(prev => ({ ...prev, [id]: open }))
        }}
        onViewDialogOpenChange={(id, open) => {
          setPhdViewDialogOpen(prev => ({ ...prev, [id]: open }))
        }}
        onRefresh={invalidateProfile}
      />



      {/* Education Details - Always Editable */}
      <EducationDetailsSection
        teacherId={user?.role_id || teacherInfo?.Tid || 0}
        educationForm={educationForm}
        educationFields={educationFields}
        educationEditingIds={educationEditingIds}
        isSavingEducation={isSavingEducation}
        educationDocumentUrls={educationDocumentUrls}
        educationDialogOpen={educationDialogOpen}
        educationViewDialogOpen={educationViewDialogOpen}
        hasAnyEditMode={isExperienceDirty || isPostDocDirty || isEducationDirty}
        hasAnyRecordEditing={hasAnyRecordEditing && educationEditingIds.size === 0}
        onAddEntry={addEducationEntry}
        onSaveRow={handleSaveEducationRow}
        onCancelRow={async (index: number, id: number) => {
          toggleEducationRowEdit(id)
          // Reset form to original values on cancel
          const teacherId = user?.role_id || teacherInfo?.Tid
          if (teacherId) {
            try {
              const res = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
              if (res.ok) {
                const data: TeacherData = await res.json()
                educationForm.reset({ educations: data.graduationDetails || [] })
              }
            } catch (e) {
              console.error('Error resetting education form:', e)
            }
          }
        }}
        onDeleteRow={removeEducationEntry}
        onToggleEdit={toggleEducationRowEdit}
        onDocumentUrlChange={(id, url) => {
          if (url) {
            setEducationDocumentUrls(prev => ({ ...prev, [id]: url }))
          } else {
            setEducationDocumentUrls(prev => {
              const newUrls = { ...prev }
              delete newUrls[id]
              return newUrls
            })
          }
        }}
        onDialogOpenChange={(id, open) => {
          setEducationDialogOpen(prev => ({ ...prev, [id]: open }))
        }}
        onViewDialogOpenChange={(id, open) => {
          setEducationViewDialogOpen(prev => ({ ...prev, [id]: open }))
        }}
        degreeTypeOptions={degreeTypeOptions}
      />

      
    
      </div>
    </div>
  )
}
