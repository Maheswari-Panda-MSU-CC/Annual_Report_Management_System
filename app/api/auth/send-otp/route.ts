// app/api/send-otp/route.ts

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Generate OTP and token
    const otp = generateOTP();
    const expiresIn = 2 * 60; // 2 minutes
    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const otpToken = jwt.sign({ email, otp, exp }, process.env.JWT_SECRET || 'dev_secret');

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    });

    return NextResponse.json({ success: true, otpToken });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }
}
