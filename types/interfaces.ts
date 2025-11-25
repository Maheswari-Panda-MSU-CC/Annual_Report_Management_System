// src/types/interfaces.ts

import { UseFormReturn } from "react-hook-form"

// ---------- Personal Information ----------
export interface TeacherInfo {
    Tid: number
    fname: string
    mname: string
    lname: string
    deptid: number
    NET: boolean
    PET: boolean
    recruit_date: string
    perma_or_tenure: boolean
    desig_perma: number
    desig_tenure: number
    phone_no: number
    email_id: string
    NET_year: number
    PET_year: number
    GATE: boolean
    GATE_year: number
    Abbri: string
    PAN_No: string
    DOB: string
    PHDGuide: boolean
    OtherGuide: boolean
    ICT_Use: boolean | null
    ICT_Details: string | null
    NILL2016_17: boolean
    NILL2017_18: boolean
    NILL2018_19: boolean
    NILL2019_20: boolean
    NILL2020_21: boolean
    NILL2021_22: boolean
    NILL2022_23: boolean
    NILL2023_24: boolean
    NILL2024_25: boolean
    NILL2025_26: boolean
    Disabled: boolean
    H_INDEX: number
    i10_INDEX: number
    CITIATIONS: number
    ORCHID_ID: string
    RESEARCHER_ID: string
    Guide_year: number
    Status: string
    ProfileImage: string | null
  }
  
  // ---------- Department ----------
  export interface Department {
    Deptid: number
    Fid: number
    name: string
    email_id: string
  }
  
  // ---------- Faculty ----------
  export interface Faculty {
    Fid: number
    Fname: string
    email_id: string
  }
  
  // ---------- Designation ----------
  export interface Designation {
    id: number
    name: string
  }
  
  // ---------- Experience ----------
  export interface ExperienceEntry {
    Id: number
    Tid: number
    Employeer: string
    Start_Date: string
    End_Date: string 
    Nature: string
    UG_PG: string
    upload: string | null
    currente: boolean
    desig: string
  }
  
  // ---------- Post Doctoral ----------
  export interface PostDocEntry {
    Id: number,
    Tid:number,
    Institute: string
    Start_Date: string
    End_Date: string
    SponsoredBy: string
    QS_THE: string
    doc: string
  }
  
  // ---------- Graduation Details ----------
  export interface EducationEntry {
    gid: number
    tid: number
    degree_type: number
    degree_name: string
    university_name: string
    state: string
    year_of_passing: string
    Image: string | null
    QS_Ranking: string | null
    subject: string | null
  }
  
  // ---------- Full Teacher Data ----------
  export interface TeacherData {
    teacherInfo: TeacherInfo
    department: Department
    faculty: Faculty
    designation: Designation
    teacherExperience: ExperienceEntry[]
    postDoctoralExp: PostDocEntry[]
    graduationDetails: EducationEntry[]
  }
  

  // Dropdown data interfaces
export interface DropdownOption {
  id: number
  name: string
}

export interface FacultyOption {
  Fid: number
  Fname: string
}

export interface DepartmentOption {
  Deptid: number
  name: string
}

export interface DesignationOption {
  id: number
  name: string
}

export interface DegreeTypeOption {
  id: number
  name: string
}

export interface UserType{
  id:number
  name:string
}

// ---------- Research Project Interfaces ----------
export interface ResearchProject {
  projid: number
  title: string
  funding_agency: number
  funding_agency_name?: string
  grant_sanctioned?: number
  grant_received?: number
  grant_year?: number
  grant_sealed?: boolean
  document?: string
  proj_nature?: number
  proj_nature_name?: string
  duration?: number
  status: number
  status_name?: string
  start_date: string
  proj_level?: number
  proj_level_name?: string
}

export interface ResearchProjectFormData {
  title: string
  funding_agency: number | null
  grant_sanctioned: string
  grant_received: string
  proj_nature: number | null
  duration: number
  status: number | null
  start_date: string
  proj_level: number | null
  grant_year: string
  grant_sealed: boolean
  Pdf: string
}

export interface ResearchMetrics {
  hIndex: number
  i10Index: number
  citations: number
  orcidId: string
  researcherId: string
}

// ---------- Patent Form ----------
export interface PatentFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  resPubLevelOptions?: Array<{ id: number; name: string }>
  patentStatusOptions?: Array<{ id: number; name: string }>
  initialDocumentUrl?: string
}

// ---------- Policy Form ----------
export interface PolicyFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  resPubLevelOptions?: Array<{ id: number; name: string }>
  initialDocumentUrl?: string
}

// ---------- E-Content Form ----------
export interface EContentFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  eContentTypeOptions?: Array<{ id: number; name: string }>
  typeEcontentValueOptions?: Array<{ id: number; name: string }>
  initialDocumentUrl?: string
}

// ---------- Consultancy Form ----------
export interface ConsultancyFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
  isExtracting?: boolean
  selectedFiles?: FileList | null
  handleFileSelect?: (files: FileList | null) => void
  handleExtractInfo?: () => void
  isEdit?: boolean
  editData?: Record<string, any>
  initialDocumentUrl?: string
}