/**
 * Update Mappers for Research Contributions Module
 * Maps form data to API format for update operations
 */

import type { SectionId } from './research-contributions-config'

export const createUpdateMapper = (
  sectionId: SectionId,
  submitData: any,
  editingItem: any,
  selectedFiles: FileList | null,
  dropdownOptions?: any
) => {
  // Use docUrl from submitData if provided (from DocumentUpload), otherwise use existing doc
  const docUrl = submitData.doc || editingItem.doc || editingItem.supportingDocument?.[0] || null

  switch (sectionId) {
    case 'patents':
      return {
        title: submitData.title || editingItem.title,
        level: submitData.level || editingItem.levelId,
        status: submitData.status || editingItem.statusId,
        date: submitData.date || editingItem.date,
        Tech_Licence: submitData.Tech_Licence || editingItem.Tech_Licence || "",
        Earnings_Generate: submitData.Earnings_Generate ? Number(submitData.Earnings_Generate) : (editingItem.Earnings_Generate ? Number(editingItem.Earnings_Generate) : null),
        PatentApplicationNo: submitData.PatentApplicationNo || editingItem.PatentApplicationNo || "",
        doc: docUrl,
      }

    case 'policy':
      const resPubLevelOptions = dropdownOptions?.resPubLevelOptions || []
      let levelName = submitData.level || editingItem.level
      if (submitData.level && typeof submitData.level === 'number') {
        const levelOption = resPubLevelOptions.find((l: any) => l.id === submitData.level)
        levelName = levelOption ? levelOption.name : editingItem.level
      } else if (editingItem.levelId) {
        const levelOption = resPubLevelOptions.find((l: any) => l.id === editingItem.levelId)
        levelName = levelOption ? levelOption.name : editingItem.level
      }
      return {
        title: submitData.title || editingItem.title,
        level: levelName,
        organisation: submitData.organisation || editingItem.organisation,
        date: submitData.date || editingItem.date,
        doc: docUrl,
      }

    case 'econtent':
      return {
        title: submitData.title || editingItem.title,
        Brief_Details: submitData.briefDetails || editingItem.Brief_Details,
        Quadrant: submitData.quadrant ? Number(submitData.quadrant) : editingItem.Quadrant,
        Publishing_date: submitData.publishingDate || editingItem.Publishing_date,
        Publishing_Authorities: submitData.publishingAuthorities || editingItem.Publishing_Authorities,
        link: submitData.link || editingItem.link || null,
        type_econtent: submitData.typeOfEContent ? Number(submitData.typeOfEContent) : (editingItem.type_econtent || null),
        e_content_type: submitData.typeOfEContentPlatform ? Number(submitData.typeOfEContentPlatform) : (editingItem.e_content_type || null),
        doc: docUrl,
      }

    case 'consultancy':
      return {
        name: submitData.title || editingItem.name || editingItem.title,
        collaborating_inst: submitData.collaboratingInstitute || editingItem.collaborating_inst || editingItem.collaboratingInstitute,
        address: submitData.address || editingItem.address,
        duration: submitData.duration ? Number(submitData.duration) : (editingItem.duration || null),
        amount: submitData.amount ? submitData.amount.toString() : (editingItem.amount || null),
        submit_date: new Date().toISOString().split('T')[0],
        Start_Date: submitData.startDate || editingItem.Start_Date || editingItem.startDate,
        outcome: submitData.detailsOutcome || editingItem.outcome || editingItem.detailsOutcome || null,
        doc: docUrl,
      }

    case 'collaborations':
      const collaborationsTypeOptions = dropdownOptions?.collaborationsTypeOptions || []
      const categoryTypeId = submitData.category || editingItem.type || null
      const categoryName = categoryTypeId
        ? (collaborationsTypeOptions.find((opt: any) => opt.id === categoryTypeId)?.name || null)
        : (editingItem.category || null)
      return {
        collaborating_inst: submitData.collaboratingInstitute || editingItem.collaborating_inst || editingItem.collaboratingInstitute,
        collab_name: submitData.collabName || editingItem.collab_name || null,
        category: categoryName,
        collab_rank: submitData.collabRank || editingItem.collab_rank || null,
        address: submitData.address || editingItem.address || null,
        details: submitData.details || editingItem.details || null,
        collab_outcome: submitData.collabOutcome || editingItem.collab_outcome || editingItem.Collaborations_Outcome_Id || null,
        collab_status: submitData.status || editingItem.collab_status || editingItem.status || null,
        starting_date: submitData.startingDate || editingItem.starting_date || editingItem.startingDate || null,
        duration: (submitData.status === "Completed" && submitData.duration) ? Number(submitData.duration) : (editingItem.status === "Completed" && editingItem.duration ? editingItem.duration : null),
        level: submitData.level || editingItem.level || editingItem.Collaborations_Level_Id || null,
        type: categoryTypeId ? Number(categoryTypeId) : (editingItem.type || null),
        beneficiary_num: submitData.noOfBeneficiary ? Number(submitData.noOfBeneficiary) : (editingItem.beneficiary_num || editingItem.noOfBeneficiary || null),
        MOU_signed: submitData.mouSigned !== undefined ? submitData.mouSigned : (editingItem.MOU_signed !== undefined ? editingItem.MOU_signed : null),
        signing_date: (submitData.mouSigned === true || editingItem.MOU_signed === true) ? (submitData.signingDate || editingItem.signing_date || editingItem.signingDate || null) : null,
        doc: docUrl,
      }

    case 'visits':
      return {
        Institute_visited: submitData.instituteVisited || editingItem.Institute_visited || editingItem.instituteVisited,
        duration: submitData.durationOfVisit ? Number(submitData.durationOfVisit) : (editingItem.duration || editingItem.durationOfVisit || null),
        role: submitData.role || editingItem.role || editingItem.Acad_research_Role_Id || null,
        Sponsored_by: submitData.sponsoredBy || editingItem.Sponsored_by || editingItem.sponsoredBy || null,
        remarks: submitData.remarks || editingItem.remarks || null,
        date: submitData.date || editingItem.date || null,
        doc: docUrl,
      }

    case 'financial':
      return {
        name: submitData.nameOfSupport || editingItem.name || editingItem.nameOfSupport,
        type: submitData.type ? Number(submitData.type) : (editingItem.type || editingItem.Financial_Support_Type_Id || null),
        support: submitData.supportingAgency || editingItem.support || editingItem.supportingAgency,
        grant_received: submitData.grantReceived ? Number(submitData.grantReceived) : (editingItem.grant_received || editingItem.grantReceived || null),
        details: submitData.detailsOfEvent || editingItem.details || editingItem.detailsOfEvent || null,
        purpose: submitData.purposeOfGrant || editingItem.purpose || editingItem.purposeOfGrant || null,
        date: submitData.date || editingItem.date || null,
        doc: docUrl,
      }

    case 'jrfSrf':
      return {
        name: submitData.nameOfFellow || editingItem.name || editingItem.nameOfFellow,
        type: submitData.type ? Number(submitData.type) : (editingItem.type || editingItem.JRF_SRF_Type_Id || null),
        title: submitData.projectTitle || editingItem.title || editingItem.projectTitle,
        duration: submitData.duration ? Number(submitData.duration) : (editingItem.duration || null),
        stipend: submitData.monthlyStipend ? Number(submitData.monthlyStipend) : (editingItem.stipend || editingItem.monthlyStipend || null),
        date: submitData.date || editingItem.date || null,
        doc: docUrl,
      }

    case 'phd':
      return {
        regno: submitData.regNo || editingItem.regno || editingItem.regNo,
        name: submitData.nameOfStudent || editingItem.name || editingItem.nameOfStudent,
        start_date: submitData.dateOfRegistration || editingItem.start_date || editingItem.dateOfRegistration,
        topic: submitData.topic || editingItem.topic,
        status: submitData.status ? Number(submitData.status) : (editingItem.status || editingItem.Res_Proj_Other_Details_Status_Id || null),
        year_of_completion: submitData.yearOfCompletion ? Number(submitData.yearOfCompletion) : (editingItem.year_of_completion || editingItem.yearOfCompletion || null),
        doc: docUrl,
      }

    case 'copyrights':
      return {
        Title: submitData.title || editingItem.Title || editingItem.title,
        RefNo: submitData.referenceNo || editingItem.RefNo || editingItem.referenceNo,
        PublicationDate: submitData.publicationDate || editingItem.PublicationDate || editingItem.publicationDate || null,
        Link: submitData.link || editingItem.Link || editingItem.link || null,
        doc: docUrl,
      }

    default:
      return {}
  }
}

export const UPDATE_REQUEST_BODIES = {
  patents: (id: number, data: any) => ({
    patentId: id,
    patent: data,
  }),
  policy: (id: number, data: any) => ({
    policyId: id,
    policy: data,
  }),
  econtent: (id: number, data: any) => ({
    eContentId: id,
    eContent: data,
  }),
  consultancy: (id: number, data: any) => ({
    consultancyId: id,
    consultancy: data,
  }),
  collaborations: (id: number, data: any) => ({
    collaborationId: id,
    collaboration: data,
  }),
  visits: (id: number, data: any) => ({
    visitId: id,
    visit: data,
  }),
  financial: (id: number, data: any) => ({
    financialSupportId: id,
    financialSupport: data,
  }),
  jrfSrf: (id: number, data: any) => ({
    jrfSrfId: id,
    jrfSrf: data,
  }),
  phd: (id: number, data: any) => ({
    phdStudentId: id,
    phdStudent: data,
  }),
  copyrights: (id: number, data: any) => ({
    copyrightId: id,
    copyright: data,
  }),
} as const

export const UPDATE_SUCCESS_MESSAGES = {
  patents: 'Patent updated successfully!',
  policy: 'Policy document updated successfully!',
  econtent: 'E-Content updated successfully!',
  consultancy: 'Consultancy record updated successfully!',
  collaborations: 'Collaboration updated successfully!',
  visits: 'Academic research visit updated successfully!',
  financial: 'Financial support record updated successfully!',
  jrfSrf: 'JRF/SRF record updated successfully!',
  phd: 'PhD student record updated successfully!',
  copyrights: 'Copyright record updated successfully!',
} as const

