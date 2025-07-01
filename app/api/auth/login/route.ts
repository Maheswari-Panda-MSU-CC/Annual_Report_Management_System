import { connectToDatabase } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// POST: Login and set cookie
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('Email_Id', email)
      .execute('sp_Get_Login_By_Email'); // Assume this SP returns user with hashed password

    const user = result.recordset[0];
    console.log(user);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Compare provided password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password_hash?.trim());

    console.log(password);
    console.log(user.password_hash);
    bcrypt.compare(password, user.password_hash).then(result => {
        console.log(result); // should log: true
      });
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email_id,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '3h' } // 3 hours expiry
    );

    // Set cookie for 3 hours
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email_id,
        user_type: user.user_type,
      },
    });
    response.cookies.set('session', token, {
      httpOnly: true,
      maxAge: 3 * 60 * 60, // 3 hours in seconds
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('Login API Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// GET: Verify session
export async function GET() {
  try {
    const token = (await cookies()).get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return NextResponse.json({ authenticated: true, user: payload });
  } catch (err) {
    return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
  }
}

// DELETE: Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
