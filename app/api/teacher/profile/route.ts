import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

// #region Profile Data get

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const teacherId = parseInt(searchParams.get('teacherId') || '', 10);

    if (isNaN(teacherId) || teacherId === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing teacherId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (user.role_id !== teacherId) {
      return new Response(JSON.stringify({ error: 'Forbidden - User ID mismatch' }), {
        status: 403,
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
 
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await req.json();
    
    // Basic validation
    if (!data.Tid || data.Tid === 0) {
      return Response.json({ 
        success: false, 
        error: "Teacher ID is required and must be valid" 
      }, { status: 400 });
    }

    if (user.role_id !== data.Tid) {
      return Response.json({ 
        success: false, 
        error: "Forbidden - User ID mismatch" 
      }, { status: 403 });
    }

    // Validate required fields
    if (!data.fname || !data.lname) {
      return Response.json({ 
        success: false, 
        error: "First name and last name are required" 
      }, { status: 400 });
    }

    const pool = await connectToDatabase();
    const request = pool.request();

    // 🎯 Map all TeacherInfo columns with proper null handling
    request.input("Tid", sql.Int, data.Tid);
    request.input("fname", sql.NVarChar(100), data.fname || '');
    request.input("mname", sql.NVarChar(100), data.mname || '');
    request.input("lname", sql.NVarChar(100), data.lname || '');
    request.input("deptid", sql.Int, data.deptid || null);
    request.input("NET", sql.Bit, data.NET ?? false);
    request.input("PET", sql.Bit, data.PET ?? false);
    request.input("recruit_date", sql.Date, data.recruit_date || null);
    request.input("perma_or_tenure", sql.Bit, data.perma_or_tenure ?? false);
    request.input("desig_perma", sql.Int, data.desig_perma || null);
    request.input("desig_tenure", sql.Int, data.desig_tenure || null);
    // Convert phone_no to BigInt safely
    const phoneNo = data.phone_no ? (typeof data.phone_no === 'string' ? parseInt(data.phone_no) : data.phone_no) : null;
    request.input("phone_no", sql.BigInt, phoneNo || null);
    request.input("email_id", sql.NVarChar(150), data.email_id || '');
    request.input("NET_year", sql.Int, data.NET_year || null);
    request.input("PET_year", sql.Int, data.PET_year || null);
    request.input("GATE", sql.Bit, data.GATE ?? false);
    request.input("GATE_year", sql.Int, data.GATE_year || null);
    request.input("Abbri", sql.NVarChar(50), data.Abbri || '');
    request.input("PAN_No", sql.NVarChar(20), data.PAN_No || '');
    request.input("DOB", sql.Date, data.DOB || null);
    request.input("PHDGuide", sql.Bit, data.PHDGuide ?? false);
    request.input("OtherGuide", sql.Bit, data.OtherGuide ?? false);
    request.input("ICT_Use", sql.Bit, data.ICT_Use ?? null);
    request.input("ICT_Details", sql.NVarChar(sql.MAX), data.ICT_Details || null);
    request.input("NILL2016_17", sql.Bit, data.NILL2016_17 ?? false);
    request.input("NILL2017_18", sql.Bit, data.NILL2017_18 ?? false);
    request.input("NILL2018_19", sql.Bit, data.NILL2018_19 ?? false);
    request.input("NILL2019_20", sql.Bit, data.NILL2019_20 ?? false);
    request.input("NILL2020_21", sql.Bit, data.NILL2020_21 ?? false);
    request.input("NILL2021_22", sql.Bit, data.NILL2021_22 ?? false);
    request.input("NILL2022_23", sql.Bit, data.NILL2022_23 ?? false);
    request.input("NILL2023_24", sql.Bit, data.NILL2023_24 ?? false);
    request.input("NILL2024_25", sql.Bit, data.NILL2024_25 ?? false);
    request.input("NILL2025_26", sql.Bit, data.NILL2025_26 ?? false);
    request.input("Disabled", sql.Bit, data.Disabled ?? false);
    request.input("H_INDEX", sql.Int, data.H_INDEX || null);
    request.input("i10_INDEX", sql.Int, data.i10_INDEX || null);
    request.input("CITIATIONS", sql.Int, data.CITIATIONS || null);
    request.input("ORCHID_ID", sql.NVarChar(100), data.ORCHID_ID || '');
    request.input("RESEARCHER_ID", sql.NVarChar(100), data.RESEARCHER_ID || '');
    request.input("Guide_year", sql.Int, data.Guide_year || null);
    request.input("Status", sql.NVarChar(50), data.Status || '');
    request.input("ProfileImage", sql.NVarChar(sql.MAX), data.ProfileImage || null);

    // Execute stored procedure
    await request.execute("sp_Update_Teacher");

    return Response.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Update error:", error);
    
    // Extract more detailed error information
    let errorMessage = "Failed to update profile";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific SQL errors
      if (error.message.includes("PRIMARY KEY") || error.message.includes("UNIQUE")) {
        errorMessage = "A record with this information already exists";
        statusCode = 409;
      } else if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Invalid reference: One or more selected values are not valid";
        statusCode = 400;
      } else if (error.message.includes("NULL") || error.message.includes("required")) {
        errorMessage = "Required fields are missing: " + error.message;
        statusCode = 400;
      } else if (error.message.includes("timeout") || error.message.includes("connection")) {
        errorMessage = "Database connection error. Please try again later";
        statusCode = 503;
      }
    }
    
    return Response.json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: statusCode });
  }
}


//#endregion