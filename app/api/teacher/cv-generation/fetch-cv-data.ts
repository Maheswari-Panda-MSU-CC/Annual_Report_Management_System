import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import type { CVData, PersonalInfo } from "@/types/cv-data"

/**
 * Fetches CV data from database using sp_GetTeacherCVData stored procedure
 * @param teacherId - Teacher ID
 * @param selectedSections - Array of section IDs to include (frontend format)
 * @returns CVData object
 */
export async function fetchCVDataFromDB(
  teacherId: number,
  selectedSections: string[]
): Promise<CVData> {
  const pool = await connectToDatabase()

  // Map frontend section IDs to stored procedure section IDs
  const sectionMap: Record<string, string> = {
    'education': 'education',
    'postdoc': 'postdoc',
    'experience': 'experience',
    'research': 'research',
    'patents': 'patents',
    'econtent': 'econtent',
    'consultancy': 'consultancy',
    'collaborations': 'collaborations',
    'phdguidance': 'phdguidance',
    'books': 'books',
    'papers': 'papers',
    'reviews': 'reviews',
    'monographs': 'monographs',
    'articles': 'journals',
    'awards': 'awards',
    'talks': 'talks',
    'academic_contribution': 'contriacad',
    'academic_participation': 'partiacad',
    'committees': 'particomm',
    'performance': 'performance',
    'extension': 'extension',
    'orientation': 'refresher'
  }

  // Map section IDs to stored procedure parameter names
  // These must match the SP parameter names exactly
  const sectionFlags: Record<string, string> = {
    'education': 'GetEducationDetail',
    'postdoc': 'GetPostDoctoralExp',
    'experience': 'GetExperience',
    'research': 'GetResearchProject',
    'patents': 'GetPatents',
    'econtent': 'GetEContent',
    'consultancy': 'GetConsultancy',
    'collaborations': 'GetCollaborations',
    'phdguidance': 'GetPhdGuidance',
    'books': 'GetBook',
    'papers': 'GetPaperPresented',
    'reviews': 'GetReviews',      // Fixed: was 'review'
    'monographs': 'GetMonographs', // Fixed: was 'monographs' but inconsistent
    'journals': 'GetJournal',
    'refresher': 'GetRefresher',
    'contriacad': 'GetContriAcad',
    'partiacad': 'GetPartiAcad',
    'particomm': 'GetPartiCommi',
    'performance': 'GetPerformance',
    'awards': 'GetAwards',
    'extension': 'GetExtension',
    'talks': 'GetTalks'
  }

  // Build stored procedure request
  const spRequest = pool.request()
  spRequest.input('Tid', sql.Int, teacherId)

  // Convert frontend section IDs to SP section IDs and set flags
  const requestedSections = selectedSections
    .filter(s => s !== 'personal') // Personal is always included
    .map(s => sectionMap[s] || s)
    .filter(Boolean)

  // Set all section flags (1 if requested, 0 if not)
  Object.entries(sectionFlags).forEach(([sectionId, paramName]) => {
    spRequest.input(paramName, sql.Bit, requestedSections.includes(sectionId) ? 1 : 0)
  })

  // Execute stored procedure
  const result = await spRequest.execute('sp_GetTeacherCVData')

  const recordsets = result.recordsets as any[][]

  // Transform stored procedure results to CVData structure
  const basicInfo = recordsets[0]?.[0]
  
  if (!basicInfo) {
    throw new Error('Teacher not found')
  }

  // Build PersonalInfo from basic data
  // Note: The SP returns basic info with fields: Tid, fname, mname, lname, email_id, phone_no,
  // DOB, ORCHID_ID, DesignationName, DepartmentName, FacultyName, ProfileImage, etc.
  const personal: PersonalInfo = {
    name: (basicInfo.Abbri ? `${basicInfo.Abbri} ` : '') + [basicInfo.fname, basicInfo.mname, basicInfo.lname].filter(Boolean).join(' '),
    designation: basicInfo.DesignationName || '',
    department: basicInfo.DepartmentName || '',
    faculty: basicInfo.FacultyName || '',
    institution: 'The Maharaja Sayajirao University of Baroda',
    email: basicInfo.email_id || '',
    phone: basicInfo.phone_no?.toString() || '',
    dateOfBirth: basicInfo.DOB 
      ? (() => {
          try {
            const date = new Date(basicInfo.DOB)
            if (isNaN(date.getTime())) return ''
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}/${month}/${year}`
          } catch {
            return ''
          }
        })()
      : '',
    orcid: basicInfo.ORCHID_ID || '',
    profileImage: basicInfo.ProfileImage || null,
  }

  // Map recordsets to CVData sections
  // The stored procedure returns recordsets in a fixed order based on IF statements
  // Recordset 0 = Basic Info (already processed above)
  // Recordset indices 1-22 correspond to sections in this exact order (matching SP structure):
  const sectionOrder = [
    'education',      // Recordset 1: IF @GetEducationDetail = 1
    'postdoc',        // Recordset 2: IF @GetPostDoctoralExp = 1
    'experience',     // Recordset 3: IF @GetExperience = 1
    'research',       // Recordset 4: IF @GetResearchProject = 1
    'patents',        // Recordset 5: IF @GetPatents = 1
    'econtent',       // Recordset 6: IF @GetEContent = 1
    'consultancy',    // Recordset 7: IF @GetConsultancy = 1
    'collaborations', // Recordset 8: IF @GetCollaborations = 1
    'phdguidance',    // Recordset 9: IF @GetPhdGuidance = 1
    'books',          // Recordset 10: IF @GetBook = 1
    'papers',         // Recordset 11: IF @GetPaperPresented = 1
    'reviews',        // Recordset 12: IF @GetReviews = 1 (not used in CV currently)
    'monographs',     // Recordset 13: IF @GetMonographs = 1 (not used in CV currently)
    'journals',       // Recordset 14: IF @GetJournal = 1
    'refresher',      // Recordset 15: IF @GetRefresher = 1
    'contriacad',     // Recordset 16: IF @GetContriAcad = 1
    'partiacad',      // Recordset 17: IF @GetPartiAcad = 1
    'particomm',      // Recordset 18: IF @GetPartiCommi = 1
    'performance',    // Recordset 19: IF @GetPerformance = 1
    'awards',         // Recordset 20: IF @GetAwards = 1
    'extension',      // Recordset 21: IF @GetExtension = 1
    'talks'           // Recordset 22: IF @GetTalks = 1
  ]

  const sectionDataMap: Record<string, any[]> = {}

  // Map each section - recordsets are returned in order, empty array if section not requested
  // Note: SQL Server returns empty recordsets (not null) when IF condition is false
  sectionOrder.forEach((sectionId, index) => {
    const recordsetIndex = index + 1 // +1 because recordset 0 is basic info
    if (recordsetIndex < recordsets.length) {
      // Get the recordset, ensure it's an array (could be empty array if section not requested)
      const recordset = recordsets[recordsetIndex]
      sectionDataMap[sectionId] = Array.isArray(recordset) ? recordset : []
    } else {
      // If recordset doesn't exist, set to empty array
      sectionDataMap[sectionId] = []
    }
  })

  // Build CVData structure
  const cvData: CVData = {
    personal,
    education: sectionDataMap['education'] || [],
    postdoc: sectionDataMap['postdoc'] || [],
    experience: sectionDataMap['experience'] || [],
    research: sectionDataMap['research'] || [],
    patents: sectionDataMap['patents'] || [],
    econtent: sectionDataMap['econtent'] || [],
    consultancy: sectionDataMap['consultancy'] || [],
    collaborations: sectionDataMap['collaborations'] || [],
    phdguidance: sectionDataMap['phdguidance'] || [],
    books: sectionDataMap['books'] || [],
    papers: sectionDataMap['papers'] || [],
    articles: sectionDataMap['journals'] || [], // journals -> articles
    awards: sectionDataMap['awards'] || [],
    talks: sectionDataMap['talks'] || [],
    academic_contribution: sectionDataMap['contriacad'] || [],
    academic_participation: sectionDataMap['partiacad'] || [],
    committees: sectionDataMap['particomm'] || [],
    performance: sectionDataMap['performance'] || [],
    extension: sectionDataMap['extension'] || [],
    orientation: sectionDataMap['refresher'] || [], // refresher -> orientation
  }

  return cvData
}

