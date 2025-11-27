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

// Format date to year only
function formatYear(date: string | Date | null | undefined): string {
  if (!date) return ''
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return String(date)
  }
}

// Generate left column HTML (Profile, Contact, Personal)
function generateLeftColumn(cvData: CVData, template: CVTemplate, selectedSections: string[]): string {
  if (!cvData.personal) return ''
  
  const personal = cvData.personal
  const styles = cvTemplateStyles[template].previewStyles
  const isProfessional = template === 'professional'
  
  // Get base URL for images
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  // Profile image
  const profileImageUrl = personal.profileImage 
    ? (personal.profileImage.startsWith('http') ? personal.profileImage : `${baseUrl}${personal.profileImage}`)
    : null
  
  // Left column background color based on template
  // Use EXACT same colors as Word document for consistency
  // Professional: #1d4ed8 (dark blue) - matches Word shading
  // Academic: Light blue background (#eff6ff) with blue accents - differentiates from classic
  // Classic: Warm amber background (#fffbeb) with amber accents - differentiates from academic
  const leftColumnBg = isProfessional 
    ? 'background-color: #1d4ed8; color: #ffffff;' // Match Word document exactly
    : template === 'modern'
    ? 'background: linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%);'
    : template === 'academic'
    ? 'background-color: #eff6ff;' // Light blue for academic - differentiates from classic
    : template === 'classic'
    ? 'background-color: #fffbeb;' // Warm amber for classic - differentiates from academic
    : 'background-color: #f9fafb;'
  
  const leftColumnTextColor = isProfessional ? '#ffffff' : '#374151'
  const leftColumnBorder = isProfessional 
    ? 'border-right: 2px solid #1e40af;' 
    : template === 'modern'
    ? 'border-right: 2px solid #bfdbfe;'
    : template === 'academic'
    ? 'border-right: 2px solid #1e3a8a;' // Blue border for academic
    : template === 'classic'
    ? 'border-right: 2px solid #92400e;' // Amber border for classic
    : 'border-right: 2px solid #d1d5db;'
  
  return `
    <div style="width: 33.33%; flex: 0 0 33.33%; padding: 32px; min-height: 100vh; ${leftColumnBg} ${leftColumnBorder}">
      <!-- Profile Image -->
      <div style="text-align: center; margin-bottom: 24px;">
        ${profileImageUrl 
          ? `<img src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(personal.name)}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid ${isProfessional ? '#ffffff' : '#d1d5db'};" />`
          : `<div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${isProfessional ? '#3b82f6' : '#e5e7eb'}; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: ${isProfessional ? '#ffffff' : '#6b7280'}; font-size: 48px; font-weight: bold;">${personal.name.charAt(0).toUpperCase()}</div>`
        }
      </div>
      
      <!-- Contact Information -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-weight: bold !important; font-size: 16px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${isProfessional ? '#bfdbfe' : template === 'academic' ? '#1e3a8a' : template === 'classic' ? '#4b5563' : '#1f2937'} !important;">
          Contact
        </h2>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${personal.email ? `
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
              <span style="font-weight: 500 !important;">Email:</span> ${escapeHtml(personal.email)}
            </p>
          ` : ''}
          ${personal.phone ? `
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
              <span style="font-weight: 500 !important;">Phone:</span> ${escapeHtml(personal.phone)}
            </p>
          ` : ''}
          ${personal.address ? `
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
              <span style="font-weight: 500 !important;">Address:</span> ${escapeHtml(personal.address)}
            </p>
          ` : ''}
          ${personal.orcid ? `
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
              <span style="font-weight: 500 !important;">ORCID:</span> ${escapeHtml(personal.orcid)}
            </p>
          ` : ''}
        </div>
      </div>
      
      <!-- Personal Details -->
      ${selectedSections.includes('personal') && (personal.dateOfBirth || personal.nationality) ? `
        <div>
          <h2 style="font-weight: bold !important; font-size: 16px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${isProfessional ? '#bfdbfe' : template === 'academic' ? '#1e3a8a' : template === 'classic' ? '#4b5563' : '#1f2937'} !important;">
            Personal
          </h2>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${personal.dateOfBirth ? `
              <div>
                  <p style="font-size: 14px !important; font-weight: 500 !important; margin-bottom: 4px !important; color: ${isProfessional ? '#bfdbfe' : '#1f2937'} !important;">
                    Date of Birth
                  </p>
                  <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
                    ${escapeHtml(personal.dateOfBirth)}
                  </p>
              </div>
            ` : ''}
            ${personal.nationality ? `
              <div>
                  <p style="font-size: 14px !important; font-weight: 500 !important; margin-bottom: 4px !important; color: ${isProfessional ? '#bfdbfe' : '#1f2937'} !important;">
                    Nationality
                  </p>
                  <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${leftColumnTextColor} !important; margin: 0 !important;">
                    ${escapeHtml(personal.nationality)}
                  </p>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `
}

// Generate right column HTML (Header and all sections)
function generateRightColumn(cvData: CVData, template: CVTemplate, selectedSections: string[]): string {
  if (!cvData.personal) return ''
  
  const personal = cvData.personal
  const styles = cvTemplateStyles[template].previewStyles
  const isProfessional = template === 'professional'
  
  // Header styles - match preview exactly with print support
  const headerBg = isProfessional 
    ? 'background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; background-color: #1d4ed8 !important; color: white !important; padding: 30px !important; border-radius: 8px !important; margin-bottom: 30px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;'
    : ''
  
  const headerBorder = isProfessional 
    ? 'border-bottom: 1px solid #1e40af;' 
    : template === 'modern'
    ? 'border-bottom: 2px solid #bfdbfe; padding-bottom: 20px;'
    : template === 'academic'
    ? 'border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;' // Blue border for academic
    : template === 'classic'
    ? 'border-bottom: 2px solid #92400e; padding-bottom: 20px;' // Amber border for classic
    : 'border-bottom: 1px solid #9ca3af; padding-bottom: 20px;'
  
  // Ensure name color is visible - pure white for professional (on dark bg), dark for others
  const nameColor = isProfessional ? '#ffffff' : '#1f2937'
  const titleColor = isProfessional ? '#e0e7ff' : '#4b5563' // Light blue for professional, gray for others
  const institutionColor = isProfessional ? '#c7d2fe' : '#6b7280' // Lighter blue for professional
  
  // Section title styles - ensure colors are visible and bold
  // Differentiate academic (blue) from classic (amber/brown)
  const sectionTitleColor = isProfessional 
    ? '#1e3a8a' 
    : template === 'modern' 
    ? '#1e40af' 
    : template === 'academic' 
    ? '#1e3a8a' // Blue for academic
    : template === 'classic'
    ? '#92400e' // Amber/brown for classic (differentiates from academic)
    : '#374151'
  
  const sectionTitleBorder = isProfessional 
    ? 'border-left: 4px solid #1e3a8a !important; padding-left: 16px !important; border-bottom: none;'
    : template === 'modern'
    ? 'border-bottom: 2px solid #bfdbfe !important; padding-bottom: 10px !important; border-left: none;'
    : template === 'academic'
    ? 'border-bottom: 2px solid #1e3a8a !important; padding-bottom: 10px !important; border-left: none;' // Blue border
    : template === 'classic'
    ? 'border-bottom: 2px solid #92400e !important; padding-bottom: 10px !important; border-left: none; letter-spacing: 1px !important;' // Amber border with letter spacing
    : 'border-bottom: 1px solid #9ca3af !important; padding-bottom: 10px !important; border-left: none;'
  
  // Item styles - ensure good contrast and visibility
  const itemTitleColor = '#1f2937' // Dark gray for titles
  const itemSubtitleColor = isProfessional 
    ? '#2563eb' 
    : template === 'modern' 
    ? '#4b5563' 
    : template === 'academic'
    ? '#1e40af' // Blue for academic
    : template === 'classic'
    ? '#92400e' // Amber for classic
    : '#4b5563'
  const itemDetailsColor = '#6b7280' // Medium gray for details
  const itemBorderColor = template === 'academic' 
    ? '#dbeafe' // Light blue border for academic
    : template === 'classic'
    ? '#fef3c7' // Light amber border for classic
    : '#e5e7eb' // Light gray for others
  
  let sectionsHTML = ''
  
  // Education
  if (selectedSections.includes('education') && cvData.education.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Education
        </h2>
        ${cvData.education.map((edu: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 15px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important; line-height: 1.4 !important;">
              ${escapeHtml(edu.degree_name || edu.degree_type_name || edu.degree || '')}
            </p>
            <p style="font-size: 13px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important; line-height: 1.5 !important;">
              ${escapeHtml(edu.university_name || edu.institution || '')}${edu.year_of_passing ? `, ${formatYear(edu.year_of_passing)}` : edu.year ? `, ${escapeHtml(String(edu.year))}` : ''}
            </p>
            ${edu.subject ? `<p style="font-size: 12px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Subject: ${escapeHtml(edu.subject)}</p>` : ''}
            ${edu.state ? `<p style="font-size: 12px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">State: ${escapeHtml(edu.state)}</p>` : ''}
            ${edu.QS_Ranking ? `<p style="font-size: 12px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">QS Ranking: ${escapeHtml(edu.QS_Ranking)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Experience
  if (selectedSections.includes('experience') && cvData.experience.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Professional Experience
        </h2>
        ${cvData.experience.map((exp: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(exp.desig || exp.designation || exp.position || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(exp.Employeer || exp.institution || '')}
            </p>
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${itemDetailsColor} !important; margin: 4px 0 !important;">
              ${formatYear(exp.Start_Date || exp.from_date)} - ${formatYear(exp.End_Date || exp.to_date) || 'Present'}
            </p>
            ${exp.Nature ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Nature: ${escapeHtml(exp.Nature)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Postdoc
  if (selectedSections.includes('postdoc') && cvData.postdoc.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Post Doctoral Research Experience
        </h2>
        ${cvData.postdoc.map((postdoc: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(postdoc.Institute || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${formatYear(postdoc.Start_Date)} - ${formatYear(postdoc.End_Date) || 'Present'}
            </p>
            ${postdoc.SponsoredBy ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Sponsored By: ${escapeHtml(postdoc.SponsoredBy)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Research
  if (selectedSections.includes('research') && cvData.research.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Research Projects
        </h2>
        ${cvData.research.map((proj: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(proj.title || '')}
            </p>
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${itemDetailsColor} !important; margin: 4px 0 !important;">
              Funding Agency: ${escapeHtml(proj.funding_agency_name || proj.funding_agency || '')}
            </p>
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${itemDetailsColor} !important; margin: 4px 0 !important;">
              Amount: ${proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ''} | Duration: ${escapeHtml(proj.duration || '')} years
            </p>
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${itemDetailsColor} !important; margin: 4px 0 !important;">
              Status: ${escapeHtml(proj.status_name || proj.status || '')}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Articles/Publications
  if (selectedSections.includes('articles') && cvData.articles.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Publications
        </h2>
        ${cvData.articles.map((pub: any, index: number) => `
          <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-size: 14px !important; line-height: 1.6 !important; color: ${itemDetailsColor} !important; margin: 0 !important;">
              <span style="font-weight: 600 !important; color: ${itemTitleColor} !important;">${index + 1}.</span> ${escapeHtml(pub.authors || '')}. "${escapeHtml(pub.title || '')}". 
              <em>${escapeHtml(pub.journal_name || '')}</em>, ${pub.month_year ? formatYear(pub.month_year) : ''}. 
              ${pub.impact_factor ? `IF: ${escapeHtml(pub.impact_factor)}` : ''}. 
              ${pub.DOI ? `DOI: ${escapeHtml(pub.DOI)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Books
  if (selectedSections.includes('books') && cvData.books.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Books Published
        </h2>
        ${cvData.books.map((book: any, index: number) => `
          <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-size: 14px !important; line-height: 1.6 !important; color: ${itemDetailsColor} !important; margin: 0 !important;">
              <span style="font-weight: 600 !important; color: ${itemTitleColor} !important;">${index + 1}.</span> ${escapeHtml(book.authors || '')}. "${escapeHtml(book.title || '')}". 
              ${escapeHtml(book.publisher_name || '')}, ${formatYear(book.submit_date)}
              ${book.isbn ? `. ISBN: ${escapeHtml(book.isbn)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Papers
  if (selectedSections.includes('papers') && cvData.papers.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Papers Presented
        </h2>
        ${cvData.papers.map((paper: any, index: number) => `
          <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-size: 14px !important; line-height: 1.6 !important; color: ${itemDetailsColor} !important; margin: 0 !important;">
              <span style="font-weight: 600 !important; color: ${itemTitleColor} !important;">${index + 1}.</span> ${escapeHtml(paper.authors || '')}. "${escapeHtml(paper.title_of_paper || '')}". 
              ${escapeHtml(paper.organising_body || '')}
              ${paper.place ? `, ${escapeHtml(paper.place)}` : ''}
              ${paper.date ? `, ${formatYear(paper.date)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Awards
  if (selectedSections.includes('awards') && cvData.awards.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Awards & Honors
        </h2>
        ${cvData.awards.map((award: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(award.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(award.organization || '')}, ${award.date_of_award ? formatYear(award.date_of_award) : ''}
            </p>
            ${award.details ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">${escapeHtml(award.details)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Patents
  if (selectedSections.includes('patents') && cvData.patents.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Patents
        </h2>
        ${cvData.patents.map((patent: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(patent.title || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${formatYear(patent.date)}
            </p>
            ${patent.PatentApplicationNo ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Application No: ${escapeHtml(patent.PatentApplicationNo)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // E-Content
  if (selectedSections.includes('econtent') && cvData.econtent.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          E-Contents
        </h2>
        ${cvData.econtent.map((econtent: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(econtent.title || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(econtent.Publishing_Authorities || '')}
            </p>
            ${econtent.Publishing_date ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Published: ${formatYear(econtent.Publishing_date)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Consultancy
  if (selectedSections.includes('consultancy') && cvData.consultancy.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Consultancy Undertaken
        </h2>
        ${cvData.consultancy.map((consult: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(consult.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(consult.collaborating_inst || '')}
            </p>
            ${consult.Start_Date ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">${formatYear(consult.Start_Date)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Collaborations
  if (selectedSections.includes('collaborations') && cvData.collaborations.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Collaborations
        </h2>
        ${cvData.collaborations.map((collab: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(collab.collaborating_inst || collab.collab_name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(collab.category || '')}
            </p>
            ${collab.starting_date ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Started: ${formatYear(collab.starting_date)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // PhD Guidance
  if (selectedSections.includes('phdguidance') && cvData.phdguidance.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Ph.D. Guidance
        </h2>
        ${cvData.phdguidance.map((phd: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(phd.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              Registration: ${escapeHtml(phd.regno || '')}
            </p>
            <p style="font-size: 14px !important; line-height: 1.5 !important; color: ${itemDetailsColor} !important; margin: 4px 0 !important;">Topic: ${escapeHtml(phd.topic || '')}</p>
            ${phd.start_date ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Started: ${formatYear(phd.start_date)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Talks
  if (selectedSections.includes('talks') && cvData.talks.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Talks
        </h2>
        ${cvData.talks.map((talk: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(talk.title || talk.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(talk.place || '')}${talk.date ? `, ${formatYear(talk.date)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Academic Contribution
  if (selectedSections.includes('academic_contribution') && cvData.academic_contribution.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Contribution in Academic Programme
        </h2>
        ${cvData.academic_contribution.map((contri: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(contri.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(contri.place || '')}${contri.date ? `, ${formatYear(contri.date)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Academic Participation
  if (selectedSections.includes('academic_participation') && cvData.academic_participation.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Participation in Academic Programme
        </h2>
        ${cvData.academic_participation.map((parti: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(parti.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(parti.acad_body || '')}, ${escapeHtml(parti.place || '')}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Committees
  if (selectedSections.includes('committees') && cvData.committees.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Participation in Academic Committee
        </h2>
        ${cvData.committees.map((committee: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(committee.committee_name || committee.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(committee.participated_as || '')}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Performance
  if (selectedSections.includes('performance') && cvData.performance.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Performance by Individual/Group
        </h2>
        ${cvData.performance.map((perf: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(perf.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(perf.place || '')}${perf.date ? `, ${formatYear(perf.date)}` : ''}
            </p>
            ${perf.perf_nature ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">Nature: ${escapeHtml(perf.perf_nature)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Extension
  if (selectedSections.includes('extension') && cvData.extension.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Extension Activities
        </h2>
        ${cvData.extension.map((ext: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(ext.name_of_activity || ext.names || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(ext.place || '')}${ext.date ? `, ${formatYear(ext.date)}` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `
  }
  
  // Orientation
  if (selectedSections.includes('orientation') && cvData.orientation.length > 0) {
    sectionsHTML += `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <h2 style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-top: 32px !important; margin-bottom: 16px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${sectionTitleColor} !important; ${sectionTitleBorder}">
          Orientation Course
        </h2>
        ${cvData.orientation.map((orient: any) => `
          <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${itemBorderColor};">
            <p style="font-weight: ${template === 'modern' ? '600' : 'bold'} !important; font-size: 16px !important; margin-bottom: 6px !important; color: ${itemTitleColor} !important;">
              ${escapeHtml(orient.name || '')}
            </p>
            <p style="font-size: 14px !important; font-style: italic !important; margin-bottom: 6px !important; color: ${itemSubtitleColor} !important;">
              ${escapeHtml(orient.institute || orient.university || '')}
            </p>
            ${orient.startdate ? `<p style="font-size: 14px; line-height: 1.5; color: ${itemDetailsColor}; margin: 4px 0;">${formatYear(orient.startdate)}${orient.enddate ? ` - ${formatYear(orient.enddate)}` : ''}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }
  
  return `
    <div style="width: 66.67%; flex: 1 1 66.67%; padding: 32px; min-height: 100vh; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px; ${headerBg} ${!isProfessional ? headerBorder : ''} ${isProfessional ? 'background-color: #1d4ed8 !important;' : ''}">
        <h1 style="font-size: ${template === 'professional' ? '22px' : template === 'modern' ? '21px' : template === 'academic' ? '20px' : '19px'} !important; font-weight: bold !important; margin-bottom: 12px !important; color: ${nameColor} !important; line-height: 1.2 !important; ${isProfessional ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;' : ''}">
          ${escapeHtml(personal.name)}
        </h1>
        <p style="font-size: 15px !important; margin-bottom: 8px !important; color: ${titleColor} !important; line-height: 1.4 !important;">
          ${escapeHtml(personal.designation)}
        </p>
        <p style="font-size: 14px !important; margin-bottom: 8px !important; color: ${titleColor} !important; line-height: 1.4 !important;">
          ${escapeHtml(personal.department)}
        </p>
        <p style="font-size: 13px !important; margin-top: 4px !important; color: ${institutionColor} !important; line-height: 1.4 !important;">
          ${escapeHtml(personal.institution)}
        </p>
      </div>
      
      ${sectionsHTML}
    </div>
  `
}

// Generate complete two-column HTML document for CV
export function generateCVHTMLTwoColumn(
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
  
  const leftColumn = generateLeftColumn(cvData, template, selectedSections)
  const rightColumn = generateRightColumn(cvData, template, selectedSections)

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
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    .cv-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
      flex-direction: row;
    }
    
    .cv-container > div {
      flex-shrink: 0;
    }
    
    .clearfix::after {
      content: "";
      display: table;
      clear: both;
    }
    
    @page {
      size: A4;
      margin: 0;
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
      
      .item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container clearfix">
    ${leftColumn}
    ${rightColumn}
  </div>
</body>
</html>
  `.trim()
}

