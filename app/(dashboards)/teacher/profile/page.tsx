"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/app/api/auth/auth-provider"
import { User, Camera, Save, X, Edit, Plus, Trash2, Upload, FileText, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/shared/DocumentUpload"
import { DocumentViewer } from "@/components/document-viewer"
import { TeacherInfo, ExperienceEntry, PostDocEntry, EducationEntry, TeacherData, Faculty, Department, Designation, FacultyOption, DepartmentOption, DesignationOption, DegreeTypeOption } from "@/types/interfaces"
import { useDropDowns } from "@/hooks/use-dropdowns"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { useTeacherProfile, useInvalidateTeacherData } from "@/hooks/use-teacher-data"
import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton"



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
  const { user } = useAuth()
  const isAuthenticated = user !== null;
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false) // Only for personal details
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null) // Store file for S3 upload on save
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
  const { control, register, reset, handleSubmit, getValues, watch, setValue, trigger, formState: { errors, touchedFields } } = useForm<any>({
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
          setProfileImage(null)
        }
      } else {
        setProfileImage(null)
      }
    } catch (error) {
      console.error("Error fetching profile image URL:", error)
      setProfileImage(null)
    }
  }

  // Initialize forms when data is loaded
  useEffect(() => {
    if (profileData) {
      const data: TeacherData = profileData as any
      setTeacherInfo(data.teacherInfo)
      
      // Fetch profile image URL if ProfileImage exists
      if (data.teacherInfo?.ProfileImage) {
        fetchProfileImageUrl(data.teacherInfo.ProfileImage)
      } else {
        setProfileImage(null)
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


  const handleInputChange = <K extends keyof TeacherInfo>(field: K, value: TeacherInfo[K]) => {
    setTeacherInfo(prev => ({
      ...(prev || {}), // fallback if prev is null
      [field]: value,
    } as TeacherInfo));
  };


  const handleCheckboxChange = (field: string, checked: boolean) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const addExperienceEntry = () => {
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
          return
        }
      }
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete experience.", variant: "destructive" })
      return
    }
    removeExperience(index)
    setExperienceEditingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const addPostDocEntry = () => {
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
      if (id && id <= 2147483647) {
        const res = await fetch(`/api/teacher/profile/phd-research?teacherId=${teacherId}&id=${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Delete failed' }))
          toast({ title: "Delete Failed", description: errorData.error || "Could not delete post-doc entry.", variant: "destructive" })
          return
        }
      }
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete post-doc entry.", variant: "destructive" })
      return
    }
    removePostDoc(index)
    setPostDocEditingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const addEducationEntry = () => {
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

  // Row-level edit toggles
  const toggleExperienceRowEdit = (id: number) => {
    setExperienceEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const togglePostDocRowEdit = (id: number) => {
    setPostDocEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const toggleEducationRowEdit = (id: number) => {
    setEducationEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const removeEducationEntry = async (index: number, id: number) => {
    try {
      const teacherId = user?.role_id || teacherInfo?.Tid;
      if (id && id <= 2147483647) {
        const res = await fetch(`/api/teacher/profile/graduation?teacherId=${teacherId}&gid=${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Delete failed' }))
          toast({ title: "Delete Failed", description: errorData.error || "Could not delete education entry.", variant: "destructive" })
          return
        }
      }
    } catch (e: any) {
      toast({ title: "Delete Failed", description: e.message || "Could not delete education entry.", variant: "destructive" })
      return
    }
    removeEducation(index)
    setEducationEditingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
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

    setIsUploadingImage(true)

    try {
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)

      // Store file for S3 upload on save button click
      setPendingProfileImageFile(file)

      // Upload image to server temporarily (local storage, not S3 yet)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("email", user.email) // Use actual email from auth
      formData.append("uploadToS3", "false") // Don't upload to S3 yet

      const uploadResponse = await fetch("/api/teacher/profile/image", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed")
      }

      toast({
        title: "Image Selected",
        description: "Image ready. Click 'Save Changes' to upload to S3 and update profile.",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      })
      // Reset preview on error
      setProfileImage(null)
      setPendingProfileImageFile(null)
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  const triggerImageUpload = () => {
    const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
    fileInput?.click()
  }


  // const handleSavePersonal = () => {
  //   // Build ICT_Details string from selections
  //   const newIctDetails = buildIctDetails(editingData)
  //   console.log("Saving personal data:", { ...editingData, ICT_Details: newIctDetails })
  //   // Typically send to API here
  //   if (teacherInfo) {
  //     setTeacherInfo({ ...teacherInfo, ICT_Details: newIctDetails })
  //   }
  //   setIsEditingPersonal(false)
  // }

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
      if (pendingProfileImageFile && user?.email) {
        try {
          const formData = new FormData()
          formData.append("file", pendingProfileImageFile)
          formData.append("email", user.email)
          formData.append("uploadToS3", "true") // Upload to S3

          const uploadResponse = await fetch("/api/teacher/profile/image", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || "Failed to upload image to S3")
          }

          const uploadResult = await uploadResponse.json()

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || "S3 upload failed")
          }

          // Update payload with S3 path
          payload.ProfileImage = uploadResult.path

          // Clear pending file
          setPendingProfileImageFile(null)

          // Fetch the full URL for the image
          const urlResponse = await fetch("/api/teacher/profile/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: uploadResult.path }),
          })

          if (urlResponse.ok) {
            const urlData = await urlResponse.json()
            if (urlData.success && urlData.url) {
              setProfileImage(urlData.url)
            }
          }
        } catch (imageError: any) {
          console.error("Error uploading profile image to S3:", imageError)
          toast({
            title: "Image Upload Warning",
            description: imageError.message || "Failed to upload image to S3. Profile will be saved without image update.",
            variant: "destructive"
          })
          // Continue with profile save even if image upload fails
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
        // Invalidate cache and refetch data
        await invalidateProfile();
        
        // Update local state
        setTeacherInfo(payload);
        
        // Clear pending image file if save was successful
        if (pendingProfileImageFile) {
          setPendingProfileImageFile(null)
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
    }
  };


  const handleCancelPersonal = () => {
    setIsEditingPersonal(false)
  }

  // Save single experience row
  const handleSaveExperienceRow = async (index: number, id: number) => {
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
    }
  }

  // Save single post-doc row
  const handleSavePostDocRow = async (index: number, id: number) => {
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
    }
  }

  // Save single education row
  const handleSaveEducationRow = async (index: number, id: number) => {
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
    }
  }

  // Handle document update for PhD Research (document-only update)
  const handlePhdDocumentUpdate = async (index: number, id: number, documentUrl: string) => {
    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    try {
      const teacherId = user?.role_id || teacherInfo?.Tid
      if (!teacherId) {
        toast({ title: "Error", description: "Teacher ID not found.", variant: "destructive" })
        return
      }

      // Check if it's a local file that needs to be uploaded to S3
      const isLocalFile = documentUrl.startsWith('/uploaded-document/')
      let s3Url = documentUrl // Default to existing URL (might already be S3 URL)

      // Only upload to S3 if it's a local file
      if (isLocalFile) {
        // Extract filename from URL (e.g., /uploaded-document/file.pdf -> file.pdf)
        const fileName = documentUrl.split('/').pop() || 'document.pdf'
        
        // Upload to S3 and get the URL
        const uploadRes = await fetch('/api/shared/s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to upload document to S3')
        }

        const uploadData = await uploadRes.json()
        s3Url = uploadData.url

        // Delete local file after successful S3 upload
        try {
          await fetch('/api/shared/local-document-upload', {
            method: 'DELETE',
          })
        } catch (deleteError) {
          console.error('Error deleting local file:', deleteError)
          // Don't fail the upload if deletion fails
        }
      }

      // Call document-only update endpoint
      const res = await fetch(`/api/teacher/profile/phd-research/${id}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teacherId, 
          doc: s3Url 
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update document')
      }

      const result = await res.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update document')
      }

      await invalidateProfile()
      // Update state with S3 URL
      setPhdDocumentUrls(prev => {
        const newUrls = { ...prev, [id]: s3Url }
        return newUrls
      })
      // Close the dialog after successful save
      setPhdDialogOpen(prev => ({ ...prev, [id]: false }))
      
      // Refresh form data to reflect the updated document
      if (teacherId) {
        setTimeout(async () => {
          const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
          if (refreshRes.ok) {
            const refreshData: TeacherData = await refreshRes.json()
            postDocForm.reset({ researches: refreshData.postDoctoralExp || [] })
          }
        }, 100)
      }
      
      toast({ 
        title: "Success", 
        description: "Document updated successfully." 
      })
    } catch (e: any) {
      console.error('Document update error:', e)
      toast({ 
        title: "Update Failed", 
        description: e.message || "Could not update document.", 
        variant: "destructive" 
      })
    }
  }

  // Handle document update for Education (document-only update)
  const handleEducationDocumentUpdate = async (index: number, id: number, documentUrl: string) => {
    if (!documentUrl) {
      toast({
        title: "Error",
        description: "Please upload a document first.",
        variant: "destructive",
      })
      return
    }

    try {
      const teacherId = user?.role_id || teacherInfo?.Tid
      if (!teacherId) {
        toast({ title: "Error", description: "Teacher ID not found.", variant: "destructive" })
        return
      }

      // Check if it's a local file that needs to be uploaded to S3
      const isLocalFile = documentUrl.startsWith('/uploaded-document/')
      let s3Url = documentUrl // Default to existing URL (might already be S3 URL)

      // Only upload to S3 if it's a local file
      if (isLocalFile) {
        // Extract filename from URL (e.g., /uploaded-document/file.pdf -> file.pdf)
        const fileName = documentUrl.split('/').pop() || 'document.pdf'
        
        // Upload to S3 and get the URL
        const uploadRes = await fetch('/api/shared/s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to upload document to S3')
        }

        const uploadData = await uploadRes.json()
        s3Url = uploadData.url

        // Delete local file after successful S3 upload
        try {
          await fetch('/api/shared/local-document-upload', {
            method: 'DELETE',
          })
        } catch (deleteError) {
          console.error('Error deleting local file:', deleteError)
          // Don't fail the upload if deletion fails
        }
      }

      // Call document-only update endpoint
      const res = await fetch(`/api/teacher/profile/graduation/${id}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teacherId, 
          Image: s3Url 
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update document')
      }

      const result = await res.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update document')
      }

      await invalidateProfile()
      // Update state with S3 URL
      setEducationDocumentUrls(prev => {
        const newUrls = { ...prev, [id]: s3Url }
        return newUrls
      })
      // Close the dialog after successful save
      setEducationDialogOpen(prev => ({ ...prev, [id]: false }))
      
      // Refresh form data to reflect the updated document
      if (teacherId) {
        setTimeout(async () => {
          const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
          if (refreshRes.ok) {
            const refreshData: TeacherData = await refreshRes.json()
            educationForm.reset({ educations: refreshData.graduationDetails || [] })
          }
        }, 100)
      }
      
      toast({ 
        title: "Success", 
        description: "Document updated successfully." 
      })
    } catch (e: any) {
      console.error('Document update error:', e)
      toast({ 
        title: "Update Failed", 
        description: e.message || "Could not update document.", 
        variant: "destructive" 
      })
    }
  }

  const handleSaveAcademicYears = async () => {
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

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your personal and academic details</CardDescription>
            </div>
            {!isEditingPersonal ? (
              <Button onClick={() => setIsEditingPersonal(true)} className="flex items-center gap-2 w-full sm:w-auto" size="sm">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Personal Info</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handlePersonalSubmit} className="flex items-center gap-2 w-full sm:w-auto" size="sm">
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelPersonal}
                  className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
            <div className="space-y-3 sm:space-y-4 w-full">

              {/* Profile Photo Section */}
              <div className="col-span-full flex flex-col items-center space-y-2 sm:space-y-3 w-full">

                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => {
                          // Fallback to placeholder if image fails to load
                          setProfileImage(null)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
                      </div>
                    )}
                  </div>
                  {isEditingPersonal && (
                    <>
                      <button
                        onClick={triggerImageUpload}
                        disabled={isUploadingImage}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload profile picture"
                      >
                        {isUploadingImage ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        id="profile-image-input"
                        type="file"
                        accept="image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-xs sm:text-sm">{`${teacherInfo?.Abbri} ${teacherInfo?.fname} ${teacherInfo?.lname}`}</p>
                  <p className="text-xs text-muted-foreground">{designationData?.name}</p>
                  <p className="text-xs text-muted-foreground">{departmentData?.name}</p>
                </div>
                {isEditingPersonal && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Click the camera icon to upload a profile picture</p>
                    <p className="text-xs text-gray-400">Supported: JPG, JPEG (Max 1MB)</p>
                  </div>
                )}
              </div>
              {/* Basic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="salutation" className="text-[11px] sm:text-xs font-medium">
                      Salutation <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="Abbri"
                      rules={{
                        required: isEditingPersonal ? "Salutation is required" : false
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Select
                            value={field.value}
                            onValueChange={(v: any) => field.onChange(v)}
                          >
                            <SelectTrigger className={`h-9 text-xs ${!isEditingPersonal ? "pointer-events-none" : ""} ${error ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select salutation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dr.">Dr.</SelectItem>
                              <SelectItem value="Prof.">Prof.</SelectItem>
                              <SelectItem value="Mr.">Mr.</SelectItem>
                              <SelectItem value="Ms.">Ms.</SelectItem>
                              <SelectItem value="Mrs.">Mrs.</SelectItem>
                              <SelectItem value="Shri.">Shri.</SelectItem>
                              <SelectItem value="Er.">Er.</SelectItem>
                            </SelectContent>
                          </Select>
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[11px] sm:text-xs font-medium">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="firstName" 
                      className={`h-9 text-xs ${errors.fname ? 'border-red-500' : ''}`}
                      {...register('fname', {
                        required: isEditingPersonal ? "First name is required" : false,
                        minLength: {
                          value: 3,
                          message: "First name must be at least 3 characters"
                        },
                        pattern: {
                          value: /^[A-Za-z\s'-]+$/,
                          message: "First name should only contain letters, spaces, hyphens, or apostrophes"
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                    />
                    {errors.fname && isEditingPersonal && touchedFields.fname && (
                      <p className="text-xs text-red-500 mt-1">{errors.fname.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-[11px] sm:text-xs font-medium">Middle Name</Label>
                    <Input 
                      id="middleName" 
                      className={`h-9 text-xs ${errors.mname ? 'border-red-500' : ''}`}
                      {...register('mname', {
                        validate: (value) => {
                          if (!value || value.trim() === '') return true; // Optional field
                          if (value.length < 3) {
                            return "Middle name must be at least 3 characters if provided";
                          }
                          if (!/^[A-Za-z\s'-]+$/.test(value)) {
                            return "Middle name should only contain letters, spaces, hyphens, or apostrophes";
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                    />
                    {errors.mname && isEditingPersonal && touchedFields.mname && (
                      <p className="text-xs text-red-500 mt-1">{errors.mname.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[11px] sm:text-xs font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="lastName" 
                      className={`h-9 text-xs ${errors.lname ? 'border-red-500' : ''}`}
                      {...register('lname', {
                        required: isEditingPersonal ? "Last name is required" : false,
                        minLength: {
                          value: 3,
                          message: "Last name must be at least 3 characters"
                        },
                        pattern: {
                          value: /^[A-Za-z\s'-]+$/,
                          message: "Last name should only contain letters, spaces, hyphens, or apostrophes"
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                    />
                    {errors.lname && isEditingPersonal && touchedFields.lname && (
                      <p className="text-xs text-red-500 mt-1">{errors.lname.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] sm:text-xs font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register('email_id')} 
                      readOnly 
                      className="h-9 text-xs bg-gray-50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[11px] sm:text-xs font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="phone_no"
                      rules={{
                        required: isEditingPersonal ? "Phone number is required" : false,
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Phone number must contain exactly 10 digits"
                        },
                        minLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits"
                        },
                        maxLength: {
                          value: 10,
                          message: "Phone number must be exactly 10 digits"
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="phone"
                            type="tel"
                            {...field}
                            className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                            onChange={(e) => {
                              // Only allow digits and limit to 10
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              field.onChange(value);
                            }}
                            readOnly={!isEditingPersonal}
                            placeholder="Enter 10 digit phone number"
                            maxLength={10}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-[11px] sm:text-xs font-medium">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="DOB"
                      rules={{
                        required: isEditingPersonal ? "Date of birth is required" : false,
                        validate: (value) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "Date of birth is required";
                            return true;
                          }
                          const dob = new Date(value);
                          if (isNaN(dob.getTime())) {
                            if (isEditingPersonal) return "Please enter a valid date";
                            return true;
                          }
                          const today = new Date();
                          const age = today.getFullYear() - dob.getFullYear();
                          const monthDiff = today.getMonth() - dob.getMonth();
                          
                          if (dob > today) {
                            return "Date of birth cannot be in the future";
                          }
                          if (age < 18 || (age === 18 && monthDiff < 0)) {
                            return "Age must be at least 18 years";
                          }
                          if (age > 100) {
                            return "Please enter a valid date of birth";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            {...field}
                            max={new Date().toISOString().split('T')[0]}
                            readOnly={!isEditingPersonal}
                            className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining" className="text-[11px] sm:text-xs font-medium">
                      Date of Joining <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="recruit_date"
                      rules={{
                        required: isEditingPersonal ? "Date of joining is required" : false,
                        validate: (value) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "Date of joining is required";
                            return true;
                          }
                          const joinDate = new Date(value);
                          if (isNaN(joinDate.getTime())) {
                            if (isEditingPersonal) return "Please enter a valid date";
                            return true;
                          }
                          const today = new Date();
                          const dob = watch('DOB') ? new Date(watch('DOB')) : null;
                          
                          if (joinDate > today) {
                            return "Date of joining cannot be in the future";
                          }
                          if (dob && !isNaN(dob.getTime()) && joinDate < dob) {
                            return "Date of joining must be after date of birth";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="dateOfJoining"
                            type="date"
                            {...field}
                            max={new Date().toISOString().split('T')[0]}
                            readOnly={!isEditingPersonal}
                            className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNo" className="text-[11px] sm:text-xs font-medium">
                      PAN Number <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="PAN_No"
                      rules={{
                        required: isEditingPersonal ? "PAN number is required" : false,
                        validate: (value) => {
                          if (!value || (typeof value === 'string' && value.trim() === '')) {
                            if (isEditingPersonal) return "PAN number is required";
                            return true;
                          }
                          const panValue = String(value).trim().toUpperCase();
                          if (panValue.length !== 10) {
                            return "PAN number must be exactly 10 characters";
                          }
                          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panValue)) {
                            return "PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)";
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="panNo"
                            {...field}
                            onChange={(e) => {
                              const upperValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                              field.onChange(upperValue);
                            }}
                            readOnly={!isEditingPersonal}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Research Metrics - Add this new section */}
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Research Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="hIndex">H-Index</Label>
                      <Input 
                      id="hIndex" 
                      type="number" 
                      {...register('H_INDEX', {
                        min: { value: 0, message: "H-Index must be a positive number" },
                        max: { value: 200, message: "H-Index value seems too high" },
                        valueAsNumber: true,
                        validate: (value) => {
                          if (value !== undefined && value !== null && value !== '') {
                            if (!Number.isInteger(Number(value))) {
                              return "H-Index must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter H-Index"
                      className={`h-9 text-xs ${errors.H_INDEX ? 'border-red-500' : ''}`}
                    />
                    {errors.H_INDEX && isEditingPersonal && touchedFields.H_INDEX && (
                      <p className="text-xs text-red-500 mt-1">{errors.H_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="i10Index" className="text-[11px] sm:text-xs font-medium">i10-Index</Label>
                      <Input 
                      id="i10Index" 
                      type="number" 
                      {...register('i10_INDEX', {
                        min: { value: 0, message: "i10-Index must be a positive number" },
                        max: { value: 200, message: "i10-Index value seems too high" },
                        valueAsNumber: true,
                        validate: (value) => {
                          if (value !== undefined && value !== null && value !== '') {
                            if (!Number.isInteger(Number(value))) {
                              return "i10-Index must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter i10-Index"
                      className={`h-9 text-xs ${errors.i10_INDEX ? 'border-red-500' : ''}`}
                    />
                    {errors.i10_INDEX && isEditingPersonal && touchedFields.i10_INDEX && (
                      <p className="text-xs text-red-500 mt-1">{errors.i10_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citations" className="text-[11px] sm:text-xs font-medium">Citations</Label>
                      <Input 
                      id="citations" 
                      type="number" 
                      {...register('CITIATIONS', {
                        min: { value: 0, message: "Citations must be a positive number" },
                        max: { value: 1000000, message: "Citations value seems too high" },
                        valueAsNumber: true,
                        validate: (value) => {
                          if (value !== undefined && value !== null && value !== '') {
                            if (!Number.isInteger(Number(value))) {
                              return "Citations must be a whole number";
                            }
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter total citations"
                      className={`h-9 text-xs ${errors.CITIATIONS ? 'border-red-500' : ''}`}
                    />
                    {errors.CITIATIONS && isEditingPersonal && touchedFields.CITIATIONS && (
                      <p className="text-xs text-red-500 mt-1">{errors.CITIATIONS.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orcidId" className="text-[11px] sm:text-xs font-medium">ORCHID ID</Label>
                      <Input 
                      id="orcidId" 
                      {...register('ORCHID_ID', {
                        pattern: {
                          value: /^(\d{4}-){3}\d{3}[\dX]$/,
                          message: "Invalid ORCID ID format (e.g., 0000-0000-0000-0000)"
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="0000-0000-0000-0000"
                      maxLength={19}
                      className={`h-9 text-xs ${errors.ORCHID_ID ? 'border-red-500' : ''}`}
                    />
                    {errors.ORCHID_ID && isEditingPersonal && touchedFields.ORCHID_ID && (
                      <p className="text-xs text-red-500 mt-1">{errors.ORCHID_ID.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researcherId" className="text-[11px] sm:text-xs font-medium">Researcher ID</Label>
                      <Input 
                      id="researcherId" 
                      {...register('RESEARCHER_ID', {
                        maxLength: {
                          value: 100,
                          message: "Researcher ID must be less than 100 characters"
                        },
                        validate: (value) => {
                          if (!value || value.trim() === '') {
                            return true; // Optional field
                          }
                          if (value.length < 3) {
                            return "Researcher ID must be at least 3 characters";
                          }
                          if (!/^[A-Za-z0-9._-]+$/.test(value)) {
                            return "Researcher ID can only contain letters, numbers, dots, hyphens, and underscores";
                          }
                          return true;
                        }
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter Researcher ID"
                      maxLength={100}
                      className={`h-9 text-xs ${errors.RESEARCHER_ID ? 'border-red-500' : ''}`}
                    />
                    {errors.RESEARCHER_ID && isEditingPersonal && touchedFields.RESEARCHER_ID && (
                      <p className="text-xs text-red-500 mt-1">{errors.RESEARCHER_ID.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teaching Status */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Teaching Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="teachingStatus" className="text-[11px] sm:text-xs font-medium">
                      Teaching Status <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="perma_or_tenure"
                      render={({ field }) => (
                        <Select
                          value={field.value === false ? "Permanent" : "Tenured"}
                          onValueChange={(value: string) => {
                            const isPermanent = value === "Permanent";
                            field.onChange(isPermanent ? false : true);
                          }}
                        >
                          <SelectTrigger className={`h-8 text-xs ${!isEditingPersonal ? "pointer-events-none" : ""}`}>
                            <SelectValue placeholder="Select teaching status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tenured">Tenured</SelectItem>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-[11px] sm:text-xs font-medium">
                      Designation <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={watch('perma_or_tenure') === false ? 'desig_perma' : 'desig_tenure'}
                      rules={{
                        required: isEditingPersonal ? "Designation is required" : false
                      }}
                      render={({ field }) => {
                        const designationOptions = watch('perma_or_tenure') === false 
                          ? permanentDesignationOptions 
                          : temporaryDesignationOptions
                        return (
                          <SearchableSelect
                            options={designationOptions.map((desig) => ({
                              value: desig.id,
                              label: desig.name,
                            }))}
                            value={field.value}
                            onValueChange={(v: string | number) => field.onChange(Number(v))}
                            placeholder="Select designation"
                            disabled={!isEditingPersonal}
                            emptyMessage="No designation found."
                            className="w-full min-w-0 h-8 text-xs"
                          />
                        )
                      }}
                    />
                    {errors.desig_perma && isEditingPersonal && touchedFields.desig_perma && (
                      <p className="text-sm text-red-500">{errors.desig_perma.message as string}</p>
                    )}
                    {errors.desig_tenure && isEditingPersonal && touchedFields.desig_tenure && (
                      <p className="text-sm text-red-500">{errors.desig_tenure.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty" className="text-[11px] sm:text-xs font-medium">
                      Faculty <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="faculty"
                      rules={{
                        required: isEditingPersonal ? "Faculty is required" : false
                      }}
                      render={({ field }) => (
                        <SearchableSelect
                          options={facultyOptions.map((faculty) => ({
                            value: faculty.Fid,
                            label: faculty.Fname,
                          }))}
                          value={field.value ?? selectedFacultyId ?? facultyData?.Fid ?? undefined}
                          onValueChange={(value: string | number) => {
                            const fidNum = Number(value)
                            setSelectedFacultyId(Number.isNaN(fidNum) ? null : fidNum)
                            // Reset department when faculty changes
                            setValue('deptid', undefined)
                            setDepartmentData(null)
                            // Update form field
                            field.onChange(fidNum)
                          }}
                          placeholder="Select faculty"
                          disabled={!isEditingPersonal}
                          emptyMessage="No faculty found."
                          className="w-full min-w-0"
                        />
                      )}
                    />
                    {errors.faculty && isEditingPersonal && touchedFields.faculty && (
                      <p className="text-sm text-red-500">{errors.faculty.message as string}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-[11px] sm:text-xs font-medium">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="deptid"
                      rules={{
                        required: isEditingPersonal ? "Department is required" : false,
                        validate: (value) => {
                          const facultyValue = watch('faculty');
                          if (isEditingPersonal && !facultyValue) {
                            return "Please select a faculty first";
                          }
                          if (isEditingPersonal && !value) {
                            return "Department is required";
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => {
                        const facultyValue = watch('faculty');
                        return (
                          <SearchableSelect
                            options={departmentOptions.map((dept) => ({
                              value: dept.Deptid,
                              label: dept.name,
                            }))}
                            value={field.value}
                            onValueChange={(v: string | number) => field.onChange(Number(v))}
                            placeholder="Select department"
                            disabled={!isEditingPersonal || !facultyValue}
                            emptyMessage={!facultyValue ? "Please select a faculty first" : "No department found."}
                            className="w-full min-w-0"
                          />
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Qualification Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Qualification Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] sm:text-xs font-medium">
                        Qualified NET Exam <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={watch('NET') ? "yes" : "no"}
                        onValueChange={(value: any) => setValue('NET', value === 'yes')}
                        className={`flex gap-6 ${!isEditingPersonal ? "pointer-events-none" : ""}`}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="net-yes" />
                          <Label htmlFor="net-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="net-no" />
                          <Label htmlFor="net-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {watch('NET') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="netYear" className="text-[11px] sm:text-xs font-medium">
                            NET Qualified Year <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            control={control}
                            name="NET_year"
                            rules={{
                              required: watch('NET') && isEditingPersonal ? "NET qualified year is required" : false,
                              validate: (value) => {
                                if (watch('NET') && isEditingPersonal) {
                                  if (!value || value.toString().trim() === '') {
                                    return "NET qualified year is required";
                                  }
                                  const yearStr = value.toString().trim();
                                  if (yearStr.length !== 4) {
                                    return "Year must be 4 digits";
                                  }
                                  const year = parseInt(yearStr);
                                  const currentYear = new Date().getFullYear();
                                  if (isNaN(year) || year < 1950 || year > currentYear) {
                                    return `Year must be between 1950 and ${currentYear}`;
                                  }
                                }
                                return true;
                              }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <div>
                                <Input
                                  id="netYear"
                                  {...field}
                                  onChange={(e) => {
                                    const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(year);
                                  }}
                                  readOnly={!isEditingPersonal}
                                  placeholder="YYYY (e.g., 2018)"
                                  maxLength={4}
                                  className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                                />
                                {error && isEditingPersonal && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] sm:text-xs font-medium">
                        Qualified GATE Exam <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={watch('GATE') ? "yes" : "no"}
                        onValueChange={(value: any) => setValue('GATE', value === 'yes')}
                        className={`flex gap-6 ${!isEditingPersonal ? "pointer-events-none" : ""}`}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="gate-yes" />
                          <Label htmlFor="gate-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="gate-no" />
                          <Label htmlFor="gate-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {watch('GATE') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="gateYear">GATE Qualified Year</Label>
                          <Controller
                            control={control}
                            name="GATE_year"
                            rules={{
                              required: watch('GATE') && isEditingPersonal ? "GATE qualified year is required" : false,
                              validate: (value) => {
                                if (watch('GATE') && isEditingPersonal) {
                                  if (!value || value.toString().trim() === '') {
                                    return "GATE qualified year is required";
                                  }
                                  const yearStr = value.toString().trim();
                                  if (yearStr.length !== 4) {
                                    return "Year must be 4 digits";
                                  }
                                  const year = parseInt(yearStr);
                                  const currentYear = new Date().getFullYear();
                                  if (isNaN(year) || year < 1950 || year > currentYear) {
                                    return `Year must be between 1950 and ${currentYear}`;
                                  }
                                }
                                return true;
                              }
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <div>
                                <Input
                                  id="gateYear"
                                  {...field}
                                  onChange={(e) => {
                                    const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    field.onChange(year);
                                  }}
                                  readOnly={!isEditingPersonal}
                                  placeholder="YYYY (e.g., 2018)"
                                  maxLength={4}
                                  className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                                />
                                {error && isEditingPersonal && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Registration Information</h4>
                <div className="space-y-2">
                  <Label className="text-[11px] sm:text-xs font-medium">
                    Registered Phd Guide at MSU <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={watch('PHDGuide') ? "yes" : "no"}
                    onValueChange={(value: any) => setValue('PHDGuide', value === 'yes')}
                    className={`flex gap-6 ${!isEditingPersonal ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="guide-yes" />
                      <Label htmlFor="guide-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="guide-no" />
                      <Label htmlFor="guide-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {watch('PHDGuide') && (
                  <div className="space-y-2">
                    <Label htmlFor="registrationYear" className="text-[11px] sm:text-xs font-medium">
                      Year of Registration <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="Guide_year"
                      rules={{
                        required: watch('PHDGuide') && isEditingPersonal ? "Year of registration is required" : false,
                        validate: (value) => {
                          if (watch('PHDGuide') && isEditingPersonal) {
                            if (!value || value.toString().trim() === '') {
                              return "Year of registration is required";
                            }
                            const yearStr = value.toString().trim();
                            if (yearStr.length !== 4) {
                              return "Year must be 4 digits";
                            }
                            const year = parseInt(yearStr);
                            const currentYear = new Date().getFullYear();
                            if (isNaN(year) || year < 1950 || year > currentYear) {
                              return `Year must be between 1950 and ${currentYear}`;
                            }
                          }
                          return true;
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            id="registrationYear"
                            {...field}
                            onChange={(e) => {
                              const year = e.target.value.replace(/\D/g, '').slice(0, 4);
                              field.onChange(year);
                            }}
                            readOnly={!isEditingPersonal}
                            placeholder="YYYY (e.g., 2015)"
                            maxLength={4}
                            className={`h-9 text-xs ${error ? 'border-red-500' : ''}`}
                          />
                          {error && isEditingPersonal && (
                            <p className="text-xs text-red-500 mt-1">{error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* ICT in Teaching */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 border-b pb-2">Use of ICT in Teaching</h4>
                <div className="space-y-4">
                  <Label className="text-[11px] sm:text-xs font-medium">Technologies Used for Teaching (Select all that apply)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="smartBoard"
                        checked={editingData.ictSmartBoard}
                        onChange={(e: any) => handleCheckboxChange("ictSmartBoard", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="smartBoard" className="text-sm font-normal">
                        Smart Board
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="powerPoint"
                        checked={editingData.ictPowerPoint}
                        onChange={(e: any) => handleCheckboxChange("ictPowerPoint", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="powerPoint" className="text-sm font-normal">
                        PowerPoint Presentation
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ictTools"
                        checked={editingData.ictTools}
                        onChange={(e: any) => handleCheckboxChange("ictTools", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="ictTools" className="text-sm font-normal">
                        ICT Tools
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="eLearningTools"
                        checked={editingData.ictELearningTools}
                        onChange={(e: any) => handleCheckboxChange("ictELearningTools", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="eLearningTools" className="text-sm font-normal">
                        E-Learning Tools
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="onlineCourse"
                        checked={editingData.ictOnlineCourse}
                        onChange={(e: any) => handleCheckboxChange("ictOnlineCourse", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="onlineCourse" className="text-sm font-normal">
                        Online Course
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="others"
                        checked={editingData.ictOthers}
                        onChange={(e) => handleCheckboxChange("ictOthers", e.target.checked)}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${!isEditingPersonal ? 'pointer-events-none' : ''}`}
                      />
                      <Label htmlFor="others" className="text-sm font-normal">
                        Others
                      </Label>
                    </div>
                  </div>
                  {editingData.ictOthers && (
                    <div className="space-y-2">
                      <Label htmlFor="otherIctTools" className="text-[11px] sm:text-xs font-medium">
                        If Others, please specify: <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="ictOthersSpecify"
                        rules={{
                          required: editingData.ictOthers && isEditingPersonal ? "Please specify other ICT tools" : false,
                          minLength: editingData.ictOthers && isEditingPersonal ? {
                            value: 3,
                            message: "Please provide at least 3 characters"
                          } : undefined,
                          maxLength: {
                            value: 200,
                            message: "Specification must be less than 200 characters"
                          }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Input
                              id="otherIctTools"
                              value={editingData.ictOthersSpecify}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 200);
                                setEditingData(prev => ({ ...prev, ictOthersSpecify: value }));
                                field.onChange(value);
                              }}
                              placeholder="Please specify other ICT tools used..."
                              readOnly={!isEditingPersonal}
                              maxLength={200}
                              className={`max-w-md h-9 text-xs ${error ? 'border-red-500' : ''}`}
                            />
                            {error && isEditingPersonal && (
                              <p className="text-xs text-red-500 mt-1">{error.message}</p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </CardContent>
      </Card>

      {/* Experience Details - Always Editable */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Experience Details</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your professional work experience</CardDescription>
            </div>
            <Button onClick={addExperienceEntry} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Experience</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="overflow-x-auto custom-scrollbar w-full max-w-full">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border rounded-lg">
                <Table className="w-full table-auto text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[60px]">Sr No.</TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[200px]">Employer <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Currently Employed? <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[150px]">Designation <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Date of Joining <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Date of Relieving <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Nature of Job <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[130px]">Type of Teaching <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {experienceFields.map((field:any, index:number) => {
                  const entry = experienceForm.watch(`experiences.${index}`)
                  const rowEditing = experienceEditingIds.has(field.Id);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 sm:p-3 text-center">{index + 1}</TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Employeer`}
                          rules={{
                            required: rowEditing ? "Employer is required" : false,
                            minLength: {
                              value: 2,
                              message: "Employer name must be at least 2 characters"
                            },
                            maxLength: {
                              value: 200,
                              message: "Employer name must be less than 200 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Employer is required";
                                }
                                if (!/^[A-Za-z0-9\s.,'-]+$/.test(value)) {
                                  return "Employer name contains invalid characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.currente`}
                          render={({ field: formField }) => {
                            // Handle database values: 0/1 or boolean
                            const currentValue = formField.value === true || (typeof formField.value === 'number' && formField.value === 1)
                            return (
                              <Select
                                value={currentValue ? "yes" : "no"}
                                onValueChange={(value: string) => {
                                  // Convert to boolean for form (will be converted to 0/1 on save)
                                  const boolValue = value === "yes"
                                  formField.onChange(boolValue)
                                  // Only trigger validation on End_Date field, not all fields
                                  setTimeout(() => {
                                    experienceForm.trigger(`experiences.${index}.End_Date`, { shouldFocus: false })
                                  }, 0)
                                }}
                                disabled={!rowEditing}
                              >
                                <SelectTrigger className="w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            )
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.desig`}
                          rules={{
                            required: rowEditing ? "Designation is required" : false,
                            maxLength: {
                              value: 100,
                              message: "Designation must be less than 100 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Designation is required";
                                }
                                if (value.length < 2) {
                                  return "Designation must be at least 2 characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Start_Date`}
                          rules={{
                            required: rowEditing ? "Start date is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Start date is required";
                                }
                                const startDate = new Date(value);
                                if (isNaN(startDate.getTime())) {
                                  return "Please enter a valid start date";
                                }
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (startDate > today) {
                                  return "Start date cannot be in the future";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                type="date"
                                value={formatDateForInput(formField.value)}
                                onChange={(e) => {
                                  formField.onChange(e.target.value)
                                  // Trigger end date validation when start date changes
                                  if (rowEditing) {
                                    setTimeout(() => {
                                      experienceForm.trigger(`experiences.${index}.End_Date`)
                                    }, 100)
                                  }
                                }}
                                className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.End_Date`}
                          rules={{
                            required: rowEditing ? "End date is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "End date is required";
                                }
                                
                                const endDate = new Date(value);
                                if (isNaN(endDate.getTime())) {
                                  return "Please enter a valid end date";
                                }
                                
                                // Handle database values: 0/1 or boolean
                                const currenteRaw = experienceForm.watch(`experiences.${index}.currente`)
                                const currenteValue = currenteRaw === true || (typeof currenteRaw === 'number' && currenteRaw === 1)
                                const startDate = experienceForm.watch(`experiences.${index}.Start_Date`)
                                
                                // End date cannot be in the future if not currently employed
                                if (!currenteValue) {
                                  const today = new Date();
                                  today.setHours(23, 59, 59, 999);
                                  if (endDate > today) {
                                    return "End date cannot be in the future if not currently employed";
                                  }
                                }
                                
                                // End date must be after start date
                                if (startDate) {
                                  const start = new Date(startDate);
                                  if (!isNaN(start.getTime())) {
                                    if (endDate < start) {
                                      return "End date must be after start date";
                                    }
                                  }
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => {
                            // Handle database values: 0/1 or boolean
                            const currenteRaw = experienceForm.watch(`experiences.${index}.currente`)
                            const currenteValue = currenteRaw === true || (typeof currenteRaw === 'number' && currenteRaw === 1)
                            return (
                              <div>
                                <Input
                                  {...formField}
                                  type="date"
                                  value={formatDateForInput(formField.value)}
                                  onChange={(e) => formField.onChange(e.target.value)}
                                  max={currenteValue ? undefined : new Date().toISOString().split('T')[0]}
                                  className={`w-full h-8 text-xs read-only:bg-white read-only:text-foreground read-only:opacity-100 read-only:cursor-default ${error ? 'border-red-500' : ''}`}
                                  readOnly={!rowEditing || currenteValue}
                                />
                                {error && rowEditing && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Nature`}
                          rules={{
                            required: rowEditing ? "Nature of job is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Nature of job is required";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Select
                                value={formField.value || ""}
                                onValueChange={formField.onChange}
                                disabled={!rowEditing}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default ${error ? 'border-red-500' : ''}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Teaching">Teaching</SelectItem>
                                  <SelectItem value="Administration">Administration</SelectItem>
                                  <SelectItem value="Industrial Work">Industrial Work</SelectItem>
                                  <SelectItem value="Non-Teaching">Non-Teaching</SelectItem>
                                  <SelectItem value="Research">Research</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.UG_PG`}
                          rules={{
                            required: rowEditing ? "Teaching type is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Teaching type is required";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Select
                                value={formField.value || ""}
                                onValueChange={formField.onChange}
                                disabled={!rowEditing}
                              >
                                <SelectTrigger className={`w-full h-8 text-xs disabled:opacity-100 disabled:cursor-default ${error ? 'border-red-500' : ''}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="UG">UG</SelectItem>
                                  <SelectItem value="PG">PG</SelectItem>
                                  <SelectItem value="UG & PG">UG & PG</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                   
                      <TableCell className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => toggleExperienceRowEdit(field.Id)} className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removeExperienceEntry(index, field.Id)} className="h-7 w-7 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleSaveExperienceRow(index, field.Id)}
                                className="flex items-center gap-1 h-7 text-xs px-2"
                              >
                                <Save className="h-3 w-3" />
                                <span className="hidden sm:inline">Save</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  toggleExperienceRowEdit(field.Id)
                                  // Reset form to original values on cancel
                                  const teacherId = user?.role_id || teacherInfo?.Tid
                                  if (teacherId) {
                                    fetch(`/api/teacher/profile?teacherId=${teacherId}`)
                                      .then(res => res.json())
                                      .then((data: TeacherData) => {
                                        experienceForm.reset({ experiences: data.teacherExperience || [] })
                                      })
                                  }
                                }}
                                className="flex items-center gap-1 h-7 text-xs px-2"
                              >
                                <X className="h-3 w-3" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Doctoral Research Experience - Always Editable */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Post Doctoral Research Experience</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your post-doctoral research positions</CardDescription>
            </div>
            <Button onClick={addPostDocEntry} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Post-Doc</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto custom-scrollbar w-full max-w-full">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden border rounded-lg">
                <Table className="w-full table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[60px]">Sr No.</TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[200px]">Institute / Industry <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Start Date <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">End Date <span className="text-red-500">*</span></TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[150px]">Sponsored By</TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[200px]">QS / THE World University Ranking</TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Supporting Document</TableHead>
                      <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {postDocFields.map((field, index) => {
                  const entry = postDocForm.watch(`researches.${index}`)
                  const rowEditing = postDocEditingIds.has(field.Id);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 sm:p-3 text-center">{index + 1}</TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.Institute`}
                          rules={{
                            required: rowEditing ? "Institute is required" : false,
                            minLength: {
                              value: 2,
                              message: "Institute name must be at least 2 characters"
                            },
                            maxLength: {
                              value: 200,
                              message: "Institute name must be less than 200 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Institute is required";
                                }
                                if (value.trim().length < 2) {
                                  return "Institute name must be at least 2 characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.Start_Date`}
                          rules={{
                            required: rowEditing ? "Start date is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Start date is required";
                                }
                                const startDate = new Date(value);
                                if (isNaN(startDate.getTime())) {
                                  return "Please enter a valid start date";
                                }
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                if (startDate > today) {
                                  return "Start date cannot be in the future";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                type="date"
                                value={formatDateForInput(formField.value)}
                                onChange={(e) => {
                                  formField.onChange(e.target.value)
                                  // Trigger end date validation when start date changes
                                  if (rowEditing) {
                                    setTimeout(() => {
                                      postDocForm.trigger(`researches.${index}.End_Date`)
                                    }, 100)
                                  }
                                }}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.End_Date`}
                          rules={{
                            required: rowEditing ? "End date is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "End date is required";
                                }
                                const endDate = new Date(value);
                                if (isNaN(endDate.getTime())) {
                                  return "Please enter a valid end date";
                                }
                                // End date must not be in the future
                                const today = new Date();
                                today.setHours(23, 59, 59, 999); // End of today
                                if (endDate > today) {
                                  return "End date cannot be in the future";
                                }
                                // End date must be after start date
                                const startDate = entry.Start_Date;
                                if (startDate) {
                                  const start = new Date(startDate);
                                  if (!isNaN(start.getTime())) {
                                    if (endDate < start) {
                                      return "End date must be after start date";
                                    }
                                  }
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                type="date"
                                value={formatDateForInput(formField.value)}
                                onChange={(e) => formField.onChange(e.target.value)}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.SponsoredBy`}
                          rules={{
                            maxLength: {
                              value: 200,
                              message: "Sponsored by must be less than 200 characters"
                            },
                            validate: (value) => {
                              if (value && typeof value === 'string' && value.trim() !== '') {
                                if (value.trim().length < 2) {
                                  return "If provided, must be at least 2 characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full h-8 text-xs"
                              placeholder="e.g., UGC, CSIR"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.QS_THE`}
                          rules={{
                            maxLength: {
                              value: 100,
                              message: "QS/THE ranking must be less than 100 characters"
                            },
                            validate: (value) => {
                              if (value && typeof value === 'string' && value.trim() !== '') {
                                if (!/^[A-Za-z0-9\s:.-]+$/.test(value)) {
                                  return "QS/THE ranking contains invalid characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full h-8 text-xs"
                              placeholder="e.g., QS Ranking: 172"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3 whitespace-nowrap">
                        {!rowEditing && entry.doc ? (
                          // View mode: Show Eye icon to view document
                          <Dialog 
                            open={phdViewDialogOpen[field.Id] || false}
                            onOpenChange={(open) => setPhdViewDialogOpen(prev => ({ ...prev, [field.Id]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Document">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>View Supporting Document</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <DocumentViewer
                                  documentUrl={entry.doc}
                                  documentName="Supporting Document"
                                  documentType={entry.doc.split('.').pop()?.toLowerCase() || 'pdf'}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : rowEditing ? (
                          // Edit mode: Show Upload icon if no document, FileText if document exists
                          <Dialog 
                            open={phdDialogOpen[field.Id] || false}
                            onOpenChange={(open) => setPhdDialogOpen(prev => ({ ...prev, [field.Id]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={entry.doc || phdDocumentUrls[field.Id] ? "Update Document" : "Upload Document"}>
                                {entry.doc || phdDocumentUrls[field.Id] ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{entry.doc || phdDocumentUrls[field.Id] ? "Update Supporting Document" : "Upload Supporting Document"}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <DocumentUpload
                                  documentUrl={phdDocumentUrls[field.Id] || entry.doc}
                                  onChange={(url) => {
                                    if (url) {
                                      setPhdDocumentUrls(prev => ({ ...prev, [field.Id]: url }))
                                    }
                                  }}
                                  onClear={() => {
                                    setPhdDocumentUrls(prev => {
                                      const newUrls = { ...prev }
                                      delete newUrls[field.Id]
                                      return newUrls
                                    })
                                  }}
                                  hideExtractButton={true}
                                  isEditMode={!!entry.doc}
                                />
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button 
                                    variant="outline"
                                    onClick={() => setPhdDialogOpen(prev => ({ ...prev, [field.Id]: false }))}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    className="cursor-pointer"
                                    onClick={async () => {
                                      const currentUrl = phdDocumentUrls[field.Id] || entry.doc
                                      if (currentUrl) {
                                        await handlePhdDocumentUpdate(index, field.Id, currentUrl)
                                      }
                                    }}
                                    disabled={!phdDocumentUrls[field.Id] && !entry.doc}
                                  >
                                    Save Document
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-xs text-gray-400">No document</span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => togglePostDocRowEdit(field.Id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removePostDocEntry(index, field.Id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleSavePostDocRow(index, field.Id)}
                                className="flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" />
                                <span className="hidden sm:inline">Save</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  togglePostDocRowEdit(field.Id)
                                  const teacherId = user?.role_id || teacherInfo?.Tid
                                  if (teacherId) {
                                    fetch(`/api/teacher/profile?teacherId=${teacherId}`)
                                      .then(res => res.json())
                                      .then((data: TeacherData) => {
                                        postDocForm.reset({ researches: data.postDoctoralExp || [] })
                                      })
                                  }
                                }}
                                className="flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Details - Always Editable */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Education Details</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Your academic qualifications</CardDescription>
            </div>
            <Button onClick={addEducationEntry} size="sm" className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Education</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar w-full max-w-full">
            <Table className="w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[60px]">Sr No.</TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[150px]">Degree Type <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[200px]">University <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[120px]">State <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Year of Passing <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[200px]">Specialization <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[150px]">QS Ranking <span className="text-red-500">*</span></TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap min-w-[140px]">Image</TableHead>
                  <TableHead className="p-2 sm:p-3 text-xs whitespace-nowrap w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationFields.map((field, index) => {
                  const entry = educationForm.watch(`educations.${index}`)
                  const rowEditing = educationEditingIds.has(field.gid);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 sm:p-3 text-center">{index + 1}</TableCell>

                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.degree_type`}
                          rules={{
                            required: rowEditing ? "Degree type is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || value === 0) {
                                  return "Degree type is required";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <SearchableSelect
                                options={degreeTypeOptions.map((degreeType) => ({
                                  value: degreeType.id,
                                  label: degreeType.name,
                                }))}
                                value={formField.value}
                                onValueChange={(value: string | number) => formField.onChange(Number(value))}
                                placeholder="Select degree type"
                                disabled={!rowEditing}
                                emptyMessage="No degree type found."
                                className={`w-full ${error ? 'border-red-500' : ''}`}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.university_name`}
                          rules={{
                            required: rowEditing ? "University name is required" : false,
                            minLength: {
                              value: 3,
                              message: "University name must be at least 3 characters"
                            },
                            maxLength: {
                              value: 200,
                              message: "University name must be less than 200 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "University name is required";
                                }
                                if (!/^[A-Za-z0-9\s.,'-]+$/.test(value)) {
                                  return "University name contains invalid characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.state`}
                          rules={{
                            required: rowEditing ? "State is required" : false,
                            maxLength: {
                              value: 50,
                              message: "State must be less than 50 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "State is required";
                                }
                                if (value.trim().length < 2) {
                                  return "State must be at least 2 characters";
                                }
                                if (!/^[A-Za-z\s]+$/.test(value)) {
                                  return "State should only contain letters and spaces";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                placeholder="Enter state"
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.year_of_passing`}
                          rules={{
                            required: rowEditing ? "Year of passing is required" : false,
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Year of passing is required";
                                }
                                let yearStr = '';
                                if (typeof value === 'string' && value.includes('-')) {
                                  const date = new Date(value);
                                  if (!isNaN(date.getTime())) {
                                    yearStr = date.getFullYear().toString();
                                  }
                                } else {
                                  yearStr = String(value).trim().replace(/\D/g, '').slice(0, 4);
                                }
                                if (yearStr.length !== 4) {
                                  return "Year must be 4 digits";
                                }
                                const year = parseInt(yearStr);
                                const currentYear = new Date().getFullYear();
                                if (isNaN(year) || year < 1950 || year > currentYear) {
                                  return `Year must be between 1950 and ${currentYear}`;
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => {
                            // Extract year value: handle both date format (YYYY-MM-DD) and plain year strings
                            let yearValue = ""
                            if (formField.value) {
                              const valueStr = String(formField.value)
                              // Check if it's already a date format (contains hyphen)
                              if (valueStr.includes('-')) {
                                try {
                                  const date = new Date(valueStr)
                                  if (!isNaN(date.getTime())) {
                                    yearValue = date.getFullYear().toString()
                                  }
                                } catch (e) {
                                  yearValue = ""
                                }
                              } else {
                                // It's a plain year string (1-4 digits), use it directly
                                yearValue = valueStr.replace(/\D/g, "").slice(0, 4)
                              }
                            }
                            
                            return (
                              <div>
                                <Input
                                  type="text"
                                  value={yearValue}
                                  onChange={(e) => {
                                    const inputValue = e.target.value
                                    const year = inputValue.replace(/\D/g, "").slice(0, 4);
                                    
                                    // If user entered 4 digits, convert to date format
                                    if (year.length === 4) {
                                      formField.onChange(`${year}-01-01`);
                                    } else if (year.length > 0) {
                                      // Store partial year as plain string for editing
                                      formField.onChange(year);
                                    } else {
                                      // Empty input
                                      formField.onChange("");
                                    }
                                  }}
                                  onBlur={(e) => {
                                    // On blur, if we have a valid 4-digit year, ensure it's in date format
                                    const year = e.target.value.replace(/\D/g, "").slice(0, 4);
                                    if (year.length === 4) {
                                      formField.onChange(`${year}-01-01`);
                                    }
                                    formField.onBlur();
                                  }}
                                  name={formField.name}
                                  ref={formField.ref}
                                  className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                  placeholder="YYYY"
                                  readOnly={!rowEditing}
                                />
                                {error && rowEditing && (
                                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                                )}
                              </div>
                            )
                          }}
                        />
                      </TableCell>

                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.subject`}
                          rules={{
                            required: rowEditing ? "Specialization is required" : false,
                            maxLength: {
                              value: 200,
                              message: "Specialization must be less than 200 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "Specialization is required";
                                }
                                if (value.trim().length < 2) {
                                  return "Specialization must be at least 2 characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                value={formField.value || ""}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-2 sm:p-3">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.QS_Ranking`}
                          rules={{
                            required: rowEditing ? "QS Ranking is required" : false,
                            maxLength: {
                              value: 50,
                              message: "QS Ranking must be less than 50 characters"
                            },
                            validate: (value) => {
                              if (rowEditing) {
                                if (!value || (typeof value === 'string' && value.trim() === '')) {
                                  return "QS Ranking is required";
                                }
                                if (!/^[A-Za-z0-9\s:.-]+$/.test(value)) {
                                  return "QS Ranking contains invalid characters";
                                }
                              }
                              return true;
                            }
                          }}
                          render={({ field: formField, fieldState: { error } }) => (
                            <div>
                              <Input
                                {...formField}
                                value={formField.value || ""}
                                className={`w-full h-8 text-xs ${error ? 'border-red-500' : ''}`}
                                placeholder="e.g., QS Ranking: 172"
                                readOnly={!rowEditing}
                              />
                              {error && rowEditing && (
                                <p className="text-xs text-red-500 mt-1">{error.message}</p>
                              )}
                            </div>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-3 whitespace-nowrap">
                        {!rowEditing && entry.Image ? (
                          // View mode: Show Eye icon to view document
                          <Dialog 
                            open={educationViewDialogOpen[field.gid] || false}
                            onOpenChange={(open) => setEducationViewDialogOpen(prev => ({ ...prev, [field.gid]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Document">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>View Document</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <DocumentViewer
                                  documentUrl={entry.Image}
                                  documentName="Education Document"
                                  documentType={entry.Image.split('.').pop()?.toLowerCase() || 'pdf'}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : rowEditing ? (
                          // Edit mode: Show Upload icon if no document, FileText if document exists
                          <Dialog 
                            open={educationDialogOpen[field.gid] || false}
                            onOpenChange={(open) => setEducationDialogOpen(prev => ({ ...prev, [field.gid]: open }))}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={entry.Image || educationDocumentUrls[field.gid] ? "Update Document" : "Upload Document"}>
                                {entry.Image || educationDocumentUrls[field.gid] ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{entry.Image || educationDocumentUrls[field.gid] ? "Update Document" : "Upload Document"}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <DocumentUpload
                                  documentUrl={educationDocumentUrls[field.gid] || entry.Image || undefined}
                                  onChange={(url) => {
                                    if (url) {
                                      setEducationDocumentUrls(prev => ({ ...prev, [field.gid]: url }))
                                    }
                                  }}
                                  onClear={() => {
                                    setEducationDocumentUrls(prev => {
                                      const newUrls = { ...prev }
                                      delete newUrls[field.gid]
                                      return newUrls
                                    })
                                  }}
                                  hideExtractButton={true}
                                  isEditMode={!!entry.Image}
                                />
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button 
                                    variant="outline"
                                    onClick={() => setEducationDialogOpen(prev => ({ ...prev, [field.gid]: false }))}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    className="cursor-pointer"
                                    onClick={async () => {
                                      const currentUrl = educationDocumentUrls[field.gid] || entry.Image
                                      if (currentUrl) {
                                        await handleEducationDocumentUpdate(index, field.gid, currentUrl)
                                      }
                                    }}
                                    disabled={!educationDocumentUrls[field.gid] && !entry.Image}
                                  >
                                    Save Document
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-xs text-gray-400">No document</span>
                        )}
                      </TableCell>
                      <TableCell className="p-2 sm:p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => toggleEducationRowEdit(field.gid)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removeEducationEntry(index, field.gid)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleSaveEducationRow(index, field.gid)}
                                className="flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" />
                                <span className="hidden sm:inline">Save</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  toggleEducationRowEdit(field.gid)
                                  const teacherId = user?.role_id || teacherInfo?.Tid
                                  if (teacherId) {
                                    fetch(`/api/teacher/profile?teacherId=${teacherId}`)
                                      .then(res => res.json())
                                      .then((data: TeacherData) => {
                                        educationForm.reset({ educations: data.graduationDetails || [] })
                                      })
                                  }
                                }}
                                className="flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Information Availability */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div>
              <CardTitle className="text-sm sm:text-base">Academic Year Information Availability</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">
                Academic Year Information Activity - Please tick if you DON'T have any information to submit in the
                following academic years
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleSaveAcademicYears}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 w-full">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2016-17"
                  checked={teacherInfo?.NILL2016_17 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2016_17: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2016-17" className="text-sm font-normal">
                  A.Y. 2016-17
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2017-18"
                  checked={teacherInfo?.NILL2017_18 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2017_18: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2017-18" className="text-sm font-normal">
                  A.Y. 2017-18
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2018-19"
                  checked={teacherInfo?.NILL2018_19 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2018_19: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2018-19" className="text-sm font-normal">
                  A.Y. 2018-19
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2019-20"
                  checked={teacherInfo?.NILL2019_20 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2019_20: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2019-20" className="text-sm font-normal">
                  A.Y. 2019-20
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2020-21"
                  checked={teacherInfo?.NILL2020_21 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2020_21: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2020-21" className="text-sm font-normal">
                  A.Y. 2020-21
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2021-22"
                  checked={teacherInfo?.NILL2021_22 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2021_22: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2021-22" className="text-sm font-normal">
                  A.Y. 2021-22
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2022-23"
                  checked={teacherInfo?.NILL2022_23 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2022_23: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2022-23" className="text-sm font-normal">
                  A.Y. 2022-23
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2023-24"
                  checked={teacherInfo?.NILL2023_24 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2023_24: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2023-24" className="text-sm font-normal">
                  A.Y. 2023-24
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2024-25"
                  checked={teacherInfo?.NILL2024_25 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2024_25: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2024-25" className="text-sm font-normal">
                  A.Y. 2024-25
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ay2025-26"
                  checked={teacherInfo?.NILL2025_26 || false}
                  onChange={(e) => {
                    if (teacherInfo) {
                      setTeacherInfo({ ...teacherInfo, NILL2025_26: e.target.checked });
                    }
                  }}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="ay2025-26" className="text-sm font-normal">
                  A.Y. 2025-26
                </Label>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Academic Year Information Activity:</strong> Please check the academic years for which you do
                NOT have any information to submit. This helps in generating accurate reports and understanding your
                research activity across different academic years.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
