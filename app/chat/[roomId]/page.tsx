// app/chat/[roomId]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, FormEvent } from 'react'

interface Message {
  id:        number
  content:   string
  createdAt: string
  author:    { email: string }
}

export default function ChatPage() {
  const { roomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // helper to load all messages
  const fetchMessages = async () => {
    if (!roomId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/chat/${roomId}`)
      const data = await res.json() as Message[]
      setMessages(data)
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

    if (!res.ok) {
      console.error('Send failed:', await res.text())
      return
    }

    // 1️⃣ read back the new message (now with author.email!)
    const saved = await res.json() as Message

    // 2️⃣ append it to your local list
    setMessages((prev) => [...prev, saved])

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
          {messages.map((m) => (
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
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv melding…"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
