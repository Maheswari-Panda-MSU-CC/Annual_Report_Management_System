import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const deptId = parseInt(searchParams.get('deptId') || '', 10);

    if (isNaN(deptId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing deptId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== deptId) {
      return new Response(JSON.stringify({ error: 'Forbidden - Department ID mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('DeptId', sql.Int, deptId)
      .execute('sp_GetDepartmentDashboardData');

    // 👇 Explicitly tell TypeScript what the result type is
    const recordsets = result.recordsets as any[][];

    const response = {
      dashboardCounts: recordsets?.[0]?.[0] ?? {
        TotalTeachers: 0,
        AcademicPrograms: 0,
        AchievementsAwards: 0,
        Collaborations: 0,
        Consultancy: 0,
        Events: 0,
        ExtensionActivities: 0,
        FacultyDevelopmentPrograms: 0,
        PhDAwarded: 0,
        Placements: 0,
        Scholarships: 0,
        StudentActivities: 0,
        TechnologyDetails: 0,
        VisitingFaculty: 0,
      },
      departmentInfo: recordsets?.[1]?.[0] ?? {
        Deptid: null,
        name: null,
        email_id: null,
      },
      recentActivities: recordsets?.[2] ?? [],
    };

    // Cache for 2 minutes (120 seconds) - dashboard data changes frequently
    return cachedJsonResponse(response, 120);
  } catch (err) {
    console.error('Error fetching department dashboard data:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

