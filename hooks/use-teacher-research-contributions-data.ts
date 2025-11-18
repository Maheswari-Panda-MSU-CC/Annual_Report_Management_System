import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { API_ENDPOINTS, type SectionId } from "@/app/(dashboards)/teacher/research-contributions/utils/research-contributions-config"
import { API_DATA_KEYS, DATA_MAPPERS } from "@/app/(dashboards)/teacher/research-contributions/utils/data-mappers"

// Query Keys - Centralized for consistency
export const researchContributionsQueryKeys = {
  all: (teacherId: number) => ['teacher', teacherId, 'research-contributions'] as const,
  section: (teacherId: number, sectionId: SectionId) => 
    ['teacher', teacherId, 'research-contributions', sectionId] as const,
  patents: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'patents'] as const,
  policy: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'policy'] as const,
  econtent: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'econtent'] as const,
  consultancy: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'consultancy'] as const,
  collaborations: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'collaborations'] as const,
  visits: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'visits'] as const,
  financial: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'financial'] as const,
  jrfSrf: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'jrfSrf'] as const,
  phd: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'phd'] as const,
  copyrights: (teacherId: number) => 
    ['teacher', teacherId, 'research-contributions', 'copyrights'] as const,
}

// API Fetch Helper
const fetchAPI = async (url: string) => {
  const separator = url.includes('?') ? '&' : '?'
  const cacheBuster = `${separator}_cb=${Date.now()}`
  const response = await fetch(`${url}${cacheBuster}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch data" }))
    throw new Error(error.error || "Failed to fetch data")
  }
  return response.json()
}

/**
 * Generic hook to fetch research contributions data for a specific section
 */
export function useTeacherResearchContributions(sectionId: SectionId, resPubLevelOptions?: any[]) {
  const { user } = useAuth()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  return useQuery({
    queryKey: researchContributionsQueryKeys.section(teacherId, sectionId),
    queryFn: async () => {
      const endpoint = API_ENDPOINTS[sectionId]
      const dataKey = API_DATA_KEYS[sectionId]
      const mapper = DATA_MAPPERS[sectionId]

      const data = await fetchAPI(`${endpoint}?teacherId=${teacherId}`)
      
      if (!data.success) {
        throw new Error(data.error || `Failed to fetch ${sectionId} records`)
      }

      // Map database fields to UI format
      const mappedData = (data[dataKey] || []).map((item: any, index: number) => mapper(item, index))

      // Special handling for policies (resolve level IDs)
      if (sectionId === 'policy' && resPubLevelOptions) {
        return mappedData.map((policy: any) => {
          const levelOption = resPubLevelOptions.find(l => l.name === policy.level)
          return {
            ...policy,
            levelId: levelOption ? levelOption.id : null,
          }
        })
      }

      return mappedData
    },
    enabled: !!teacherId && teacherId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}

/**
 * Individual hooks for each section (for convenience)
 */
export function useTeacherPatents(resPubLevelOptions?: any[]) {
  return useTeacherResearchContributions('patents', resPubLevelOptions)
}

export function useTeacherPolicy(resPubLevelOptions?: any[]) {
  return useTeacherResearchContributions('policy', resPubLevelOptions)
}

export function useTeacherEContent() {
  return useTeacherResearchContributions('econtent')
}

export function useTeacherConsultancy() {
  return useTeacherResearchContributions('consultancy')
}

export function useTeacherCollaborations() {
  return useTeacherResearchContributions('collaborations')
}

export function useTeacherVisits() {
  return useTeacherResearchContributions('visits')
}

export function useTeacherFinancial() {
  return useTeacherResearchContributions('financial')
}

export function useTeacherJrfSrf() {
  return useTeacherResearchContributions('jrfSrf')
}

export function useTeacherPhd() {
  return useTeacherResearchContributions('phd')
}

export function useTeacherCopyrights() {
  return useTeacherResearchContributions('copyrights')
}

