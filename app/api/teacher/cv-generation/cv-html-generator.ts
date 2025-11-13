import { cvTemplateStyles, type CVTemplate } from "./cv-template-styles"

interface PersonalInfo {
  name: string
  designation: string
  department: string
  institution: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  nationality: string
  orcid: string
}

interface CVData {
  personal: PersonalInfo | null
  education: any[]
  postdoc: any[]
  experience: any[]
  research: any[]
  patents: any[]
  econtent: any[]
  consultancy: any[]
  collaborations: any[]
  phdguidance: any[]
  books: any[]
  papers: any[]
  articles: any[]
  awards: any[]
  talks: any[]
  academic_contribution: any[]
  academic_participation: any[]
  committees: any[]
  performance: any[]
  extension: any[]
  orientation: any[]
}

// Helper function to escape HTML
function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return ""
  const str = String(text)
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Format date to year only
function formatYear(date: string | Date | null | undefined): string {
  if (!date) return ""
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return String(date)
  }
}

// Generate HTML for a CV section
function formatCVSection(sectionId: string, data: CVData, styles: any): string {
  if (!data.personal) return ""

  switch (sectionId) {
    case "personal":
      return `
        <div class="section">
          <div class="section-title">Personal Information</div>
          <table>
            <tr><th>Name</th><td>${escapeHtml(data.personal.name || "")}</td></tr>
            <tr><th>Designation</th><td>${escapeHtml(data.personal.designation || "")}</td></tr>
            <tr><th>Department</th><td>${escapeHtml(data.personal.department || "")}</td></tr>
            <tr><th>Institution</th><td>${escapeHtml(data.personal.institution || "")}</td></tr>
            <tr><th>Email</th><td>${escapeHtml(data.personal.email || "")}</td></tr>
            <tr><th>Phone</th><td>${escapeHtml(data.personal.phone || "")}</td></tr>
            <tr><th>Date of Birth</th><td>${escapeHtml(data.personal.dateOfBirth || "")}</td></tr>
            <tr><th>Nationality</th><td>${escapeHtml(data.personal.nationality || "")}</td></tr>
            <tr><th>ORCID</th><td>${escapeHtml(data.personal.orcid || "")}</td></tr>
          </table>
        </div>
      `
    case "education":
      if (data.education.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Education</div>
          ${data.education
            .map(
              (edu: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(edu.degree_name || edu.degree_type_name || edu.degree || "")}</div>
              <div class="item-subtitle">${escapeHtml(edu.university_name || edu.institution || "")}${edu.year_of_passing ? `, ${formatYear(edu.year_of_passing)}` : edu.year ? `, ${escapeHtml(String(edu.year))}` : ""}</div>
              ${edu.subject ? `<div class="item-details">Subject: ${escapeHtml(edu.subject)}</div>` : ""}
              ${edu.state ? `<div class="item-details">State: ${escapeHtml(edu.state)}</div>` : ""}
              ${edu.QS_Ranking ? `<div class="item-details">QS Ranking: ${escapeHtml(edu.QS_Ranking)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "experience":
      if (data.experience.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${data.experience
            .map(
              (exp: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(exp.desig || exp.designation || exp.position || "")}</div>
              <div class="item-subtitle">${escapeHtml(exp.Employeer || exp.institution || "")}</div>
              <div class="item-details">${exp.Start_Date ? formatYear(exp.Start_Date) : exp.from_date ? formatYear(exp.from_date) : ""} - ${exp.End_Date ? formatYear(exp.End_Date) : exp.to_date ? formatYear(exp.to_date) : exp.currente ? "Present" : ""}</div>
              ${exp.Nature ? `<div class="item-details">Nature: ${escapeHtml(exp.Nature)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "research":
      if (data.research.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Research Projects</div>
          ${data.research
            .map(
              (proj: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(proj.title || "")}</div>
              <div class="item-details">Funding Agency: ${escapeHtml(proj.funding_agency_name || proj.funding_agency || "")}</div>
              <div class="item-details">Amount: ${proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ""} | Duration: ${escapeHtml(proj.duration || "")} years</div>
              <div class="item-details">Status: ${escapeHtml(proj.status_name || proj.status || "")}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "articles":
      if (data.articles.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Publications</div>
          ${data.articles
            .map(
              (pub: any, index: number) => `
            <div class="publication">
              <strong>${index + 1}.</strong> ${escapeHtml(pub.authors || "")}. "${escapeHtml(pub.title || "")}". 
              <em>${escapeHtml(pub.journal_name || "")}</em>, ${pub.month_year ? formatYear(pub.month_year) : ""}. 
              ${pub.impact_factor ? `IF: ${escapeHtml(pub.impact_factor)}` : ""}. 
              ${pub.DOI ? `DOI: ${escapeHtml(pub.DOI)}` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "postdoc":
      if (data.postdoc.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Post Doctoral Research Experience</div>
          ${data.postdoc
            .map(
              (postdoc: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(postdoc.Institute || "")}</div>
              <div class="item-subtitle">${postdoc.Start_Date ? formatYear(postdoc.Start_Date) : ""} - ${postdoc.End_Date ? formatYear(postdoc.End_Date) : "Present"}</div>
              ${postdoc.SponsoredBy ? `<div class="item-details">Sponsored By: ${escapeHtml(postdoc.SponsoredBy)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "patents":
      if (data.patents.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Patents</div>
          ${data.patents
            .map(
              (patent: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(patent.title || "")}</div>
              <div class="item-subtitle">${patent.date ? formatYear(patent.date) : ""}</div>
              ${patent.PatentApplicationNo ? `<div class="item-details">Application No: ${escapeHtml(patent.PatentApplicationNo)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "econtent":
      if (data.econtent.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">E-Contents</div>
          ${data.econtent
            .map(
              (econtent: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(econtent.title || "")}</div>
              <div class="item-subtitle">${escapeHtml(econtent.Publishing_Authorities || "")}</div>
              ${econtent.Publishing_date ? `<div class="item-details">Published: ${formatYear(econtent.Publishing_date)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "consultancy":
      if (data.consultancy.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Consultancy Undertaken</div>
          ${data.consultancy
            .map(
              (consult: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(consult.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(consult.collaborating_inst || "")}</div>
              ${consult.Start_Date ? `<div class="item-details">${formatYear(consult.Start_Date)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "collaborations":
      if (data.collaborations.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Collaborations</div>
          ${data.collaborations
            .map(
              (collab: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(collab.collaborating_inst || collab.collab_name || "")}</div>
              <div class="item-subtitle">${escapeHtml(collab.category || "")}</div>
              ${collab.starting_date ? `<div class="item-details">Started: ${formatYear(collab.starting_date)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "phdguidance":
      if (data.phdguidance.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Ph.D. Guidance</div>
          ${data.phdguidance
            .map(
              (phd: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(phd.name || "")}</div>
              <div class="item-subtitle">Registration: ${escapeHtml(phd.regno || "")}</div>
              <div class="item-details">Topic: ${escapeHtml(phd.topic || "")}</div>
              ${phd.start_date ? `<div class="item-details">Started: ${formatYear(phd.start_date)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "books":
      if (data.books.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Books Published</div>
          ${data.books
            .map(
              (book: any, index: number) => `
            <div class="publication">
              <strong>${index + 1}.</strong> ${escapeHtml(book.authors || "")}. "${escapeHtml(book.title || "")}". ${escapeHtml(book.publisher_name || "")}${book.submit_date ? `, ${formatYear(book.submit_date)}` : ""}${book.isbn ? `. ISBN: ${escapeHtml(book.isbn)}` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "papers":
      if (data.papers.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Papers Presented</div>
          ${data.papers
            .map(
              (paper: any, index: number) => `
            <div class="publication">
              <strong>${index + 1}.</strong> ${escapeHtml(paper.authors || "")}. "${escapeHtml(paper.title_of_paper || "")}". ${escapeHtml(paper.organising_body || "")}${paper.place ? `, ${escapeHtml(paper.place)}` : ""}${paper.date ? `, ${formatYear(paper.date)}` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "talks":
      if (data.talks.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Talks</div>
          ${data.talks
            .map(
              (talk: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(talk.title || talk.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(talk.place || "")}${talk.date ? `, ${formatYear(talk.date)}` : ""}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "academic_contribution":
      if (data.academic_contribution.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Contribution in Academic Programme</div>
          ${data.academic_contribution
            .map(
              (contri: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(contri.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(contri.place || "")}${contri.date ? `, ${formatYear(contri.date)}` : ""}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "academic_participation":
      if (data.academic_participation.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Participation in Academic Programme</div>
          ${data.academic_participation
            .map(
              (parti: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(parti.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(parti.acad_body || "")}, ${escapeHtml(parti.place || "")}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "committees":
      if (data.committees.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Participation in Academic Committee</div>
          ${data.committees
            .map(
              (committee: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(committee.committee_name || committee.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(committee.participated_as || "")}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "performance":
      if (data.performance.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Performance by Individual/Group</div>
          ${data.performance
            .map(
              (perf: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(perf.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(perf.place || "")}${perf.date ? `, ${formatYear(perf.date)}` : ""}</div>
              ${perf.perf_nature ? `<div class="item-details">Nature: ${escapeHtml(perf.perf_nature)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "extension":
      if (data.extension.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Extension Activities</div>
          ${data.extension
            .map(
              (ext: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(ext.name_of_activity || ext.names || "")}</div>
              <div class="item-subtitle">${escapeHtml(ext.place || "")}${ext.date ? `, ${formatYear(ext.date)}` : ""}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "orientation":
      if (data.orientation.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Orientation Course</div>
          ${data.orientation
            .map(
              (orient: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(orient.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(orient.institute || orient.university || "")}</div>
              ${orient.startdate ? `<div class="item-details">${formatYear(orient.startdate)}${orient.enddate ? ` - ${formatYear(orient.enddate)}` : ""}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    case "awards":
      if (data.awards.length === 0) return ""
      return `
        <div class="section">
          <div class="section-title">Awards & Honors</div>
          ${data.awards
            .map(
              (award: any) => `
            <div class="item">
              <div class="item-title">${escapeHtml(award.name || "")}</div>
              <div class="item-subtitle">${escapeHtml(award.organization || "")}, ${award.date_of_award ? formatYear(award.date_of_award) : ""}</div>
              ${award.details ? `<div class="item-details">${escapeHtml(award.details)}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
    default:
      return ""
  }
}

// Generate complete HTML document for CV
export function generateCVHTML(
  cvData: CVData,
  template: CVTemplate,
  selectedSections: string[],
): string {
  if (!cvData.personal) {
    throw new Error("Personal information is required")
  }

  const styles = cvTemplateStyles[template].documentStyles
  const personal = cvData.personal

  const sectionsHTML = selectedSections
    .map((sectionId) => formatCVSection(sectionId, cvData, styles))
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${escapeHtml(personal.name)}</title>
  <style>
    @media print {
      body { margin: 0.5in; }
      .page-break { page-break-before: always; }
    }
    body { 
      ${styles.body}
    }
    .header { 
      ${styles.header}
    }
    .name { 
      ${styles.name}
    }
    .title { 
      ${styles.title}
    }
    .contact { 
      ${styles.contact}
    }
    .section { 
      ${styles.section}
    }
    .section-title { 
      ${styles.sectionTitle}
    }
    .item { 
      ${styles.item}
    }
    .item-title { 
      ${styles.itemTitle}
    }
    .item-subtitle { 
      ${styles.itemSubtitle}
    }
    .item-details { 
      ${styles.itemDetails}
    }
    table { 
      ${styles.table}
    }
    th { 
      ${styles.th}
    }
    td { 
      ${styles.td}
    }
    .publication { 
      ${styles.publication}
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${escapeHtml(personal.name)}</div>
    <div class="title">${escapeHtml(personal.designation)}</div>
    <div class="title">${escapeHtml(personal.department)}</div>
    <div class="title">${escapeHtml(personal.institution)}</div>
    <div class="contact">
      ${personal.email ? `Email: ${escapeHtml(personal.email)}` : ""}${personal.email && personal.phone ? " | " : ""}${personal.phone ? `Phone: ${escapeHtml(personal.phone)}` : ""}<br>
      ${personal.address ? `Address: ${escapeHtml(personal.address)}` : ""}${personal.address && personal.orcid ? "<br>" : ""}
      ${personal.orcid ? `ORCID: ${escapeHtml(personal.orcid)}` : ""}
    </div>
  </div>

  ${sectionsHTML}

  <div class="section">
    <div class="section-title">Document Information</div>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Template:</strong> ${template.charAt(0).toUpperCase() + template.slice(1)}</p>
    <p><strong>Sections included:</strong> ${selectedSections.length}</p>
  </div>
</body>
</html>
  `.trim()
}

