// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { globalLimiter } from "./lib/rateLimiter"

export const config = {
  matcher: '/api/:path*',
}

export async function middleware(request: NextRequest) {
  // Try the most common headers in order of trust:
  const cfIp = request.headers.get('cf-connecting-ip')            // Cloudflare
  const realIp = request.headers.get('x-real-ip')                 // common “real” header
  const forwarded = request.headers.get('x-forwarded-for')        // may be a comma list
  const ip =
    cfIp
    ?? realIp
    ?? forwarded?.split(',')[0].trim()
    ?? '127.0.0.1'

  const { success } = await globalLimiter.limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}
