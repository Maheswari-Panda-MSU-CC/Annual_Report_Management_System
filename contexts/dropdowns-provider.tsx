"use client"

import { createContext, useContext, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { DegreeTypeOption, DepartmentOption, DesignationOption, FacultyOption, UserType } from "@/types/interfaces"

export interface DropdownOption {
  id: number
  name: string
}

interface DropdownsData {
  faculties: FacultyOption[]
  departments: DepartmentOption[]
  userTypes: UserType[]
  permanentDesignations: DesignationOption[]
  temporaryDesignations: DesignationOption[]
  degreeTypes: DegreeTypeOption[]
  projectStatuses: DropdownOption[]
  projectLevels: DropdownOption[]
  fundingAgencies: DropdownOption[]
  projectNatures: DropdownOption[]
  bookTypes: DropdownOption[]
  journalEditedTypes: DropdownOption[]
  resPubLevels: DropdownOption[]
  journalAuthorTypes: DropdownOption[]
  patentStatuses: DropdownOption[]
  eContentTypes: DropdownOption[]
  typeEcontentValues: DropdownOption[]
  collaborationsLevels: DropdownOption[]
  collaborationsOutcomes: DropdownOption[]
  collaborationsTypes: DropdownOption[]
  academicVisitRoles: DropdownOption[]
  financialSupportTypes: DropdownOption[]
  jrfSrfTypes: DropdownOption[]
  phdGuidanceStatuses: DropdownOption[]
  refresherTypes: DropdownOption[]
  academicProgrammes: DropdownOption[]
  participantTypes: DropdownOption[]
  reportYears: DropdownOption[]
  committeeLevels: DropdownOption[]
  talksProgrammeTypes: DropdownOption[]
  talksParticipantTypes: DropdownOption[]
  awardFellowLevels: DropdownOption[]
  sponserNames: DropdownOption[]
}

interface DropdownsContextType {
  data: DropdownsData
  isLoading: boolean
  error: Error | null
}

const DropdownsContext = createContext<DropdownsContextType | undefined>(undefined)

// Cache time for dropdowns - 30 minutes (dropdowns rarely change)
const DROPDOWN_CACHE_TIME = 30 * 60 * 1000

// Fetch all dropdowns in one batched API call
// Fetches both shared and teacher-specific dropdowns
// For other modules, they can call with their specific modules parameter
const fetchAllDropdowns = async (): Promise<DropdownsData> => {
  // Fetch both shared and teacher dropdowns (teacher module needs both)
  // Other modules can modify this to fetch their specific modules
  const response = await fetch('/api/shared/dropdown/all?modules=shared,teacher')
  if (!response.ok) {
    throw new Error('Failed to fetch dropdowns')
  }
  const result = await response.json()
  
  // Handle both flattened (backward compatibility) and structured responses
  // If result has shared/teacher structure, extract from there
  // Otherwise, assume flattened structure (backward compatibility)
  const shared = result.shared || {};
  const teacher = result.teacher || {};
  
  // Return with default empty arrays if any field is missing
  return {
    // Shared dropdowns
    faculties: shared.faculties || result.faculties || [],
    departments: [], // Dynamic, fetched per faculty
    userTypes: [], // Admin only
    permanentDesignations: shared.permanentDesignations || result.permanentDesignations || [],
    temporaryDesignations: shared.temporaryDesignations || result.temporaryDesignations || [],
    degreeTypes: shared.degreeTypes || result.degreeTypes || [],
    // Teacher dropdowns
    projectStatuses: teacher.projectStatuses || result.projectStatuses || [],
    projectLevels: teacher.projectLevels || result.projectLevels || [],
    fundingAgencies: teacher.fundingAgencies || result.fundingAgencies || [],
    projectNatures: teacher.projectNatures || result.projectNatures || [],
    bookTypes: teacher.bookTypes || result.bookTypes || [],
    journalEditedTypes: teacher.journalEditedTypes || result.journalEditedTypes || [],
    resPubLevels: teacher.resPubLevels || result.resPubLevels || [],
    journalAuthorTypes: teacher.journalAuthorTypes || result.journalAuthorTypes || [],
    patentStatuses: teacher.patentStatuses || result.patentStatuses || [],
    eContentTypes: teacher.eContentTypes || result.eContentTypes || [],
    typeEcontentValues: teacher.typeEcontentValues || result.typeEcontentValues || [],
    collaborationsLevels: teacher.collaborationsLevels || result.collaborationsLevels || [],
    collaborationsOutcomes: teacher.collaborationsOutcomes || result.collaborationsOutcomes || [],
    collaborationsTypes: teacher.collaborationsTypes || result.collaborationsTypes || [],
    academicVisitRoles: teacher.academicVisitRoles || result.academicVisitRoles || [],
    financialSupportTypes: teacher.financialSupportTypes || result.financialSupportTypes || [],
    jrfSrfTypes: teacher.jrfSrfTypes || result.jrfSrfTypes || [],
    phdGuidanceStatuses: teacher.phdGuidanceStatuses || result.phdGuidanceStatuses || [],
    refresherTypes: teacher.refresherTypes || result.refresherTypes || [],
    academicProgrammes: teacher.academicProgrammes || result.academicProgrammes || [],
    participantTypes: teacher.participantTypes || result.participantTypes || [],
    reportYears: teacher.reportYears || result.reportYears || [],
    committeeLevels: teacher.committeeLevels || result.committeeLevels || [],
    talksProgrammeTypes: teacher.talksProgrammeTypes || result.talksProgrammeTypes || [],
    talksParticipantTypes: teacher.talksParticipantTypes || result.talksParticipantTypes || [],
    awardFellowLevels: teacher.awardFellowLevels || result.awardFellowLevels || [],
    sponserNames: teacher.sponserNames || result.sponserNames || [],
  }
}

export function DropdownsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Only fetch dropdowns when user is logged in
  const { data, isLoading, error } = useQuery({
    queryKey: ['dropdowns', 'all'],
    queryFn: fetchAllDropdowns,
    enabled: !!user, // Only fetch when user is logged in
    staleTime: DROPDOWN_CACHE_TIME,
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  })

  // Provide default empty data structure
  const defaultData: DropdownsData = {
    faculties: [],
    departments: [],
    userTypes: [],
    permanentDesignations: [],
    temporaryDesignations: [],
    degreeTypes: [],
    projectStatuses: [],
    projectLevels: [],
    fundingAgencies: [],
    projectNatures: [],
    bookTypes: [],
    journalEditedTypes: [],
    resPubLevels: [],
    journalAuthorTypes: [],
    patentStatuses: [],
    eContentTypes: [],
    typeEcontentValues: [],
    collaborationsLevels: [],
    collaborationsOutcomes: [],
    collaborationsTypes: [],
    academicVisitRoles: [],
    financialSupportTypes: [],
    jrfSrfTypes: [],
    phdGuidanceStatuses: [],
    refresherTypes: [],
    academicProgrammes: [],
    participantTypes: [],
    reportYears: [],
    committeeLevels: [],
    talksProgrammeTypes: [],
    talksParticipantTypes: [],
    awardFellowLevels: [],
    sponserNames: [],
  }

  return (
    <DropdownsContext.Provider
      value={{
        data: data || defaultData,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </DropdownsContext.Provider>
  )
}

export function useDropdownsContext() {
  const context = useContext(DropdownsContext)
  if (context === undefined) {
    throw new Error('useDropdownsContext must be used within DropdownsProvider')
  }
  return context
}

