// app/api/chat/[roomId]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

type Context = {
  params: Promise<{ roomId: string }>
}

async function requireAuth(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    // build a login URL that returns user back here
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return null
}

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  // 0️⃣ auth guard
  const redirectResponse = await requireAuth(request)
  if (redirectResponse) return redirectResponse

  // 1️⃣ unwrap the async params
  const { roomId } = await params
  const id = parseInt(roomId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 })
  }

  // 2️⃣ fetch messages for this room
  const messages = await prisma.message.findMany({
    where: { roomId: id },
    include: { author: { select: { email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(
  request: NextRequest,
  { params }: Context
) {
  // 0️⃣ auth guard
  const redirectResponse = await requireAuth(request)
  if (redirectResponse) return redirectResponse

  // 1️⃣ unwrap params + validate
  const { roomId } = await params
  const id = parseInt(roomId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 })
  }

  // 2️⃣ parse + validate payload
  const body = await request.json()
  if (typeof body.content !== 'string' || !body.content.trim()) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  // 3️⃣ persist new message
  const message = await prisma.message.create({
    data: {
      content: body.content,
      author: { connect: { email: (await auth())!.user!.email! } },
      room: {
        connectOrCreate: {
          where: { id },
          create: { name: `Room ${id}`, id },
        },
      },
    },
    include: { author: { select: { email: true } } },
  })

  return NextResponse.json(message, { status: 201 })
}
