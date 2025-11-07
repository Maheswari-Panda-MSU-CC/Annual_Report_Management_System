/**
 * API Helper Utilities for Research Contributions Module
 * Generic functions for API operations
 */

import { API_ENDPOINTS, DELETE_CONFIG, type SectionId } from './research-contributions-config'
import { API_DATA_KEYS, DATA_MAPPERS} from './data-mappers'

/**
 * Generic function to fetch section data
 */
export const fetchSectionData = async (
  sectionId: SectionId,
  teacherId: number,
  setData: React.Dispatch<React.SetStateAction<any>>,
  toast: any,
  resPubLevelOptions?: any[]
): Promise<void> => {
  if (!teacherId) return

  try {
    const endpoint = API_ENDPOINTS[sectionId]
    const dataKey = API_DATA_KEYS[sectionId]
    const mapper = DATA_MAPPERS[sectionId]

    const res = await fetch(`${endpoint}?teacherId=${teacherId}`)
    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.error || `Failed to fetch ${sectionId} records`)
    }

    // Map database fields to UI format
    const mappedData = (data[dataKey] || []).map((item: any, index: number) => mapper(item, index))

    // Special handling for policies (resolve level IDs)
    if (sectionId === 'policy' && resPubLevelOptions) {
      const policiesWithLevelIds = mappedData.map((policy: any) => {
        const levelOption = resPubLevelOptions.find(l => l.name === policy.level)
        return {
          ...policy,
          levelId: levelOption ? levelOption.id : null,
        }
      })
      setData((prev: any) => ({
        ...prev,
        [sectionId]: policiesWithLevelIds,
      }))
    } else {
      setData((prev: any) => ({
        ...prev,
        [sectionId]: mappedData,
      }))
    }
  } catch (error: any) {
    console.error(`Error fetching ${sectionId} records:`, error)
    toast({
      title: "Error",
      description: `Failed to load ${sectionId} records`,
      variant: "destructive",
      duration: 3000,
    })
  }
}

/**
 * Generic function to delete section data
 */
export const deleteSectionData = async (
  sectionId: SectionId,
  itemId: number,
  refreshFn: () => Promise<void>,
  toast: any
): Promise<void> => {
  const config = DELETE_CONFIG[sectionId]
  if (!config) {
    throw new Error(`No delete configuration found for section: ${sectionId}`)
  }

  try {
    const res = await fetch(`${config.endpoint}?${config.param}=${itemId}`, {
      method: "DELETE",
    })
    const result = await res.json()

    if (!res.ok || !result.success) {
      throw new Error(result.error || `Failed to delete ${sectionId} record`)
    }

    toast({
      title: "Success",
      description: config.successMessage,
      duration: 3000,
    })

    // Refresh data
    await refreshFn()
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || `Failed to delete ${sectionId} record`,
      variant: "destructive",
      duration: 3000,
    })
    throw error
  }
}

/**
 * Handle document upload (placeholder for future implementation)
 */
export const handleDocumentUpload = (selectedFiles: FileList | null, existingDoc?: string): string | null => {
  if (selectedFiles && selectedFiles.length > 0) {
    // TODO: Implement actual file upload
    return `https://dummy-document-url-${Date.now()}.pdf`
  }
  return existingDoc || null
}

