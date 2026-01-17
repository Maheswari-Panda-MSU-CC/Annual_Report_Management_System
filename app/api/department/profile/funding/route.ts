import { connectToDatabase } from '@/lib/db';
import { cachedJsonResponse } from '@/lib/api-cache';
import sql from 'mssql';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { logActivityFromRequest } from '@/lib/activity-log';

// GET - Fetch all funding records for a department
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
      .execute('sp_GetAll_Dept_Funding_ByDeptid');

    const fundingRecords = result.recordset || [];

    // Cache for 2 minutes (120 seconds)
    return cachedJsonResponse({ fundingRecords }, 120);
  } catch (err) {
    console.error('Error fetching department funding:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch department funding' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST - Insert new funding record
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Validation
    if (!data.deptId || isNaN(data.deptId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required and must be valid" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== data.deptId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.fundingAgency || data.fundingAgency.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funding agency is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.dateofRecog) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Date of recognition is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.fundsSancttioned || isNaN(Number(data.fundsSancttioned))) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funds sanctioned is required and must be a valid number" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const requestObj = pool.request();

    requestObj.input('DeptId', sql.Int, data.deptId);
    requestObj.input('FundingAgency', sql.VarChar(100), data.fundingAgency.trim());
    requestObj.input('DateofRecog', sql.Date, data.dateofRecog);
    requestObj.input('Funds_Sancttioned', sql.BigInt, BigInt(data.fundsSancttioned));
    requestObj.input('Details', sql.VarChar(500), data.details?.trim() || null);

    const result = await requestObj.execute('sp_Insert_Dept_Funding');
    const insertedId = result.recordset?.[0]?.id || result.recordset?.[0]?.Id || result.returnValue || null;

    // Log activity (non-blocking)
    logActivityFromRequest(request, user, 'CREATE', 'Dept_Funding', insertedId).catch(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Funding record added successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Insert error:", error);
    
    let errorMessage = "Failed to add funding record";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("PRIMARY KEY") || error.message.includes("UNIQUE")) {
        errorMessage = "A record with this information already exists";
        statusCode = 409;
      } else if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Invalid reference: One or more selected values are not valid";
        statusCode = 400;
      } else if (error.message.includes("NULL") || error.message.includes("required")) {
        errorMessage = "Required fields are missing: " + error.message;
        statusCode = 400;
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

// PUT/PATCH - Update funding record
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const data = await request.json();

    // Validation
    if (!data.id || isNaN(data.id)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funding record ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.deptId || isNaN(data.deptId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required and must be valid" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== data.deptId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Forbidden - Department ID mismatch" 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.fundingAgency || data.fundingAgency.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funding agency is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.dateofRecog) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Date of recognition is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data.fundsSancttioned || isNaN(Number(data.fundsSancttioned))) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funds sanctioned is required and must be a valid number" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = await connectToDatabase();
    const requestObj = pool.request();

    requestObj.input('Id', sql.Int, data.id);
    requestObj.input('DeptId', sql.Int, data.deptId);
    requestObj.input('FundingAgency', sql.VarChar(100), data.fundingAgency.trim());
    requestObj.input('DateofRecog', sql.Date, data.dateofRecog);
    requestObj.input('Funds_Sancttioned', sql.BigInt, BigInt(data.fundsSancttioned));
    requestObj.input('Details', sql.VarChar(500), data.details?.trim() || null);

    await requestObj.execute('sp_Update_Dept_Funding');

    // Log activity
    logActivityFromRequest(request, user, 'UPDATE', 'Dept_Funding', data.id).catch(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Funding record updated successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Update error:", error);
    
    let errorMessage = "Failed to update funding record";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("PRIMARY KEY") || error.message.includes("UNIQUE")) {
        errorMessage = "A record with this information already exists";
        statusCode = 409;
      } else if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Invalid reference: One or more selected values are not valid";
        statusCode = 400;
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

// DELETE - Delete funding record
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '', 10);
    const deptId = parseInt(searchParams.get('deptId') || '', 10);

    if (isNaN(id)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Funding record ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isNaN(deptId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Department ID is required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user's dept_id matches the requested deptId
    if (user.dept_id !== deptId) {
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

    requestObj.input('Id', sql.Int, id);

    await requestObj.execute('sp_Delete_Dept_Funding');

    // Log activity
    logActivityFromRequest(request, user, 'DELETE', 'Dept_Funding', id).catch(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Funding record deleted successfully" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Delete error:", error);
    
    let errorMessage = "Failed to delete funding record";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("FOREIGN KEY") || error.message.includes("constraint")) {
        errorMessage = "Cannot delete: This record is referenced by other records";
        statusCode = 400;
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

