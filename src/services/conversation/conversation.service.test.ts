import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { API_URL } from '../httpClient'
import { createConversation, getConversations } from './conversation.service'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const url = (path: string) => `${API_URL}${path}`

const conversations = [
  { id: 1, senderId: 1, senderNickname: 'Thibaut', recipientId: 2, recipientNickname: 'Jeremie', lastMessageTimestamp: 1625637849 },
  { id: 3, senderId: 3, senderNickname: 'Patrick', recipientId: 1, recipientNickname: 'Thibaut', lastMessageTimestamp: 1620284667 },
]

describe('getConversations', () => {
  it("returns the user's conversations", async () => {
    server.use(http.get(url('/conversations/1'), () => HttpResponse.json(conversations)))

    await expect(getConversations(1)).resolves.toEqual(conversations)
  })

  it('returns an empty list when the API answers 404', async () => {
    server.use(http.get(url('/conversations/1'), () => new HttpResponse(null, { status: 404 })))

    await expect(getConversations(1)).resolves.toEqual([])
  })

  it('propagates server errors', async () => {
    server.use(http.get(url('/conversations/1'), () => new HttpResponse(null, { status: 503 })))

    await expect(getConversations(1)).rejects.toMatchObject({ kind: 'http', status: 503 })
  })

  it('rejects conversations with a missing field', async () => {
    const incomplete = { ...conversations[0], recipientNickname: undefined }
    server.use(http.get(url('/conversations/1'), () => HttpResponse.json([incomplete])))

    await expect(getConversations(1)).rejects.toMatchObject({ kind: 'invalid-response' })
  })
})

describe('createConversation', () => {
  const input = { senderId: 1, senderNickname: 'Thibaut', recipientId: 3, recipientNickname: ' Patrick ' }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('posts the full conversation and rebuilds it from the returned id', async () => {
    let body: unknown
    server.use(
      http.post(url('/conversations/1'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 42 })
      }),
    )

    const expected = {
      senderId: 1,
      senderNickname: 'Thibaut',
      recipientId: 3,
      recipientNickname: 'Patrick',
      lastMessageTimestamp: 1767225600,
    }

    await expect(createConversation(input)).resolves.toEqual({ id: 42, ...expected })
    expect(body).toEqual(expected)
  })

  it('rejects a conversation with oneself without calling the API', async () => {
    await expect(createConversation({ ...input, recipientId: 1 })).rejects.toBeInstanceOf(ZodError)
  })

  it('rejects an empty nickname without calling the API', async () => {
    await expect(createConversation({ ...input, recipientNickname: '   ' })).rejects.toBeInstanceOf(ZodError)
  })
})
