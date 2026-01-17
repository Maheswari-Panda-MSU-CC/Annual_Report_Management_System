import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/app/api/auth/auth-provider"
import { departmentStudentAcademicActivitiesQueryKeys } from "./use-department-events-mutations"

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

export function useDepartmentStudentAcademicActivities() {
  const { user } = useAuth()
  const deptId: number = user?.dept_id || 0

  const activities = useQuery({
    queryKey: departmentStudentAcademicActivitiesQueryKeys.list(deptId),
    queryFn: () => fetchAPI(`/api/department/events/student-academic-activities?deptId=${deptId}`),
    enabled: !!deptId && deptId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  return {
    activities,
    isLoading: activities.isLoading,
    isFetching: activities.isFetching,
    isError: activities.isError,
    data: {
      activities: activities.data?.activities || [],
    }
  }
}

