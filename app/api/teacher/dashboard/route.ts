import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10);

    if (isNaN(teacherId)) {
      return new Response(JSON.stringify({ error: 'Invalid or missing teacherId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('TeacherId', sql.Int, teacherId)
      .execute('GetTeacherDashboardData');

    // 👇 Explicitly tell TypeScript what the result type is
    const recordsets = result.recordsets as any[][];

    const response = {
      researchProjects: recordsets?.[0]?.[0]?.ResearchProjects ?? 0,
      booksPublished: recordsets?.[1]?.[0]?.BooksPublished ?? 0,
      journalArticles: recordsets?.[2]?.[0]?.JournalArticles ?? 0,
      PapersPresented: recordsets?.[3]?.[0]?.PapersPresented ?? 0,
      totalPublications: recordsets?.[4]?.[0]?.TotalPublications ?? 0,
      recentActivities: recordsets?.[5] ?? [],
      quickCounts: recordsets?.[6]?.[0] ?? {},
      researchSummary: recordsets?.[7]?.[0] ?? {},
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch dashboard data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
