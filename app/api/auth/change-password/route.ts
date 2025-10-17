// import { connectToDatabase } from '@/lib/db';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     // Get session token from cookies
//     const cookieStore = cookies();
//     const token = (await cookieStore).get('session')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
//     }

//     // Verify JWT and extract email
//     let payload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
//     } catch {
//       return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
//     }
//     // Type guard for JwtPayload
//     const email = (typeof payload === 'object' && payload && 'email' in payload) ? (payload as any).email : undefined;
//     if (!email) {
//       return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
//     }

//     // Get new password from request
//     const { newPassword, user_type } = await request.json();
//     if (!newPassword || newPassword.length < 8) {
//       return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update password in DB
//     const pool = await connectToDatabase();
//     await pool
//       .request()
//       .input('Email_Id', email)
//       .input('Password_Hash', hashedPassword)
//       .execute('sp_UpdateLoginDetailsPassword_ByEmail');

//     return NextResponse.json({ success: true, message: 'Password changed successfully' });
//   } catch (err) {
//     console.error('Change Password API Error:', err);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// } 

import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// PBKDF2 constants to match existing hashes
const PBKDF2_ITERATIONS = 1000;
const SALT_BYTE_SIZE = 48;
const HASH_BYTE_SIZE = 48;
const PBKDF2_DIGEST = 'sha1';

function hashPasswordPBKDF2(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE);
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE, PBKDF2_DIGEST);
  return `${PBKDF2_ITERATIONS}:${salt.toString('base64')}:${hash.toString('base64')}`;
}

// POST /api/auth/change-password
// Body: { email }
// Sends reset link with 5-min token to the provided email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const pool = await connectToDatabase();

    // ✅ Check if email exists using existing stored procedure
    const result = await pool
      .request()
      .input("Email_Id", email)
      .execute("sp_Get_Login_By_Email");

    const loginAccount = result.recordset[0];
    if (!loginAccount) {
      // keep response generic for security
      return NextResponse.json({
        success: false,
        message: "If the email exists, a reset link will be sent.",
      });
    }
    // Generate short-lived JWT reset token
    const resetToken = jwt.sign({ email, purpose: 'password_reset' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5m' });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/change-password?token=${encodeURIComponent(resetToken)}`;

    // Send email via existing mail route
   // Send email via existing mail route
await fetch(`${baseUrl}/api/send-mail`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: email,
    subject: "ARMS Password Reset Request",
    text: `Dear User,

We received a request to reset the password for your ARMS account associated with this email address.

If you made this request, please click the link below to set a new password. This link will expire in 5 minutes for your security.

Reset your password:
${resetLink}

If you did not request a password reset, please ignore this email. Your account will remain secure.

Best regards,
ARMS Support Team
Faculty of Technology and Engineering
Maharaja Sayajirao University of Baroda`,

    // ✅ Optional: include HTML version for better formatting in email clients
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear User,</p>
        <p>We received a request to reset the password for your <strong>ARMS account</strong> associated with this email address.</p>
        <p>If you made this request, please click the button below to set a new password. This link will expire in <strong>5 minutes</strong> for your security.</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
        <br />
        <p>Best regards,<br />
        <strong>ARMS Support Team</strong><br />
        Faculty of Technology and Engineering<br />
        Maharaja Sayajirao University of Baroda</p>
      </div>
    `,
  }),
});


    return NextResponse.json({ success: true, message: 'Reset link sent if email exists' });
  } catch (err) {
    console.error('Send reset link error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// PUT /api/auth/change-password
// Body: { token, newPassword }
// Verifies token and updates password
export async function PUT(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) return NextResponse.json({ error: 'Token and newPassword are required' }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    } catch {
      return NextResponse.json({ error: 'Reset link expired or invalid' }, { status: 401 });
    }

    if (!payload || payload.purpose !== 'password_reset' || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const email = payload.email as string;
    const hashedPassword = hashPasswordPBKDF2(newPassword);

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("Email_Id", email)
      .input("Password_Hash", hashedPassword)
      .execute("sp_UpdateLoginDetailsPassword_ByEmail");

    // Extract stored procedure output (first recordset)
    const response = result.recordset[0];

    if (response && response.Success) {
      return NextResponse.json({ success: true, message: response.Message || "Password updated successfully." });
    } else {
      return NextResponse.json({ success: false, message: response?.Message || "Password update failed." }, { status: 400 });
    }
  } catch (err) {
    console.error('Password update error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
