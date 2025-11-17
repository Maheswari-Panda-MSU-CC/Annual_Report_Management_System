import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import { cachedJsonResponse } from '@/lib/api-cache';

export async function GET() {
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

    const response = {
      // Preserve original Faculty structure (Fid, Fname) - required by profile page
      faculties: (faculties.recordset || []).map(mapFacultyItem),
      // All other dropdowns use { id, name } structure
      bookTypes: (bookTypes.recordset || []).map(mapDropdownItem),
      journalAuthorTypes: (journalAuthorTypes.recordset || []).map(mapDropdownItem),
      journalEditedTypes: (journalEditedTypes.recordset || []).map(mapDropdownItem),
      resPubLevels: (resPubLevels.recordset || []).map(mapDropdownItem),
      projectStatuses: (projectStatuses.recordset || []).map(mapDropdownItem),
      projectLevels: (projectLevels.recordset || []).map(mapDropdownItem),
      fundingAgencies: (fundingAgencies.recordset || []).map(mapDropdownItem),
      projectNatures: (projectNatures.recordset || []).map(mapDropdownItem),
      patentStatuses: (patentStatuses.recordset || []).map(mapDropdownItem),
      eContentTypes: (eContentTypes.recordset || []).map(mapDropdownItem),
      typeEcontentValues: (typeEcontentValues.recordset || []).map(mapDropdownItem),
      collaborationsLevels: (collaborationsLevels.recordset || []).map(mapDropdownItem),
      collaborationsOutcomes: (collaborationsOutcomes.recordset || []).map(mapDropdownItem),
      collaborationsTypes: (collaborationsTypes.recordset || []).map(mapDropdownItem),
      academicVisitRoles: (academicVisitRoles.recordset || []).map(mapDropdownItem),
      financialSupportTypes: (financialSupportTypes.recordset || []).map(mapDropdownItem),
      jrfSrfTypes: (jrfSrfTypes.recordset || []).map(mapDropdownItem),
      phdGuidanceStatuses: (phdGuidanceStatuses.recordset || []).map(mapDropdownItem),
      refresherTypes: (refresherTypes.recordset || []).map(mapDropdownItem),
      academicProgrammes: (academicProgrammes.recordset || []).map(mapDropdownItem),
      participantTypes: (participantTypes.recordset || []).map(mapDropdownItem),
      reportYears: (reportYears.recordset || []).map(mapDropdownItem),
      committeeLevels: (committeeLevels.recordset || []).map(mapDropdownItem),
      talksProgrammeTypes: (talksProgrammeTypes.recordset || []).map(mapDropdownItem),
      talksParticipantTypes: (talksParticipantTypes.recordset || []).map(mapDropdownItem),
      awardFellowLevels: (awardFellowLevels.recordset || []).map(mapDropdownItem),
      sponserNames: (sponserNames.recordset || []).map(mapDropdownItem),
      degreeTypes: (degreeTypes.recordset || []).map(mapDropdownItem),
      permanentDesignations: (permanentDesignations.recordset || []).map(mapDesignationItem),
      temporaryDesignations: (temporaryDesignations.recordset || []).map(mapDesignationItem),
    };

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

