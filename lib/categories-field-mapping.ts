/**
 * Comprehensive field mapping based on categoriesTablesFieldsJson
 * Maps extracted field names from LLM API to actual form field names
 */

// Category/Subcategory to Form Type mapping
export const CATEGORY_FORM_TYPE_MAP: Record<string, Record<string, string>> = {
  "Books/Papers": {
    "Published Articles/Papers in Journals/Edited Volumes": "journal-articles",
    "Books/Books Chapter(s) Published": "books",
    "Papers Presented": "papers",
  },
  "Research & Consultancy": {
    "Research Projects": "research",
    "Patents": "patents",
    "Policy Document Developed": "policy",
    "E Content": "econtent",
    "Details of Consultancy Undertaken": "consultancy",
    "Collaborations/MOUs/Linkages Signed": "collaborations",
    "Academic/Research Visit": "visits",
    "Financial Support/Aid Received For Academic/Research Activities": "financial",
    "Details Of JRF/SRF Working With You": "jrf-srf",
    "PhD Guidance Details": "phd",
    "Copyrights": "copyrights",
  },
  "Academic Programs": {
    "Refresher/Orientantion Course": "refresher",
    "Contribution in Organising Academic Programs": "academic-programs",
    "Participation in Academic Bodies of other Universities": "academic-bodies",
    "Participation in Committees of University": "committees",
  },
  "Awards/Performance": {
    "Performance by Individual/Group": "performance",
    "Awards/Fellowship/Recognition": "awards",
    "Extension": "extension",
  },
  "Talks": {
    "Talks of Academic/Research Nature": "talks",
  },
  "Academic Recommendation": {
    "Articles/Journals/Edited Volumes": "articles",
    "Books": "books",
    "Magazines": "magazines",
    "Technical Report and Other(s)": "technical",
  },
}

// Field name mappings for each form type
export const FIELD_NAME_MAPPINGS: Record<string, Record<string, string>> = {
  // Papers Presented
  papers: {
    // Direct mappings from extracted field names to form field names
    "Presentation Level": "level",
    "Mode of Participation": "mode",
    "Theme Of Conference/Seminar/Symposia": "theme",
    "Organizing Body": "organising_body",
    "Organising Body": "organising_body",
    "Place": "place",
    "Date of Presentation/Seminar": "date",
    "Date": "date",
    "Title of Paper": "title_of_paper",
    "Title": "title_of_paper",
    "Author(s)": "authors",
    "Authors": "authors",
  },

  // Journal Articles
  "journal-articles": {
    "Author(s)": "authors",
    "No. of Authors": "author_num",
    "Author Type": "author_type",
    "Title": "title",
    "Type": "type",
    "ISSN (Without - )": "issn",
    "ISBN (Without - )": "isbn",
    "Journal/Book Name": "journal_name",
    "Volume No.": "volume_num",
    "Page No. (Range)": "page_num",
    "Date": "month_year",
    "Level": "level",
    "Peer Reviewed?": "peer_reviewed",
    "H Index": "h_index",
    "Impact Factor": "impact_factor",
    "DOI": "DOI",
    "In Scopus?": "in_scopus",
    "In UGC CARE?": "in_ugc",
    "In CLARIVATE?": "in_clarivate",
    "In Old UGC List?": "in_oldUGCList",
    "Charges Paid?": "paid",
  },

  // Books
  books: {
    "Authors": "authors",
    "Title": "title",
    "ISBN (Without - )": "isbn",
    "Publisher Name": "publisher_name",
    "Publishing Date": "submit_date",
    "Publishing Place": "publishing_place",
    "Charges Paid": "charges_paid",
    "Edited": "edited",
    "Chapter Count": "chapter_count",
    "Publishing Level": "publishing_level",
    "Book Type": "book_type",
    "Author Type": "author_type",
  },

  // Research Projects
  research: {
    "Title": "title",
    "Funding Agency": "funding_agency",
    "Total Grant Sanctioned": "grant_sanctioned",
    "Total Grant Received": "grant_received",
    "Project Nature Level": "project_nature_level",
    "Duration": "duration",
    "Status": "status",
    "Start Date": "start_date",
    "Seed Grant": "seed_grant",
    "Seed Grant Year": "seed_grant_year",
  },

  // Patents
  patents: {
    "Title": "title",
    "Level": "level",
    "Status": "status",
    "Date": "date",
    "Transfer of Technology with Licence": "transfer_of_technology",
    "Earning Generated (Rupees)": "earning_generated",
    "Patent Application/Publication/Grant No.": "PatentApplicationNo",
  },

  // Policy Documents
  policy: {
    "Title": "title",
    "Level": "level",
    "Organisation": "organisation",
    "Date": "date",
  },

  // E-Content
  econtent: {
    "Title": "title",
    "Type of E-Content Platform": "type",
    "Brief Details": "brief_details",
    "Quadrant": "quadrant",
    "Publishing Date": "Publishing_date",
    "Publishing Authorities": "Publishing_Authorities",
    "Link": "link",
    "Type of E Content": "type",
  },

  // Consultancy
  consultancy: {
    "Title": "name",
    "Collaborating Institute / Industry": "collaborating_inst",
    "Address": "address",
    "Start Date": "Start_Date",
    "Duration(in Months)": "duration",
    "Amount(Rs.)": "amount",
    "Details / Outcome": "details",
  },

  // Collaborations
  collaborations: {
    "Category": "category",
    "Collaborating Institute": "collaborating_inst",
    "Name of Collaborator(At other institute)": "collab_name",
    "QS/THE World University Ranking of Institute": "qs_ranking",
    "Address": "address",
    "Details": "details",
    "Collaboration Outcome": "outcome",
    "Status": "status",
    "Starting Date": "starting_date",
    "Duration(months)": "duration",
    "Level": "level",
    "No. of Beneficiary": "beneficiary_count",
    "MOU Signed?": "mou_signed",
    "Signing Date": "signing_date",
  },

  // Visits
  visits: {
    "Institute/Industry Visited": "institute",
    "Duration of Visit(days)": "duration",
    "Role": "role",
    "Sponsored By": "sponsored_by",
    "Remarks": "remarks",
    "Date": "date",
  },

  // Financial Support
  financial: {
    "Name Of Support": "title",
    "Type": "type",
    "Supporting Agency": "agency",
    "Grant Received": "amount",
    "Details Of Event": "event_details",
    "Purpose Of Grant": "purpose",
    "Date": "date",
  },

  // JRF/SRF
  "jrf-srf": {
    "Name Of Fellow": "name",
    "Type": "type",
    "Project Title": "project_title",
    "Duration [in months]": "duration",
    "Monthly Stipend": "stipend",
    "Date": "date",
  },

  // PhD Guidance
  phd: {
    "Reg No": "regno",
    "Name of Student": "name",
    "Date of Registration": "start_date",
    "Topic": "topic",
    "Status": "status",
    "Year of Completion": "completion_year",
  },

  // Copyrights
  copyrights: {
    "Title": "title",
    "Reference No.": "referenceNo",
    "Publication Date": "publicationDate",
    "Link": "link",
  },

  // Refresher/Orientation
  refresher: {
    "Name": "name",
    "Course Type": "course_type",
    "Start Date": "start_date",
    "End Date": "end_date",
    "Orgnizing University": "organizing_university",
    "Orgnizing Institute": "organizing_institute",
    "Orgnizing Department": "organizing_department",
    "Centre": "centre",
  },

  // Academic Programs
  "academic-programs": {
    "Name": "name",
    "Programme": "programme",
    "Place": "place",
    "Date": "date",
    "Year": "year",
    "Participated As": "participated_as",
  },

  // Academic Bodies
  "academic-bodies": {
    "Course Title": "name",
    "Academic Body": "acad_body",
    "Place": "place",
    "Participated As": "participated_as",
    "Year": "year_name", // Form uses "year_name" field, not "year"
  },

  // Committees
  committees: {
    "Name": "name",
    "Committee Name": "committee_name",
    "Level": "level",
    "Participated As": "participated_as",
    "Year": "year",
  },

  // Performance
  performance: {
    "Title of Performance": "name",
    "Place": "place",
    "Performance Date": "date",
    "Nature of Performance": "perf_nature",
  },

  // Awards
  awards: {
    "Name of Award / Fellowship": "name",
    "Details": "details",
    "Name of Awarding Agency": "organization",
    "Adress of Awarding Agency": "address",
    "Date of Award": "date_of_award",
    "Level": "level",
  },

  // Extension
  extension: {
    "Name of Activity": "name_of_activity",
    "Nature of Activity": "nature",
    "Level": "level",
    "Sponsered By": "sponsored_by",
    "Place": "place",
    "Date": "date",
  },

  // Talks
  talks: {
    "Name": "name",
    "Programme": "programme",
    "Place": "place",
    "Talk Date": "date",
    "Title of Event / Talk": "title",
    "Participated As": "participated_as",
  },

  // Academic Recommendations - Articles
  articles: {
    "Journal Name": "journal_name",
    "ISSN (Without - )": "issn",
    "E-ISSN (Without - )": "e_issn",
    "Volume No.": "volume",
    "Publisher  s Name": "publisher",
    "Type": "type",
    "Level": "level",
    "Peer Reviewed?": "peer_reviewed",
    "H Index": "h_index",
    "Impact Factor": "impact_factor",
    "DOI": "doi",
    "In Scopus?": "in_scopus",
    "In UGC CARE?": "in_ugc",
    "In CLARIVATE?": "in_clarivate",
    "In Old UGC List?": "in_old_ugc_list",
    "Approx. Price": "price",
    "Currency": "currency",
  },

  // Academic Recommendations - Books
  "academic-books": {
    "Title": "title",
    "Author(s)": "authors",
    "ISBN (Without - )": "isbn",
    "Publisher Name": "publisher",
    "Publishing Level": "publishing_level",
    "Book Type": "book_type",
    "Edition": "edition",
    "Volume No.": "volume",
    "Publication Date": "publication_date",
    "EBook": "ebook",
    "Digital Media(If any provided like Pendrive,CD/DVD)": "digital_media",
    "Approx. Price": "price",
    "Currency": "currency",
  },

  // Academic Recommendations - Magazines
  magazines: {
    "Title": "title",
    "Mode": "mode",
    "Publishing Agency": "publishing_agency",
    "Volume No.": "volume",
    "Publication Date": "publication_date",
    "Is Additional Attachment(USB/CD/DVD)?": "has_attachment",
    "AdditionalAttachment": "additional_attachment",
    "No. of Issues per Year": "issues_per_year",
    "Approx. Price": "price",
    "Currency": "currency",
  },

  // Academic Recommendations - Technical
  technical: {
    "Title": "title",
    "Subject": "subject",
    "Publisher  s Name": "publisher",
    "Publication Date": "publication_date",
    "No. of Issues per Year": "issues_per_year",
    "Approx. Price": "price",
    "Currency": "currency",
  },
}

/**
 * Get form type from category and subcategory
 */
export function getFormType(category: string, subCategory: string): string | null {
  const categoryMap = CATEGORY_FORM_TYPE_MAP[category]
  if (!categoryMap) return null

  // Try exact match first
  if (categoryMap[subCategory]) {
    return categoryMap[subCategory]
  }

  // Try normalized match
  const normalizedSubCategory = normalizeString(subCategory)
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalizeString(key) === normalizedSubCategory) {
      return value
    }
  }

  return null
}

/**
 * Get mapped field name for a form type
 */
export function getMappedFieldName(
  extractedFieldName: string,
  formType: string
): string | null {
  const mappings = FIELD_NAME_MAPPINGS[formType]
  if (!mappings) return null

  // Direct match
  if (mappings[extractedFieldName]) {
    return mappings[extractedFieldName]
  }

  // Normalized match
  const normalized = normalizeFieldName(extractedFieldName)
  for (const [key, value] of Object.entries(mappings)) {
    if (normalizeFieldName(key) === normalized) {
      return value
    }
  }

  // Partial match (extracted field contains key or vice versa)
  for (const [key, value] of Object.entries(mappings)) {
    const keyNormalized = normalizeFieldName(key)
    if (
      normalized.includes(keyNormalized) ||
      keyNormalized.includes(normalized)
    ) {
      return value
    }
  }

  return null
}

/**
 * Normalize field name for matching
 */
function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

