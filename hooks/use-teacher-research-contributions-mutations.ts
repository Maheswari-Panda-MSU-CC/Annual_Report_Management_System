import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { researchContributionsQueryKeys } from "./use-teacher-research-contributions-data"
import { useToast } from "@/components/ui/use-toast"
import { API_ENDPOINTS, DELETE_CONFIG, type SectionId } from "@/app/(dashboards)/teacher/research-contributions/utils/research-contributions-config"
import { UPDATE_REQUEST_BODIES, UPDATE_SUCCESS_MESSAGES } from "@/app/(dashboards)/teacher/research-contributions/utils/update-mappers"

/**
 * Generic mutation hook for research contributions
 */
export function useResearchContributionsMutations(sectionId: SectionId) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id 
    ? parseInt(user.role_id.toString()) 
    : parseInt(user?.id?.toString() || '0')

  // Map section IDs to their request body keys
  const getRequestBodyKey = (sectionId: SectionId): string => {
    const keyMap: Record<SectionId, string> = {
      patents: 'patent',
      policy: 'policy',
      econtent: 'eContent',
      consultancy: 'consultancy',
      collaborations: 'collaboration',
      visits: 'visit',
      financial: 'financialSupport',
      jrfSrf: 'jrfSrf',
      phd: 'phdStudent',
      copyrights: 'copyright',
    }
    return keyMap[sectionId]
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = API_ENDPOINTS[sectionId]
      const requestBodyKey = getRequestBodyKey(sectionId)
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, [requestBodyKey]: data }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to create ${sectionId} record`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.section(teacherId, sectionId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.all(teacherId)
      })
      toast({ 
        title: "Success", 
        description: `${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} added successfully!`,
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || `Failed to add ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = API_ENDPOINTS[sectionId]
      const requestBody = UPDATE_REQUEST_BODIES[sectionId](id, teacherId, data)
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to update ${sectionId} record`)
      }
      return res.json()
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: researchContributionsQueryKeys.section(teacherId, sectionId) 
      })
      
      const previousData = queryClient.getQueryData(
        researchContributionsQueryKeys.section(teacherId, sectionId)
      )
      
      queryClient.setQueryData(
        researchContributionsQueryKeys.section(teacherId, sectionId),
        (old: any) => {
          if (!old) return old
          return old.map((item: any) =>
            item.id === id ? { ...item, ...data } : item
          )
        }
      )
      
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          researchContributionsQueryKeys.section(teacherId, sectionId),
          context.previousData
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || `Failed to update ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.section(teacherId, sectionId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.all(teacherId)
      })
      toast({ 
        title: "Success", 
        description: UPDATE_SUCCESS_MESSAGES[sectionId],
        duration: 3000,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const config = DELETE_CONFIG[sectionId]
      const res = await fetch(`${config.endpoint}?${config.param}=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to delete ${sectionId} record`)
      }
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ 
        queryKey: researchContributionsQueryKeys.section(teacherId, sectionId) 
      })
      
      const previousData = queryClient.getQueryData(
        researchContributionsQueryKeys.section(teacherId, sectionId)
      )
      
      queryClient.setQueryData(
        researchContributionsQueryKeys.section(teacherId, sectionId),
        (old: any) => {
          if (!old) return old
          return old.filter((item: any) => item.id !== id)
        }
      )
      
      return { previousData }
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          researchContributionsQueryKeys.section(teacherId, sectionId),
          context.previousData
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || `Failed to delete ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.section(teacherId, sectionId),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({ 
        queryKey: researchContributionsQueryKeys.all(teacherId)
      })
      toast({ 
        title: "Success", 
        description: DELETE_CONFIG[sectionId].successMessage,
        duration: 3000,
      })
    },
  })

  return { 
    create: createMutation, 
    update: updateMutation, 
    delete: deleteMutation 
  }
}

/**
 * Individual mutation hooks for each section
 */
export function usePatentMutations() {
  return useResearchContributionsMutations('patents')
}

export function usePolicyMutations() {
  return useResearchContributionsMutations('policy')
}

export function useEContentMutations() {
  return useResearchContributionsMutations('econtent')
}

export function useConsultancyMutations() {
  return useResearchContributionsMutations('consultancy')
}

export function useCollaborationMutations() {
  return useResearchContributionsMutations('collaborations')
}

export function useVisitMutations() {
  return useResearchContributionsMutations('visits')
}

export function useFinancialMutations() {
  return useResearchContributionsMutations('financial')
}

export function useJrfSrfMutations() {
  return useResearchContributionsMutations('jrfSrf')
}

export function usePhdMutations() {
  return useResearchContributionsMutations('phd')
}

export function useCopyrightMutations() {
  return useResearchContributionsMutations('copyrights')
}
