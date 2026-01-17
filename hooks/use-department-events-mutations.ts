import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { createAbortController } from "@/lib/request-controller"

// Query keys for all department events modules
export const departmentEventsQueryKeys = {
  all: (deptId: number) => ['department', 'events', deptId] as const,
  list: (deptId: number) => [...departmentEventsQueryKeys.all(deptId), 'list'] as const,
}

export const departmentStudentAcademicActivitiesQueryKeys = {
  all: (deptId: number) => ['department', 'student-academic-activities', deptId] as const,
  list: (deptId: number) => [...departmentStudentAcademicActivitiesQueryKeys.all(deptId), 'list'] as const,
}

export const departmentStudentBodyEventsQueryKeys = {
  all: (deptId: number) => ['department', 'student-body-events', deptId] as const,
  list: (deptId: number) => [...departmentStudentBodyEventsQueryKeys.all(deptId), 'list'] as const,
}

export function useDepartmentEventsMutations() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const deptId: number = user?.dept_id || 0

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

  // ========== EVENTS MUTATIONS ==========
  const createEvent = useMutation({
    mutationFn: async (eventData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/dept-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: departmentEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Event added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateEvent = useMutation({
    mutationFn: async ({ eventId, eventData }: { eventId: number; eventData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/dept-events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eid: eventId, ...eventData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ eventId, eventData }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentEventsQueryKeys.list(deptId) 
      })
      
      const previousEvents = queryClient.getQueryData(
        departmentEventsQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentEventsQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.events) return old
          return {
            ...old,
            events: old.events.map((e: any) =>
              e.eid === eventId ? { ...e, ...eventData } : e
            ),
          }
        }
      )
      
      return { previousEvents }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousEvents) {
        queryClient.setQueryData(
          departmentEventsQueryKeys.list(deptId),
          context.previousEvents
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Event updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteEvent = useMutation({
    mutationFn: async ({ eventId, docPath, deptId: requestDeptId }: { eventId: number; docPath?: string | null; deptId?: number }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/department/events/dept-events?eid=${eventId}&deptId=${requestDeptId || deptId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: docPath || null, 
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ eventId }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentEventsQueryKeys.list(deptId) 
      })
      
      const previousEvents = queryClient.getQueryData(
        departmentEventsQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentEventsQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.events) return old
          return {
            ...old,
            events: old.events.filter((e: any) => e.eid !== eventId),
          }
        }
      )
      
      return { previousEvents }
    },
    onError: (err, { eventId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousEvents) {
        queryClient.setQueryData(
          departmentEventsQueryKeys.list(deptId),
          context.previousEvents
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Event deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Event deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  // ========== STUDENT ACADEMIC ACTIVITIES MUTATIONS ==========
  const createActivity = useMutation({
    mutationFn: async (activityData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/student-academic-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create activity")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentAcademicActivitiesQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Student academic activity added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add activity. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateActivity = useMutation({
    mutationFn: async ({ activityId, activityData }: { activityId: number; activityData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/student-academic-activities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activityId, ...activityData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update activity")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ activityId, activityData }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentStudentAcademicActivitiesQueryKeys.list(deptId) 
      })
      
      const previousActivities = queryClient.getQueryData(
        departmentStudentAcademicActivitiesQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentStudentAcademicActivitiesQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.activities) return old
          return {
            ...old,
            activities: old.activities.map((a: any) =>
              a.id === activityId ? { ...a, ...activityData } : a
            ),
          }
        }
      )
      
      return { previousActivities }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousActivities) {
        queryClient.setQueryData(
          departmentStudentAcademicActivitiesQueryKeys.list(deptId),
          context.previousActivities
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update activity. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentAcademicActivitiesQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Activity updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteActivity = useMutation({
    mutationFn: async ({ activityId, docPath, deptId: requestDeptId }: { activityId: number; docPath?: string | null; deptId?: number }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/department/events/student-academic-activities?id=${activityId}&deptId=${requestDeptId || deptId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: docPath || null,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete activity")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ activityId }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentStudentAcademicActivitiesQueryKeys.list(deptId) 
      })
      
      const previousActivities = queryClient.getQueryData(
        departmentStudentAcademicActivitiesQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentStudentAcademicActivitiesQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.activities) return old
          return {
            ...old,
            activities: old.activities.filter((a: any) => a.id !== activityId),
          }
        }
      )
      
      return { previousActivities }
    },
    onError: (err, { activityId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousActivities) {
        queryClient.setQueryData(
          departmentStudentAcademicActivitiesQueryKeys.list(deptId),
          context.previousActivities
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete activity. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentAcademicActivitiesQueryKeys.all(deptId),
        refetchType: 'active'
      })
      
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Activity deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Activity deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  // ========== STUDENT BODY EVENTS MUTATIONS ==========
  const createStudentBodyEvent = useMutation({
    mutationFn: async (eventData: any) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/student-body-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to create event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentBodyEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Student body event added successfully!",
        duration: 3000,
      })
    },
    onError: (error: Error) => {
      if (handleUnauthorized(error)) return
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const updateStudentBodyEvent = useMutation({
    mutationFn: async ({ studentBodyEventId, eventData }: { studentBodyEventId: number; eventData: any }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch("/api/department/events/student-body-events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: studentBodyEventId, ...eventData }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ studentBodyEventId, eventData }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentStudentBodyEventsQueryKeys.list(deptId) 
      })
      
      const previousEvents = queryClient.getQueryData(
        departmentStudentBodyEventsQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentStudentBodyEventsQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.events) return old
          return {
            ...old,
            events: old.events.map((e: any) =>
              e.id === studentBodyEventId ? { ...e, ...eventData } : e
            ),
          }
        }
      )
      
      return { previousEvents }
    },
    onError: (err, variables, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousEvents) {
        queryClient.setQueryData(
          departmentStudentBodyEventsQueryKeys.list(deptId),
          context.previousEvents
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentBodyEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      toast({ 
        title: "Success", 
        description: "Event updated successfully!",
        duration: 3000,
      })
    },
  })

  const deleteStudentBodyEvent = useMutation({
    mutationFn: async ({ studentBodyEventId, docPath, deptId: requestDeptId }: { studentBodyEventId: number; docPath?: string | null; deptId?: number }) => {
      const { controller, unregister } = createAbortController()
      try {
        const res = await fetch(`/api/department/events/student-body-events?id=${studentBodyEventId}&deptId=${requestDeptId || deptId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: docPath || null, 
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to delete event")
        }
        return res.json()
      } finally {
        unregister()
      }
    },
    onMutate: async ({ studentBodyEventId }) => {
      await queryClient.cancelQueries({ 
        queryKey: departmentStudentBodyEventsQueryKeys.list(deptId) 
      })
      
      const previousEvents = queryClient.getQueryData(
        departmentStudentBodyEventsQueryKeys.list(deptId)
      )
      
      queryClient.setQueryData(
        departmentStudentBodyEventsQueryKeys.list(deptId),
        (old: any) => {
          if (!old?.events) return old
          return {
            ...old,
            events: old.events.filter((e: any) => e.id !== studentBodyEventId),
          }
        }
      )
      
      return { previousEvents }
    },
    onError: (err, { studentBodyEventId }, context) => {
      if (handleUnauthorized(err)) return
      if (context?.previousEvents) {
        queryClient.setQueryData(
          departmentStudentBodyEventsQueryKeys.list(deptId),
          context.previousEvents
        )
      }
      toast({ 
        title: "Error", 
        description: err.message || "Failed to delete event. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: departmentStudentBodyEventsQueryKeys.all(deptId),
        refetchType: 'active'
      })
      
      // Show success message - handle different scenarios
      if (data.warning) {
        toast({
          title: "Success",
          description: data.message || "Event deleted successfully",
          duration: 5000,
        })
        toast({
          title: "Warning",
          description: data.warning,
          variant: "default",
          duration: 5000,
        })
      } else {
        toast({ 
          title: "Success", 
          description: data.message || "Event deleted successfully!",
          duration: 3000,
        })
      }
    },
  })

  return {
    // Events
    createEvent,
    updateEvent,
    deleteEvent,
    // Student Academic Activities
    createActivity,
    updateActivity,
    deleteActivity,
    // Student Body Events
    createStudentBodyEvent,
    updateStudentBodyEvent,
    deleteStudentBodyEvent,
  }
}
