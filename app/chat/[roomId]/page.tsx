// app/chat/[roomId]/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage({
  params,                // <- this is Promise<{ roomId: string }>
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params               // ← await here
  const session = await auth()
  if (!session) {
    // now roomId is just a string
    redirect(`/?callbackUrl=/chat/${roomId}`)
  }
  return <ChatClient />
}
