import { NextResponse, type NextRequest } from "next/server"
import { globalLimiter } from "./lib/rateLimiter"

export const config = {
    matcher: '/api/:path*',
}

export async function middleware(request: NextRequest) {

    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'

    const { success } = await globalLimiter.limit(ip)
    if (!success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded.'},
            { status: 429 }
        )
    }

    return NextResponse.next()
}