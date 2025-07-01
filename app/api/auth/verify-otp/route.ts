import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, otp, otpToken } = await request.json();
    if (!email || !otp || !otpToken) {
      return NextResponse.json({ error: 'Email, OTP, and otpToken are required.' }, { status: 400 });
    }

    let payload;
    try {
      payload = jwt.verify(otpToken, process.env.JWT_SECRET || 'dev_secret');
    } catch {
      return NextResponse.json({ error: 'OTP expired or invalid.' }, { status: 401 });
    }

    // Type guard for payload
    const valid =
      typeof payload === 'object' &&
      payload &&
      'email' in payload &&
      'otp' in payload &&
      'exp' in payload &&
      payload.email === email &&
      payload.otp === otp;

    if (!valid) {
      return NextResponse.json({ error: 'Invalid OTP or email.' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify OTP API Error:', err);
    return NextResponse.json({ error: 'Failed to verify OTP.' }, { status: 500 });
  }
} 