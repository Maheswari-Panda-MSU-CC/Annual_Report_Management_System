import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  ShadingType,
  ImageRun,
  Media,
} from "docx"
import { type CVTemplate } from "./cv-template-styles"
import type { CVData } from "@/types/cv-data"

// Types are now imported from types/cv-data.ts

// Template-specific styling configurations
// Font sizes are in half-points (e.g., 45 = 22.5pt)
// Match preview exactly: text-3xl=30px=45hp, text-lg=18px=27hp, text-base=16px=24hp, text-sm=14px=21hp
const templateStyles = {
  academic: {
    nameSize: 43, // 22.5pt (30px) - matches preview text-3xl
    titleSize: 25, // 13.5pt (18px) - matches preview text-lg
    contactSize: 19, // 10.5pt (14px) - matches preview text-sm
    sectionHeadingSize: 21, // 12pt (16px) - matches preview text-base
    bodySize: 19, // 10.5pt (14px) - matches preview text-sm
    nameColor: "1f2937", // Dark gray - excellent contrast
    titleColor: "4b5563", // Medium gray - good hierarchy
    sectionColor: "1e3a8a", // Blue - professional and readable (differentiates from classic)
    fontFamily: "Times New Roman",
  },
  professional: {
    nameSize: 43, // 22.5pt (30px) - matches preview text-3xl
    titleSize: 25, // 13.5pt (18px) - matches preview text-lg
    contactSize: 19, // 10.5pt (14px) - matches preview text-sm
    sectionHeadingSize: 21, // 12pt (16px) - matches preview text-base
    bodySize: 19,  // 10.5pt (14px) - matches preview text-sm
    nameColor: "ffffff", // White - on dark blue background
    titleColor: "e0e7ff", // Light blue - good contrast on dark bg
    sectionColor: "1d4ed8", // Blue - matches theme
    fontFamily: "Calibri",
  },
  modern: {
    nameSize: 43, // 22.5pt (30px) - matches preview text-3xl
    titleSize: 25, // 13.5pt (18px) - matches preview text-lg
    contactSize: 19, // 10.5pt (14px) - matches preview text-sm
    sectionHeadingSize: 21, // 12pt (16px) - matches preview text-base
    bodySize: 19,  // 10.5pt (14px) - matches preview text-sm
    nameColor: "111827", // Very dark gray - excellent contrast
    titleColor: "4b5563", // Medium gray - good hierarchy
    sectionColor: "374151", // Dark gray - modern and readable
    fontFamily: "Calibri",
  },
  classic: {
    nameSize: 43, // 22.5pt (30px) - matches preview text-3xl
    titleSize: 25, // 13.5pt (18px) - matches preview text-lg
    contactSize: 19, // 10.5pt (14px) - matches preview text-sm
    sectionHeadingSize: 21, // 12pt (16px) - matches preview text-base
    bodySize: 19, // 10.5pt (14px) - matches preview text-sm
    nameColor: "1f2937", // Dark gray - excellent contrast
    titleColor: "4b5563", // Medium gray - different from academic
    sectionColor: "4b5563", // Dark gray for classic (different from academic blue)
    fontFamily: "Georgia", // Different font from academic (Times New Roman) to differentiate
  },
}

// Format full date (DD/MM/YYYY)
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A"
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return "N/A"
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return "N/A"
  }
}

// Helper to format year (for year-only fields)
function formatYear(date: string | Date | null | undefined): string {
  if (!date) return "N/A"
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return "N/A"
  }
}

// Helper to show value or N/A
function showValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return "N/A"
  return String(value)
}

// Create Word document section with template-specific styling
// Helper function to create section headings with template-specific colors
function createSectionHeading(
  text: string,
  template: CVTemplate,
  styles: typeof templateStyles.academic,
): Paragraph {
  const sectionHeadingColor = template === "professional" 
    ? "1e3a8a" 
    : template === "academic"
    ? "1e3a8a" // Blue for academic
    : template === "classic"
    ? "92400e" // Amber for classic
    : "374151"
  
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 18, // 9pt - smaller professional font
        color: sectionHeadingColor,
        font: styles.fontFamily,
      }),
    ],
    spacing: { after: 200, before: 400 },
    pageBreakBefore: false,
  })
}

// Helper to create table cell with borders
function createTableCell(text: string, styles: typeof templateStyles.academic, borderColor: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            size: 18, // 9pt
            font: styles.fontFamily,
          }),
        ],
      }),
    ],
    margins: {
      top: 120, // 6pt padding (120 twips = 6pt)
      bottom: 120,
      left: 120,
      right: 120,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    },
  })
}

// Helper to create table section
function createTableSection(
  title: string,
  headers: string[],
  rows: any[],
  renderRow: (row: any, idx: number, styles: typeof templateStyles.academic, borderColor: string) => TableCell[],
  template: CVTemplate,
  styles: typeof templateStyles.academic,
): (Paragraph | Table)[] {
  if (rows.length === 0) {
    const sectionHeadingColor = template === "professional" 
      ? "1e3a8a" 
      : template === "academic"
      ? "1e3a8a"
      : template === "classic"
      ? "92400e"
      : "374151"
    
    const borderColor = template === "professional" 
      ? "bfdbfe"
      : template === "academic"
      ? "bfdbfe"
      : template === "classic"
      ? "fde68a"
      : "d1d5db"
    
    return [
      createSectionHeading(title, template, styles),
      new Paragraph({
        children: [
          new TextRun({
            text: "No data available for this section.",
            size: 18,
            color: "374151",
            font: styles.fontFamily,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Expected columns: ${headers.join(", ")}`,
            size: 16,
            color: "6b7280",
            font: styles.fontFamily,
            italics: true,
      }),
    ],
    spacing: { after: 300 },
      }),
    ]
  }
  
  const sectionHeadingColor = template === "professional" 
    ? "1e3a8a" 
    : template === "academic"
    ? "1e3a8a"
    : template === "classic"
    ? "92400e"
    : "374151"
  
  const thBgColor = template === "professional" 
    ? "eff6ff"
    : template === "academic"
    ? "eff6ff"
    : template === "classic"
    ? "fef3c7"
    : "f3f4f6"
  
  const borderColor = template === "professional" 
    ? "bfdbfe"
    : template === "academic"
    ? "bfdbfe"
    : template === "classic"
    ? "fde68a"
    : "d1d5db"
  
  const sections: (Paragraph | Table)[] = []
  
  // Section heading
  sections.push(createSectionHeading(title, template, styles))
  
  // Create table
  const tableRows = [
    // Header row
    new TableRow({
      children: headers.map(header => 
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  size: 18, // 9pt
                  color: sectionHeadingColor,
                  font: styles.fontFamily,
                }),
              ],
            }),
          ],
          margins: {
            top: 120, // 6pt padding (120 twips = 6pt)
            bottom: 120,
            left: 120,
            right: 120,
          },
          shading: {
            type: ShadingType.SOLID,
            color: thBgColor,
            fill: thBgColor,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
            left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
            right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          },
        })
      ),
    }),
    // Data rows
    ...rows.map((row, idx) => 
      new TableRow({
        children: renderRow(row, idx, styles, borderColor),
        cantSplit: true, // Prevent row from splitting across pages
      })
    ),
  ]
  
  sections.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      },
    })
  )
  
  // Add spacing after table
  sections.push(new Paragraph({ text: "", spacing: { after: 300 } }))
  
  return sections
}

function createWordSection(
  sectionId: string,
  data: CVData,
  template: CVTemplate,
): (Paragraph | Table)[] {
  const sections: (Paragraph | Table)[] = []
  const styles = templateStyles[template]

  switch (sectionId) {
    case "personal":
      if (!data.personal) return []
      sections.push(
        new Paragraph({
          text: "Personal Information",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
        }),
      )

      // Create a table for personal information
      const personalRows = [
        ["Name", data.personal.name || ""],
        ["Designation", data.personal.designation || ""],
        ["Department", data.personal.department || ""],
        ["Faculty", data.personal.faculty || ""],
        ["Institution", data.personal.institution || ""],
        ["Email", data.personal.email || ""],
        ["Phone", data.personal.phone || ""],
        ["Date of Birth", data.personal.dateOfBirth || ""],
        ["ORCHID", data.personal.orcid || ""],
      ]
        .filter(([_, value]) => value)
        .map(
          ([key, value]) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: key, bold: true, size: styles.bodySize })],
                    }),
                  ],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: String(value), size: styles.bodySize })],
                    }),
                  ],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
        )

      if (personalRows.length > 0) {
        // Add table as a separate element (not inside paragraph)
        sections.push(
          new Table({
            rows: personalRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        )
        sections.push(new Paragraph({ text: "", spacing: { after: 300 } }))
      }
      break

    case "education":
      if (data.education.length > 0) {
        const sectionHeadingColor = template === "professional" 
          ? "1e3a8a" 
          : template === "academic"
          ? "1e3a8a" // Blue for academic
          : template === "classic"
          ? "92400e" // Amber for classic
          : "374151"
        sections.push(createSectionHeading("Education", template, styles))
        data.education.forEach((edu: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree_type || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.university_name || ""}${
                    edu.year_of_passing
                      ? `, ${formatYear(edu.year_of_passing)}`
                      : ""
                  }`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 50 },
            }),
          )
          if (edu.subject) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `Subject: ${edu.subject}`, size: styles.bodySize }),
                ],
                spacing: { after: 50 },
              }),
            )
          }
          if (edu.state) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `State: ${edu.state}`, size: styles.bodySize }),
                ],
                spacing: { after: 50 },
              }),
            )
          }
          if (edu.QS_Ranking) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `QS Ranking: ${edu.QS_Ranking}`, size: styles.bodySize }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "experience":
      if (data.experience.length > 0) {
        sections.push(createSectionHeading("Professional Experience", template, styles))
        data.experience.forEach((exp: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.desig || exp.designation || exp.position || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.Employeer || exp.institution || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${
                    exp.Start_Date
                      ? formatYear(exp.Start_Date)
                      : exp.from_date
                        ? formatYear(exp.from_date)
                        : ""
                  } - ${
                    exp.End_Date
                      ? formatYear(exp.End_Date)
                      : exp.to_date
                        ? formatYear(exp.to_date)
                        : exp.currente
                          ? "Present"
                          : ""
                  }`,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 50 },
            }),
          )
          if (exp.Nature) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `Nature: ${exp.Nature}`, size: styles.bodySize }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "research":
      if (data.research.length > 0) {
        sections.push(createSectionHeading("Research Projects", template, styles))
        data.research.forEach((proj: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: proj.title || "", bold: true, size: styles.bodySize + 2 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Funding Agency: ${proj.funding_agency_name || proj.funding_agency || ""}`,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Amount: ${
                    proj.grant_sanctioned ? `₹${proj.grant_sanctioned.toLocaleString()}` : ""
                  } | Duration: ${proj.duration || ""} years`,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Status: ${proj.status_name || proj.status || ""}`,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "articles":
      if (data.articles.length > 0) {
        sections.push(createSectionHeading("Published Articles/Journals", template, styles))
        data.articles.forEach((pub: any, index: number) => {
          const pubText = `${index + 1}. ${pub.authors || ""}. "${pub.title || ""}". ${
            pub.journal_name || ""
          }, ${pub.month_year ? formatYear(pub.month_year) : ""}. ${
            pub.impact_factor ? `IF: ${pub.impact_factor}` : ""
          }. ${pub.DOI ? `DOI: ${pub.DOI}` : ""}`
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: pubText, size: styles.bodySize })],
              spacing: { after: 150 },
            }),
          )
        })
      }
      break

    case "postdoc":
      if (data.postdoc.length > 0) {
        sections.push(createSectionHeading("Post Doctoral Research Experience", template, styles))
        data.postdoc.forEach((postdoc: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: postdoc.Institute || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${postdoc.Start_Date ? formatYear(postdoc.Start_Date) : ""} - ${
                    postdoc.End_Date ? formatYear(postdoc.End_Date) : "Present"
                  }`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (postdoc.SponsoredBy) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Sponsored By: ${postdoc.SponsoredBy}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "patents":
      if (data.patents.length > 0) {
        sections.push(createSectionHeading("Patents", template, styles))
        data.patents.forEach((patent: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: patent.title || "", bold: true, size: styles.bodySize + 2 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: patent.date ? formatYear(patent.date) : "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (patent.PatentApplicationNo) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Application No: ${patent.PatentApplicationNo}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "econtent":
      if (data.econtent.length > 0) {
        sections.push(createSectionHeading("E-Contents", template, styles))
        data.econtent.forEach((econtent: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: econtent.title || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: econtent.Publishing_Authorities || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (econtent.Publishing_date) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Published: ${formatYear(econtent.Publishing_date)}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "consultancy":
      if (data.consultancy.length > 0) {
        sections.push(createSectionHeading("Consultancy Undertaken", template, styles))
        data.consultancy.forEach((consult: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: consult.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: consult.collaborating_inst || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (consult.Start_Date) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatYear(consult.Start_Date),
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "collaborations":
      if (data.collaborations.length > 0) {
        sections.push(createSectionHeading("Collaborations", template, styles))
        data.collaborations.forEach((collab: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: collab.collaborating_inst || collab.collab_name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: collab.category || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (collab.starting_date) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Started: ${formatYear(collab.starting_date)}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "phdguidance":
      if (data.phdguidance.length > 0) {
        sections.push(createSectionHeading("Ph.D. Guidance", template, styles))
        data.phdguidance.forEach((phd: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: phd.name || "", bold: true, size: styles.bodySize + 2 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Registration: ${phd.regno || ""}`,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Topic: ${phd.topic || ""}`, size: styles.bodySize }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (phd.start_date) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Started: ${formatYear(phd.start_date)}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "books":
      if (data.books.length > 0) {
        sections.push(createSectionHeading("Books Published", template, styles))
        data.books.forEach((book: any, index: number) => {
          const bookText = `${index + 1}. ${book.authors || ""}. "${book.title || ""}". ${
            book.publisher_name || ""
          }${book.submit_date ? `, ${formatYear(book.submit_date)}` : ""}${
            book.isbn ? `. ISBN: ${book.isbn}` : ""
          }`
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: bookText, size: styles.bodySize })],
              spacing: { after: 150 },
            }),
          )
        })
      }
      break

    case "papers":
      if (data.papers.length > 0) {
        sections.push(createSectionHeading("Papers Presented", template, styles))
        data.papers.forEach((paper: any, index: number) => {
          const paperText = `${index + 1}. ${paper.authors || ""}. "${paper.title_of_paper || ""}". ${
            paper.organising_body || ""
          }${paper.place ? `, ${paper.place}` : ""}${
            paper.date ? `, ${formatYear(paper.date)}` : ""
          }`
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: paperText, size: styles.bodySize })],
              spacing: { after: 150 },
            }),
          )
        })
      }
      break

    case "talks":
      if (data.talks.length > 0) {
        sections.push(createSectionHeading("Talks", template, styles))
        data.talks.forEach((talk: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: talk.title || talk.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${talk.place || ""}${talk.date ? `, ${formatYear(talk.date)}` : ""}`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "academic_contribution":
      if (data.academic_contribution.length > 0) {
        sections.push(createSectionHeading("Contribution in Academic Programme", template, styles))
        data.academic_contribution.forEach((contri: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: contri.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${contri.place || ""}${contri.date ? `, ${formatYear(contri.date)}` : ""}`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "academic_participation":
      if (data.academic_participation.length > 0) {
        sections.push(createSectionHeading("Participation in Academic Programme", template, styles))
        data.academic_participation.forEach((parti: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: parti.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${parti.acad_body || ""}, ${parti.place || ""}`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "committees":
      if (data.committees.length > 0) {
        sections.push(createSectionHeading("Participation in Academic Committee", template, styles))
        data.committees.forEach((committee: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: committee.committee_name || committee.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: committee.participated_as || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "performance":
      if (data.performance.length > 0) {
        sections.push(createSectionHeading("Performance by Individual/Group", template, styles))
        data.performance.forEach((perf: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: perf.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${perf.place || ""}${perf.date ? `, ${formatYear(perf.date)}` : ""}`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (perf.perf_nature) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Nature: ${perf.perf_nature}`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "extension":
      if (data.extension.length > 0) {
        sections.push(createSectionHeading("Extension Activities", template, styles))
        data.extension.forEach((ext: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: ext.name_of_activity || ext.names || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${ext.place || ""}${ext.date ? `, ${formatYear(ext.date)}` : ""}`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 200 },
            }),
          )
        })
      }
      break

    case "orientation":
      if (data.orientation.length > 0) {
        sections.push(createSectionHeading("Orientation Course", template, styles))
        data.orientation.forEach((orient: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: orient.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: orient.institute || orient.university || "",
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (orient.startdate) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${formatYear(orient.startdate)}${
                      orient.enddate ? ` - ${formatYear(orient.enddate)}` : ""
                    }`,
                    size: styles.bodySize,
                  }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    case "awards":
      if (data.awards.length > 0) {
        sections.push(createSectionHeading("Awards & Honors", template, styles))
        data.awards.forEach((award: any) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: award.name || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${award.organization || ""}, ${
                    award.date_of_award ? formatYear(award.date_of_award) : ""
                  }`,
                  italics: true,
                  size: styles.bodySize,
                }),
              ],
              spacing: { after: 100 },
            }),
          )
          if (award.details) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: award.details, size: styles.bodySize }),
                ],
                spacing: { after: 200 },
              }),
            )
          } else {
            sections.push(new Paragraph({ text: "", spacing: { after: 200 } }))
          }
        })
      }
      break

    default:
      break
  }

  return sections
}

// Helper function to fetch and convert image to buffer using API endpoint
async function fetchImageAsBuffer(imageUrl: string, sessionCookie?: string): Promise<Buffer | null> {
  try {
    // Determine the fetch URL
    let fetchUrl = imageUrl
    
    // If it's already a full HTTP URL (S3 or external), use it directly
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Check if it's an API endpoint
      if (imageUrl.includes('/api/teacher/profile/image')) {
        // API GET endpoint returns image directly, POST returns JSON with URL
        // Check if it's a GET request (has ?path=)
        if (imageUrl.includes('?path=') || imageUrl.includes('&path=')) {
          // GET endpoint - returns image directly
          fetchUrl = imageUrl
        } else {
          // POST endpoint - returns JSON, need to extract URL
          // But we're using GET, so this shouldn't happen
          fetchUrl = imageUrl
        }
      } else {
        // Direct image URL (S3 or external)
        fetchUrl = imageUrl
      }
    } else {
      // Relative path - construct API endpoint URL for production builds
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
      
      // Use GET endpoint which returns image directly
      fetchUrl = `${baseUrl}/api/teacher/profile/image?path=${encodeURIComponent(imageUrl)}`
    }
    
    // Prepare headers with session cookie for authenticated requests
    const headers: HeadersInit = {
      'Cache-Control': 'no-store', // Ensure fresh image in production
    }
    
    // Add session cookie if provided and if fetching from API endpoint
    if (sessionCookie && fetchUrl.includes('/api/teacher/profile/image')) {
      headers['Cookie'] = `session=${sessionCookie}`
    }
    
    // Fetch the image (API GET endpoint returns image directly, not JSON)
    const response = await fetch(fetchUrl, {
      headers,
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`)
      return null
    }
    
    // Check if response is an image
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.startsWith('image/')) {
      // Direct image response
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
    
    // If response is JSON (POST endpoint), extract URL
    try {
      const jsonData = await response.json()
      if (jsonData.success && jsonData.url) {
        // Fetch the actual image from the URL
        const imageResponse = await fetch(jsonData.url, { cache: 'no-store' })
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image from URL: ${imageResponse.statusText}`)
          return null
        }
        const arrayBuffer = await imageResponse.arrayBuffer()
        return Buffer.from(arrayBuffer)
      }
    } catch {
      // Not JSON, already handled above
    }
    
    console.error("Unexpected response format")
    return null
  } catch (error) {
    console.error("Error fetching image:", error)
    return null
  }
}

// Generate complete Word document - Single Column Layout
export async function generateWordDocument(
  cvData: CVData,
  template: CVTemplate,
  selectedSections: string[],
  sessionCookie?: string,
): Promise<Buffer> {
  if (!cvData.personal) {
    throw new Error("Personal information is required")
  }

  const styles = templateStyles[template]
  const content: (Paragraph | Table)[] = []
  
  const borderColor = template === "professional" 
    ? "bfdbfe"
    : template === "academic"
    ? "bfdbfe"
    : template === "classic"
    ? "fde68a"
    : "d1d5db"
  
  // Fetch profile image if available using API endpoint for production builds
  let profileImageBuffer: Buffer | null = null
  
  if (cvData.personal.profileImage) {
    profileImageBuffer = await fetchImageAsBuffer(cvData.personal.profileImage, sessionCookie)
  }
  
  // Personal Details Section with Profile Image
  if (selectedSections.includes("personal")) {
    // Create a table for personal details with image on right
    const personalTableRows = [
      new TableRow({
        children: [
          // Left cell - Personal Information
          new TableCell({
            children: [
              // Name
    new Paragraph({
      children: [
        new TextRun({
                    text: cvData.personal.name,
                    bold: true,
                    size: 32, // 16pt
                    color: "1f2937",
                    font: styles.fontFamily,
        }),
      ],
                spacing: { after: 150 },
              }),
              // Designation, Department, Institution
              ...(cvData.personal.designation ? [
    new Paragraph({
      children: [
        new TextRun({
                      text: `Designation: ${cvData.personal.designation}`,
                      size: 20, // 10pt
                      color: "4b5563",
                      font: styles.fontFamily,
        }),
      ],
                  spacing: { after: 80 },
                }),
              ] : []),
              ...(cvData.personal.department ? [
      new Paragraph({
        children: [
          new TextRun({
                      text: `Department: ${cvData.personal.department}`,
                      size: 20,
                      color: "4b5563",
                      font: styles.fontFamily,
          }),
        ],
                  spacing: { after: 80 },
                }),
              ] : []),
              ...(cvData.personal.faculty ? [
      new Paragraph({
        children: [
          new TextRun({
                      text: `Faculty: ${cvData.personal.faculty}`,
                      size: 20,
                      color: "4b5563",
                      font: styles.fontFamily,
          }),
        ],
                  spacing: { after: 80 },
                }),
              ] : []),
              ...(cvData.personal.institution ? [
      new Paragraph({
        children: [
          new TextRun({
                      text: `Institution: ${cvData.personal.institution}`,
                      size: 20,
                      color: "4b5563",
                      font: styles.fontFamily,
          }),
        ],
        spacing: { after: 100 },
                }),
              ] : []),
              // Contact details
              ...(cvData.personal.email ? [
      new Paragraph({
        children: [
          new TextRun({
                      text: `Email: ${cvData.personal.email}`,
                      size: 18, // 9pt
                      color: "6b7280",
                      font: styles.fontFamily,
          }),
        ],
                  spacing: { after: 60 },
                }),
              ] : []),
              ...(cvData.personal.phone ? [
      new Paragraph({
        children: [
          new TextRun({
                      text: `Phone: ${cvData.personal.phone}`,
                      size: 18,
                      color: "6b7280",
                      font: styles.fontFamily,
          }),
        ],
                  spacing: { after: 60 },
                }),
              ] : []),
             
              ...(cvData.personal.dateOfBirth ? [
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of Birth: ${cvData.personal.dateOfBirth}`,
                      size: 18,
                      color: "6b7280",
                      font: styles.fontFamily,
            }),
          ],
                  spacing: { after: 60 },
                }),
              ] : []),
       
              ...(cvData.personal.orcid ? [
    new Paragraph({
      children: [
        new TextRun({
                      text: `ORCHID: ${cvData.personal.orcid}`,
                      size: 18,
                      color: "6b7280",
          font: styles.fontFamily,
        }),
      ],
                  spacing: { after: 0 },
                }),
              ] : []),
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
            verticalAlign: "top",
          }),
          // Right cell - Profile Image
          new TableCell({
            children: [
              new Paragraph({
                children: profileImageBuffer
                  ? [
                      new ImageRun({
                        data: profileImageBuffer,
                        transformation: {
                          width: 144,
                          height: 144,
                        },
                        type: "jpg",
                      }),
                    ]
                  : [
                      new TextRun({
                        text: cvData.personal.name ? cvData.personal.name.charAt(0).toUpperCase() : "?",
                        bold: true,
                        size: 72, // Large font for initial
                        color: "6b7280",
                      }),
                    ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            verticalAlign: "top",
            shading: {
              type: ShadingType.SOLID,
              color: "f9fafb",
              fill: "f9fafb",
            },
          }),
      ],
      }),
    ]
    
    content.push(
      new Table({
        rows: personalTableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        },
      })
    )
    
    // Horizontal line separator
    content.push(
    new Paragraph({
      children: [
        new TextRun({
            text: "─".repeat(50),
            size: 18,
            color: template === "professional" ? "1e3a8a" : template === "academic" ? "1e3a8a" : template === "classic" ? "92400e" : "374151",
        }),
      ],
        spacing: { after: 300 },
      })
    )
  }
  
  // Generate table sections for all other sections
  const sectionHandlers: Record<string, (data: CVData, template: CVTemplate, styles: typeof templateStyles.academic) => (Paragraph | Table)[]> = {
    education: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Education Detail",
        ["Degree Level", "Institution/University", "Year", "Subject", "State", "QS Ranking"],
        data.education,
        (edu: any) => [
          createTableCell(showValue(edu.degree_type), styles, borderColor),
          createTableCell(showValue(edu.university_name), styles, borderColor),
          createTableCell(edu.year_of_passing ? formatYear(edu.year_of_passing) : "N/A", styles, borderColor),
          createTableCell(showValue(edu.subject), styles, borderColor),
          createTableCell(showValue(edu.state), styles, borderColor),
          createTableCell(showValue(edu.QS_Ranking), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    postdoc: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Post Doctoral Research Experience",
        ["Institute", "Start Date", "End Date", "Sponsored By"],
        data.postdoc,
        (postdoc: any) => [
          createTableCell(showValue(postdoc.Institute), styles, borderColor),
          createTableCell(postdoc.Start_Date ? formatDate(postdoc.Start_Date) : "N/A", styles, borderColor),
          createTableCell(postdoc.End_Date ? formatDate(postdoc.End_Date) : "Present", styles, borderColor),
          createTableCell(showValue(postdoc.SponsoredBy), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    experience: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Experience Detail",
        ["Designation", "Employer/Institution", "Start Date", "End Date", "Nature", "Is Currently Working"],
        data.experience,
        (exp: any) => [
          createTableCell(showValue(exp.desig), styles, borderColor),
          createTableCell(showValue(exp.Employeer), styles, borderColor),
          createTableCell(exp.Start_Date ? formatDate(exp.Start_Date) : "N/A", styles, borderColor),
          createTableCell(exp.End_Date ? formatDate(exp.End_Date) : exp.currente ? "Present" : "N/A", styles, borderColor),
          createTableCell(showValue(exp.Nature), styles, borderColor),
          createTableCell(exp.currente ? "Yes" : "No", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    research: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Research Projects Detail",
        ["Title", "Funding Agency", "Project Nature", "Duration (Months)", "Status", "Date"],
        data.research,
        (proj: any) => [
          createTableCell(showValue(proj.title), styles, borderColor),
          createTableCell(showValue(proj.Funding_Agency_Name), styles, borderColor),
          createTableCell(showValue(proj.Proj_Nature_Name), styles, borderColor),
          createTableCell(showValue(proj.duration), styles, borderColor),
          createTableCell(showValue(proj.Proj_Status_Name), styles, borderColor),
          createTableCell(proj.start_date ? formatDate(proj.start_date) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    patents: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Patents Detail",
        ["Title", "Level", "Status", "Tech License", "Date"],
        data.patents,
        (patent: any) => [
          createTableCell(showValue(patent.title), styles, borderColor),
          createTableCell(showValue(patent.Res_Pub_Level_Name), styles, borderColor),
          createTableCell(showValue(patent.Patent_Level_Name), styles, borderColor),
          createTableCell(showValue(patent.Tech_Licence), styles, borderColor),
          createTableCell(patent.date ? formatDate(patent.date) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    econtent: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "E-Contents Detail",
        ["Title", "Brief Details", "Link", "Content Type", "Platform"],
        data.econtent,
        (econtent: any) => [
          createTableCell(showValue(econtent.title), styles, borderColor),
          createTableCell(showValue(econtent.Brief_Details), styles, borderColor),
          createTableCell(showValue(econtent.link), styles, borderColor),
          createTableCell(showValue(econtent.EcontentTypeName), styles, borderColor),
          createTableCell(showValue(econtent.Econtent_PlatformName), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    consultancy: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Consultancy Undertaken Detail",
        ["Name", "Collaborating Institution", "Address", "Duration", "Amount", "Start Date", "Outcome"],
        data.consultancy,
        (consult: any) => [
          createTableCell(showValue(consult.name), styles, borderColor),
          createTableCell(showValue(consult.collaborating_inst), styles, borderColor),
          createTableCell(showValue(consult.address), styles, borderColor),
          createTableCell(showValue(consult.duration), styles, borderColor),
          createTableCell(showValue(consult.amount), styles, borderColor),
          createTableCell(consult.Start_Date ? formatDate(consult.Start_Date) : "N/A", styles, borderColor),
          createTableCell(showValue(consult.outcome), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    collaborations: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Collaborations Detail",
        ["Collaboration Name", "Collaborating Institution", "Category", "Level", "Outcome", "Starting Date", "Duration", "Status"],
        data.collaborations,
        (collab: any) => [
          createTableCell(showValue(collab.collab_name), styles, borderColor),
          createTableCell(showValue(collab.collaborating_inst), styles, borderColor),
          createTableCell(showValue(collab.category), styles, borderColor),
          createTableCell(showValue(collab.Collaborations_Level_Name), styles, borderColor),
          createTableCell(showValue(collab.Collaborations_Outcome_Name), styles, borderColor),
          createTableCell(collab.starting_date ? formatDate(collab.starting_date) : "N/A", styles, borderColor),
          createTableCell(showValue(collab.duration), styles, borderColor),
          createTableCell(showValue(collab.collab_status), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    phdguidance: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Ph.D. Guidance Detail",
        ["Student Name", "Registration No", "Topic", "Status", "Date Registered", "Year of Completion"],
        data.phdguidance,
        (phd: any) => [
          createTableCell(showValue(phd.name), styles, borderColor),
          createTableCell(showValue(phd.regno), styles, borderColor),
          createTableCell(showValue(phd.topic), styles, borderColor),
          createTableCell(showValue(phd.Res_Proj_Other_Details_Status_Name), styles, borderColor),
          createTableCell(phd.start_date ? formatDate(phd.start_date) : "N/A", styles, borderColor),
          createTableCell(showValue(phd.year_of_completion), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    books: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Book Published Detail",
        ["S.No", "Authors", "Title", "Publisher", "Place", "Book Type", "Author Type", "Level", "Year", "ISBN"],
        data.books,
        (book: any, idx: number) => [
          createTableCell(String(idx + 1), styles, borderColor),
          createTableCell(showValue(book.authors), styles, borderColor),
          createTableCell(showValue(book.title), styles, borderColor),
          createTableCell(showValue(book.publisher_name), styles, borderColor),
          createTableCell(showValue(book.place), styles, borderColor),
          createTableCell(showValue(book.Book_Type_Name), styles, borderColor),
          createTableCell(showValue(book.Author_Type_Name), styles, borderColor),
          createTableCell(showValue(book.Res_Pub_Level_Name), styles, borderColor),
          createTableCell(book.submit_date ? formatYear(book.submit_date) : "N/A", styles, borderColor),
          createTableCell(showValue(book.isbn), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    papers: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Paper Presented Detail",
        ["S.No", "Authors", "Title of Paper", "Theme", "Level", "Organising Body", "Place", "Published Year"],
        data.papers,
        (paper: any, idx: number) => [
          createTableCell(String(idx + 1), styles, borderColor),
          createTableCell(showValue(paper.authors), styles, borderColor),
          createTableCell(showValue(paper.title_of_paper), styles, borderColor),
          createTableCell(showValue(paper.theme), styles, borderColor),
          createTableCell(showValue(paper.Res_Pub_Level_Name), styles, borderColor),
          createTableCell(showValue(paper.organising_body), styles, borderColor),
          createTableCell(showValue(paper.place), styles, borderColor),
          createTableCell(paper.date ? formatYear(paper.date) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    articles: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Published Articles/Papers in Journals/Edited Volumes",
        ["S.No", "Authors", "Title", "Journal Name", "Volume No", "Page No", "ISSN", "Level", "Published Year"],
        data.articles,
        (pub: any, idx: number) => [
          createTableCell(String(idx + 1), styles, borderColor),
          createTableCell(showValue(pub.authors), styles, borderColor),
          createTableCell(showValue(pub.title), styles, borderColor),
          createTableCell(showValue(pub.journal_name), styles, borderColor),
          createTableCell(showValue(pub.volume_num), styles, borderColor),
          createTableCell(showValue(pub.page_num), styles, borderColor),
          createTableCell(showValue(pub.issn), styles, borderColor),
          createTableCell(showValue(pub.Res_Pub_Level_Name), styles, borderColor),
          createTableCell(pub.month_year ? formatYear(pub.month_year) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    awards: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Awards/Fellowship Detail",
        ["Name", "Organization", "Level", "Date of Award", "Details", "Address"],
        data.awards,
        (award: any) => [
          createTableCell(showValue(award.name), styles, borderColor),
          createTableCell(showValue(award.organization), styles, borderColor),
          createTableCell(showValue(award.Expr1), styles, borderColor),
          createTableCell(award.date_of_award ? formatDate(award.date_of_award) : "N/A", styles, borderColor),
          createTableCell(showValue(award.details), styles, borderColor),
          createTableCell(showValue(award.address), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    talks: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Talk Detail",
        ["Title/Name", "Programme", "Place", "Participated As", "Date"],
        data.talks,
        (talk: any) => [
          createTableCell(showValue(talk.title || talk.name), styles, borderColor),
          createTableCell(showValue(talk.teacher_talks_prog_name), styles, borderColor),
          createTableCell(showValue(talk.place), styles, borderColor),
          createTableCell(showValue(talk.teacher_talks_parti_name), styles, borderColor),
          createTableCell(talk.date ? formatDate(talk.date) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    academic_contribution: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Contribution in Academic Programme Detail",
        ["Name", "Programme", "Participated As", "Place", "Date", "Year"],
        data.academic_contribution,
        (contri: any) => [
          createTableCell(showValue(contri.name), styles, borderColor),
          createTableCell(showValue(contri.Expr2), styles, borderColor),
          createTableCell(showValue(contri.Expr1), styles, borderColor),
          createTableCell(showValue(contri.place), styles, borderColor),
          createTableCell(contri.date ? formatDate(contri.date) : "N/A", styles, borderColor),
          createTableCell(showValue(contri.Expr22), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    academic_participation: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Participation in Academic Programme Detail",
        ["Name", "Academic Body", "Participated As", "Place", "Submit Date", "Year"],
        data.academic_participation,
        (parti: any) => [
          createTableCell(showValue(parti.name), styles, borderColor),
          createTableCell(showValue(parti.acad_body), styles, borderColor),
          createTableCell(showValue(parti.participated_as), styles, borderColor),
          createTableCell(showValue(parti.place), styles, borderColor),
          createTableCell(parti.submit_date ? formatDate(parti.submit_date) : "N/A", styles, borderColor),
          createTableCell(showValue(parti.Report_Yr), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    committees: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Participation in Academic Committee",
        ["Name", "Committee Name", "Level", "Participated As", "Submit Date", "Year"],
        data.committees,
        (committee: any) => [
          createTableCell(showValue(committee.name), styles, borderColor),
          createTableCell(showValue(committee.committee_name), styles, borderColor),
          createTableCell(showValue(committee.Parti_Commi_Level_Name), styles, borderColor),
          createTableCell(showValue(committee.participated_as), styles, borderColor),
          createTableCell(committee.submit_date ? formatDate(committee.submit_date) : "N/A", styles, borderColor),
          createTableCell(showValue(committee.Expr28), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    performance: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Performance by Individual/Group Detail",
        ["Name", "Place", "Date", "Nature"],
        data.performance,
        (perf: any) => [
          createTableCell(showValue(perf.name), styles, borderColor),
          createTableCell(showValue(perf.place), styles, borderColor),
          createTableCell(perf.date ? formatDate(perf.date) : "N/A", styles, borderColor),
          createTableCell(showValue(perf.perf_nature), styles, borderColor),
        ],
        template,
        styles,
      )
    },
    extension: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Extension Detail",
        ["Name of Activity", "Place", "Level", "Sponsored By", "Date"],
        data.extension,
        (ext: any) => [
          createTableCell(showValue(ext.name_of_activity || ext.names), styles, borderColor),
          createTableCell(showValue(ext.place), styles, borderColor),
          createTableCell(showValue(ext.Awards_Fellows_Level_name), styles, borderColor),
          createTableCell(showValue(ext.sponsered_name), styles, borderColor),
          createTableCell(ext.date ? formatDate(ext.date) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
    orientation: (data, template, styles) => {
      const borderColor = template === "professional" ? "bfdbfe" : template === "academic" ? "bfdbfe" : template === "classic" ? "fde68a" : "d1d5db"
      return createTableSection(
        "Orientation Course Detail",
        ["Name", "Course Type", "Institute", "University", "Department", "Centre", "Start Date", "End Date"],
        data.orientation,
        (orient: any) => [
          createTableCell(showValue(orient.name), styles, borderColor),
          createTableCell(showValue(orient.Refresher_Course_Type_Name), styles, borderColor),
          createTableCell(showValue(orient.institute), styles, borderColor),
          createTableCell(showValue(orient.university), styles, borderColor),
          createTableCell(showValue(orient.department), styles, borderColor),
          createTableCell(showValue(orient.centre), styles, borderColor),
          createTableCell(orient.startdate ? formatDate(orient.startdate) : "N/A", styles, borderColor),
          createTableCell(orient.enddate ? formatDate(orient.enddate) : "N/A", styles, borderColor),
        ],
        template,
        styles,
      )
    },
  }
  
  // Add selected sections (except personal which is already added)
  selectedSections.forEach((sectionId) => {
    if (sectionId !== "personal" && sectionHandlers[sectionId]) {
      const sectionContent = sectionHandlers[sectionId](cvData, template, styles)
      content.push(...sectionContent)
    }
  })

  // Create the document with all content
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: "portrait",
              width: 12240, // 8.5 inches in twips
              height: 15840, // 11 inches in twips
            },
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: content,
      },
    ],
  })

  // Generate blob and convert to buffer
  const blob = await Packer.toBlob(doc)
  return Buffer.from(await blob.arrayBuffer())
}

