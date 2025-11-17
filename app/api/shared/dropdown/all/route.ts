import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { cachedJsonResponse } from '@/lib/api-cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Support query parameter: ?modules=shared,teacher,department
  // If not provided, fetch all modules (backward compatibility)
  const modulesParam = searchParams.get('modules');
  const requestedModules = modulesParam 
    ? modulesParam.split(',').map(m => m.trim().toLowerCase())
    : ['shared', 'teacher', 'department', 'faculty', 'university']; // Default: all modules
  try {
    const pool = await connectToDatabase();
    
    // Execute all dropdown queries in parallel using Promise.all
    const [
      faculties,
      bookTypes,
      journalAuthorTypes,
      journalEditedTypes,
      resPubLevels,
      projectStatuses,
      projectLevels,
      fundingAgencies,
      projectNatures,
      patentStatuses,
      eContentTypes,
      typeEcontentValues,
      collaborationsLevels,
      collaborationsOutcomes,
      collaborationsTypes,
      academicVisitRoles,
      financialSupportTypes,
      jrfSrfTypes,
      phdGuidanceStatuses,
      refresherTypes,
      academicProgrammes,
      participantTypes,
      reportYears,
      committeeLevels,
      talksProgrammeTypes,
      talksParticipantTypes,
      awardFellowLevels,
      sponserNames,
      degreeTypes,
      permanentDesignations,
      temporaryDesignations,
    ] = await Promise.all([
      pool.request().execute('sp_GetAll_Faculty'),
      pool.request().execute('sp_GetAll_Book_Type'),
      pool.request().execute('sp_GetAllTeacherJournalsAuthorTypes'),
      pool.request().execute('sp_GetAll_Teacher_Jour_Edited_Type'),
      pool.request().execute('sp_GetAll_Res_Pub_Level'),
      pool.request().execute('sp_GetAll_Res_Proj_Status'),
      pool.request().execute('sp_GetAll_Res_Proj_Level'),
      pool.request().execute('sp_GetAllFundingAgencies'),
      pool.request().execute('sp_GetAll_Res_Proj_Nature'),
      pool.request().execute('sp_GetAllPatents_Level'),
      pool.request().execute('sp_GetAll_e_content_type'),
      pool.request().execute('sp_getall_type_econtent_value'),
      pool.request().execute('sp_GetAll_Collaborations_Level'),
      pool.request().execute('sp_GetAll_Collaborations_Outcome'),
      pool.request().execute('sp_GetAll_Collaborations_Type'),
      pool.request().execute('sp_GetAll_Acad_Research_Role'),
      pool.request().execute('sp_Get_All_Financial_Support_Types'),
      pool.request().execute('sp_GetAll_JRF_SRF_Types'),
      pool.request().execute('sp_GetAll_Res_Proj_Other_Details_Status'),
      pool.request().execute('sp_GetAll_Refresher_Course_Type'),
      pool.request().execute('sp_GetAll_Contri_prog'),
      pool.request().execute('sp_Contri_Parti_GetAll'),
      pool.request().execute('sp_Report_Year_GetAll'),
      pool.request().execute('sp_Get_All_Parti_Commi_Level'),
      pool.request().execute('sp_GetAll_teacher_talks_prog'),
      pool.request().execute('sp_GetAllTeacherTalksParti'),
      pool.request().execute('sp_Get_Awards_Fellows_Level'),
      pool.request().execute('sp_GetAll_sponsered_name'),
      pool.request().execute('sp_GetAllDegreeTypes'),
      pool.request().execute('sp_Get_All_perma_desig'),
      pool.request().execute('sp_GetAllTenureDesig'),
    ]);

    // Helper function to map dropdown items to consistent format { id, name }
    // Used for most dropdowns that expect id/name structure
    const mapDropdownItem = (item: any) => ({
      id: item.Id || item.id || item.ID,
      name: item.name || item.Name || item.type || item.Type || item.year_name?.toString() || '',
    });

    // Helper function to preserve Faculty structure { Fid, Fname }
    // Faculty dropdown expects Fid and Fname (not id and name)
    const mapFacultyItem = (item: any) => ({
      Fid: item.Fid || item.Id || item.id || item.ID,
      Fname: item.Fname || item.Name || item.name || '',
    });

    // Helper function to map designations - preserve id/name structure
    const mapDesignationItem = (item: any) => ({
      id: item.Id || item.id || item.ID,
      name: item.name || item.Name || item.type || item.Type || '',
    });

    // Build response structure based on requested modules
    const response: any = {};

    // Shared dropdowns (available to all modules)
    if (requestedModules.includes('shared')) {
      response.faculties = (faculties.recordset || []).map(mapFacultyItem);
      response.degreeTypes = (degreeTypes.recordset || []).map(mapDropdownItem);
      response.permanentDesignations = (permanentDesignations.recordset || []).map(mapDesignationItem);
      response.temporaryDesignations = (temporaryDesignations.recordset || []).map(mapDesignationItem);
    }

    // Teacher module dropdowns
    if (requestedModules.includes('teacher')) {
      response.projectStatuses = (projectStatuses.recordset || []).map(mapDropdownItem);
      response.projectLevels = (projectLevels.recordset || []).map(mapDropdownItem);
      response.fundingAgencies = (fundingAgencies.recordset || []).map(mapDropdownItem);
      response.projectNatures = (projectNatures.recordset || []).map(mapDropdownItem);
      response.bookTypes = (bookTypes.recordset || []).map(mapDropdownItem);
      response.journalAuthorTypes = (journalAuthorTypes.recordset || []).map(mapDropdownItem);
      response.journalEditedTypes = (journalEditedTypes.recordset || []).map(mapDropdownItem);
      response.resPubLevels = (resPubLevels.recordset || []).map(mapDropdownItem);
      response.patentStatuses = (patentStatuses.recordset || []).map(mapDropdownItem);
      response.eContentTypes = (eContentTypes.recordset || []).map(mapDropdownItem);
      response.typeEcontentValues = (typeEcontentValues.recordset || []).map(mapDropdownItem);
      response.collaborationsLevels = (collaborationsLevels.recordset || []).map(mapDropdownItem);
      response.collaborationsOutcomes = (collaborationsOutcomes.recordset || []).map(mapDropdownItem);
      response.collaborationsTypes = (collaborationsTypes.recordset || []).map(mapDropdownItem);
      response.academicVisitRoles = (academicVisitRoles.recordset || []).map(mapDropdownItem);
      response.financialSupportTypes = (financialSupportTypes.recordset || []).map(mapDropdownItem);
      response.jrfSrfTypes = (jrfSrfTypes.recordset || []).map(mapDropdownItem);
      response.phdGuidanceStatuses = (phdGuidanceStatuses.recordset || []).map(mapDropdownItem);
      response.refresherTypes = (refresherTypes.recordset || []).map(mapDropdownItem);
      response.academicProgrammes = (academicProgrammes.recordset || []).map(mapDropdownItem);
      response.participantTypes = (participantTypes.recordset || []).map(mapDropdownItem);
      response.reportYears = (reportYears.recordset || []).map(mapDropdownItem);
      response.committeeLevels = (committeeLevels.recordset || []).map(mapDropdownItem);
      response.talksProgrammeTypes = (talksProgrammeTypes.recordset || []).map(mapDropdownItem);
      response.talksParticipantTypes = (talksParticipantTypes.recordset || []).map(mapDropdownItem);
      response.awardFellowLevels = (awardFellowLevels.recordset || []).map(mapDropdownItem);
      response.sponserNames = (sponserNames.recordset || []).map(mapDropdownItem);
    }

    // Department module dropdowns (placeholder for future expansion)
    if (requestedModules.includes('department')) {
      // Add department-specific dropdowns here as needed
      // response.departmentSpecificDropdown = ...
    }

    // Faculty module dropdowns (placeholder for future expansion)
    if (requestedModules.includes('faculty')) {
      // Add faculty-specific dropdowns here as needed
      // response.facultySpecificDropdown = ...
    }

    // University module dropdowns (placeholder for future expansion)
    if (requestedModules.includes('university')) {
      // Add university-specific dropdowns here as needed
      // response.universitySpecificDropdown = ...
    }

    // For backward compatibility: if no modules specified, flatten structure
    // This ensures existing code continues to work
    if (!modulesParam) {
      // Flatten the response to match the old structure
      const flattenedResponse: any = {
        // Shared dropdowns
        faculties: response.faculties || [],
        degreeTypes: response.degreeTypes || [],
        permanentDesignations: response.permanentDesignations || [],
        temporaryDesignations: response.temporaryDesignations || [],
        // Teacher dropdowns
        projectStatuses: response.projectStatuses || [],
        projectLevels: response.projectLevels || [],
        fundingAgencies: response.fundingAgencies || [],
        projectNatures: response.projectNatures || [],
        bookTypes: response.bookTypes || [],
        journalAuthorTypes: response.journalAuthorTypes || [],
        journalEditedTypes: response.journalEditedTypes || [],
        resPubLevels: response.resPubLevels || [],
        patentStatuses: response.patentStatuses || [],
        eContentTypes: response.eContentTypes || [],
        typeEcontentValues: response.typeEcontentValues || [],
        collaborationsLevels: response.collaborationsLevels || [],
        collaborationsOutcomes: response.collaborationsOutcomes || [],
        collaborationsTypes: response.collaborationsTypes || [],
        academicVisitRoles: response.academicVisitRoles || [],
        financialSupportTypes: response.financialSupportTypes || [],
        jrfSrfTypes: response.jrfSrfTypes || [],
        phdGuidanceStatuses: response.phdGuidanceStatuses || [],
        refresherTypes: response.refresherTypes || [],
        academicProgrammes: response.academicProgrammes || [],
        participantTypes: response.participantTypes || [],
        reportYears: response.reportYears || [],
        committeeLevels: response.committeeLevels || [],
        talksProgrammeTypes: response.talksProgrammeTypes || [],
        talksParticipantTypes: response.talksParticipantTypes || [],
        awardFellowLevels: response.awardFellowLevels || [],
        sponserNames: response.sponserNames || [],
      };
      return cachedJsonResponse(flattenedResponse, 1800);
    }

    // Return structured response with modules
    // Cache for 30 minutes (1800 seconds) - dropdowns rarely change
    return cachedJsonResponse(response, 1800);
  } catch (err) {
    console.error('Error fetching all dropdowns:', err);
    return NextResponse.json(
      { error: 'Failed to fetch dropdowns' },
      { status: 500 }
    );
  }
}

