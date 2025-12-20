import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth-utils'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/change-password')) {
    return NextResponse.next()
  }

  // Read httpOnly session cookie presence
  const session = request.cookies.get('session')?.value

  const invalidateAndRedirect = () => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)

    // Clear known cookies
    response.cookies.set('session', '', { path: '/', maxAge: 0 })
    response.cookies.set('role_id', '', { path: '/', maxAge: 0 })
    response.cookies.set('faculty_id', '', { path: '/', maxAge: 0 })
    response.cookies.set('dept_id', '', { path: '/', maxAge: 0 })
    response.cookies.set('session_expires_at', '', { path: '/', maxAge: 0 })
    return response
  }

  if (!session) {
    return invalidateAndRedirect()
  }

  // Verify JWT token validity (Edge-safe via jose in auth-utils)
  const decoded = await verifyJWT(session)
  if (!decoded) {
    return invalidateAndRedirect()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/faculty/:path*',
    '/department/:path*',
    '/teacher/:path*',
    '/(dashboards)/:path*',
  ],
}


