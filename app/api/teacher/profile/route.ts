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

    // Execute the stored procedure
    const result = await pool
      .request()
      .input('tid', sql.Int, teacherId)
      .execute('sp_GetTeacherBioData');

    const recordsets = result.recordsets as any[][];
 
    // Flatten recordsets into meaningful keys
    const response = {
        teacherInfo: recordsets?.[0]?.[0] ?? null,       
        department: recordsets?.[1]?.[0] ?? null,        
        faculty: recordsets?.[2]?.[0] ?? null,           
        designation: recordsets?.[3]?.[0] ?? null,       
        teacherExperience: recordsets?.[4] ?? [],        
        postDoctoralExp: recordsets?.[5] ?? [],          
        graduationDetails: recordsets?.[6] ?? [],        
      };
      
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching teacher profile:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch teacher profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
