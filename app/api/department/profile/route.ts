import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

// GET - Fetch Department Profile Details
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const deptId = user.dept_id;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year') || '', 10) : null;
    if (deptId === null || isNaN(deptId)) {
      return new Response(JSON.stringify({ error: 'Department ID is required and must be valid' }), {
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

    let deptDetails = null;

      // If year is provided, use the stored procedure to get record for that year
      const requestObj = pool.request();
      requestObj.input('deptid', sql.Int, deptId);
      requestObj.input('year', sql.Int, year?year:null);

      const result = await requestObj.execute('sp_GetDeptDetails');
      deptDetails = result.recordset?.[0] ?? null;
    

    // Cache for 5 minutes (300 seconds) - profile data doesn't change frequently
    return cachedJsonResponse({ deptDetails }, 300);
  } catch (err) {
    console.error('Error fetching department profile:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch department profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST/PUT - Save Department Profile Details
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Basic validation
    if (!data.deptid || isNaN(data.deptid)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required and must be valid" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== data.deptid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const requestObj = pool.request();

    // Map all parameters with proper null handling (matching sp_Insert_Dept_Details)
    requestObj.input('submit_date', sql.DateTime, data.submit_date ? new Date(data.submit_date) : null);
    requestObj.input('intro', sql.NVarChar(sql.MAX), data.intro || null);
    requestObj.input('exam_reforms', sql.NVarChar(sql.MAX), data.exam_reforms || null);
    requestObj.input('innovative_processes', sql.NVarChar(sql.MAX), data.innovative_processes || null);
    requestObj.input('deptid', sql.Int, data.deptid);
    requestObj.input('year', sql.Int, data.year || null);
    requestObj.input('dept_lib', sql.NVarChar(sql.MAX), data.dept_lib || null);
    requestObj.input('dept_lab', sql.NVarChar(sql.MAX), data.dept_lab || null);

    // Execute stored procedure
    const result = await requestObj.execute('sp_Insert_Dept_Details');
    const insertedId = result.recordset?.[0]?.id || result.recordset?.[0]?.Id || result.returnValue || null;

    logActivityFromRequest(request, user, 'UPDATE', 'Dept_Details', insertedId).catch(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Department profile updated successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Update error:", error);
    
    // Extract more detailed error information
    let errorMessage = "Failed to update department profile";
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
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT - Alias for POST (same functionality)
export async function PUT(request: NextRequest) {
  return POST(request);
}

