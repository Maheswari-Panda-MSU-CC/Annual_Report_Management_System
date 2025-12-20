import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { teacherQueryKeys } from "./use-teacher-data"
import { useToast } from "@/components/ui/use-toast"
import { createAbortController } from "@/lib/request-controller"

type SectionId = "performance" | "awards" | "extension"

// API Endpoints
const API_ENDPOINTS: Record<SectionId, string> = {
  performance: "/api/teacher/awards-recognition/performance-teacher",
  awards: "/api/teacher/awards-recognition/awards-fellow",
  extension: "/api/teacher/awards-recognition/extensions",
}

// Delete endpoint configurations
const DELETE_CONFIG: Record<SectionId, { endpoint: string; param: string; successMessage: string }> = {
  performance: {
    endpoint: "/api/teacher/awards-recognition/performance-teacher",
    param: "perfTeacherId",
    successMessage: "Performance teacher deleted successfully!",
  },
  awards: {
    endpoint: "/api/teacher/awards-recognition/awards-fellow",
    param: "awardsFellowId",
    successMessage: "Awards/Fellows deleted successfully!",
  },
  extension: {
    endpoint: "/api/teacher/awards-recognition/extensions",
    param: "extensionActId",
    successMessage: "Extension activity deleted successfully!",
  },
}

// Get query key for a section
const getQueryKey = (teacherId: number, sectionId: SectionId) => {
  if (sectionId === "performance") {
    return teacherQueryKeys.awards.performance(teacherId)
  } else if (sectionId === "awards") {
    return teacherQueryKeys.awards.awards(teacherId)
  } else if (sectionId === "extension") {
    return teacherQueryKeys.awards.extension(teacherId)
  }
  return teacherQueryKeys.awards.all(teacherId)
}

// Get request body key for a section
const getRequestBodyKey = (sectionId: SectionId): string => {
  const keyMap: Record<SectionId, string> = {
    performance: "perfTeacher",
    awards: "awardsFellow",
    extension: "extensionAct",
  }
  return keyMap[sectionId]
}

// Get update request body for a section
const getUpdateRequestBody = (sectionId: SectionId, id: number, data: any) => {
  if (sectionId === "performance") {
    return {
      perfTeacherId: id,
      perfTeacher: data,
    }
  } else if (sectionId === "awards") {
    return {
      awardsFellowId: id,
      awardsFellow: data,
    }
  } else if (sectionId === "extension") {
    return {
      extensionActId: id,
      extensionAct: data,
    }
  }
  return { data }
}

/**
 * Generic mutation hook for awards-recognition sections
 */
export function useAwardsRecognitionMutations(sectionId: SectionId) {
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
        queryKey: teacherQueryKeys.awards.all(teacherId),
      })
      toast({
        title: "Success",
        description: `"${variables.name || variables.name_of_activity || sectionId}" has been added successfully!`,
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
        // The data structure from useTeacherAwardsRecognition query is the API response:
        // { success: true, performanceTeacher: [...] } or { success: true, awardsFellows: [...] } etc.
        const dataKey = sectionId === "performance" ? "performanceTeacher" :
          sectionId === "awards" ? "awardsFellows" :
          "extensionActivities"
        
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
        queryKey: teacherQueryKeys.awards.all(teacherId),
      })
      toast({
        title: "Success",
        description: `"${variables.data.name || variables.data.name_of_activity || sectionId}" has been updated successfully!`,
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
        // The data structure from useTeacherAwardsRecognition query is the API response:
        // { success: true, performanceTeacher: [...] } or { success: true, awardsFellows: [...] } etc.
        const dataKey = sectionId === "performance" ? "performanceTeacher" :
          sectionId === "awards" ? "awardsFellows" :
          "extensionActivities"
        
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
        queryKey: teacherQueryKeys.awards.all(teacherId),
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
export function usePerformanceMutations() {
  return useAwardsRecognitionMutations("performance")
}

export function useAwardsMutations() {
  return useAwardsRecognitionMutations("awards")
}

export function useExtensionMutations() {
  return useAwardsRecognitionMutations("extension")
}

