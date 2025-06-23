// app/chat/[roomId]/ChatClient.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'

interface Message {
  id:        number
  content:   string
  createdAt: string
  author:    { email: string }
}

export default function ChatClient() {
  const { roomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

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

    const saved = await res.json() as Message
    setMessages(prev => [...prev, saved])
    setNewMessage('')
  }

  if (!roomId) return <p>Laster rom…</p>
  return (
    <div>
      <h1>Chat Room {roomId}</h1>
      {loading ? (
        <p>Henter meldinger…</p>
      ) : (
        <ul>
          {messages.map(m => (
            <li key={m.id}>
              <strong>{m.author.email}:</strong> {m.content}
              <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#666' }}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSend}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Skriv melding…"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
