import { connectToDatabase } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get session token from cookies
    const cookieStore = cookies();
    const token = (await cookieStore).get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify JWT and extract email
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    } catch {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }
    // Type guard for JwtPayload
    const email = (typeof payload === 'object' && payload && 'email' in payload) ? (payload as any).email : undefined;
    if (!email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get new password from request
    const { newPassword, user_type } = await request.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    const pool = await connectToDatabase();
    await pool
      .request()
      .input('Email_Id', email)
      .input('Password_Hash', hashedPassword)
      .execute('sp_UpdateLoginDetailsPassword_ByEmail');

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change Password API Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 