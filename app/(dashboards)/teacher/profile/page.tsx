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
import { User, Camera, Save, X, Edit, Plus, Trash2, Upload, FileText } from "lucide-react"
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
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [facultyData, setFacultyData] = useState<Faculty | null>(null);
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [designationData, setDesignationData] = useState<Designation | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  // Row-level edit state for tables
  const [experienceEditingIds, setExperienceEditingIds] = useState<Set<number>>(new Set());
  const [postDocEditingIds, setPostDocEditingIds] = useState<Set<number>>(new Set());
  const [educationEditingIds, setEducationEditingIds] = useState<Set<number>>(new Set());


  const { facultyOptions, departmentOptions, degreeTypeOptions, permanentDesignationOptions, temporaryDesignationOptions, fetchFaculties, fetchDepartments, fetchDegreeTypes, fetchParmanentDesignations, fetchTemporaryDesignations } = useDropDowns()

  // Form data for editing (only used for temporary editing state)
  const [editingData, setEditingData] = useState({ ...initialEditingData })

  // react-hook-form for Personal Details
  const { control, register, reset, handleSubmit, getValues, watch, setValue, formState: { errors } } = useForm<any>({
    defaultValues: {},
  })

  // react-hook-form for Experience Details
  const experienceForm = useForm<{ experiences: ExperienceEntry[] }>({
    defaultValues: { experiences: [] },
    mode: 'onChange',
  })
  const { fields: experienceFields, append: appendExperience, remove: removeExperience, update: updateExperience } = useFieldArray({
    control: experienceForm.control,
    name: 'experiences',
  })

  // react-hook-form for Post-Doctoral Research
  const postDocForm = useForm<{ researches: PostDocEntry[] }>({
    defaultValues: { researches: [] },
    mode: 'onChange',
  })
  const { fields: postDocFields, append: appendPostDoc, remove: removePostDoc, update: updatePostDoc } = useFieldArray({
    control: postDocForm.control,
    name: 'researches',
  })

  // react-hook-form for Education Details
  const educationForm = useForm<{ educations: EducationEntry[] }>({
    defaultValues: { educations: [] },
    mode: 'onChange',
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

  // Initialize forms when data is loaded
  useEffect(() => {
    if (profileData) {
      const data: TeacherData = profileData as any
      setTeacherInfo(data.teacherInfo)
      
      // Initialize react-hook-form arrays
      experienceForm.reset({ experiences: data.teacherExperience || [] })
      postDocForm.reset({ researches: data.postDoctoralExp || [] })
      educationForm.reset({ educations: data.graduationDetails || [] })
      setFacultyData(data.faculty)
      setSelectedFacultyId(data.faculty?.Fid ?? null)
      setDepartmentData(data.department)
      setDesignationData(data.designation)
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
        // Department
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    setIsUploadingImage(true)

    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)

      // To integrate with S3 later, use the helper below.
      // await uploadProfileImageToS3(file)

      console.log("Image uploaded:", file.name)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const triggerImageUpload = () => {
    const fileInput = document.getElementById("profile-image-input") as HTMLInputElement
    fileInput?.click()
  }

  // Upload to S3 via backend helper (scaffold; not active by default)
  const uploadProfileImageToS3 = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    try {
      const uploadRes = await fetch('/api/s3/upload', { method: 'POST', body: form });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();
      if (teacherInfo) {
        const updated = { ...teacherInfo, ProfileImage: url };
        setTeacherInfo(updated);
        await fetch('/api/teacher/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      }
    } catch (err) {
      console.error('S3 upload failed', err);
    }
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

  const onSubmitPersonal = async () => {
    try {
      const values = getValues();
      const newIctDetails = buildIctDetails(editingData);
      const payload = {
        ...(teacherInfo || {}),
        ...values,
        ICT_Details: newIctDetails,
      } as TeacherInfo;

      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setTeacherInfo(payload);
        toast({ title: "Profile Updated", description: "Your information has been saved successfully." });
        setIsEditingPersonal(false)
      } else {
        toast({ title: "Update Failed", description: result.error || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Update Failed", description: "Network or server error while saving your profile.", variant: "destructive" })
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

      // Validate only this row
      const isValid = await experienceForm.trigger(`experiences.${index}`)
      if (!isValid) {
        toast({ title: "Validation Failed", description: "Please fill all required fields.", variant: "destructive" })
        return
      }

      const entry = experienceForm.getValues(`experiences.${index}`)
      const isNewEntry = !entry.Id || entry.Id > 2147483647

      const res = await fetch('/api/teacher/profile/experience', {
        method: isNewEntry ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, experience: entry }),
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
        
        // Refresh data after successful save
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          experienceForm.reset({ experiences: refreshData.teacherExperience || [] })
        }
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

      // Validate only this row
      const isValid = await postDocForm.trigger(`researches.${index}`)
      if (!isValid) {
        toast({ title: "Validation Failed", description: "Please fill all required fields.", variant: "destructive" })
        return
      }

      const entry = postDocForm.getValues(`researches.${index}`)
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
        
        // Refresh data after successful save
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          postDocForm.reset({ researches: refreshData.postDoctoralExp || [] })
        }
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

      // Validate only this row
      const isValid = await educationForm.trigger(`educations.${index}`)
      if (!isValid) {
        toast({ title: "Validation Failed", description: "Please fill all required fields.", variant: "destructive" })
        return
      }

      const entry = educationForm.getValues(`educations.${index}`)
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
        
        // Refresh data after successful save
        const refreshRes = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (refreshRes.ok) {
          const refreshData: TeacherData = await refreshRes.json()
          educationForm.reset({ educations: refreshData.graduationDetails || [] })
        }
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
                <Button onClick={handleSubmit(onSubmitPersonal)} className="flex items-center gap-2 w-full sm:w-auto" size="sm">
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
                    {teacherInfo?.ProfileImage ? (
                      <img
                        src={teacherInfo?.ProfileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
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
                        accept="image/*"
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
                    <p className="text-xs text-gray-400">Supported: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                )}
              </div>
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 w-full">
                <div className="space-y-2">
                  <Label htmlFor="salutation" className="text-[11px] sm:text-xs">Salutation</Label>
                  <Controller
                    control={control}
                    name="Abbri"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v: any) => field.onChange(v)}
                      >
                        <SelectTrigger className={`h-8 text-xs ${!isEditingPersonal ? "pointer-events-none" : ""}`}>
                          <SelectValue />
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
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[11px] sm:text-xs">First Name</Label>
                  <Input 
                    id="firstName" 
                    className="h-8 text-xs"
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
                  {errors.fname && isEditingPersonal && (
                    <p className="text-sm text-red-500">{errors.fname.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-[11px] sm:text-xs">Middle Name</Label>
                  <Input 
                    id="middleName" 
                    className="h-8 text-xs"
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
                  {errors.mname && isEditingPersonal && (
                    <p className="text-sm text-red-500">{errors.mname.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[11px] sm:text-xs">Last Name</Label>
                  <Input 
                    id="lastName" 
                    className="h-8 text-xs"
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
                  {errors.lname && isEditingPersonal && (
                    <p className="text-sm text-red-500">{errors.lname.message as string}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] sm:text-xs">Email</Label>
                  <Input id="email" type="email" {...register('email_id')} readOnly className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[11px] sm:text-xs">Phone Number</Label>
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
                    render={({ field }) => (
                        <Input
                          id="phone"
                          type="tel"
                          {...field}
                          className="h-8 text-xs"
                          onChange={(e) => {
                            // Only allow digits and limit to 10
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            field.onChange(value);
                          }}
                          readOnly={!isEditingPersonal}
                          placeholder="Enter 10 digit phone number"
                          maxLength={10}
                        />
                    )}
                  />
                  {errors.phone_no && isEditingPersonal && (
                    <p className="text-sm text-red-500">{errors.phone_no.message as string}</p>
                  )}
                </div>

              </div>

              {/* Additional Personal Information */}
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-medium">Additional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" {...register('DOB')} readOnly={!isEditingPersonal} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input id="dateOfJoining" type="date" {...register('recruit_date')} readOnly={!isEditingPersonal} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNo">PAN Number</Label>
                  <Input id="panNo" {...register('PAN_No')} readOnly={!isEditingPersonal} placeholder="ABCDE1234F" maxLength={10} className="h-8 text-xs" />
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
                        valueAsNumber: true
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter H-Index"
                      className="h-8 text-xs"
                    />
                    {errors.H_INDEX && isEditingPersonal && (
                      <p className="text-sm text-red-500">{errors.H_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="i10Index">i10-Index</Label>
                      <Input 
                      id="i10Index" 
                      type="number" 
                      {...register('i10_INDEX', {
                        min: { value: 0, message: "i10-Index must be a positive number" },
                        valueAsNumber: true
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter i10-Index"
                      className="h-8 text-xs"
                    />
                    {errors.i10_INDEX && isEditingPersonal && (
                      <p className="text-sm text-red-500">{errors.i10_INDEX.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citations">Citations</Label>
                      <Input 
                      id="citations" 
                      type="number" 
                      {...register('CITIATIONS', {
                        min: { value: 0, message: "Citations must be a positive number" },
                        valueAsNumber: true
                      })} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter total citations"
                      className="h-8 text-xs"
                    />
                    {errors.CITIATIONS && isEditingPersonal && (
                      <p className="text-sm text-red-500">{errors.CITIATIONS.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orcidId">ORCHID ID</Label>
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
                      className="h-8 text-xs"
                    />
                    {errors.ORCHID_ID && isEditingPersonal && (
                      <p className="text-sm text-red-500">{errors.ORCHID_ID.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researcherId">Researcher ID</Label>
                      <Input 
                      id="researcherId" 
                      {...register('RESEARCHER_ID')} 
                      readOnly={!isEditingPersonal} 
                      placeholder="Enter Researcher ID"
                      maxLength={100}
                      className="h-8 text-xs"
                    />
                    {errors.RESEARCHER_ID && isEditingPersonal && (
                      <p className="text-sm text-red-500">{errors.RESEARCHER_ID.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Teaching Status */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold">Teaching Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="teachingStatus">Teaching Status</Label>
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
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Controller
                      control={control}
                      name={watch('perma_or_tenure') === false ? 'desig_perma' : 'desig_tenure'}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty</Label>
                    <SearchableSelect
                      options={facultyOptions.map((faculty) => ({
                        value: faculty.Fid,
                        label: faculty.Fname,
                      }))}
                      value={selectedFacultyId ?? facultyData?.Fid}
                      onValueChange={(value: string | number) => {
                        const fidNum = Number(value)
                        setSelectedFacultyId(Number.isNaN(fidNum) ? null : fidNum)
                        // Reset selected department when faculty changes
                        setValue('deptid', 0)
                        setDepartmentData(null)
                      }}
                      placeholder="Select faculty"
                      disabled={!isEditingPersonal}
                      emptyMessage="No faculty found."
                      className="w-full min-w-0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Controller
                      control={control}
                      name="deptid"
                      render={({ field }) => (
                        <SearchableSelect
                          options={departmentOptions.map((dept) => ({
                            value: dept.Deptid,
                            label: dept.name,
                          }))}
                          value={field.value}
                          onValueChange={(v: string | number) => field.onChange(Number(v))}
                          placeholder="Select department"
                          disabled={!isEditingPersonal || !selectedFacultyId}
                          emptyMessage={!selectedFacultyId ? "Please select a faculty first" : "No department found."}
                          className="w-full min-w-0"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Qualification Information */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold">Qualification Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Qualified NET Exam</Label>
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
                          <Label htmlFor="netYear">NET Qualified Year</Label>
                          <Input id="netYear" {...register('NET_year')} readOnly={!isEditingPersonal} className="h-8 text-xs" />
                        </div>

                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Qualified GATE Exam</Label>
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
                          <Input id="gateYear" {...register('GATE_year')} readOnly={!isEditingPersonal} placeholder="e.g., 2018" className="h-8 text-xs" />
                        </div>

                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold">Registration Information</h3>
                <div className="space-y-2">
                  <Label>Registered Phd Guide at MSU</Label>
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
                    <Label htmlFor="registrationYear">Year of Registration</Label>
                    <Input id="registrationYear" {...register('Guide_year')} readOnly={!isEditingPersonal} className="h-8 text-xs" />
                  </div>
                )}
              </div>

              {/* ICT in Teaching */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-semibold">Use of ICT in Teaching</h3>
                <div className="space-y-4">
                  <Label>Technologies Used for Teaching (Select all that apply)</Label>
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
                      <Label htmlFor="otherIctTools">If Others, please specify:</Label>
                      <Input
                        id="otherIctTools"
                        value={editingData.ictOthersSpecify}
                        // onChange={(e) => handleInputChange("ictOthersSpecify", e.target.value)}
                        placeholder="Please specify other ICT tools used..."
                        readOnly={!isEditingPersonal}
                        className="max-w-md h-8 text-xs"
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
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Sr No.</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Employer</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Currently Employed?</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Designation</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Date of Joining</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Date of Relieving</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Nature of Job</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Type of Teaching</TableHead>
                      <TableHead className="p-1.5 sm:p-2 text-xs whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {experienceFields.map((field, index) => {
                  const entry = experienceForm.watch(`experiences.${index}`)
                  const rowEditing = experienceEditingIds.has(field.Id);
                  return (
                    <TableRow key={field.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="min-w-[220px]">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Employeer`}
                          rules={{ required: rowEditing ? "Employer is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0 h-8 text-xs"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.currente`}
                          render={({ field: formField }) => (
                            <Select
                              value={formField.value ? "yes" : "no"}
                              onValueChange={(value: string) => formField.onChange(value === "yes")}
                              disabled={!rowEditing}
                            >
                              <SelectTrigger className={`w-full min-w-[60px] max-w-full h-8 text-xs ${!rowEditing ? "pointer-events-none" : ""}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.desig`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0 h-8 text-xs"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Start_Date`}
                          rules={{ required: rowEditing ? "Start date is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              type="date"
                              value={formatDateForInput(formField.value)}
                              onChange={(e) => formField.onChange(e.target.value)}
                              className="w-full min-w-0"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.End_Date`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              type="date"
                              value={formatDateForInput(formField.value)}
                              onChange={(e) => formField.onChange(e.target.value)}
                              className="w-full min-w-0"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.Nature`}
                          rules={{ required: rowEditing ? "Nature of job is required" : false }}
                          render={({ field: formField }) => (
                            <Select
                              value={formField.value || ""}
                              onValueChange={formField.onChange}
                              disabled={!rowEditing}
                            >
                              <SelectTrigger className={`w-full min-w-[80px] max-w-full h-8 text-xs ${!rowEditing ? "pointer-events-none" : ""}`}>
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
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={experienceForm.control}
                          name={`experiences.${index}.UG_PG`}
                          rules={{ required: rowEditing ? "Teaching type is required" : false }}
                          render={({ field: formField }) => (
                            <Select
                              value={formField.value || ""}
                              onValueChange={formField.onChange}
                              disabled={!rowEditing}
                            >
                              <SelectTrigger className={`w-full min-w-[70px] max-w-full h-8 text-xs ${!rowEditing ? "pointer-events-none" : ""}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UG">UG</SelectItem>
                                <SelectItem value="PG">PG</SelectItem>
                                <SelectItem value="UG & PG">UG & PG</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 whitespace-nowrap">
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
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Sr No.</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Institute / Industry</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Start Date</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">End Date</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Sponsored By</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">QS / THE World University Ranking</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Supporting Document</TableHead>
                      <TableHead className="p-2 sm:p-4 whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
              <TableBody>
                {postDocFields.map((field, index) => {
                  const entry = postDocForm.watch(`researches.${index}`)
                  const rowEditing = postDocEditingIds.has(field.Id);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="p-1.5 sm:p-2 whitespace-nowrap text-xs">{index + 1}</TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.Institute`}
                          rules={{ required: rowEditing ? "Institute is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0 h-8 text-xs"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.Start_Date`}
                          rules={{ required: rowEditing ? "Start date is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              type="date"
                              value={formatDateForInput(formField.value)}
                              onChange={(e) => formField.onChange(e.target.value)}
                              className="w-full min-w-0"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.End_Date`}
                          rules={{ required: rowEditing ? "End date is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              type="date"
                              value={formatDateForInput(formField.value)}
                              onChange={(e) => formField.onChange(e.target.value)}
                              className="w-full min-w-0"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.SponsoredBy`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0"
                              placeholder="e.g., UGC, CSIR"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={postDocForm.control}
                          name={`researches.${index}.QS_THE`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0"
                              placeholder="e.g., QS Ranking: 172"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 whitespace-nowrap">
                        <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                          <Controller
                            control={postDocForm.control}
                            name={`researches.${index}.doc`}
                            render={({ field: formField }) => (
                              <Input
                                {...formField}
                                className="w-full min-w-0"
                                placeholder="Document name"
                                readOnly={!rowEditing}
                              />
                            )}
                          />
                          <Button size="sm" variant="outline" disabled={!rowEditing}>
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 whitespace-nowrap">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Degree Type</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Year of Passing</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>QS Ranking</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationFields.map((field, index) => {
                  const entry = educationForm.watch(`educations.${index}`)
                  const rowEditing = educationEditingIds.has(field.gid);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 sm:p-4 whitespace-nowrap">{index + 1}</TableCell>

                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.degree_type`}
                          rules={{ required: rowEditing ? "Degree type is required" : false }}
                          render={({ field: formField }) => (
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
                              className="w-full min-w-0"
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.university_name`}
                          rules={{ required: rowEditing ? "University name is required" : false }}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className="w-full min-w-0 h-8 text-xs"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.state`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              className={`w-full min-w-0 ${!rowEditing ? "pointer-events-none bg-gray-100 text-gray-500" : ""}`}
                              placeholder="Enter state"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.year_of_passing`}
                          rules={{ required: rowEditing ? "Year of passing is required" : false }}
                          render={({ field: formField }) => {
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
                                className="w-full min-w-0"
                                placeholder="YYYY"
                                readOnly={!rowEditing}
                              />
                            )
                          }}
                        />
                      </TableCell>

                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.subject`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              value={formField.value || ""}
                              className="w-full min-w-0"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell className="p-1.5 sm:p-2 min-w-0">
                        <Controller
                          control={educationForm.control}
                          name={`educations.${index}.QS_Ranking`}
                          render={({ field: formField }) => (
                            <Input
                              {...formField}
                              value={formField.value || ""}
                              className="w-full min-w-0"
                              placeholder="QS Ranking"
                              readOnly={!rowEditing}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 whitespace-nowrap">
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
