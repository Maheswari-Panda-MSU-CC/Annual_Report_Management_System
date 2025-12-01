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
    "Chapter Count": "chap_count",
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
    "Project Nature Level": "proj_level", // Maps to project level dropdown
    "Project Nature": "proj_nature", // Maps to project nature dropdown
    "Duration": "duration",
    "Status": "status",
    "Start Date": "start_date",
    "Seed Grant": "seed_grant",
    "Seed Grant Year": "seed_grant_year",
  },

  // Patents
  patents: {
    "Title": "title",
    "title": "title",  // Add alias
    "Level": "level",
    "level": "level",  // Add alias
    "Status": "status",
    "status": "status",  // Add alias
    "Date": "date",
    "date": "date",  // Add alias
    "Transfer of Technology with Licence": "Tech_Licence",
    "transfer of technology with licence": "Tech_Licence",
    "Transfer_of_Technology_with_Licence": "Tech_Licence",
    "transfer_of_technology": "Tech_Licence",  // Add alias
    "Tech_Licence": "Tech_Licence",  // Direct alias
    "Earning Generated (Rupees)": "Earnings_Generate",
    "earning generated rupees": "Earnings_Generate",
    "Earning_Generated_Rupees": "Earnings_Generate",
    "earning_generated": "Earnings_Generate",  // Add alias
    "Earnings_Generate": "Earnings_Generate",  // Direct alias
    "Patent Application/Publication/Grant No.": "PatentApplicationNo",
    "patent application publication grant no": "PatentApplicationNo",
    "Patent_Application_Publication_Grant_No": "PatentApplicationNo",
    "PatentApplicationNo": "PatentApplicationNo",  // Direct alias
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
    "title": "title",  // Add alias
    "Type of E-Content Platform": "type",
    "type": "type",  // Add alias
    "Brief Details": "briefDetails",
    "brief details": "briefDetails",
    "Brief_Details": "briefDetails",
    "brief_details": "briefDetails",  // Add alias
    "briefDetails": "briefDetails",  // Direct alias
    "Quadrant": "quadrant",
    "quadrant": "quadrant",  // Add alias
    "Publishing Date": "publishingDate",
    "publishing date": "publishingDate",
    "Publishing_Date": "publishingDate",
    "Publishing_date": "publishingDate",  // Add alias
    "publishingDate": "publishingDate",  // Direct alias
    "Publishing Authorities": "publishingAuthorities",
    "publishing authorities": "publishingAuthorities",
    "Publishing_Authorities": "publishingAuthorities",
    "publishingAuthorities": "publishingAuthorities",  // Direct alias
    "Link": "link",
    "link": "link",  // Add alias
    "Type of E Content": "type",
  },

  // Consultancy
  consultancy: {
    "Title": "title",
    "title": "title",  // Add alias
    "name": "title",  // Backend uses name, form uses title
    "Collaborating Institute / Industry": "collaboratingInstitute",
    "collaborating institute / industry": "collaboratingInstitute",
    "Collaborating_Institute_Industry": "collaboratingInstitute",
    "collaborating_inst": "collaboratingInstitute",  // Backend uses collaborating_inst, form uses collaboratingInstitute
    "collaboratingInstitute": "collaboratingInstitute",  // Direct alias
    "Address": "address",
    "address": "address",  // Add alias
    "Start Date": "startDate",
    "start date": "startDate",
    "Start_Date": "startDate",
    "startDate": "startDate",  // Direct alias
    "Duration(in Months)": "duration",
    "duration": "duration",  // Add alias
    "Amount(Rs.)": "amount",
    "amount": "amount",  // Add alias
    "Details / Outcome": "detailsOutcome",
    "details / outcome": "detailsOutcome",
    "Details_Outcome": "detailsOutcome",
    "details": "detailsOutcome",  // Backend uses details, form uses detailsOutcome
    "detailsOutcome": "detailsOutcome",  // Direct alias
  },

  // Collaborations
  collaborations: {
    "Category": "category",
    "category": "category",  // Add alias
    "Collaborating Institute": "collaboratingInstitute",
    "collaborating institute": "collaboratingInstitute",
    "Collaborating_Institute": "collaboratingInstitute",
    "collaborating_inst": "collaboratingInstitute",  // Backend uses collaborating_inst, form uses collaboratingInstitute
    "collaboratingInstitute": "collaboratingInstitute",  // Direct alias
    "Name of Collaborator(At other institute)": "collabName",
    "name of collaborator": "collabName",
    "Name_of_Collaborator": "collabName",
    "collab_name": "collabName",  // Backend uses collab_name, form uses collabName
    "collabName": "collabName",  // Direct alias
    "QS/THE World University Ranking of Institute": "collabRank",
    "qs the world university ranking": "collabRank",
    "QS_THE_World_University_Ranking": "collabRank",
    "qs_ranking": "collabRank",  // Backend uses qs_ranking, form uses collabRank
    "collabRank": "collabRank",  // Direct alias
    "Address": "address",
    "address": "address",  // Add alias
    "Details": "details",
    "details": "details",  // Add alias
    "Collaboration Outcome": "collabOutcome",
    "collaboration outcome": "collabOutcome",
    "Collaboration_Outcome": "collabOutcome",
    "outcome": "collabOutcome",  // Backend uses outcome, form uses collabOutcome
    "collabOutcome": "collabOutcome",  // Direct alias
    "Status": "status",
    "status": "status",  // Add alias
    "Starting Date": "startingDate",
    "starting date": "startingDate",
    "Starting_Date": "startingDate",
    "starting_date": "startingDate",
    "startingDate": "startingDate",  // Direct alias
    "Duration(months)": "duration",
    "duration": "duration",  // Add alias
    "Level": "level",
    "level": "level",  // Add alias
    "No. of Beneficiary": "noOfBeneficiary",
    "no of beneficiary": "noOfBeneficiary",
    "No_of_Beneficiary": "noOfBeneficiary",
    "beneficiary_count": "noOfBeneficiary",
    "beneficiary_num": "noOfBeneficiary",
    "noOfBeneficiary": "noOfBeneficiary",  // Direct alias
    "MOU Signed?": "mouSigned",
    "mou signed": "mouSigned",
    "MOU_Signed": "mouSigned",
    "mou_signed": "mouSigned",
    "mouSigned": "mouSigned",  // Direct alias
    "Signing Date": "signingDate",
    "signing date": "signingDate",
    "Signing_Date": "signingDate",
    "signing_date": "signingDate",
    "signingDate": "signingDate",  // Direct alias
  },

  // Visits
  visits: {
    "Institute/Industry Visited": "instituteVisited",
    "institute industry visited": "instituteVisited",
    "Institute_Industry_Visited": "instituteVisited",
    "institute": "instituteVisited",  // Backend uses institute, form uses instituteVisited
    "instituteVisited": "instituteVisited",  // Direct alias
    "Duration of Visit(days)": "durationOfVisit",
    "duration of visit days": "durationOfVisit",
    "Duration_of_Visit_days": "durationOfVisit",
    "duration": "durationOfVisit",  // Backend uses duration, form uses durationOfVisit
    "durationOfVisit": "durationOfVisit",  // Direct alias
    "Role": "role",
    "role": "role",  // Add alias
    "Sponsored By": "sponsoredBy",
    "sponsored by": "sponsoredBy",
    "Sponsored_By": "sponsoredBy",
    "sponsored_by": "sponsoredBy",  // Backend uses sponsored_by, form uses sponsoredBy
    "sponsoredBy": "sponsoredBy",  // Direct alias
    "Remarks": "remarks",
    "remarks": "remarks",  // Add alias
    "Date": "date",
    "date": "date",  // Add alias
  },

  // Financial Support
  financial: {
    "Name Of Support": "nameOfSupport",
    "name of support": "nameOfSupport",
    "Name_Of_Support": "nameOfSupport",
    "title": "nameOfSupport",  // Mapping was wrong, form uses nameOfSupport
    "nameOfSupport": "nameOfSupport",  // Direct alias
    "Type": "type",
    "type": "type",  // Add alias
    "Supporting Agency": "supportingAgency",
    "supporting agency": "supportingAgency",
    "Supporting_Agency": "supportingAgency",
    "agency": "supportingAgency",  // Mapping was wrong, form uses supportingAgency
    "supportingAgency": "supportingAgency",  // Direct alias
    "Grant Received": "grantReceived",
    "grant received": "grantReceived",
    "Grant_Received": "grantReceived",
    "amount": "grantReceived",  // Mapping was wrong, form uses grantReceived
    "grantReceived": "grantReceived",  // Direct alias
    "Details Of Event": "detailsOfEvent",
    "details of event": "detailsOfEvent",
    "Details_Of_Event": "detailsOfEvent",
    "event_details": "detailsOfEvent",
    "detailsOfEvent": "detailsOfEvent",  // Direct alias
    "Purpose Of Grant": "purposeOfGrant",
    "purpose of grant": "purposeOfGrant",
    "Purpose_Of_Grant": "purposeOfGrant",
    "purpose": "purposeOfGrant",
    "purposeOfGrant": "purposeOfGrant",  // Direct alias
    "Date": "date",
    "date": "date",  // Add alias
  },

  // JRF/SRF
  "jrf-srf": {
    "Name Of Fellow": "nameOfFellow",
    "name": "nameOfFellow",
    "Type": "type",
    "Project Title": "projectTitle",
    "project_title": "projectTitle",
    "Duration [in months]": "duration",
    "Monthly Stipend": "monthlyStipend",
    "stipend": "monthlyStipend",
    "Date": "date",
  },

  // PhD Guidance
  phd: {
    "Reg No": "regNo",
    "reg no": "regNo",
    "Reg_No": "regNo",
    "regno": "regNo",  // Backend uses regno, form uses regNo
    "regNo": "regNo",  // Direct alias
    "Name of Student": "nameOfStudent",
    "name of student": "nameOfStudent",
    "Name_of_Student": "nameOfStudent",
    "name": "nameOfStudent",  // Backend uses name, form uses nameOfStudent
    "nameOfStudent": "nameOfStudent",  // Direct alias
    "Date of Registration": "dateOfRegistration",
    "date of registration": "dateOfRegistration",
    "Date_of_Registration": "dateOfRegistration",
    "start_date": "dateOfRegistration",  // Backend uses start_date, form uses dateOfRegistration
    "dateOfRegistration": "dateOfRegistration",  // Direct alias
    "Topic": "topic",
    "topic": "topic",  // Add alias
    "Status": "status",
    "status": "status",  // Add alias
    "Year of Completion": "yearOfCompletion",
    "year of completion": "yearOfCompletion",
    "Year_of_Completion": "yearOfCompletion",
    "completion_year": "yearOfCompletion",  // Backend uses completion_year, form uses yearOfCompletion
    "yearOfCompletion": "yearOfCompletion",  // Direct alias
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
    "name": "name",  // Add alias
    "Course Type": "course_type",
    "course type": "course_type",
    "Course_Type": "course_type",
    "course_type": "course_type",  // Add alias
    "refresher_type": "course_type",  // Form uses refresher_type, map to course_type
    "Start Date": "start_date",
    "start date": "start_date",
    "Start_Date": "start_date",
    "start_date": "start_date",  // Add alias
    "startdate": "start_date",  // Form field name alias
    "End Date": "end_date",
    "end date": "end_date",
    "End_Date": "end_date",
    "end_date": "end_date",  // Add alias
    "enddate": "end_date",  // Form field name alias
    "Orgnizing University": "organizing_university",
    "organizing university": "organizing_university",
    "Orgnizing_University": "organizing_university",
    "organizing_university": "organizing_university",  // Add alias
    "university": "organizing_university",  // Form field name alias
    "Orgnizing Institute": "organizing_institute",
    "organizing institute": "organizing_institute",
    "Orgnizing_Institute": "organizing_institute",
    "organizing_institute": "organizing_institute",  // Add alias
    "institute": "organizing_institute",  // Form field name alias
    "Orgnizing Department": "organizing_department",
    "organizing department": "organizing_department",
    "Orgnizing_Department": "organizing_department",
    "organizing_department": "organizing_department",  // Add alias
    "department": "organizing_department",  // Form field name alias
    "Centre": "centre",
    "centre": "centre",  // Add alias
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
    "name of activity": "name_of_activity",
    "Name_of_Activity": "name_of_activity",
    "name_of_activity": "name_of_activity",  // Add alias
    "Nature of Activity": "names",
    "nature of activity": "names",
    "Nature_of_Activity": "names",
    "nature": "names",  // Add alias
    "names": "names",  // Direct alias
    "Level": "level",
    "level": "level",  // Add alias
    "Sponsered By": "sponsered",
    "sponsered by": "sponsered",
    "Sponsered_By": "sponsered",
    "sponsored_by": "sponsered",  // Add alias
    "sponsered": "sponsered",  // Direct alias
    "Place": "place",
    "place": "place",  // Add alias
    "Date": "date",
    "date": "date",  // Add alias
  },

  // Talks
  talks: {
    "Name": "name",
    "name": "name",  // Add alias
    "Programme": "programme",
    "programme": "programme",  // Add alias
    "Place": "place",
    "place": "place",  // Add alias
    "Talk Date": "date",
    "talk date": "date",  // Add normalized version
    "Talk_Date": "date",  // Add underscore version
    "date": "date",  // Add alias
    "Title of Event / Talk": "title",
    "title of event / talk": "title",  // Add normalized version
    "Title_of_Event_Talk": "title",  // Add underscore version
    "title": "title",  // Add alias
    "Participated As": "participated_as",
    "participated as": "participated_as",  // Add normalized version
    "Participated_As": "participated_as",  // Add underscore version
    "participated_as": "participated_as",  // Add alias
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
    .replace(/_/g, " ")  // Convert underscores to spaces FIRST (like awards fix)
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

