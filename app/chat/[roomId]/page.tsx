// app/chat/[roomId]/page.tsx
'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ChatRoom() {
  const params = useSearchParams()
  const roomId = params.get('roomId')!
  const { data: messages, mutate } = useSWR(
    `/api/chat/${roomId}`,
    fetcher,
    { refreshInterval: 500 }
  )
  const [input, setInput] = useState('')

  async function send() {
    if (!input.trim()) return
    await fetch(`/api/chat/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    })
    setInput('')
    mutate()
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Room #{roomId}</h1>
      <ul className="space-y-2 mb-4">
        {messages?.map((m: any) => (
          <li key={m.id}>
            <span className="font-semibold">{m.author.name}:</span> {m.content}
          </li>
        ))}
      </ul>
      <div className="flex">
        <input
          className="flex-1 border rounded px-2 py-1 mr-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Skriv melding…"
        />
        <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick={send}>
          Send
        </button>
      </div>
    </div>
  )
}
