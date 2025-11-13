import { NextResponse } from "next/server"

/**
 * Adds caching headers to API responses
 * @param response - The response object
 * @param maxAge - Cache duration in seconds (default: 300 = 5 minutes)
 * @returns Response with cache headers
 */
export function withCache(response: NextResponse, maxAge: number = 300): NextResponse {
  response.headers.set("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`)
  response.headers.set("CDN-Cache-Control", `public, s-maxage=${maxAge}`)
  response.headers.set("Vercel-CDN-Cache-Control", `public, s-maxage=${maxAge}`)
  return response
}

/**
 * Creates a cached JSON response
 */
export function cachedJsonResponse(data: any, maxAge: number = 300): NextResponse {
  const response = NextResponse.json(data)
  return withCache(response, maxAge)
}

