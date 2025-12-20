import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { teacherQueryKeys } from "./use-teacher-data"
import { useToast } from "@/components/ui/use-toast"
import { createAbortController } from "@/lib/request-controller"

type SectionId = "refresher" | "academic-programs" | "academic-bodies" | "committees" | "talks"

// API Endpoints
const API_ENDPOINTS: Record<SectionId, string> = {
  refresher: "/api/teacher/talks-events/refresher-details",
  "academic-programs": "/api/teacher/talks-events/academic-contri",
  "academic-bodies": "/api/teacher/talks-events/acad-bodies-parti",
  committees: "/api/teacher/talks-events/parti-university-committes",
  talks: "/api/teacher/talks-events/teacher-talks",
}

// Delete endpoint configurations
const DELETE_CONFIG: Record<SectionId, { endpoint: string; param: string; successMessage: string }> = {
  refresher: {
    endpoint: "/api/teacher/talks-events/refresher-details",
    param: "refresherDetailId",
    successMessage: "Refresher detail deleted successfully!",
  },
  "academic-programs": {
    endpoint: "/api/teacher/talks-events/academic-contri",
    param: "academicContriId",
    successMessage: "Academic contribution deleted successfully!",
  },
  "academic-bodies": {
    endpoint: "/api/teacher/talks-events/acad-bodies-parti",
    param: "partiAcadsId",
    successMessage: "Academic bodies participation deleted successfully!",
  },
  committees: {
    endpoint: "/api/teacher/talks-events/parti-university-committes",
    param: "partiCommiId",
    successMessage: "University committee participation deleted successfully!",
  },
  talks: {
    endpoint: "/api/teacher/talks-events/teacher-talks",
    param: "teacherTalkId",
    successMessage: "Teacher talk deleted successfully!",
  },
}

// Get query key for a section
const getQueryKey = (teacherId: number, sectionId: SectionId) => {
  if (sectionId === "refresher") {
    return teacherQueryKeys.talks.refresher(teacherId)
  } else if (sectionId === "talks") {
    return teacherQueryKeys.talks.talks(teacherId)
  } else if (sectionId === "academic-programs") {
    return [...teacherQueryKeys.talks.all(teacherId), "academic-contri"]
  } else if (sectionId === "academic-bodies") {
    return [...teacherQueryKeys.talks.all(teacherId), "academic-participation"]
  } else if (sectionId === "committees") {
    return [...teacherQueryKeys.talks.all(teacherId), "committees"]
  }
  return teacherQueryKeys.talks.all(teacherId)
}

// Get request body key for a section
const getRequestBodyKey = (sectionId: SectionId): string => {
  const keyMap: Record<SectionId, string> = {
    refresher: "refresherDetail",
    "academic-programs": "academicContri",
    "academic-bodies": "partiAcads",
    committees: "partiCommi",
    talks: "teacherTalk",
  }
  return keyMap[sectionId]
}

// Get update request body for a section
const getUpdateRequestBody = (sectionId: SectionId, id: number, data: any) => {
  if (sectionId === "refresher") {
    return {
      refresherDetailId: id,
      refresherDetail: data,
    }
  } else if (sectionId === "academic-programs") {
    return {
      academicContriId: id,
      academicContri: data,
    }
  } else if (sectionId === "academic-bodies") {
    return {
      partiAcadsId: id,
      partiAcads: data,
    }
  } else if (sectionId === "committees") {
    return {
      partiCommiId: id,
      partiCommi: data,
    }
  } else if (sectionId === "talks") {
    return {
      teacherTalkId: id,
      teacherTalk: data,
    }
  }
  return { data }
}

/**
 * Generic mutation hook for talks-events sections
 */
export function useTalksEventsMutations(sectionId: SectionId) {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const teacherId: number = user?.role_id
    ? parseInt(user.role_id.toString())
    : parseInt(user?.id?.toString() || "0")

  const handleUnauthorized = (error: Error) => {
    const message = error?.message || ""
    if (message.includes("Unauthorized") || message.includes("401")) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
        duration: 5000,
      })
      logout?.()
      return true
    }
    return false
  }

  const queryKey = getQueryKey(teacherId, sectionId)
  const requestBodyKey = getRequestBodyKey(sectionId)

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { controller, unregister } = createAbortController()
      const endpoint = API_ENDPOINTS[sectionId]
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [requestBodyKey]: data }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || `Failed to create ${sectionId} record`)
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.talks.all(teacherId),
      })
      toast({
        title: "Success",
        description: `"${variables.name || sectionId}" has been added successfully!`,
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
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
      const { controller, unregister } = createAbortController()
      const endpoint = API_ENDPOINTS[sectionId]
      const requestBody = getUpdateRequestBody(sectionId, id, data)
      try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || `Failed to update ${sectionId} record`)
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        // The data structure from useTeacherTalksEvents is: { refresherDetails: [...], success: true }
        // We need to update the array within the response object
        const dataKey = sectionId === "refresher" ? "refresherDetails" :
          sectionId === "academic-programs" ? "academicContributions" :
          sectionId === "academic-bodies" ? "academicBodiesParticipation" :
          sectionId === "committees" ? "universityCommittees" :
          "teacherTalks"
        
        const items = old[dataKey] || []
        return {
          ...old,
          [dataKey]: items.map((item: any) =>
            (item.id === id || item.Id === id) ? { ...item, ...data } : item
          ),
        }
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast({
        title: "Error",
        description: err.message || `Failed to update ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (_, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.talks.all(teacherId),
      })
      toast({
        title: "Success",
        description: `"${variables.data.name || sectionId}" has been updated successfully!`,
        duration: 3000,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { controller, unregister } = createAbortController()
      const config = DELETE_CONFIG[sectionId]
      try {
        const res = await fetch(`${config.endpoint}?${config.param}=${id}`, {
          method: "DELETE",
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || `Failed to delete ${sectionId} record`)
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        // The data structure from useTeacherTalksEvents is: { refresherDetails: [...], success: true }
        // We need to update the array within the response object
        const dataKey = sectionId === "refresher" ? "refresherDetails" :
          sectionId === "academic-programs" ? "academicContributions" :
          sectionId === "academic-bodies" ? "academicBodiesParticipation" :
          sectionId === "committees" ? "universityCommittees" :
          "teacherTalks"
        
        const items = old[dataKey] || []
        return {
          ...old,
          [dataKey]: items.filter((item: any) => (item.id !== id && item.Id !== id)),
        }
      })

      return { previousData }
    },
    onError: (err, id, context) => {
      if (handleUnauthorized(err)) return
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      toast({
        title: "Error",
        description: err.message || `Failed to delete ${sectionId}. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      })
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.talks.all(teacherId),
      })
      toast({
        title: "Success",
        description: DELETE_CONFIG[sectionId].successMessage,
        duration: 3000,
      })
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}

// Individual section mutation hooks for convenience
export function useRefresherMutations() {
  return useTalksEventsMutations("refresher")
}

export function useAcademicProgramMutations() {
  return useTalksEventsMutations("academic-programs")
}

export function useAcademicBodiesMutations() {
  return useTalksEventsMutations("academic-bodies")
}

export function useCommitteeMutations() {
  return useTalksEventsMutations("committees")
}

export function useTalksMutations() {
  return useTalksEventsMutations("talks")
}

