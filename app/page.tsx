// app/page.tsx
import { auth } from '@/auth' 
import { redirect } from "next/navigation"
import SignInButton from "@/app/components/SignInButton"

export default async function HomePage() {
  const session = await auth()

  // if the user is signed in, send them straight to the chat
  if (session) {
    // you could also use session.user.id or
    // generate a new room and redirect to `/chat/${newRoomId}`
    redirect("/chat/1")
  }

  // otherwise show a sign–in prompt
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl mb-4">Welcome to My Chat App</h1>
      <SignInButton />
    </main>
  )
}
