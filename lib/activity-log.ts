import { NextRequest } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import sql from 'mssql'
import { getAuthUser, AuthUser } from './auth-utils'

/**
 * Extract IP address from request headers
 */
export function getClientIP(request: NextRequest | Request): string | null {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const cfConnectingIP = headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  return null
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: NextRequest | Request): string | null {
  return request.headers.get('user-agent') || null
}

/**
 * Log activity to database using sp_insert_activity_log
 * This is non-blocking and won't fail the main operation
 */
export async function logActivity(
  request: NextRequest | Request,
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'PATCH',
  entityName: string,
  entityId: number | null = null,
  performedById: number | null = null,
  performedByType: number | null = null
): Promise<void> {
  try {
    // Get user info from request if not provided
    let userId: number | null = performedById
    let userType: number | null = performedByType

    if (!userId || !userType) {
      try {
        if (request instanceof NextRequest) {
          const user = await getAuthUser(request)
          if (user) {
            userId = userId || user.role_id || null
            userType = userType || user.user_type || null
          }
        }
      } catch (error) {
        // If we can't get user info, continue with provided values or null
        console.warn('Could not extract user info for activity log:', error)
      }
    }

    // If we still don't have user info, skip logging
    if (!userId || !userType) {
      console.warn('Skipping activity log: Missing user information')
      return
    }

    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    const pool = await connectToDatabase()
    await pool
      .request()
      .input('performed_by_id', sql.Int, userId)
      .input('performed_by_type', sql.Int, userType)
      .input('action_type', sql.VarChar(20), actionType)
      .input('entity_name', sql.NVarChar(100), entityName)
      .input('entity_id', sql.Int, entityId)
      .input('ip_address', sql.VarChar(45), ipAddress)
      .input('user_agent', sql.NVarChar(255), userAgent)
      .execute('sp_insert_activity_log')
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Error logging activity:', error)
  }
}

/**
 * Helper to log activity with user info already available
 * More efficient when user info is already known
 */
export async function logActivityWithUser(
  user: AuthUser,
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'PATCH',
  entityName: string,
  entityId: number | null = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
): Promise<void> {
  try {
    const userId = user.role_id || null
    const userType = user.user_type || null

    if (!userId || !userType) {
      console.warn('Skipping activity log: Missing user information')
      return
    }

    const pool = await connectToDatabase()
    await pool
      .request()
      .input('performed_by_id', sql.Int, userId)
      .input('performed_by_type', sql.Int, userType)
      .input('action_type', sql.VarChar(20), actionType)
      .input('entity_name', sql.NVarChar(100), entityName)
      .input('entity_id', sql.Int, entityId)
      .input('ip_address', sql.VarChar(45), ipAddress)
      .input('user_agent', sql.NVarChar(255), userAgent)
      .execute('sp_insert_activity_log')
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Error logging activity:', error)
  }
}

/**
 * Convenience helper that extracts IP and User Agent from request
 * Use this when you have user info and request object
 */
export async function logActivityFromRequest(
  request: NextRequest | Request,
  user: AuthUser,
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'PATCH',
  entityName: string,
  entityId: number | null = null
): Promise<void> {
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)
  await logActivityWithUser(user, actionType, entityName, entityId, ipAddress, userAgent)
}

