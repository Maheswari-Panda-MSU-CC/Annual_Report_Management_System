"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/app/api/auth/auth-provider"
import { User, Camera, Save, X, Edit, Plus, Trash2, Upload, FileText } from "lucide-react"
import { TeacherInfo,ExperienceEntry,PostDocEntry,EducationEntry, TeacherData, Faculty, Department, Designation,FacultyOption,DepartmentOption,DesignationOption,DegreeTypeOption } from "@/types/interfaces"
import { toast } from "@/components/ui/use-toast"
import { number } from "zod"



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
};


export default function ProfilePage() {
  const { user } = useAuth()
  const isAuthenticated = user !== null;
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingPersonal, setIsEditingPersonal] = useState(false) // Only for personal details
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [teacherInfo,setTeacherInfo] = useState<TeacherInfo|null>(null);
  const [facultyData,setFacultyData] = useState<Faculty|null>(null);
  const [departmentData,setDepartmentData] = useState<Department|null>(null);
  const [designationData,setDesignationData] = useState<Designation|null>(null);
  
  // Dropdown data states
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [permanentDesignationOptions, setPermanentDesignationOptions] = useState<DesignationOption[]>([]);
  const [temporaryDesignationOptions, setTemporaryDesignationOptions] = useState<DesignationOption[]>([]);
  const [degreeTypeOptions, setDegreeTypeOptions] = useState<DegreeTypeOption[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  // Row-level edit state for tables
  const [experienceEditingIds, setExperienceEditingIds] = useState<Set<number>>(new Set());
  const [postDocEditingIds, setPostDocEditingIds] = useState<Set<number>>(new Set());
  const [educationEditingIds, setEducationEditingIds] = useState<Set<number>>(new Set());

  // Form data for editing (only used for temporary editing state)
  const [editingData, setEditingData] = useState({ ...initialEditingData })

  // Experience Details - Always editable
  const [experienceData, setExperienceData] = useState<ExperienceEntry[]>([
    {
      Id: 1,
      Tid:1,
      upload:null,
      Employeer: "ABC University",
      currente: false,
      desig: "Assistant Professor",
      Start_Date: "2012-07-01",
      End_Date: "2015-06-30",
      Nature: "Teaching & Research",
      UG_PG: "UG & PG",
    },
    {
      Id: 2,
      Tid:1,
      upload:null,
      Employeer: "ABC University",
      currente: false,
      desig: "Assistant Professor",
      Start_Date: "2012-07-01",
      End_Date: "2015-06-30",
      Nature: "Teaching & Research",
      UG_PG: "UG & PG",
    },
  ])

  // Post Doctoral Research Experience - Always editable
  const [postDocData, setPostDocData] = useState<PostDocEntry[]>([
    {
      Id: 1,
      Tid:1,
      Institute: "IIT Bombay",
      Start_Date: "2011-01-01",
      End_Date: "2012-06-30",
      SponsoredBy: "UGC",
      QS_THE: "QS Ranking: 172",
      doc: "postdoc_certificate.pdf",
    },
  ])

  // Education Details - Always editable
  const [educationData, setEducationData] = useState<EducationEntry[]>([
    {
      gid: 1,
      tid:1,
      degree_name: "Ph.D",
      degree_type: 1,
      university_name: "IIT Delhi",
      state: "Delhi",
      year_of_passing: "2011",
      subject: "Computer Science",
      Image: null,
      QS_Ranking: ""
    },
    {
      gid: 2,
      tid:1,
      degree_name: "Ph.D",
      degree_type: 1,
      university_name: "IIT Delhi",
      state: "Delhi",
      year_of_passing: "2011",
      subject: "Computer Science",
      Image: null,
      QS_Ranking: ""
    },
    {
      gid: 3,
      tid:1,
      degree_name: "Ph.D",
      degree_type: 1,
      university_name: "IIT Delhi",
      state: "Delhi",
      year_of_passing: "2011",
      subject: "Computer Science",
      Image: null,
      QS_Ranking: ""
    },
  ])

  // useEffect(() => {
  //   if (isAuthenticated === false) {
  //     router.push("/teacher/dashboard")
  //   } else {
  //     setIsLoading(false)
  //   }
  // }, [isAuthenticated, router])

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      // Fetch faculty options
      const facultyRes = await fetch('/api/shared/dropdown/faculty');
      if (facultyRes.ok) {
        const facultyData = await facultyRes.json();
        setFacultyOptions(facultyData.faculties || []);
      }

      // Departments are fetched based on faculty id; handled by fetchDepartmentsByFaculty

      // Fetch permanent designation options
      const permDesigRes = await fetch('/api/shared/dropdown/designation?type=permanent');
      if (permDesigRes.ok) {
        const permDesigData = await permDesigRes.json();
        setPermanentDesignationOptions(permDesigData.designations || []);
      }

      // Fetch temporary designation options
      const tempDesigRes = await fetch('/api/shared/dropdown/designation?type=temporary');
      if (tempDesigRes.ok) {
        const tempDesigData = await tempDesigRes.json();
        setTemporaryDesignationOptions(tempDesigData.designations || []);
      }

      // Fetch degree type options
      const degreeTypeRes = await fetch('/api/shared/dropdown/degreeType');
      if (degreeTypeRes.ok) {
        const degreeTypeData = await degreeTypeRes.json();
        setDegreeTypeOptions(degreeTypeData.degreeTypes || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      // Set dummy data as fallback
      setFacultyOptions([
        { Fid: 1, Fname: "Faculty of Science & Technology" },
        { Fid: 2, Fname: "Faculty of Arts" },
        { Fid: 3, Fname: "Faculty of Commerce" }
      ]);
      setDepartmentOptions([
        { Deptid: 1, name: "Computer Science" },
        { Deptid: 2, name: "Mathematics" },
        { Deptid: 3, name: "Physics" }
      ]);
      setPermanentDesignationOptions([
        { id: 1, name: "Professor" },
        { id: 2, name: "Associate Professor" },
        { id: 3, name: "Assistant Professor" }
      ]);
      setTemporaryDesignationOptions([
        { id: 1, name: "Assistant Professor (Contract)" },
        { id: 2, name: "Lecturer" },
        { id: 3, name: "Visiting Faculty" }
      ]);
      setDegreeTypeOptions([
        { id: 1, name: "Post Graduate" },
        { id: 2, name: "Graduate" },
        { id: 3, name: "Diploma" }
      ]);
    }
  };

  // Fetch departments by faculty id
  const fetchDepartmentsByFaculty = async (fid: number) => {
    try {
      const res = await fetch(`/api/shared/dropdown/department?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartmentOptions(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      // Fallback dummy departments
      setDepartmentOptions([
        { Deptid: 1, name: 'Computer Science' },
        { Deptid: 2, name: 'Mathematics' },
        { Deptid: 3, name: 'Physics' },
      ]);
    }
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherId = user?.role_id || 1 // Replace with actual user id or fallback
        const res = await fetch(`/api/teacher/profile?teacherId=${teacherId}`)
        if (!res.ok) throw new Error("Failed to fetch teacher data")
  
        const data:TeacherData = await res.json()
        console.log(data)
        setTeacherInfo(data.teacherInfo) // setTeacherData is your state hook for storing fetched data
        setEducationData(data.graduationDetails)
        setExperienceData(data.teacherExperience)
        setPostDocData(data.postDoctoralExp)
        setFacultyData(data.faculty)
        setSelectedFacultyId(data.faculty?.Fid ?? null)
        setDepartmentData(data.department)
        setDesignationData(data.designation)
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
      } catch (error) {
        console.error("Error fetching teacher profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    if (isAuthenticated === false) {
      router.push("/teacher/dashboard")
    } else {
      fetchTeacherData()
      fetchDropdownData()
    }
  }, [isAuthenticated, router])

  // When faculty selection changes, fetch departments for that faculty
  useEffect(() => {
    if (selectedFacultyId && !Number.isNaN(selectedFacultyId)) {
      fetchDepartmentsByFaculty(selectedFacultyId)
    }
  }, [selectedFacultyId])
  

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
      Tid:1,
      upload:null,
      Employeer: "",
      currente: false,
      desig: "",
      Start_Date: "",
      End_Date: "",
      Nature: "",
      UG_PG: "",
    }
    setExperienceData([...experienceData, newEntry])
  }

  const updateExperienceEntry = (id: number, field: string, value: any) => {
    setExperienceData((prev) => prev.map((entry) => (entry.Id === id ? { ...entry, [field]: value } : entry)))
  }

  const removeExperienceEntry = (id: number) => {
    setExperienceData((prev) => prev.filter((entry) => entry.Id !== id))
  }

  const addPostDocEntry = () => {
    const newEntry: PostDocEntry = {
      Id: Date.now(),
      Tid:1,
      Institute: "",
      Start_Date: "",
      End_Date: "",
      SponsoredBy: "",
      QS_THE: "",
      doc: "",
    }
    setPostDocData([...postDocData, newEntry])
  }

  const updatePostDocEntry = (id: number, field: string, value: string) => {
    setPostDocData((prev) => prev.map((entry) => (entry.Id === id ? { ...entry, [field]: value } : entry)))
  }

  const removePostDocEntry = (id: number) => {
    setPostDocData((prev) => prev.filter((entry) => entry.Id !== id))
  }

  const addEducationEntry = () => {
    const newEntry: EducationEntry = {
      gid: Date.now(),
      tid:1,
      Image:null,
      QS_Ranking:"",
      degree_name: "",
      degree_type: 1,
      university_name: "",
      state: "",
      year_of_passing: "",
      subject: "",
    }
    setEducationData([...educationData, newEntry])
  }

  const updateEducationEntry = (id: number, field: string, value: string) => {
    setEducationData((prev) => prev.map((entry) => (entry.gid === id ? { ...entry, [field]: value } : entry)))
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

  const removeEducationEntry = (id: number) => {
    setEducationData((prev) => prev.filter((entry) => entry.gid !== id))
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

      // Here you would typically upload to your server
      // const formData = new FormData()
      // teacherInfo.append('profileImage', file)
      // await uploadProfileImage(formData)

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

  const handleSavePersonal = async () => {
    try {
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherInfo), // your state
      });
  
      const result = await response.json();
  
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your information has been saved successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };
  

  const handleCancelPersonal = () => {
    setIsEditingPersonal(false)
  }

  const handleSaveExperience = () => {
    console.log("Saving experience data:", experienceData)
    // Show success message
  }

  const handleSavePostDoc = () => {
    console.log("Saving post-doc data:", postDocData)
    // Show success message
  }

  const handleSaveEducation = () => {
    console.log("Saving education data:", educationData)
    // Show success message
  }

  const handleSaveAcademicYears = () => {
    console.log("Saving academic years data:", {
      NILL2016_17: teacherInfo?.NILL2016_17,
      NILL2017_18: teacherInfo?.NILL2017_18,
      NILL2018_19: teacherInfo?.NILL2018_19,
      NILL2019_20: teacherInfo?.NILL2019_20,
      NILL2020_21: teacherInfo?.NILL2020_21,
      NILL2021_22: teacherInfo?.NILL2021_22,
      NILL2022_23: teacherInfo?.NILL2022_23,
      NILL2023_24: teacherInfo?.NILL2023_24,
      NILL2024_25: teacherInfo?.NILL2024_25,
      NILL2025_26: teacherInfo?.NILL2025_26,
    })
    // Here you would typically make an API call to save the data
    // Show success message
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
   <div className="space-y-6 w-full max-w-full overflow-x-hidden">

       <div className="flex items-center justify-between px-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">View and manage your personal information</p>
          </div>

          {/* Generate CV Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => router.push("/teacher/generate-cv")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4" />
              Generate CV
            </Button>
          </div>
       </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal and academic details</CardDescription>
              </div>
              {!isEditingPersonal ? (
                <Button onClick={() => setIsEditingPersonal(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Personal Info
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSavePersonal} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelPersonal}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full">
              <div className="lg:col-span-3 space-y-6">
                
              {/* Profile Photo Section */}
              <div className="col-span-full lg:col-span-1 flex flex-col items-center space-y-4">

                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {teacherInfo?.ProfileImage ? (
                      <img
                        src={teacherInfo?.ProfileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="h-16 w-16 text-blue-400" />
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
                  <p className="font-medium">{`${teacherInfo?.Abbri} ${teacherInfo?.fname} ${teacherInfo?.lname}`}</p>
                  <p className="text-sm text-muted-foreground">{designationData?.name}</p>
                  <p className="text-sm text-muted-foreground">{departmentData?.name}</p>
                </div>
                {isEditingPersonal && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Click the camera icon to upload a profile picture</p>
                    <p className="text-xs text-gray-400">Supported: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                )}
                </div>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">Salutation</Label>
                    <Select
                      value={teacherInfo?.Abbri}
                      onValueChange={(value:any) => handleInputChange("Abbri", value)}
                    >
                      <SelectTrigger className={!isEditingPersonal ? "pointer-events-none" : undefined}>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={teacherInfo?.fname || ""}
                      onChange={(e) => {handleInputChange("fname", e.target.value) 
                        console.log(e.target.value);
                        console.log(isEditingPersonal);
                      }}
                      readOnly={!isEditingPersonal}
                    />
                    
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={teacherInfo?.mname || ""}
                      onChange={(e) => handleInputChange("mname", e.target.value)}
                      readOnly={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={teacherInfo?.lname || ""}
                      onChange={(e) => handleInputChange("lname", e.target.value)}
                      readOnly={!isEditingPersonal}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={teacherInfo?.email_id || ""}
                      onChange={(e) => handleInputChange("email_id", e.target.value)}
                      readOnly={!isEditingPersonal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="number"
                      value={teacherInfo?.phone_no || ""}
                      onChange={(e) => handleInputChange("phone_no", Number(e.target.value))}
                      readOnly={!isEditingPersonal}
                    />
                  </div>
                  
                </div>

                {/* Additional Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formatDateForInput(teacherInfo?.DOB)}
                        onChange={(e) => handleInputChange("DOB", e.target.value)}
                        readOnly={!isEditingPersonal}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfJoining">Date of Joining</Label>
                      <Input
                        id="dateOfJoining"
                        type="date"
                        value={formatDateForInput(teacherInfo?.recruit_date)}
                        onChange={(e) => handleInputChange("recruit_date", e.target.value)}
                        readOnly={!isEditingPersonal}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panNo">PAN Number</Label>
                      <Input
                        id="panNo"
                        value={teacherInfo?.PAN_No || ""}
                        onChange={(e) => handleInputChange("PAN_No", e.target.value)}
                        readOnly={!isEditingPersonal}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Teaching Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Teaching Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teachingStatus">Teaching Status</Label>
                      <Select
                        value={teacherInfo?.desig_perma ? "Permanent" : "Tenured"} // Default selection
                        onValueChange={(value:any) => {
                          // Update teaching status in teacherInfo
                          if (teacherInfo) {
                            setTeacherInfo({
                              ...teacherInfo,
                              perma_or_tenure: value === "Permanent",
                              desig_perma: value === "Permanent" ? teacherInfo?.desig_perma : 0,
                            });
                          }

                          // Reset designation when teaching status changes
                          handleInputChange("desig_perma",value);

                          // Optional: if you also store teachingStatus separately
                          handleInputChange("desig_perma", value);
                        }}
                      >
                        <SelectTrigger className={!isEditingPersonal ? "pointer-events-none" : undefined}>
                          <SelectValue placeholder="Select teaching status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tenured">Tenured</SelectItem>
                          <SelectItem value="Permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Select
                        value={designationData?.id?.toString() || ""}
                        onValueChange={(value:any) => handleInputChange("desig_perma", value)}
                      >
                        <SelectTrigger className={!isEditingPersonal ? "pointer-events-none" : undefined}>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherInfo?.desig_perma ? (
                            // Show permanent designations
                            permanentDesignationOptions.map((desig) => (
                              <SelectItem key={desig.id} value={desig.id.toString()}>
                                {desig.name}
                              </SelectItem>
                            ))
                          ) : (
                            // Show temporary designations
                            temporaryDesignationOptions.map((desig) => (
                              <SelectItem key={desig.id} value={desig.id.toString()}>
                                {desig.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faculty">Faculty</Label>
                      <Select
                        value={(selectedFacultyId ?? facultyData?.Fid)?.toString() || ""}
                        onValueChange={(value:any) => {
                          // handleInputChange("Fid", value)
                          const fidNum = Number(value)
                          setSelectedFacultyId(Number.isNaN(fidNum) ? null : fidNum)
                          // Reset selected department when faculty changes
                          handleInputChange("deptid", 0)
                          setDepartmentData(null)
                        }}
                      >
                        <SelectTrigger className={!isEditingPersonal ? "pointer-events-none" : undefined}>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {facultyOptions.map((faculty) => (
                            <SelectItem key={faculty.Fid} value={faculty.Fid.toString()}>
                              {faculty.Fname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={departmentData?.Deptid?.toString() || ""}
                        onValueChange={(value:any) => handleInputChange("deptid", value)}
                      >
                        <SelectTrigger className={!isEditingPersonal ? "pointer-events-none" : undefined}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept.Deptid} value={dept.Deptid.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Qualification Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Qualification Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Qualified NET Exam</Label>
                        <RadioGroup
                          value={teacherInfo?.NET ? "yes" : "no"}
                          onValueChange={(value:any) =>
                            handleInputChange("NET", value === "yes" ? true : false)
                          }
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
                      {teacherInfo?.NET && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="netYear">NET Qualified Year</Label>
                            <Input
                              id="netYear"
                              value={teacherInfo?.NET_year?.toString() || ""}
                              onChange={(e) => handleInputChange("NET_year", Number(e.target.value))}
                              readOnly={!isEditingPersonal}
                            />
                          </div>
                         
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Qualified GATE Exam</Label>
                        <RadioGroup
                          value={teacherInfo?.GATE ? "yes" : "no"}
                          onValueChange={(value:any) =>
                            handleInputChange("GATE", value === "yes" ? true : false)
                          }
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
                      {teacherInfo?.GATE && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="gateYear">GATE Qualified Year</Label>
                            <Input
                              id="gateYear"
                              value={teacherInfo?.GATE_year || 0}
                              onChange={(e) => handleInputChange("GATE_year", Number(e.target.value))}
                              readOnly={!isEditingPersonal}
                              placeholder="e.g., 2018"
                            />
                          </div>
                         
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Registration Information</h3>
                  <div className="space-y-2">
                    <Label>Registered Guide at MSU</Label>
                    <RadioGroup
                      value={teacherInfo?.PHDGuide ? "yes" : "no"}
                      onValueChange={(value:any) =>
                        handleInputChange("PHDGuide", value === "yes" ? true : false)
                      }
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
                  {teacherInfo?.PHDGuide && (
                    <div className="space-y-2">
                      <Label htmlFor="registrationYear">Year of Registration</Label>
                      <Input
                        id="registrationYear"
                        value={teacherInfo?.Guide_year || 0}
                        onChange={(e) => handleInputChange("Guide_year", Number(e.target.value))}
                        readOnly={!isEditingPersonal}
                      />
                    </div>
                  )}
                </div>

                {/* ICT in Teaching */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Use of ICT in Teaching</h3>
                  <div className="space-y-4">
                    <Label>Technologies Used for Teaching (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="smartBoard"
                          checked={editingData.ictSmartBoard}
                          onChange={(e:any) => handleCheckboxChange("ictSmartBoard", e.target.checked)}
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
                          onChange={(e:any) => handleCheckboxChange("ictPowerPoint", e.target.checked)}
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
                          onChange={(e:any) => handleCheckboxChange("ictTools", e.target.checked)}
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
                          onChange={(e:any) => handleCheckboxChange("ictELearningTools", e.target.checked)}
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
                          onChange={(e:any) => handleCheckboxChange("ictOnlineCourse", e.target.checked)}
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
                          className="max-w-md"
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Experience Details</CardTitle>
                <CardDescription>Your professional work experience</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addExperienceEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
                <Button
                  onClick={handleSaveExperience}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Currently Employed?</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Date of Joining</TableHead>
                    <TableHead>Date of Relieving</TableHead>
                    <TableHead>Nature of Job</TableHead>
                    <TableHead>Type of Teaching</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experienceData.map((entry, index) => {
                    const rowEditing = experienceEditingIds.has(entry.Id);
                    return (
                    <TableRow key={entry.Id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={entry?.Employeer || ""}
                          onChange={(e) => updateExperienceEntry(entry.Id, "employer", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.currente ? "yes" : "no"}
                          onValueChange={(value:any) =>
                            updateExperienceEntry(entry.Id, "currentlyEmployed", value === "yes")
                          }
                        >
                          <SelectTrigger className={`min-w-[100px] ${!rowEditing ? "pointer-events-none" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry?.desig || ""}
                          onChange={(e) => updateExperienceEntry(entry.Id, "designation", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formatDateForInput(entry.Start_Date)}
                          onChange={(e) => updateExperienceEntry(entry.Id, "dateOfJoining", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formatDateForInput(entry.End_Date)}
                          onChange={(e) => updateExperienceEntry(entry.Id, "dateOfRelieving", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing || entry.currente}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.Nature}
                          onValueChange={(value:any) => updateExperienceEntry(entry.Id, "natureOfJob", value)}
                        >
                          <SelectTrigger className={`min-w-[150px] ${!rowEditing ? "pointer-events-none" : ""}`}>
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
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry?.UG_PG || ""}
                          onValueChange={(value:any) =>
                            updateExperienceEntry(entry.Id, "typeOfTeaching", value)
                          }
                        >
                          <SelectTrigger className={`min-w-[120px] ${!rowEditing ? "pointer-events-none" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UG">UG</SelectItem>
                            <SelectItem value="PG">PG</SelectItem>
                            <SelectItem value="UG & PG">UG & PG</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => toggleExperienceRowEdit(entry.Id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removeExperienceEntry(entry.Id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => toggleExperienceRowEdit(entry.Id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toggleExperienceRowEdit(entry.Id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Post Doctoral Research Experience - Always Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Post Doctoral Research Experience</CardTitle>
                <CardDescription>Your post-doctoral research positions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addPostDocEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Post-Doc
                </Button>
                <Button
                  onClick={handleSavePostDoc}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr No.</TableHead>
                    <TableHead>Institute / Industry</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Sponsored By</TableHead>
                    <TableHead>QS / THE World University Ranking</TableHead>
                    <TableHead>Supporting Document</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postDocData.map((entry, index) => {
                    const rowEditing = postDocEditingIds.has(entry.Id);
                    return (
                    <TableRow key={entry.Id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={entry?.Institute || ""}
                          onChange={(e) => updatePostDocEntry(entry.Id, "institute", e.target.value)}
                          className="min-w-[200px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formatDateForInput(entry.Start_Date)}
                          onChange={(e) => updatePostDocEntry(entry.Id, "startDate", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={formatDateForInput(entry.End_Date)}
                          onChange={(e) => updatePostDocEntry(entry.Id, "endDate", e.target.value)}
                          className="min-w-[150px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry?.SponsoredBy || ""}
                          onChange={(e) => updatePostDocEntry(entry.Id, "sponsoredBy", e.target.value)}
                          className="min-w-[150px]"
                          placeholder="e.g., UGC, CSIR"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={entry?.QS_THE || ""}
                          onChange={(e) => updatePostDocEntry(entry.Id, "ranking", e.target.value)}
                          className="min-w-[200px]"
                          placeholder="e.g., QS Ranking: 172"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={entry?.doc || ""}
                            onChange={(e) => updatePostDocEntry(entry.Id, "supportingDocument", e.target.value)}
                            className="min-w-[150px]"
                            placeholder="Document name"
                            readOnly={!rowEditing}
                          />
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => togglePostDocRowEdit(entry.Id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removePostDocEntry(entry.Id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => togglePostDocRowEdit(entry.Id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => togglePostDocRowEdit(entry.Id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Education Details - Always Editable */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Education Details</CardTitle>
                <CardDescription>Your academic qualifications</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={addEducationEntry} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
                <Button
                  onClick={handleSaveEducation}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {educationData.map((entry, index) => {
                    const rowEditing = educationEditingIds.has(entry.gid);
                    return (
                    <TableRow key={entry.gid}>
                      <TableCell>{index + 1}</TableCell>
                       
                      <TableCell>
                        <Select
                          value={entry.degree_type.toString()}
                          onValueChange={(value:any) => updateEducationEntry(entry.gid, "degreeType", value)}
                        >
                          <SelectTrigger className={`min-w-[140px] ${!rowEditing ? "pointer-events-none" : ""}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {degreeTypeOptions.map((degreeType) => (
                              <SelectItem key={degreeType.id} value={degreeType.id.toString()}>
                                {degreeType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                 
                      <TableCell>
                        <Input
                          value={entry.university_name}
                          onChange={(e) => updateEducationEntry(entry.gid, "university", e.target.value)}
                          className="min-w-[200px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                      <input
                        type="text"
                        value={entry?.state || ""}
                        onChange={(e) => updateEducationEntry(entry.gid, "state", e.target.value)}
                        className={`min-w-[140px] border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !rowEditing ? "pointer-events-none bg-gray-100 text-gray-500" : ""
                        }`}
                        placeholder="Enter state"
                      />
                    </TableCell>

                      <TableCell>
                      <Input
                        type="text"
                        value={
                          entry.year_of_passing
                            ? new Date(entry.year_of_passing).getFullYear().toString()
                            : ""
                        }
                        onChange={(e) => {
                          const year = e.target.value.replace(/\D/g, "").slice(0, 4);
                          updateEducationEntry(entry.gid, "year_of_passing", `${year}-01-01`);
                        }}
                        className="min-w-[120px]"
                        placeholder="YYYY"
                        readOnly={!rowEditing}
                      />

                      </TableCell>
                     
                      <TableCell>
                        <Input
                          value={entry?.subject || ""}
                          onChange={(e) => updateEducationEntry(entry.gid, "specialization", e.target.value)}
                          className="min-w-[200px]"
                          readOnly={!rowEditing}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={entry?.QS_Ranking || ""}
                          onChange={(e) => updateEducationEntry(entry.gid, "QS_Ranking", e.target.value)}
                          className="min-w-[120px]"
                          placeholder="YYYY"
                          readOnly={!rowEditing}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!rowEditing ? (
                            <>
                              <Button size="sm" onClick={() => toggleEducationRowEdit(entry.gid)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => removeEducationEntry(entry.gid)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => toggleEducationRowEdit(entry.gid)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toggleEducationRowEdit(entry.gid)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year Information Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Academic Year Information Availability</CardTitle>
                <CardDescription>
                  Academic Year Information Activity - Please tick if you DON'T have any information to submit in the
                  following academic years
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAcademicYears}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ay2016-17"
                    checked={teacherInfo?.NILL2016_17 || false}
                    onChange={(e) => {
                      if (teacherInfo) {
                        setTeacherInfo({...teacherInfo, NILL2016_17: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2017_18: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2018_19: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2019_20: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2020_21: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2021_22: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2022_23: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2023_24: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2024_25: e.target.checked});
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
                        setTeacherInfo({...teacherInfo, NILL2025_26: e.target.checked});
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
  )
}
