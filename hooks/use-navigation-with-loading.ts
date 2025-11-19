import { useTransition } from "react"
import { useRouter } from "next/navigation"

/**
 * Custom hook for navigation with loading state
 * Provides immediate loading feedback using React's useTransition
 * 
 * @returns {Object} Object containing navigate function and isPending state
 */
export function useNavigationWithLoading() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  /**
   * Navigate to a new route with loading state
   * @param path - The path to navigate to
   */
  const navigate = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  /**
   * Replace current route with loading state
   * @param path - The path to replace with
   */
  const replace = (path: string) => {
    startTransition(() => {
      router.replace(path)
    })
  }

  return { navigate, replace, isPending }
}

