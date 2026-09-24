import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { conversations } from '@/test/fixtures'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { createConversation, getConversations } from './conversation.service'

describe('getConversations', () => {
  it("returns the user's conversations", async () => {
    server.use(http.get(apiUrl('/conversations/1'), () => HttpResponse.json(conversations)))

    await expect(getConversations(1)).resolves.toEqual(conversations)
  })

  it('returns an empty list when the API answers 404', async () => {
    server.use(http.get(apiUrl('/conversations/1'), () => new HttpResponse(null, { status: 404 })))

    await expect(getConversations(1)).resolves.toEqual([])
  })

  it('propagates server errors', async () => {
    server.use(http.get(apiUrl('/conversations/1'), () => new HttpResponse(null, { status: 503 })))

    await expect(getConversations(1)).rejects.toMatchObject({ kind: 'http', status: 503 })
  })

  it('rejects conversations with a missing field', async () => {
    const incomplete = { ...conversations[0], recipientNickname: undefined }
    server.use(http.get(apiUrl('/conversations/1'), () => HttpResponse.json([incomplete])))

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
      http.post(apiUrl('/conversations/1'), async ({ request }) => {
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
