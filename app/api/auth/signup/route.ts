import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import crypto from 'crypto';

// Legacy PBKDF2 parameters to match existing hashes
const PBKDF2_ITERATIONS = 1000;
const SALT_BYTE_SIZE = 48;
const HASH_BYTE_SIZE = 48;
const PBKDF2_DIGEST = 'sha1';

function hashPasswordPBKDF2(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE);
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE, PBKDF2_DIGEST);
  return `${PBKDF2_ITERATIONS}:${salt.toString('base64')}:${hash.toString('base64')}`;
}

export async function POST(request: Request) {
  try {
    const { email, password, user_type, fid, deptid } = await request.json();
    
    if (!email || !password || user_type === undefined) {
      return new Response(JSON.stringify({ error: 'Email, password, and user_type are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate based on user type according to SP requirements
    const userType = Number(user_type);
    if (userType === 3 && !fid) {
      return new Response(JSON.stringify({ error: 'Faculty ID (Fid) is required for Department account.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (userType === 4 && (!fid || !deptid)) {
      return new Response(JSON.stringify({ error: 'Faculty ID (Fid) and Department ID (DeptId) are required for Teacher account.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash the password using legacy PBKDF2 format
    const hashedPassword = hashPasswordPBKDF2(password);

    const pool = await connectToDatabase();
    const requestObj = pool.request()
      .input('Email_Id', sql.NVarChar(150), email)
      .input('Password_Hash', sql.Char(300), hashedPassword)
      .input('User_Type', sql.Int, userType)
      .input('DeptId', sql.Int, deptid || null)
      .input('Fid', sql.Int, fid || null);

    try {
      await requestObj.execute('sp_Insert_Login_Details');
    } catch (err: any) {
      // Check for duplicate email error
      if (err instanceof Error && err.message && err.message.includes('Email ID already exists')) {
        return new Response(JSON.stringify({ error: 'Email ID already exists.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Check for validation errors from SP
      if (err instanceof Error && err.message) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw err;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Signup API Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
