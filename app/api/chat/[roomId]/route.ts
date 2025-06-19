// app/api/chat/[roomId]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

type Context = {
  params: Promise<{ roomId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  // 1️⃣ unwrap the async params
  const { roomId } = await params
  const id = parseInt(roomId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 })
  }

  // 2️⃣ fetch messages for this room
  console.log('prisma client:', prisma)
console.log('prisma.message:', prisma?.message)

  const messages = await prisma.message.findMany({
    where: { roomId: id },
    include: {
      author: { select: { email: true } }
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(
  request: NextRequest,
  { params }: Context
) {
  // 1️⃣ unwrap params + validate
  const { roomId } = await params
  const id = parseInt(roomId, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 })
  }

  // 2️⃣ get and verify session
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3️⃣ parse + validate payload
  const body = await request.json()
  if (typeof body.content !== 'string' || !body.content.trim()) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  // 4️⃣ persist new message
  const message = await prisma.message.create({
  data: {
    content: body.content,
    author:  { connect: { email: session.user.email } },
    room: {
      connectOrCreate: {
        where: { id },
        create: { name: `Room ${id}`, id },  // you can explicitly set id on an autoincrement PK
      }
    }
  },
  include: {
    author: { select: { email: true } }
  }
})

  return NextResponse.json(message, { status: 201 })
}
