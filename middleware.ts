import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read httpOnly session cookie presence
  const session = request.cookies.get('session')?.value

  if (!session) {
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


