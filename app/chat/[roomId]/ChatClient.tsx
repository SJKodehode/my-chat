'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef, FormEvent } from 'react'
import { signIn } from 'next-auth/react'

interface Message {
  id:        number
  content:   string
  createdAt: string
  author:    { 
    email: string
    name?: string
  }
}

export default function ChatClient() {
  const { roomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    if (!roomId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/${roomId}`)
      // 1️⃣ If not signed in, trigger Google flow
      if (res.status === 401) {
        signIn('google', { callbackUrl: `/chat/${roomId}` })
        return
      }
      // 2️⃣ Bail on other errors
      if (!res.ok) {
        console.error('Fetch error:', await res.text())
        return
      }
      // 3️⃣ Parse and guard
      const data = await res.json()
      if (!Array.isArray(data)) {
        console.error('Expected array, got:', data)
        return
      }
      setMessages(data)
    } catch (err) {
      console.error('Unexpected fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [roomId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!roomId || !newMessage.trim()) return

    const res = await fetch(`/api/chat/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    })

    // 4️⃣ Same guard for the POST
    if (res.status === 401) {
      signIn('google', { callbackUrl: `/chat/${roomId}` })
      return
    }
    if (!res.ok) {
      console.error('Send failed:', await res.text())
      return
    }

    const saved = (await res.json()) as Message
    setMessages(prev => [...prev, saved])
    setNewMessage('')
  }

  if (!roomId) return <p>Laster rom…</p>
  return (
    <div className="bg-white text-black flex flex-col justify-center items-center min-h-screen ">
        <div className="absolute inset-0 bg-[url('/nicolas-cage-bg.jpg')] bg-cover bg-center opacity-60 z-0"></div>
      <h1 className='z-10 text-4xl font-bold'>Kodehode chat {roomId}</h1>

      {loading ? (
        <p className='z-10'>Henter meldinger…</p>
      ) : (
        <div className='z-10 overflow-y-auto h-[70vh] w-full lg:w-[50vw] px-4'>
            
          <ul className='space-y-4'>
            {messages.map(m => (
              <li
                key={m.id}
                className='bg-blue-500 my-6 p-4 rounded-xl shadow-md max-w-fit'
              >
                <strong>{m.author.name ?? m.author.email}:</strong> {m.content}
                <span className='ml-2 text-xs text-gray-600'>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSend} className='z-10 w-full lg:w-[50vw] px-4 mt-4 flex space-x-2'>
        <input
          className='flex-1 border rounded p-2'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Skriv melding…"
        />
        <button
          className='bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50'
          type="submit"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}