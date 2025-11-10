// hooks/useFacultyDepartment.ts
import { DegreeTypeOption, DepartmentOption, DesignationOption, FacultyOption, UserType } from "@/types/interfaces";
import { useEffect, useState } from "react"

export interface DropdownOption {
  id: number;
  name: string;
}

export function useDropDowns() {
  
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([])
  const [permanentDesignationOptions, setPermanentDesignationOptions] = useState<DesignationOption[]>([]);
  const [temporaryDesignationOptions, setTemporaryDesignationOptions] = useState<DesignationOption[]>([]);
  const [degreeTypeOptions, setDegreeTypeOptions] = useState<DegreeTypeOption[]>([]);
  const [projectStatusOptions, setProjectStatusOptions] = useState<DropdownOption[]>([]);
  const [projectLevelOptions, setProjectLevelOptions] = useState<DropdownOption[]>([]);
  const [fundingAgencyOptions, setFundingAgencyOptions] = useState<DropdownOption[]>([]);
  const [projectNatureOptions, setProjectNatureOptions] = useState<DropdownOption[]>([]);
  const [bookTypeOptions, setBookTypeOptions] = useState<DropdownOption[]>([]);
  const [journalEditedTypeOptions, setJournalEditedTypeOptions] = useState<DropdownOption[]>([]);
  const [resPubLevelOptions, setResPubLevelOptions] = useState<DropdownOption[]>([]);
  const [journalAuthorTypeOptions, setJournalAuthorTypeOptions] = useState<DropdownOption[]>([]);
  const [patentStatusOptions, setPatentStatusOptions] = useState<DropdownOption[]>([]);
  const [eContentTypeOptions, setEContentTypeOptions] = useState<DropdownOption[]>([]);
  const [typeEcontentValueOptions, setTypeEcontentValueOptions] = useState<DropdownOption[]>([]);
  const [collaborationsLevelOptions, setCollaborationsLevelOptions] = useState<DropdownOption[]>([]);
  const [collaborationsOutcomeOptions, setCollaborationsOutcomeOptions] = useState<DropdownOption[]>([]);
  const [collaborationsTypeOptions, setCollaborationsTypeOptions] = useState<DropdownOption[]>([]);
  const [academicVisitRoleOptions, setAcademicVisitRoleOptions] = useState<DropdownOption[]>([]);
  const [financialSupportTypeOptions, setFinancialSupportTypeOptions] = useState<DropdownOption[]>([]);
  const [jrfSrfTypeOptions, setJrfSrfTypeOptions] = useState<DropdownOption[]>([]);
  const [phdGuidanceStatusOptions, setPhdGuidanceStatusOptions] = useState<DropdownOption[]>([]);
  const [refresherTypeOptions, setRefresherTypeOptions] = useState<DropdownOption[]>([]);
  const [academicProgrammeOptions, setAcademicProgrammeOptions] = useState<DropdownOption[]>([]);
  const [participantTypeOptions, setParticipantTypeOptions] = useState<DropdownOption[]>([]);
  const [reportYearsOptions, setReportYearsOptions] = useState<DropdownOption[]>([]);
  const [committeeLevelOptions, setCommitteeLevelOptions] = useState<DropdownOption[]>([]);
  const [talksProgrammeTypeOptions, setTalksProgrammeTypeOptions] = useState<DropdownOption[]>([]);
  const [talksParticipantTypeOptions, setTalksParticipantTypeOptions] = useState<DropdownOption[]>([]);

  const fetchFaculties = async () => {
    try {
      // Fetch faculty options
      const facultyRes = await fetch('/api/shared/dropdown/faculty');
      if (facultyRes.ok) {
        const facultyData = await facultyRes.json();
        setFacultyOptions(facultyData.faculties || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      // Set dummy data as fallback
      setFacultyOptions([]);
    }
      
  }

  const fetchDepartments = async (fid: number) => {
    try {
      const res = await fetch(`/api/shared/dropdown/department?fid=${fid}`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartmentOptions(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments by faculty:', error);
      // Fallback dummy departments
      setDepartmentOptions([]);
    }
  }

  const fetchUserTypes = async () => {
    try {
      const res = await fetch('/api/admin/user-types')
      if (!res.ok) throw new Error('Failed to fetch user types')

      const data = await res.json()
      setUserTypes(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDegreeTypes = async () =>{
    try{
      const degreeTypeRes = await fetch('/api/shared/dropdown/degreeType');
      if (degreeTypeRes.ok) {
        const degreeTypeData = await degreeTypeRes.json();
        setDegreeTypeOptions(degreeTypeData.degreeTypes || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }


  const fetchParmanentDesignations = async () =>{
    try{
      const permDesigRes = await fetch('/api/shared/dropdown/designation?type=permanent');
      if (permDesigRes.ok) {
        const permDesigData = await permDesigRes.json();
        setPermanentDesignationOptions(permDesigData.designations || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const fetchTemporaryDesignations = async () =>{
    try{
      const tempDesigRes = await fetch('/api/shared/dropdown/designation?type=temporary');
      if (tempDesigRes.ok) {
        const tempDesigData = await tempDesigRes.json();
        setTemporaryDesignationOptions(tempDesigData.designations || []);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  const fetchProjectStatuses = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/res-proj-status');
      if (res.ok) {
        const data = await res.json();
        setProjectStatusOptions(data.statuses || []);
      }
    } catch (error) {
      console.error('Error fetching project statuses:', error);
    }
  }

  const fetchProjectLevels = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/res-proj-level');
      if (res.ok) {
        const data = await res.json();
        setProjectLevelOptions(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching project levels:', error);
    }
  }

  const fetchFundingAgencies = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/funding-agency');
      if (res.ok) {
        const data = await res.json();
        setFundingAgencyOptions(data.agencies || []);
      }
    } catch (error) {
      console.error('Error fetching funding agencies:', error);
    }
  }

  const fetchProjectNatures = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/res-proj-nature');
      if (res.ok) {
        const data = await res.json();
        setProjectNatureOptions(data.natures || []);
      }
    } catch (error) {
      console.error('Error fetching project natures:', error);
    }
  }

  const fetchBookTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/book-type');
      if (res.ok) {
        const data = await res.json();
        // Map the response to match DropdownOption format (id, name)
        // SP returns Id and type, so we map type to name
        const mapped = (data.bookTypes || []).map((item: any) => ({
          id: item.Id,
          name: item.type || item.Type || item.name || item.Name
        }));
        setBookTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching book types:', error);
    }
  }

  const fetchJournalEditedTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/journal-edited-type');
      if (res.ok) {
        const data = await res.json();
        // Map the response to match DropdownOption format (id, name)
        const mapped = (data.journalEditedTypes || []).map((item: any) => ({
          id: item.Id,
          name: item.name || item.Name
        }));
        setJournalEditedTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching journal edited types:', error);
    }
  }

  const fetchResPubLevels = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/res-pub-level');
      if (res.ok) {
        const data = await res.json();
        // Map the response to match DropdownOption format (id, name)
        const mapped = (data.resPubLevels || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setResPubLevelOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching research publication levels:', error);
    }
  }

  const fetchJournalAuthorTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/journal-author-type');
      if (res.ok) {
        const data = await res.json();
        // Map the response to match DropdownOption format (id, name)
        const mapped = (data.journalAuthorTypes || []).map((item: any) => ({
          id: item.Id,
          name: item.name || item.Name
        }));
        setJournalAuthorTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching journal author types:', error);
    }
  }

  const fetchPatentStatuses = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/patent-status');
      if (res.ok) {
        const data = await res.json();
        // Map the response to match DropdownOption format (id, name)
        const mapped = (data.patentStatuses || []).map((item: any) => ({
          id: item.Id || item.id,
          name: item.name || item.Name
        }));
        setPatentStatusOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching patent statuses:', error);
    }
  }

  const fetchEContentTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/e-content-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.eContentTypes || []).map((item: any) => ({
          id: item.Id || item.id,
          name: item.name || item.Name
        }));
        setEContentTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching e-content types:', error);
    }
  }

  const fetchTypeEcontentValues = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/type-econtent-value');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.typeEcontentValues || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setTypeEcontentValueOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching type econtent values:', error);
    }
  }

  const fetchCollaborationsLevels = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/collaborations-level');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.collaborationsLevels || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setCollaborationsLevelOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching collaborations levels:', error);
    }
  }

  const fetchCollaborationsOutcomes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/collaborations-outcome');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.collaborationsOutcomes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setCollaborationsOutcomeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching collaborations outcomes:', error);
    }
  }

  const fetchCollaborationsTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/collaborations-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.collaborationsTypes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setCollaborationsTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching collaborations types:', error);
    }
  }

  const fetchAcademicVisitRoles = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/academic-visit-role');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.academicVisitRoles || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setAcademicVisitRoleOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching academic visit roles:', error);
    }
  }

  const fetchFinancialSupportTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/financial-support-types');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.financialSupportTypes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setFinancialSupportTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching financial support types:', error);
    }
  }

  const fetchJrfSrfTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/jrf-srf-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.jrfSrfTypes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setJrfSrfTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching JRF/SRF types:', error);
    }
  }

  const fetchPhdGuidanceStatuses = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/phd-guidance-status');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.phdGuidanceStatuses || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setPhdGuidanceStatusOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching PhD guidance statuses:', error);
    }
  }

  const fetchRefresherTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/refresher-types');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.refresherTypes || []).map((item: any) => ({
          id: item.Id || item.id,
          name: item.name || item.Name
        }));
        setRefresherTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching refresher types:', error);
    }
  }

  const fetchAcademicProgrammes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/acad-programm');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.programmes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setAcademicProgrammeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching academic programmes:', error);
    }
  }

  const fetchParticipantTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/acad-participent-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.participantTypes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setParticipantTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching participant types:', error);
    }
  }

  const fetchReportYears = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/report-years');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.reportYears || []).map((item: any) => ({
          id: item.Id || item.id,
          name: item.year_name?.toString() || item.name || item.year_name
        }));
        setReportYearsOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching report years:', error);
    }
  }

  const fetchCommitteeLevels = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/parti-commi-level');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.committeeLevels || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setCommitteeLevelOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching committee levels:', error);
    }
  }

  const fetchTalksProgrammeTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/talks-prog-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.talksProgrammeTypes || []).map((item: any) => ({
          id: item.id || item.Id,
          name: item.name || item.Name
        }));
        setTalksProgrammeTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching talks programme types:', error);
    }
  }

  const fetchTalksParticipantTypes = async () => {
    try {
      const res = await fetch('/api/shared/dropdown/talks-parti-type');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.talksParticipantTypes || []).map((item: any) => ({
          id: item.Id || item.id,
          name: item.name || item.Name
        }));
        setTalksParticipantTypeOptions(mapped);
      }
    } catch (error) {
      console.error('Error fetching talks participant types:', error);
    }
  }

  useEffect(() => { fetchFaculties() }, [])

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
    fetchTalksParticipantTypes
  }
}
