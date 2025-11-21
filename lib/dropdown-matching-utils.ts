/**
 * Utilities for matching extracted string values to dropdown options
 */

interface DropdownOption {
  id: number | string
  name: string
}

/**
 * Find dropdown option by matching name (fuzzy match)
 */
export function findDropdownOption(
  extractedValue: string,
  options: DropdownOption[],
  fieldName?: string
): number | string | null {
  if (!extractedValue || !options || options.length === 0) {
    return null
  }

  const normalized = normalizeValue(extractedValue)

  // Exact match (case-insensitive)
  const exactMatch = options.find(
    (opt) => normalizeValue(opt.name) === normalized
  )
  if (exactMatch) return exactMatch.id

  // Partial match (extracted value contains option name or vice versa)
  const partialMatch = options.find((opt) => {
    const optNormalized = normalizeValue(opt.name)
    return (
      normalized.includes(optNormalized) ||
      optNormalized.includes(normalized)
    )
  })
  if (partialMatch) return partialMatch.id

  // Special matching for specific fields
  if (fieldName === "level" || fieldName?.includes("level")) {
    return matchLevel(extractedValue, options)
  }

  return null
}

/**
 * Normalize value for matching
 */
function normalizeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Special matching for level field
 */
function matchLevel(
  extractedValue: string,
  options: DropdownOption[]
): number | string | null {
  const normalized = normalizeValue(extractedValue)

  // Common level mappings
  const levelMap: Record<string, string[]> = {
    national: ["national", "nation", "country", "india"],
    international: ["international", "global", "world", "abroad"],
    state: ["state", "provincial", "regional"],
    university: ["university", "institutional", "institute"],
    college: ["college", "department", "departmental"],
    local: ["local", "district", "city"],
  }

  for (const [key, variations] of Object.entries(levelMap)) {
    if (variations.some((v) => normalized.includes(v))) {
      const match = options.find((opt) =>
        normalizeValue(opt.name).includes(key)
      )
      if (match) return match.id
    }
  }

  // Try direct partial match
  for (const opt of options) {
    const optNormalized = normalizeValue(opt.name)
    if (normalized.includes(optNormalized) || optNormalized.includes(normalized)) {
      return opt.id
    }
  }

  return null
}

/**
 * Normalize mode values
 */
export function normalizeModeValue(extractedValue: string): string | null {
  const normalized = normalizeValue(extractedValue)

  const modeMap: Record<string, string> = {
    physical: "Physical",
    virtual: "Virtual",
    online: "Virtual",
    hybrid: "Hybrid",
    "hybrid mode": "Hybrid",
    "physical mode": "Physical",
    "virtual mode": "Virtual",
  }

  for (const [key, value] of Object.entries(modeMap)) {
    if (normalized.includes(key)) {
      return value
    }
  }

  return null
}

/**
 * Normalize boolean values
 */
export function normalizeBooleanValue(extractedValue: string): boolean | null {
  const normalized = normalizeValue(extractedValue)

  const trueValues = ["yes", "true", "1", "y", "paid", "reviewed", "included", "in"]
  const falseValues = ["no", "false", "0", "n", "unpaid", "not reviewed", "not", "out"]

  if (trueValues.some((v) => normalized.includes(v))) {
    return true
  }
  if (falseValues.some((v) => normalized.includes(v))) {
    return false
  }

  return null
}

