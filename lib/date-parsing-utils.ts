/**
 * Utilities for parsing and formatting dates from extracted text
 */

/**
 * Parse date string to YYYY-MM-DD format
 * Handles formats like:
 * - "28th January, 2025"
 * - "January 28, 2025"
 * - "28/01/2025" (DD/MM/YYYY)
 * - "28-01-2025" (DD-MM-YYYY)
 * - "28.01.2025" (DD.MM.YYYY)
 * - "2025-01-28"
 */
export function parseDateString(dateString: string): string | null {
  if (!dateString) return null

  // Remove ordinal suffixes (st, nd, rd, th)
  const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim()

  // Try parsing with Date object first
  const date = new Date(cleaned)
  if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
    return formatDate(date)
  }

  // Try manual parsing for "28th January, 2025" format
  const monthMap: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  }

  // Pattern: "28 January, 2025" or "28th January 2025"
  const parts = cleaned.toLowerCase().match(/(\d+)\s+(\w+)[,\s]+(\d{4})/)
  if (parts) {
    const day = parseInt(parts[1])
    const monthName = parts[2]
    const year = parseInt(parts[3])
    const month = monthMap[monthName]

    if (month !== undefined && day >= 1 && day <= 31 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, month, day)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
  }

  // Try DD/MM/YYYY or MM/DD/YYYY format
  const slashParts = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slashParts) {
    const part1 = parseInt(slashParts[1])
    const part2 = parseInt(slashParts[2])
    const year = parseInt(slashParts[3])

    // Try DD/MM/YYYY first (more common)
    if (part1 <= 31 && part2 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part2 - 1, part1)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
    // Try MM/DD/YYYY
    if (part2 <= 31 && part1 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part1 - 1, part2)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
  }

  // Try DD-MM-YYYY or MM-DD-YYYY format (dash-separated)
  const dashParts = cleaned.match(/(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (dashParts) {
    const part1 = parseInt(dashParts[1])
    const part2 = parseInt(dashParts[2])
    const year = parseInt(dashParts[3])

    // Try DD-MM-YYYY first (more common)
    if (part1 <= 31 && part2 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part2 - 1, part1)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
    // Try MM-DD-YYYY
    if (part2 <= 31 && part1 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part1 - 1, part2)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
  }

  // NEW: Try DD.MM.YYYY or MM.DD.YYYY format (dot-separated)
  const dotParts = cleaned.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (dotParts) {
    const part1 = parseInt(dotParts[1])
    const part2 = parseInt(dotParts[2])
    const year = parseInt(dotParts[3])

    // Try DD.MM.YYYY first (more common)
    if (part1 <= 31 && part2 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part2 - 1, part1)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
    // Try MM.DD.YYYY
    if (part2 <= 31 && part1 <= 12 && year >= 1900 && year < 2100) {
      const parsedDate = new Date(year, part1 - 1, part2)
      if (!isNaN(parsedDate.getTime())) {
        return formatDate(parsedDate)
      }
    }
  }

  return null
}

/**
 * Format Date object to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

