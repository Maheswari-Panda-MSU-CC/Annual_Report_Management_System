// import { connectToDatabase } from '@/lib/db';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import crypto from "crypto";

// // POST: Login and set cookie
// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
//     }

//     const pool = await connectToDatabase();
//     const result = await pool
//       .request()
//       .input('Email_Id', email)
//       .execute('sp_Get_Login_By_Email'); // Assume this SP returns user with hashed password
 
//     const user = result.recordset[0];
//     // console.log(user);
//     if (!user) {
//       return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
//     }

//     // Compare provided password with hashed password
//     const passwordMatch = await verifyPassword(password,user.password_hash,user.email_id);
//     // const passwordMatch = await bcrypt.compare(password, user.password_hash?.trim());

//     // console.log(password);
//     // console.log(user.password_hash);

//     /* FOR TIME BEING ITS COMMENTED OUT THE PASSWORD VALIDATION
//     bcrypt.compare(password, user.password_hash).then(result => {
//         console.log(result); // should log: true
//       });
//     if (!passwordMatch) {
//       return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
//     }
//       */

//     // Generate JWT with minimal essential fields only
//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email_id,
//         user_type: user.user_type,
//         role_id: user.Role_Id || null,
//         faculty_id: user.Faculty_Id || null,
//         dept_id: user.Dept_Id || null,
//       },
//       process.env.JWT_SECRET || 'dev_secret',
//       { expiresIn: '3h' } // 3 hours expiry
//     );

//     // Set cookie for 3 hours with additional cookies for essential IDs
//     const response = NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         email: user.email_id,
//         user_type: user.user_type,
//         name: user.Display_Name || null,
//         department: user.Department_Name || null,
//         faculty: user.Faculty_Name || null,
//         role_id: user.Role_Id || null,
//         faculty_id: user.Faculty_Id || null,
//         dept_id: user.Dept_Id || null,
//       },
//     });
//     response.cookies.set('session', token, {
//       httpOnly: true,
//       maxAge: 3 * 60 * 60, // 3 hours in seconds
//       path: '/',
//       sameSite: 'lax',
//       secure: process.env.NODE_ENV === 'production',
//     });

//     // Set additional cookies for essential IDs (non-httpOnly for frontend access)
//     if (user.Role_Id) {
//       response.cookies.set('role_id', user.Role_Id.toString(), {
//         maxAge: 3 * 60 * 60, // 3 hours in seconds
//         path: '/',
//         sameSite: 'lax',
//         secure: process.env.NODE_ENV === 'production',
//       });
//     }
    
//     if (user.Faculty_Id) {
//       response.cookies.set('faculty_id', user.Faculty_Id.toString(), {
//         maxAge: 3 * 60 * 60, // 3 hours in seconds
//         path: '/',
//         sameSite: 'lax',
//         secure: process.env.NODE_ENV === 'production',
//       });
//     }
    
//     if (user.Dept_Id) {
//       response.cookies.set('dept_id', user.Dept_Id.toString(), {
//         maxAge: 3 * 60 * 60, // 3 hours in seconds
//         path: '/',
//         sameSite: 'lax',
//         secure: process.env.NODE_ENV === 'production',
//       });
//     }

//     return response;
//   } catch (err) {
//     console.error('Login API Error:', err);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }

// // GET: Verify session
// export async function GET() {
//   try {
//     const token = (await cookies()).get('session')?.value;

//     if (!token) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }

//     const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
//     return NextResponse.json({ authenticated: true, user: payload });
//   } catch (err) {
//     return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
//   }
// }

// // DELETE: Logout
// export async function DELETE() {
//   const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
//   // Clear session cookie
//   response.cookies.set('session', '', {
//     httpOnly: true,
//     maxAge: 0,
//     path: '/',
//   });
  
//   // Clear additional ID cookies
//   response.cookies.set('role_id', '', {
//     maxAge: 0,
//     path: '/',
//   });
  
//   response.cookies.set('faculty_id', '', {
//     maxAge: 0,
//     path: '/',
//   });
  
//   response.cookies.set('dept_id', '', {
//     maxAge: 0,
//     path: '/',
//   });
  
//   return response;
// }


// // // PBKDF2 validation
// function validatePBKDF2(password:any ,storedHash:any) {
//   const [iterationsStr, saltB64, hashB64] = storedHash.split(":");
//   const iterations = parseInt(iterationsStr, 10);
//   const salt = Buffer.from(saltB64, "base64");
//   const storedHashBuffer = Buffer.from(hashB64, "base64");

//   const derived = crypto.pbkdf2Sync(password, salt, iterations, storedHashBuffer.length, "sha1");
//   return crypto.timingSafeEqual(storedHashBuffer, derived);
// }

// // Login logic
// async function verifyPassword(password:any, hashedPassword:any, email:string) {
//   if (hashedPassword.startsWith("$2")) {
//     // bcrypt
//     return await bcrypt.compare(password, hashedPassword);
//   } else if (hashedPassword.includes(":")) {
//     // old PBKDF2
//     const valid = validatePBKDF2(password, hashedPassword);
//     if (valid) {
//       // rehash and update to bcrypt
//       const newHash = await bcrypt.hash(password, 10);

//       // Update password in DB
//       const pool = await connectToDatabase();
//       await pool
//         .request()
//         .input('Email_Id', email)
//         .input('Password_Hash', newHash)
//         .execute('sp_UpdateLoginDetailsPassword_ByEmail');

//     }
//     return valid;
//   }
//   return false;
// }


import { connectToDatabase } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import crypto from "crypto";

// Legacy PBKDF2 parameters
const PBKDF2_ITERATIONS = 1000;
const SALT_BYTE_SIZE = 48;
const HASH_BYTE_SIZE = 48;
const PBKDF2_DIGEST = "sha1";

// ---------------- PBKDF2 hash ----------------
function hashPasswordPBKDF2(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE);
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE, PBKDF2_DIGEST);
  return `${PBKDF2_ITERATIONS}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

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

// ---------------- POST: Login ----------------
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('Email_Id', email)
      .execute('sp_Get_Login_By_Email');

    const user = result.recordset[0];
    if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

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
      

    return response;

  } catch (err) {
    console.error('Login API Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: Logout and clear auth cookies
export async function DELETE() {
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

  // No-store headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
