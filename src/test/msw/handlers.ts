import { http, HttpResponse } from 'msw'
import type { Conversation, Message } from '@/services'
import { db, nextId } from './db'
import { apiUrl } from './utils'

// Mirrors the real json-server, quirks included: users come with their token, and /user/:id returns an array.
const withToken = <T extends object>(user: T) => ({ ...user, token: 'xxxx' })

export const handlers = [
  http.get(apiUrl('/conversations/:userId'), ({ params }) => {
    const userId = Number(params.userId)
    return HttpResponse.json(db.conversations.filter((c) => c.senderId === userId || c.recipientId === userId))
  }),
  http.post(apiUrl('/conversations/:userId'), async ({ request }) => {
    const conversation = { ...((await request.json()) as Omit<Conversation, 'id'>), id: nextId(db.conversations) }
    db.conversations.push(conversation)
    return HttpResponse.json(conversation, { status: 201 })
  }),
  http.get(apiUrl('/messages/:conversationId'), ({ params }) =>
    HttpResponse.json(db.messages.filter((m) => m.conversationId === Number(params.conversationId))),
  ),
  http.post(apiUrl('/messages/:conversationId'), async ({ request }) => {
    const message = { ...((await request.json()) as Omit<Message, 'id'>), id: nextId(db.messages) }
    db.messages.push(message)
    return HttpResponse.json(message, { status: 201 })
  }),
  http.get(apiUrl('/users'), () => HttpResponse.json(db.users.map(withToken))),
  http.get(apiUrl('/user/:userId'), ({ params }) =>
    HttpResponse.json(db.users.filter((u) => u.id === Number(params.userId)).map(withToken)),
  ),
]
