import { jwtVerify } from "jose"
import { NextRequest } from "next/server"

export interface AuthUser {
  id: string
  email: string
  user_type: number
  role_id: number | null
  faculty_id: number | null
  dept_id: number | null
}

const secretKey = process.env.JWT_SECRET || "dev_secret"
const secret = new TextEncoder().encode(secretKey)

export async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      id: String(payload.id),
      email: String(payload.email),
      user_type: Number(payload.user_type),
      role_id: payload.role_id !== undefined && payload.role_id !== null ? Number(payload.role_id) : null,
      faculty_id: payload.faculty_id !== undefined && payload.faculty_id !== null ? Number(payload.faculty_id) : null,
      dept_id: payload.dept_id !== undefined && payload.dept_id !== null ? Number(payload.dept_id) : null,
    }
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const sessionCookie = request.cookies.get("session")?.value
  if (!sessionCookie) return null
  return verifyJWT(sessionCookie)
}

