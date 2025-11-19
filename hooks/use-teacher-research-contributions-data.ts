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

// API Fetch Helper - Removed cache busting for better performance
// React Query handles caching, so we don't need cache busting or no-store
const fetchAPI = async (url: string) => {
  const response = await fetch(url, {
    // Let browser and React Query handle caching
    // Removed 'no-store' and cache busters for better performance
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch data" }))
    throw new Error(error.error || "Failed to fetch data")
  }
  return response.json()
}

/**
 * Generic hook to fetch research contributions data for a specific section
 * @param sectionId - The section identifier
 * @param resPubLevelOptions - Optional level options for policy section
 * @param options - Optional query options including enabled flag for lazy loading
 */
export function useTeacherResearchContributions(
  sectionId: SectionId, 
  resPubLevelOptions?: any[],
  options?: { enabled?: boolean }
) {
  const { user } = useAuth()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  // Determine if query should be enabled
  const isEnabled = (!!teacherId && teacherId > 0) && (options?.enabled !== false)

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
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - increased for better caching
    gcTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    refetchOnMount: false, // Don't refetch if data is fresh (was causing delays)
    refetchOnWindowFocus: false,
  })
}

/**
 * Individual hooks for each section (for convenience)
 * All hooks now support lazy loading via options parameter
 */
export function useTeacherPatents(resPubLevelOptions?: any[], options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('patents', resPubLevelOptions, options)
}

export function useTeacherPolicy(resPubLevelOptions?: any[], options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('policy', resPubLevelOptions, options)
}

export function useTeacherEContent(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('econtent', undefined, options)
}

export function useTeacherConsultancy(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('consultancy', undefined, options)
}

export function useTeacherCollaborations(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('collaborations', undefined, options)
}

export function useTeacherVisits(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('visits', undefined, options)
}

export function useTeacherFinancial(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('financial', undefined, options)
}

export function useTeacherJrfSrf(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('jrfSrf', undefined, options)
}

export function useTeacherPhd(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('phd', undefined, options)
}

export function useTeacherCopyrights(options?: { enabled?: boolean }) {
  return useTeacherResearchContributions('copyrights', undefined, options)
}

