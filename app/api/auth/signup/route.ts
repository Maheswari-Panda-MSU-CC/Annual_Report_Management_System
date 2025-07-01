import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, user_type } = await request.json();
    if (!email || !password || user_type === undefined) {
      return new Response(JSON.stringify({ error: 'Email, password, and user_type are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await connectToDatabase();
    try {
      await pool
        .request()
        .input('Email_Id', email)
        .input('Password_Hash', hashedPassword)
        .input('User_Type', user_type)
        .execute('sp_Insert_Login_Details');
    } catch (err) {
      // Check for duplicate email error
      if (err instanceof Error && err.message && err.message.includes('Email ID already exists')) {
        return new Response(JSON.stringify({ error: 'Email ID already exists.' }), {
          status: 409,
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
