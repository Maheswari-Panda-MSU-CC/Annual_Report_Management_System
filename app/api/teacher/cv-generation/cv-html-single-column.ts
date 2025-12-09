import { cvTemplateStyles, type CVTemplate } from './cv-template-styles'
import type { CVData } from '@/types/cv-data'

// Helper function to escape HTML
function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return ''
  const str = String(text)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Format full date (DD/MM/YYYY)
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return 'N/A'
  }
}

// Format date to year only (for year-only fields)
function formatYear(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return 'N/A'
  }
}

// Helper to show value or N/A
function showValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'N/A'
  return String(value)
}

// Generate personal details section with profile image
function generatePersonalSection(cvData: CVData, template: CVTemplate): string {
  if (!cvData.personal) return ''
  
  const personal = cvData.personal
  const isProfessional = template === 'professional'
  const isAcademic = template === 'academic'
  const isClassic = template === 'classic'
  
  // Get base URL for images
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  // Profile image
  const profileImageUrl = personal.profileImage 
    ? (personal.profileImage.startsWith('http') ? personal.profileImage : `${baseUrl}${personal.profileImage}`)
    : null
  
  const sectionTitleColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  const borderColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  
  const tdBorderColor = isProfessional ? '#bfdbfe' : isAcademic ? '#bfdbfe' : isClassic ? '#fde68a' : '#d1d5db'
  
  return `
    <div style="margin-bottom: 24px; page-break-inside: avoid;">
      <div style="display: flex; gap: 24px; align-items: flex-start; background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid ${tdBorderColor};">
        <!-- Personal Information -->
        <div style="flex: 1;">
          <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 12px; margin-top: 0; line-height: 1.3;">
            ${escapeHtml(personal.name)}
          </h1>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin-bottom: 12px;">
            ${personal.designation ? `
              <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Designation:</span>
              <span style="font-size: 13px; color: #1f2937;">${escapeHtml(personal.designation)}</span>
            ` : ''}
            ${personal.department ? `
              <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Department:</span>
              <span style="font-size: 13px; color: #1f2937;">${escapeHtml(personal.department)}</span>
            ` : ''}
            ${personal.faculty ? `
              <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Faculty:</span>
              <span style="font-size: 13px; color: #1f2937;">${escapeHtml(personal.faculty)}</span>
            ` : ''}
            ${personal.institution ? `
              <span style="font-size: 13px; color: #6b7280; font-weight: 500;">Institution:</span>
              <span style="font-size: 13px; color: #1f2937;">${escapeHtml(personal.institution)}</span>
            ` : ''}
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px;">
              ${personal.email ? `
                <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Email:</span>
                <span style="font-size: 12px; color: #1f2937;">${escapeHtml(personal.email)}</span>
              ` : ''}
              ${personal.phone ? `
                <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Phone:</span>
                <span style="font-size: 12px; color: #1f2937;">${escapeHtml(personal.phone)}</span>
              ` : ''}
             
              ${personal.dateOfBirth ? `
                <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Date of Birth:</span>
                <span style="font-size: 12px; color: #1f2937;">${escapeHtml(personal.dateOfBirth)}</span>
              ` : ''}
            
              ${personal.orcid ? `
                <span style="font-size: 12px; color: #6b7280; font-weight: 500;">ORCID:</span>
                <span style="font-size: 12px; color: #1f2937;">${escapeHtml(personal.orcid)}</span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Profile Image - Right Side -->
        <div style="flex-shrink: 0;">
          ${profileImageUrl 
            ? `<img src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(personal.name)}" style="width: 144px; height: 144px; border-radius: 50%; object-fit: cover; border: 3px solid ${borderColor};" />`
            : `<div style="width: 144px; height: 144px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 48px; font-weight: bold; border: 3px solid ${borderColor};">${personal.name.charAt(0).toUpperCase()}</div>`
          }
        </div>
      </div>
    </div>
    <hr style="border: none; border-top: 2px solid ${borderColor}; margin: 24px 0;" />
  `
}

// Generate table section
function generateTableSection(
  title: string,
  headers: string[],
  rows: any[],
  renderRow: (row: any, idx: number) => string,
  template: CVTemplate,
): string {
  if (rows.length === 0) {
    const sectionTitleColor = template === 'professional' ? '#1e3a8a' : template === 'academic' ? '#1e3a8a' : template === 'classic' ? '#92400e' : '#374151'
    const borderColor = template === 'professional' ? '#1e3a8a' : template === 'academic' ? '#1e3a8a' : template === 'classic' ? '#92400e' : '#374151'
    const tdBorderColor = template === 'professional' ? '#bfdbfe' : template === 'academic' ? '#bfdbfe' : template === 'classic' ? '#fde68a' : '#d1d5db'
    return `
      <div style="page-break-inside: avoid; margin-bottom: 20px;">
        <h2 style="font-size: 14px; font-weight: bold; color: ${sectionTitleColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          ${escapeHtml(title)}
        </h2>
        <div style="padding: 16px; background-color: #f9fafb; border: 1px solid ${tdBorderColor}; border-radius: 4px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0 0 8px 0; font-weight: 500; color: #374151;">No data available for this section.</p>
          <p style="margin: 0; font-size: 11px;"><strong>Expected columns:</strong> ${headers.map(h => escapeHtml(h)).join(', ')}</p>
        </div>
      </div>
    `
  }
  
  const isProfessional = template === 'professional'
  const isAcademic = template === 'academic'
  const isClassic = template === 'classic'
  
  const sectionTitleColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  const borderColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  const thBgColor = isProfessional ? '#eff6ff' : isAcademic ? '#eff6ff' : isClassic ? '#fef3c7' : '#f3f4f6'
  const thBorderColor = isProfessional ? '#bfdbfe' : isAcademic ? '#bfdbfe' : isClassic ? '#fde68a' : '#d1d5db'
  
  const tableRows = rows.map((row, idx) => {
    const cells = renderRow(row, idx)
    return `<tr style="page-break-inside: avoid;">${cells}</tr>`
  }).join('')
  
  return `
    <div style="page-break-inside: avoid; margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: bold; color: ${sectionTitleColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${escapeHtml(title)}
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px;">
        <thead>
          <tr>
            ${headers.map(header => `
              <th style="background-color: ${thBgColor}; border: 1px solid ${thBorderColor}; padding: 8px 10px; text-align: left; font-weight: bold; color: ${sectionTitleColor}; font-size: 12px;">
                ${escapeHtml(header)}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `
}

// Generate complete single-column HTML document for CV
export function generateCVHTMLSingleColumn(
  cvData: CVData,
  template: CVTemplate,
  selectedSections: string[],
): string {
  if (!cvData.personal) {
    throw new Error('Personal information is required')
  }

  const fontFamily = template === 'modern' || template === 'professional' 
    ? 'Calibri, Arial, sans-serif' 
    : 'Times New Roman, serif'
  
  const isProfessional = template === 'professional'
  const isAcademic = template === 'academic'
  const isClassic = template === 'classic'
  
  const sectionTitleColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  const borderColor = isProfessional ? '#1e3a8a' : isAcademic ? '#1e3a8a' : isClassic ? '#92400e' : '#374151'
  const tdBorderColor = isProfessional ? '#bfdbfe' : isAcademic ? '#bfdbfe' : isClassic ? '#fde68a' : '#d1d5db'
  
  let sectionsHTML = ''
  
  // Personal Section
  if (selectedSections.includes('personal')) {
    sectionsHTML += generatePersonalSection(cvData, template)
  }
  
  // Education
  if (selectedSections.includes('education') && cvData.education.length > 0) {
    sectionsHTML += generateTableSection(
      'Education Detail',
      ['Degree Level', 'Institution/University', 'Year', 'Subject', 'State', 'QS Ranking'],
      cvData.education,
      (edu: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(edu.degree_type))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(edu.university_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${edu.year_of_passing ? formatYear(edu.year_of_passing) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(edu.subject))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(edu.state))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(edu.QS_Ranking))}</td>
      `,
      template,
    )
  }
  
  // Postdoc
  if (selectedSections.includes('postdoc') && cvData.postdoc.length > 0) {
    sectionsHTML += generateTableSection(
      'Post Doctoral Research Experience',
      ['Institute', 'Start Date', 'End Date', 'Sponsored By'],
      cvData.postdoc,
      (postdoc: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(postdoc.Institute))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${postdoc.Start_Date ? formatDate(postdoc.Start_Date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${postdoc.End_Date ? formatDate(postdoc.End_Date) : 'Present'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(postdoc.SponsoredBy))}</td>
      `,
      template,
    )
  }
  
  // Experience
  if (selectedSections.includes('experience') && cvData.experience.length > 0) {
    sectionsHTML += generateTableSection(
      'Experience Detail',
      ['Designation', 'Employer/Institution', 'Start Date', 'End Date', 'Nature', 'Is Currently Working'],
      cvData.experience,
      (exp: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(exp.desig))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(exp.Employeer))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${exp.Start_Date ? formatDate(exp.Start_Date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${exp.End_Date ? formatDate(exp.End_Date) : exp.currente ? 'Present' : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(exp.Nature))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${exp.currente ? 'Yes' : 'No'}</td>
      `,
      template,
    )
  }
  
  // Research
  if (selectedSections.includes('research')) {
    if (cvData.research.length > 0) {
      sectionsHTML += generateTableSection(
        'Research Projects Detail',
        ['Title', 'Funding Agency', 'Project Nature', 'Duration (Months)', 'Status', 'Date'],
        cvData.research,
        (proj: any) => `
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(proj.title))}</td>
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(proj.Funding_Agency_Name))}</td>
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(proj.Proj_Nature_Name))}</td>
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(proj.duration))}</td>
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(proj.Proj_Status_Name))}</td>
          <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${proj.start_date ? formatDate(proj.start_date) : 'N/A'}</td>
        `,
        template,
      )
    } else {
      sectionsHTML += `
        <div style="page-break-inside: avoid; margin-bottom: 20px;">
          <h2 style="font-size: 14px; font-weight: bold; color: ${sectionTitleColor}; border-bottom: 2px solid ${borderColor}; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Research Projects Detail
          </h2>
          <div style="padding: 16px; background-color: #f9fafb; border: 1px solid ${tdBorderColor}; border-radius: 4px; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 8px 0; font-weight: 500; color: #374151;">No data available for this section.</p>
            <p style="margin: 0; font-size: 11px;"><strong>Expected columns:</strong> Title, Funding Agency, Project Nature, Duration (Months), Status, Date</p>
          </div>
        </div>
      `
    }
  }
  
  // Patents
  if (selectedSections.includes('patents') && cvData.patents.length > 0) {
    sectionsHTML += generateTableSection(
      'Patents Detail',
      ['Title', 'Level', 'Status', 'Tech License', 'Date'],
      cvData.patents,
      (patent: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(patent.title))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(patent.Res_Pub_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(patent.Patent_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(patent.Tech_Licence))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${patent.date ? formatDate(patent.date) : 'N/A'}</td>
      `,
      template,
    )
  }
  
  // E-Content
  if (selectedSections.includes('econtent') && cvData.econtent.length > 0) {
    sectionsHTML += generateTableSection(
      'E-Contents Detail',
      ['Title', 'Brief Details', 'Link', 'Content Type', 'Platform'],
      cvData.econtent,
      (econtent: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(econtent.title))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(econtent.Brief_Details))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${econtent.link ? `<a href="${escapeHtml(econtent.link)}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(econtent.link)}</a>` : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(econtent.EcontentTypeName))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(econtent.Econtent_PlatformName))}</td>
      `,
      template,
    )
  }
  
  // Consultancy
  if (selectedSections.includes('consultancy') && cvData.consultancy.length > 0) {
    sectionsHTML += generateTableSection(
      'Consultancy Undertaken Detail',
      ['Name', 'Collaborating Institution', 'Address', 'Duration', 'Amount', 'Start Date', 'Outcome'],
      cvData.consultancy,
      (consult: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.collaborating_inst))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.address))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.duration))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.amount))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${consult.Start_Date ? formatDate(consult.Start_Date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(consult.outcome))}</td>
      `,
      template,
    )
  }
  
  // Collaborations
  if (selectedSections.includes('collaborations') && cvData.collaborations.length > 0) {
    sectionsHTML += generateTableSection(
      'Collaborations Detail',
      ['Collaboration Name', 'Collaborating Institution', 'Category', 'Level', 'Outcome', 'Starting Date', 'Duration', 'Status'],
      cvData.collaborations,
      (collab: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.collab_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.collaborating_inst))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.category))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.Collaborations_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.Collaborations_Outcome_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${collab.starting_date ? formatDate(collab.starting_date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.duration))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(collab.collab_status))}</td>
      `,
      template,
    )
  }
  
  // PhD Guidance
  if (selectedSections.includes('phdguidance') && cvData.phdguidance.length > 0) {
    sectionsHTML += generateTableSection(
      'Ph.D. Guidance Detail',
      ['Student Name', 'Registration No', 'Topic', 'Status', 'Date Registered', 'Year of Completion'],
      cvData.phdguidance,
      (phd: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(phd.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(phd.regno))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(phd.topic))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(phd.Res_Proj_Other_Details_Status_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${phd.start_date ? formatDate(phd.start_date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(phd.year_of_completion))}</td>
      `,
      template,
    )
  }
  
  // Books
  if (selectedSections.includes('books') && cvData.books.length > 0) {
    sectionsHTML += generateTableSection(
      'Book Published Detail',
      ['S.No', 'Authors', 'Title', 'Publisher', 'Place', 'Book Type', 'Author Type', 'Level', 'Year', 'ISBN'],
      cvData.books,
      (book: any, idx: number) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${idx + 1}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.authors))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.title))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.publisher_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.Book_Type_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.Author_Type_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.Res_Pub_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${book.submit_date ? formatYear(book.submit_date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(book.isbn))}</td>
      `,
      template,
    )
  }
  
  // Papers
  if (selectedSections.includes('papers') && cvData.papers.length > 0) {
    sectionsHTML += generateTableSection(
      'Paper Presented Detail',
      ['S.No', 'Authors', 'Title of Paper', 'Theme', 'Level', 'Organising Body', 'Place', 'Published Year'],
      cvData.papers,
      (paper: any, idx: number) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${idx + 1}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.authors))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.title_of_paper))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.theme))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.Res_Pub_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.organising_body))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(paper.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${paper.date ? formatYear(paper.date) : 'N/A'}</td>
      `,
      template,
    )
  }
  
  // Articles
  if (selectedSections.includes('articles') && cvData.articles.length > 0) {
    sectionsHTML += generateTableSection(
      'Published Articles/Papers in Journals/Edited Volumes',
      ['S.No', 'Authors', 'Title', 'Journal Name', 'Volume No', 'Page No', 'ISSN', 'Level', 'Published Year'],
      cvData.articles,
      (pub: any, idx: number) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${idx + 1}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.authors))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.title))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.journal_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.volume_num))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.page_num))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.issn))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(pub.Res_Pub_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${pub.month_year ? formatYear(pub.month_year) : 'N/A'}</td>
      `,
      template,
    )
  }
  
  // Awards
  if (selectedSections.includes('awards') && cvData.awards.length > 0) {
    sectionsHTML += generateTableSection(
      'Awards/Fellowship Detail',
      ['Name', 'Organization', 'Level', 'Date of Award', 'Details', 'Address'],
      cvData.awards,
      (award: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(award.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(award.organization))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(award.Expr1))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${award.date_of_award ? formatDate(award.date_of_award) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(award.details))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(award.address))}</td>
      `,
      template,
    )
  }
  
  // Talks
  if (selectedSections.includes('talks') && cvData.talks.length > 0) {
    sectionsHTML += generateTableSection(
      'Talk Detail',
      ['Title/Name', 'Programme', 'Place', 'Participated As', 'Date'],
      cvData.talks,
      (talk: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(talk.title || talk.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(talk.teacher_talks_prog_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(talk.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(talk.teacher_talks_parti_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${talk.date ? formatDate(talk.date) : 'N/A'}</td>
      `,
      template,
    )
  }
  
  // Academic Contribution
  if (selectedSections.includes('academic_contribution') && cvData.academic_contribution.length > 0) {
    sectionsHTML += generateTableSection(
      'Contribution in Academic Programme Detail',
      ['Name', 'Programme', 'Participated As', 'Place', 'Date', 'Year'],
      cvData.academic_contribution,
      (contri: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(contri.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(contri.Expr2))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(contri.Expr1))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(contri.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${contri.date ? formatDate(contri.date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(contri.Expr22))}</td>
      `,
      template,
    )
  }
  
  // Academic Participation
  if (selectedSections.includes('academic_participation') && cvData.academic_participation.length > 0) {
    sectionsHTML += generateTableSection(
      'Participation in Academic Programme Detail',
      ['Name', 'Academic Body', 'Participated As', 'Place', 'Submit Date', 'Year'],
      cvData.academic_participation,
      (parti: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(parti.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(parti.acad_body))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(parti.participated_as))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(parti.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${parti.submit_date ? formatDate(parti.submit_date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(parti.Report_Yr))}</td>
      `,
      template,
    )
  }
  
  // Committees
  if (selectedSections.includes('committees') && cvData.committees.length > 0) {
    sectionsHTML += generateTableSection(
      'Participation in Academic Committee',
      ['Name', 'Committee Name', 'Level', 'Participated As', 'Submit Date', 'Year'],
      cvData.committees,
      (committee: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(committee.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(committee.committee_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(committee.Parti_Commi_Level_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(committee.participated_as))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${committee.submit_date ? formatDate(committee.submit_date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(committee.Expr28))}</td>
      `,
      template,
    )
  }
  
  // Performance
  if (selectedSections.includes('performance') && cvData.performance.length > 0) {
    sectionsHTML += generateTableSection(
      'Performance by Individual/Group Detail',
      ['Name', 'Place', 'Date', 'Nature'],
      cvData.performance,
      (perf: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(perf.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(perf.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${perf.date ? formatDate(perf.date) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(perf.perf_nature))}</td>
      `,
      template,
    )
  }
  
  // Extension
  if (selectedSections.includes('extension') && cvData.extension.length > 0) {
    sectionsHTML += generateTableSection(
      'Extension Detail',
      ['Name of Activity', 'Place', 'Level', 'Sponsored By', 'Date'],
      cvData.extension,
      (ext: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(ext.name_of_activity || ext.names))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(ext.place))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(ext.Awards_Fellows_Level_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(ext.sponsered_name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${ext.date ? formatDate(ext.date) : 'N/A'}</td>
      `,
      template,
    )
  }
  
  // Orientation
  if (selectedSections.includes('orientation') && cvData.orientation.length > 0) {
    sectionsHTML += generateTableSection(
      'Orientation Course Detail',
      ['Name', 'Course Type', 'Institute', 'University', 'Department', 'Centre', 'Start Date', 'End Date'],
      cvData.orientation,
      (orient: any) => `
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.Refresher_Course_Type_Name))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.institute))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.university))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.department))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${escapeHtml(showValue(orient.centre))}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${orient.startdate ? formatDate(orient.startdate) : 'N/A'}</td>
        <td style="border: 1px solid ${tdBorderColor}; padding: 8px 10px; font-size: 12px; color: #1f2937;">${orient.enddate ? formatDate(orient.enddate) : 'N/A'}</td>
      `,
      template,
    )
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${escapeHtml(cvData.personal.name)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${fontFamily};
      background: #ffffff;
      color: #1f2937;
      line-height: 1.5;
      font-size: 12px;
      padding: 24px;
      overflow-x: hidden;
    }
    
    @page {
      size: A4;
      margin: 10mm;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      tfoot {
        display: table-footer-group;
      }
    }
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>
  `.trim()
}

