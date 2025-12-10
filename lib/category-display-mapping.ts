/**
 * Maps backend category/subcategory names to frontend sidebar display names
 * This is a frontend-only mapping - backend logic names remain unchanged
 */

// Category mapping: backend name -> frontend sidebar display name
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "Books/Papers": "Publications",
  "Research & Consultancy": "Research & Academic Contributions",
  "Academic Programs": "Events & Activities",
  "Awards/Performance": "Awards & Recognition",
  "Talks": "Events & Activities",
  "Academic Recommendation": "Academic Recommendations",
}

// Subcategory mapping: backend name -> frontend sidebar display name
export const SUBCATEGORY_DISPLAY_MAP: Record<string, string> = {
  // Publications subcategories
  "Published Articles/Papers in Journals/Edited Volumes": "Published Articles/Journals",
  "Books/Books Chapter(s) Published": "Books/Book Chapters",
  "Papers Presented": "Papers Presented",

  // Research & Academic Contributions subcategories
  "Research Projects": "Research Projects", // Standalone category in sidebar, but can appear as subcategory from backend
  "Patents": "Patents",
  "Policy Document Developed": "Policy Documents",
  "E Content": "E-Content",
  "Details of Consultancy Undertaken": "Consultancy",
  "Collaborations/MOUs/Linkages Signed": "Collaborations / MoUs",
  "Academic/Research Visit": "Academic Visits",
  "Financial Support/Aid Received For Academic/Research Activities": "Financial Support",
  "Details Of JRF/SRF Working With You": "JRF/SRF",
  "PhD Guidance Details": "PhD Guidance",
  "Copyrights": "Copyrights",

  // Events & Activities subcategories
  "Refresher/Orientantion Course": "Refresher/Orientation",
  "Contribution in Organising Academic Programs": "Academic Programs",
  "Participation in Academic Bodies of other Universities": "Academic Bodies",
  "Participation in Committees of University": "University Committees",
  "Talks of Academic/Research Nature": "Academic Talks",

  // Awards & Recognition subcategories
  "Performance by Individual/Group": "Performance",
  "Awards/Fellowship/Recognition": "Awards Recognition",
  "Extension": "Extension Activities",

  // Academic Recommendations subcategories
  "Articles/Journals/Edited Volumes": "Articles/Journals",
  "Books": "Books",
  "Magazines": "Magazines",
  "Technical Report and Other(s)": "Technical Reports",
}

/**
 * Get display name for category
 * @param backendCategory - Backend category name
 * @returns Frontend display name or original if no mapping found
 */
export function getCategoryDisplayName(backendCategory: string): string {
  return CATEGORY_DISPLAY_MAP[backendCategory] || backendCategory
}

/**
 * Get display name for subcategory
 * @param backendSubCategory - Backend subcategory name
 * @returns Frontend display name or original if no mapping found
 */
export function getSubCategoryDisplayName(backendSubCategory: string): string {
  return SUBCATEGORY_DISPLAY_MAP[backendSubCategory] || backendSubCategory
}

