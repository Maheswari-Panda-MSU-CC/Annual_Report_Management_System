import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';

// #region Profile Data get

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10);

    if (isNaN(teacherId) || teacherId===0) {
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
      
    // Cache for 5 minutes (300 seconds) - profile data doesn't change frequently
    return cachedJsonResponse(response, 300);
  } catch (err) {
    console.error('Error fetching teacher profile:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch teacher profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

//#endregion

//#region - Update Profile Data
 
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const pool = await connectToDatabase();
    const request = pool.request();

    // 🎯 Map all TeacherInfo columns
    request.input("Tid", sql.Int, data.Tid);
    request.input("fname", sql.NVarChar(100), data.fname);
    request.input("mname", sql.NVarChar(100), data.mname);
    request.input("lname", sql.NVarChar(100), data.lname);
    request.input("deptid", sql.Int, data.deptid);
    request.input("NET", sql.Bit, data.NET);
    request.input("PET", sql.Bit, data.PET);
    request.input("recruit_date", sql.Date, data.recruit_date);
    request.input("perma_or_tenure", sql.Bit, data.perma_or_tenure);
    request.input("desig_perma", sql.Int, data.desig_perma);
    request.input("desig_tenure", sql.Int, data.desig_tenure);
    request.input("phone_no", sql.BigInt, data.phone_no);
    request.input("email_id", sql.NVarChar(150), data.email_id);
    request.input("NET_year", sql.Int, data.NET_year);
    request.input("PET_year", sql.Int, data.PET_year);
    request.input("GATE", sql.Bit, data.GATE);
    request.input("GATE_year", sql.Int, data.GATE_year);
    request.input("Abbri", sql.NVarChar(50), data.Abbri);
    request.input("PAN_No", sql.NVarChar(20), data.PAN_No);
    request.input("DOB", sql.Date, data.DOB);
    request.input("PHDGuide", sql.Bit, data.PHDGuide);
    request.input("OtherGuide", sql.Bit, data.OtherGuide);
    request.input("ICT_Use", sql.Bit, data.ICT_Use ?? null);
    request.input("ICT_Details", sql.NVarChar(sql.MAX), data.ICT_Details ?? null);
    request.input("NILL2016_17", sql.Bit, data.NILL2016_17);
    request.input("NILL2017_18", sql.Bit, data.NILL2017_18);
    request.input("NILL2018_19", sql.Bit, data.NILL2018_19);
    request.input("NILL2019_20", sql.Bit, data.NILL2019_20);
    request.input("NILL2020_21", sql.Bit, data.NILL2020_21);
    request.input("NILL2021_22", sql.Bit, data.NILL2021_22);
    request.input("NILL2022_23", sql.Bit, data.NILL2022_23);
    request.input("NILL2023_24", sql.Bit, data.NILL2023_24);
    request.input("NILL2024_25", sql.Bit, data.NILL2024_25);
    request.input("NILL2025_26", sql.Bit, data.NILL2025_26);
    request.input("Disabled", sql.Bit, data.Disabled);
    request.input("H_INDEX", sql.Int, data.H_INDEX);
    request.input("i10_INDEX", sql.Int, data.i10_INDEX);
    request.input("CITIATIONS", sql.Int, data.CITIATIONS);
    request.input("ORCHID_ID", sql.NVarChar(100), data.ORCHID_ID);
    request.input("RESEARCHER_ID", sql.NVarChar(100), data.RESEARCHER_ID);
    request.input("Guide_year", sql.Int, data.Guide_year);
    request.input("Status", sql.NVarChar(50), data.Status);
    request.input("ProfileImage", sql.NVarChar(sql.MAX), data.ProfileImage ?? null);

    // Execute stored procedure
    await request.execute("sp_Update_Teacher");

    return Response.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


//#endregion