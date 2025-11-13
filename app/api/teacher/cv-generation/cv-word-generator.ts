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
} from "docx"
import { type CVTemplate } from "./cv-template-styles"
import type { CVData } from "@/types/cv-data"

// Types are now imported from types/cv-data.ts

// Template-specific styling configurations
const templateStyles = {
  academic: {
    nameSize: 32,
    titleSize: 20,
    contactSize: 18,
    sectionHeadingSize: 22,
    bodySize: 22,
    nameColor: "1f2937",
    titleColor: "4b5563",
    sectionColor: "1e3a8a",
    fontFamily: "Times New Roman",
  },
  professional: {
    nameSize: 36,
    titleSize: 22,
    contactSize: 20,
    sectionHeadingSize: 24,
    bodySize: 22,
    nameColor: "ffffff",
    titleColor: "ffffff",
    sectionColor: "1d4ed8",
    fontFamily: "Calibri",
  },
  modern: {
    nameSize: 34,
    titleSize: 21,
    contactSize: 19,
    sectionHeadingSize: 23,
    bodySize: 22,
    nameColor: "111827",
    titleColor: "4b5563",
    sectionColor: "374151",
    fontFamily: "Calibri",
  },
  classic: {
    nameSize: 30,
    titleSize: 19,
    contactSize: 18,
    sectionHeadingSize: 22,
    bodySize: 22,
    nameColor: "1f2937",
    titleColor: "374151",
    sectionColor: "374151",
    fontFamily: "Times New Roman",
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
        sections.push(
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Professional Experience",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Research Projects",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Published Articles/Journals",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Post Doctoral Research Experience",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Patents",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "E-Contents",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Consultancy Undertaken",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Collaborations",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Ph.D. Guidance",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Books Published",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Papers Presented",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Talks",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Contribution in Academic Programme",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Participation in Academic Programme",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Participation in Academic Committee",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Performance by Individual/Group",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Extension Activities",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Orientation Course",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
        sections.push(
          new Paragraph({
            text: "Awards & Honors",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
        )
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
          size: styles.sectionHeadingSize - 4,
          color: template === "professional" ? "ffffff" : styles.sectionColor,
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
            size: styles.bodySize - 2,
            color: template === "professional" ? "ffffff" : "000000",
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
            size: styles.bodySize - 2,
            color: template === "professional" ? "ffffff" : "000000",
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
            size: styles.bodySize - 2,
            color: template === "professional" ? "ffffff" : "000000",
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
            size: styles.bodySize - 2,
            color: template === "professional" ? "ffffff" : "000000",
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
            size: styles.sectionHeadingSize - 4,
            color: template === "professional" ? "ffffff" : styles.sectionColor,
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
              size: styles.bodySize - 2,
              color: template === "professional" ? "ffffff" : "000000",
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
              size: styles.bodySize - 2,
              color: template === "professional" ? "ffffff" : "000000",
            }),
          ],
          spacing: { after: 100 },
        })
      )
    }
  }

  // Build right column content (Header + Sections)
  const rightColumnContent: (Paragraph | Table)[] = []

  // Header
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
              fill: template === "professional" ? "1d4ed8" : template === "modern" ? "eff6ff" : "f9fafb",
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

