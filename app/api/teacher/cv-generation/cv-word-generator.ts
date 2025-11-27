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

// Helper to format year
function formatYear(date: string | Date | null | undefined): string {
  if (!date) return ""
  try {
    return new Date(date).getFullYear().toString()
  } catch {
    return String(date)
  }
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
        size: styles.sectionHeadingSize,
        color: sectionHeadingColor,
        font: styles.fontFamily,
      }),
    ],
    spacing: { after: 300 },
  })
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
        ["Institution", data.personal.institution || ""],
        ["Email", data.personal.email || ""],
        ["Phone", data.personal.phone || ""],
        ["Address", data.personal.address || ""],
        ["Date of Birth", data.personal.dateOfBirth || ""],
        ["Nationality", data.personal.nationality || ""],
        ["ORCID", data.personal.orcid || ""],
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
                  text: edu.degree_name || edu.degree_type_name || edu.degree || "",
                  bold: true,
                  size: styles.bodySize + 2,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.university_name || edu.institution || ""}${
                    edu.year_of_passing
                      ? `, ${formatYear(edu.year_of_passing)}`
                      : edu.year
                        ? `, ${edu.year}`
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

// Generate complete Word document
export async function generateWordDocument(
  cvData: CVData,
  template: CVTemplate,
  selectedSections: string[],
): Promise<Buffer> {
  if (!cvData.personal) {
    throw new Error("Personal information is required")
  }

  const styles = templateStyles[template]
  
  // Build left column content (Personal info, Contact)
  const leftColumnContent: (Paragraph | Table)[] = []
  
  // Profile image placeholder
  leftColumnContent.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "[Profile Image]",
          italics: true,
          size: styles.bodySize - 4,
          color: "888888",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Contact Information
  leftColumnContent.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "CONTACT",
          bold: true,
          size: styles.sectionHeadingSize - 8, // 24pt -> 16pt (8 half-points)
          color: template === "professional" 
            ? "e0e7ff" // Light blue for professional
            : template === "academic"
            ? "1e3a8a" // Blue for academic
            : template === "classic"
            ? "92400e" // Amber/brown for classic - differentiates from academic
            : styles.sectionColor,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  if (cvData.personal.email) {
    leftColumnContent.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Email: ${cvData.personal.email}`,
            size: styles.bodySize, // Use standard body size (24 = 12pt)
            color: template === "professional" ? "ffffff" : "1f2937", // White for professional, dark for others
          }),
        ],
        spacing: { after: 100 },
      })
    )
  }

  if (cvData.personal.phone) {
    leftColumnContent.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Phone: ${cvData.personal.phone}`,
            size: styles.bodySize,
            color: template === "professional" ? "ffffff" : "1f2937",
          }),
        ],
        spacing: { after: 100 },
      })
    )
  }

  if (cvData.personal.address) {
    leftColumnContent.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Address: ${cvData.personal.address}`,
            size: styles.bodySize,
            color: template === "professional" ? "ffffff" : "1f2937",
          }),
        ],
        spacing: { after: 100 },
      })
    )
  }

  if (cvData.personal.orcid) {
    leftColumnContent.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `ORCID: ${cvData.personal.orcid}`,
            size: styles.bodySize,
            color: template === "professional" ? "ffffff" : "1f2937",
          }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  // Personal Details (if selected)
  if (selectedSections.includes("personal") && (cvData.personal.dateOfBirth || cvData.personal.nationality)) {
    leftColumnContent.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PERSONAL",
            bold: true,
            size: styles.sectionHeadingSize - 8, // Consistent with CONTACT
            color: template === "professional" 
              ? "e0e7ff" // Light blue for professional
              : template === "academic"
              ? "1e3a8a" // Blue for academic
              : template === "classic"
              ? "92400e" // Amber/brown for classic - differentiates from academic
              : styles.sectionColor,
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    )

    if (cvData.personal.dateOfBirth) {
      leftColumnContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Date of Birth: ${cvData.personal.dateOfBirth}`,
              size: styles.bodySize,
              color: template === "professional" ? "ffffff" : "1f2937",
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }

    if (cvData.personal.nationality) {
      leftColumnContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Nationality: ${cvData.personal.nationality}`,
              size: styles.bodySize,
              color: template === "professional" ? "ffffff" : "1f2937",
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }
  }

  // Build right column content (Header + Sections)
  const rightColumnContent: (Paragraph | Table)[] = []

  // Header - Add background shading for professional template
  const headerShading = template === "professional" 
    ? {
        type: ShadingType.SOLID,
        color: "1d4ed8", // Dark blue background
        fill: "1d4ed8",
      }
    : undefined

  rightColumnContent.push(
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.personal.name,
          bold: true,
          size: styles.nameSize,
          color: styles.nameColor,
          font: styles.fontFamily,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      shading: headerShading,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.personal.designation,
          size: styles.titleSize,
          color: styles.titleColor,
          font: styles.fontFamily,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      shading: headerShading,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.personal.department,
          size: styles.titleSize,
          color: styles.titleColor,
          font: styles.fontFamily,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      shading: headerShading,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.personal.institution,
          size: styles.titleSize,
          color: styles.titleColor,
          font: styles.fontFamily,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      shading: headerShading,
    })
  )

  // Add selected sections in order
  selectedSections.forEach((sectionId) => {
    if (sectionId !== "personal") {
      const sectionContent = createWordSection(sectionId, cvData, template)
      rightColumnContent.push(...sectionContent)
    }
  })

  // Create two-column table
  const mainTable = new Table({
    rows: [
      new TableRow({
        children: [
          // Left column (33% width)
          new TableCell({
            children: leftColumnContent,
            width: { size: 33, type: WidthType.PERCENTAGE },
            shading: {
              fill: template === "professional" 
                ? "1d4ed8" 
                : template === "modern" 
                ? "eff6ff" 
                : template === "academic"
                ? "eff6ff" // Light blue for academic - differentiates from classic
                : "fffbeb", // Warm amber for classic - differentiates from academic
            },
            margins: {
              top: 1440, // 1 inch
              right: 360, // 0.25 inch
              bottom: 1440,
              left: 360,
            },
          }),
          // Right column (67% width)
          new TableCell({
            children: rightColumnContent,
            width: { size: 67, type: WidthType.PERCENTAGE },
            margins: {
              top: 1440,
              right: 360,
              bottom: 1440,
              left: 360,
            },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
  })

  // Create the document
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
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        },
        children: [mainTable],
      },
    ],
  })

  // Generate blob and convert to buffer
  const blob = await Packer.toBlob(doc)
  return Buffer.from(await blob.arrayBuffer())
}

