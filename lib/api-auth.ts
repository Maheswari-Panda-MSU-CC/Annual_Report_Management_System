import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, AuthUser } from "./auth-utils"

export type AuthResult =
  | { user: AuthUser; error?: never }
  | { user?: never; error: NextResponse }

export async function authenticateRequest(
  request: NextRequest,
  requiredTeacherId?: number
): Promise<AuthResult> {
  const user = await getAuthUser(request)

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized - Invalid or expired session" },
        { status: 401 }
      ),
    }
  }

  if (requiredTeacherId !== undefined && user.role_id !== requiredTeacherId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden - User ID mismatch" },
        { status: 403 }
      ),
    }
  }

  return { user }
}

