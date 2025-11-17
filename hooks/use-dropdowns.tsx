// hooks/use-dropdowns.tsx
import { DegreeTypeOption, DepartmentOption, DesignationOption, FacultyOption, UserType } from "@/types/interfaces";
import { useState, useCallback } from "react"
import { useDropdownsContext } from "@/contexts/dropdowns-provider"

export interface DropdownOption {
  id: number;
  name: string;
}

export function useDropDowns() {
  // Get dropdowns from context (fetched once on login via React Query)
  const { data: dropdownsData } = useDropdownsContext();
  
  // Individual state for dynamic dropdowns (departments, userTypes)
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);

  // Map context data to hook return values (backward compatible - no changes needed in existing files)
  const facultyOptions = dropdownsData.faculties;
  const permanentDesignationOptions = dropdownsData.permanentDesignations;
  const temporaryDesignationOptions = dropdownsData.temporaryDesignations;
  const degreeTypeOptions = dropdownsData.degreeTypes;
  const projectStatusOptions = dropdownsData.projectStatuses;
  const projectLevelOptions = dropdownsData.projectLevels;
  const fundingAgencyOptions = dropdownsData.fundingAgencies;
  const projectNatureOptions = dropdownsData.projectNatures;
  const bookTypeOptions = dropdownsData.bookTypes;
  const journalEditedTypeOptions = dropdownsData.journalEditedTypes;
  const resPubLevelOptions = dropdownsData.resPubLevels;
  const journalAuthorTypeOptions = dropdownsData.journalAuthorTypes;
  const patentStatusOptions = dropdownsData.patentStatuses;
  const eContentTypeOptions = dropdownsData.eContentTypes;
  const typeEcontentValueOptions = dropdownsData.typeEcontentValues;
  const collaborationsLevelOptions = dropdownsData.collaborationsLevels;
  const collaborationsOutcomeOptions = dropdownsData.collaborationsOutcomes;
  const collaborationsTypeOptions = dropdownsData.collaborationsTypes;
  const academicVisitRoleOptions = dropdownsData.academicVisitRoles;
  const financialSupportTypeOptions = dropdownsData.financialSupportTypes;
  const jrfSrfTypeOptions = dropdownsData.jrfSrfTypes;
  const phdGuidanceStatusOptions = dropdownsData.phdGuidanceStatuses;
  const refresherTypeOptions = dropdownsData.refresherTypes;
  const academicProgrammeOptions = dropdownsData.academicProgrammes;
  const participantTypeOptions = dropdownsData.participantTypes;
  const reportYearsOptions = dropdownsData.reportYears;
  const committeeLevelOptions = dropdownsData.committeeLevels;
  const talksProgrammeTypeOptions = dropdownsData.talksProgrammeTypes;
  const talksParticipantTypeOptions = dropdownsData.talksParticipantTypes;
  const awardFellowLevelOptions = dropdownsData.awardFellowLevels;
  const sponserNameOptions = dropdownsData.sponserNames;

  // Backward compatible fetch functions
  // Most are no-ops since data comes from Context (fetched on login)
  // Only fetchDepartments and fetchUserTypes still need to fetch dynamically
  const fetchFaculties = useCallback(async () => {
    // Data is already fetched via Context on login, no action needed
  }, []);

  const fetchDepartments = useCallback(async (fid: number) => {
    try {
      const res = await fetch(`/api/shared/dropdown/department?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartmentOptions(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      setDepartmentOptions([]);
    }
  }, []);

  const fetchUserTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/user-types');
      if (!res.ok) throw new Error('Failed to fetch user types');
      const data = await res.json();
      setUserTypes(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // All other fetch functions are no-ops since data comes from Context
  const fetchDegreeTypes = useCallback(async () => {}, []);
  const fetchParmanentDesignations = useCallback(async () => {}, []);
  const fetchTemporaryDesignations = useCallback(async () => {}, []);
  const fetchProjectStatuses = useCallback(async () => {}, []);
  const fetchProjectLevels = useCallback(async () => {}, []);
  const fetchFundingAgencies = useCallback(async () => {}, []);
  const fetchProjectNatures = useCallback(async () => {}, []);
  const fetchBookTypes = useCallback(async () => {}, []);
  const fetchJournalEditedTypes = useCallback(async () => {}, []);
  const fetchResPubLevels = useCallback(async () => {}, []);
  const fetchJournalAuthorTypes = useCallback(async () => {}, []);
  const fetchPatentStatuses = useCallback(async () => {}, []);
  const fetchEContentTypes = useCallback(async () => {}, []);
  const fetchTypeEcontentValues = useCallback(async () => {}, []);
  const fetchCollaborationsLevels = useCallback(async () => {}, []);
  const fetchCollaborationsOutcomes = useCallback(async () => {}, []);
  const fetchCollaborationsTypes = useCallback(async () => {}, []);
  const fetchAcademicVisitRoles = useCallback(async () => {}, []);
  const fetchFinancialSupportTypes = useCallback(async () => {}, []);
  const fetchJrfSrfTypes = useCallback(async () => {}, []);
  const fetchPhdGuidanceStatuses = useCallback(async () => {}, []);
  const fetchRefresherTypes = useCallback(async () => {}, []);
  const fetchAcademicProgrammes = useCallback(async () => {}, []);
  const fetchParticipantTypes = useCallback(async () => {}, []);
  const fetchReportYears = useCallback(async () => {}, []);
  const fetchCommitteeLevels = useCallback(async () => {}, []);
  const fetchTalksProgrammeTypes = useCallback(async () => {}, []);
  const fetchTalksParticipantTypes = useCallback(async () => {}, []);
  const fetchAwardFellowLevels = useCallback(async () => {}, []);
  const fetchSponserNames = useCallback(async () => {}, []);

  return { 
    facultyOptions, 
    departmentOptions,
    userTypes,
    degreeTypeOptions,
    permanentDesignationOptions,
    temporaryDesignationOptions,
    projectStatusOptions,
    projectLevelOptions,
    fundingAgencyOptions,
    projectNatureOptions,
    bookTypeOptions,
    journalEditedTypeOptions,
    resPubLevelOptions,
    journalAuthorTypeOptions,
    patentStatusOptions,
    eContentTypeOptions,
    typeEcontentValueOptions,
    collaborationsLevelOptions,
    collaborationsOutcomeOptions,
    collaborationsTypeOptions,
    academicVisitRoleOptions,
    financialSupportTypeOptions,
    jrfSrfTypeOptions,
    phdGuidanceStatusOptions,
    refresherTypeOptions,
    academicProgrammeOptions,
    participantTypeOptions,
    reportYearsOptions,
    committeeLevelOptions,
    talksProgrammeTypeOptions,
    talksParticipantTypeOptions,
    awardFellowLevelOptions,
    sponserNameOptions,
    fetchFaculties, 
    fetchDepartments,
    fetchUserTypes,
    fetchDegreeTypes,
    fetchParmanentDesignations,
    fetchTemporaryDesignations,
    fetchProjectStatuses,
    fetchProjectLevels,
    fetchFundingAgencies,
    fetchProjectNatures,
    fetchBookTypes,
    fetchJournalEditedTypes,
    fetchResPubLevels,
    fetchJournalAuthorTypes,
    fetchPatentStatuses,
    fetchEContentTypes,
    fetchTypeEcontentValues,
    fetchCollaborationsLevels,
    fetchCollaborationsOutcomes,
    fetchCollaborationsTypes,
    fetchAcademicVisitRoles,
    fetchFinancialSupportTypes,
    fetchJrfSrfTypes,
    fetchPhdGuidanceStatuses,
    fetchRefresherTypes,
    fetchAcademicProgrammes,
    fetchParticipantTypes,
    fetchReportYears,
    fetchCommitteeLevels,
    fetchTalksProgrammeTypes,
    fetchTalksParticipantTypes,
    fetchAwardFellowLevels,
    fetchSponserNames
  }
}
