import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { departmentEventsQueryKeys } from "./use-department-events-mutations"

async function fetchAPI(url: string) {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch data")
  }
  return res.json()
}

export function useDepartmentEvents() {
  const { user } = useAuth()
  const deptId: number = user?.dept_id || 0

  const events = useQuery({
    queryKey: departmentEventsQueryKeys.list(deptId),
    queryFn: () => fetchAPI(`/api/department/events/dept-events?deptId=${deptId}`),
    enabled: !!deptId && deptId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  return {
    events,
    isLoading: events.isLoading,
    isFetching: events.isFetching,
    isError: events.isError,
    data: {
      events: events.data?.events || [],
    }
  }
}

