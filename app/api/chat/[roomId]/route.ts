// app/api/chat/[roomId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }>}
) {

  const { roomId } = await context.params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(roomId, 10)
  const messages = await prisma.message.findMany({
    where: { roomId: id },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }>}
) {
  const { roomId } = await context.params

  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = parseInt(roomId, 10)
  const message = await prisma.message.create({
    data: {
      content: body.content,
      author:    { connect: { email: session.user!.email! } },
      room:      { connect: { id } },
    },
    include: { author: true },
  })
  return NextResponse.json(message, { status: 201 })
}
