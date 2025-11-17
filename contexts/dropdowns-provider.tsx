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
const fetchAllDropdowns = async (): Promise<DropdownsData> => {
  const response = await fetch('/api/shared/dropdown/all')
  if (!response.ok) {
    throw new Error('Failed to fetch dropdowns')
  }
  const result = await response.json()
  
  // Return with default empty arrays if any field is missing
  return {
    faculties: result.faculties || [],
    departments: [],
    userTypes: [],
    permanentDesignations: result.permanentDesignations || [],
    temporaryDesignations: result.temporaryDesignations || [],
    degreeTypes: result.degreeTypes || [],
    projectStatuses: result.projectStatuses || [],
    projectLevels: result.projectLevels || [],
    fundingAgencies: result.fundingAgencies || [],
    projectNatures: result.projectNatures || [],
    bookTypes: result.bookTypes || [],
    journalEditedTypes: result.journalEditedTypes || [],
    resPubLevels: result.resPubLevels || [],
    journalAuthorTypes: result.journalAuthorTypes || [],
    patentStatuses: result.patentStatuses || [],
    eContentTypes: result.eContentTypes || [],
    typeEcontentValues: result.typeEcontentValues || [],
    collaborationsLevels: result.collaborationsLevels || [],
    collaborationsOutcomes: result.collaborationsOutcomes || [],
    collaborationsTypes: result.collaborationsTypes || [],
    academicVisitRoles: result.academicVisitRoles || [],
    financialSupportTypes: result.financialSupportTypes || [],
    jrfSrfTypes: result.jrfSrfTypes || [],
    phdGuidanceStatuses: result.phdGuidanceStatuses || [],
    refresherTypes: result.refresherTypes || [],
    academicProgrammes: result.academicProgrammes || [],
    participantTypes: result.participantTypes || [],
    reportYears: result.reportYears || [],
    committeeLevels: result.committeeLevels || [],
    talksProgrammeTypes: result.talksProgrammeTypes || [],
    talksParticipantTypes: result.talksParticipantTypes || [],
    awardFellowLevels: result.awardFellowLevels || [],
    sponserNames: result.sponserNames || [],
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

