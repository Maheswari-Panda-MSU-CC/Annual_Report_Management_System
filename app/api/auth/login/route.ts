import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import crypto from "crypto";
import sql from 'mssql';

// Legacy PBKDF2 parameters

const PBKDF2_DIGEST = "sha1";

// ---------------- PBKDF2 validation ----------------
function validatePBKDF2(password: string, storedHash: string): boolean {
  const [iterationsStr, saltB64, hashB64] = storedHash.split(":");
  const iterations = parseInt(iterationsStr, 10);
  const salt = Buffer.from(saltB64, "base64");
  const hash = Buffer.from(hashB64, "base64");

  const derived = crypto.pbkdf2Sync(password, salt, iterations, hash.length, PBKDF2_DIGEST);

  // Constant-time comparison
  let diff = hash.length ^ derived.length;
  for (let i = 0; i < hash.length && i < derived.length; i++) {
    diff |= hash[i] ^ derived[i];
  }
  return diff === 0;
}

// ---------------- Verify password ----------------
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!hashedPassword) return false;
  if (hashedPassword.includes(":")) {
    return validatePBKDF2(password, hashedPassword);
  }
  return false;
}

// Helper function to extract IP address from request
function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return null;
}

// Helper function to extract user agent from request
function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent') || null;
}

// Helper function to log login attempt
async function logLoginAttempt(
  pool: sql.ConnectionPool,
  loginId: number | null,
  email: string,
  userType: number | null,
  roleId: number | null,
  loginStatus: 'SUCCESS' | 'FAILED',
  failureReason: string | null,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  try {
    await pool
      .request()
      .input('login_id', sql.Int, loginId)
      .input('email_id', sql.NVarChar(150), email)
      .input('user_type', sql.Int, userType)
      .input('role_id', sql.Int, roleId)
      .input('login_status', sql.VarChar(20), loginStatus)
      .input('failure_reason', sql.NVarChar(100), failureReason)
      .input('ip_address', sql.VarChar(45), ipAddress)
      .input('user_agent', sql.NVarChar(255), userAgent)
      .execute('sp_Insert_Auth_Login_Log');
  } catch (error) {
    // Log error but don't fail the login/logout process
    console.error('Error logging login attempt:', error);
  }
}

// ---------------- POST: Login ----------------
export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);
  let email: string = '';
  let user: any = null;

  try {
    const body = await request.json();
    email = body.email || '';
    const password = body.password || '';
    
    if (!email || !password) {
      // Log failed login attempt - missing credentials
      const pool = await connectToDatabase();
      await logLoginAttempt(pool, null, email || 'unknown', null, null, 'FAILED', 'Missing email or password', ipAddress, userAgent);
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('Email_Id', email)
      .execute('sp_Get_Login_By_Email');

    user = result.recordset[0];
    if (!user) {
      // Log failed login attempt - user not found
      await logLoginAttempt(pool, null, email, null, null, 'FAILED', 'User not found', ipAddress, userAgent);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      // Log failed login attempt - invalid password
      await logLoginAttempt(pool, user.id, email, user.user_type, user.Role_Id || null, 'FAILED', 'Invalid password', ipAddress, userAgent);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email_id,
        user_type: user.user_type,
        role_id: user.Role_Id || null,
        faculty_id: user.Faculty_Id || null,
        dept_id: user.Dept_Id || null,
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '3h' }
      // { expiresIn: '30s' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email_id,
        user_type: user.user_type,
        name: user.Display_Name || null,
        department: user.Department_Name || null,
        faculty: user.Faculty_Name || null,
        role_id: user.Role_Id || null,
        faculty_id: user.Faculty_Id || null,
        dept_id: user.Dept_Id || null,
        profilePicture: user.ProfileImage || null,
      },
    });

    // Ensure no caching of auth responses
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    response.cookies.set('session', token, {
      httpOnly: true,
      maxAge: 3*60*60, // 3 hours
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Also set a readable expiry timestamp cookie for client auto-logout (not httpOnly)
    const expiresAt = Date.now() + 3*60*60 * 1000
    response.cookies.set('session_expires_at', String(expiresAt), {
      httpOnly: false,
      maxAge: 3*60*60, // 3 hours
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

          // Set additional cookies for essential IDs (non-httpOnly for frontend access)
          if (user.Role_Id) {
            response.cookies.set('role_id', user.Role_Id.toString(), {
              maxAge: 3*60*60, // 3 hours
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          }
          
          if (user.Faculty_Id) {
            response.cookies.set('faculty_id', user.Faculty_Id.toString(), {
              maxAge: 3*60*60, // 3 hours
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          }
          
          if (user.Dept_Id) {
            response.cookies.set('dept_id', user.Dept_Id.toString(), {
              maxAge: 3*60*60, // 3 hours
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
          }
      
    // Log successful login attempt
    await logLoginAttempt(pool, user.id, email, user.user_type, user.Role_Id || null, 'SUCCESS', null, ipAddress, userAgent);

    return response;

  } catch (err) {
    console.error('Login API Error:', err);
    // Log failed login attempt - server error
    try {
      const pool = await connectToDatabase();
      await logLoginAttempt(pool, user?.id || null, email || 'unknown', user?.user_type || null, user?.Role_Id || null, 'FAILED', 'Internal server error', ipAddress, userAgent);
    } catch (logError) {
      console.error('Error logging failed login attempt:', logError);
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Helper function to log logout
async function logLogout(
  pool: sql.ConnectionPool,
  loginId: number,
  email: string,
  userType: number | null,
  roleId: number | null,
  logoutReason: string | null,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  try {
    await pool
      .request()
      .input('login_id', sql.Int, loginId)
      .input('email_id', sql.NVarChar(150), email)
      .input('user_type', sql.Int, userType)
      .input('role_id', sql.Int, roleId)
      .input('logout_reason', sql.NVarChar(100), logoutReason)
      .input('ip_address', sql.VarChar(45), ipAddress)
      .input('user_agent', sql.NVarChar(255), userAgent)
      .execute('sp_Insert_Auth_Logout_Log');
  } catch (error) {
    // Log error but don't fail the logout process
    console.error('Error logging logout:', error);
  }
}

// DELETE: Logout and clear auth cookies
export async function DELETE(request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = getUserAgent(request);
  
  // Get user info from session cookie before clearing it
  let loginId: number | null = null;
  let email: string | null = null;
  let userType: number | null = null;
  let roleId: number | null = null;

  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      try {
        const decoded = jwt.verify(sessionCookie, process.env.JWT_SECRET || 'dev_secret') as any;
        loginId = decoded.id ? parseInt(decoded.id) : null;
        email = decoded.email || null;
        userType = decoded.user_type || null;
        roleId = decoded.role_id || null;
      } catch (jwtError) {
        // Invalid or expired token - still proceed with logout
        console.warn('Invalid session token during logout:', jwtError);
      }
    }
  } catch (error) {
    console.error('Error extracting user info for logout log:', error);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear session cookie
  response.cookies.set('session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Clear additional ID cookies
  response.cookies.set('role_id', '', {
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  response.cookies.set('faculty_id', '', {
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  response.cookies.set('dept_id', '', {
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  response.cookies.set('session_expires_at', '', {
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // No-store headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Log logout attempt (non-blocking)
  if (loginId !== null && email) {
    try {
      const pool = await connectToDatabase();
      await logLogout(pool, loginId, email, userType, roleId, 'User initiated logout', ipAddress, userAgent);
    } catch (logError) {
      console.error('Error logging logout:', logError);
      // Don't fail the logout process if logging fails
    }
  }

  return response;
}
