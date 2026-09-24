import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import { API_URL } from '../httpClient'
import { MESSAGE_MAX_LENGTH } from './message.schema'
import { getMessages, sendMessage } from './message.service'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const url = (path: string) => `${API_URL}${path}`

const messages = [
  { id: 1, conversationId: 1, authorId: 1, timestamp: 1625637849, body: 'Bonjour' },
  { id: 2, conversationId: 1, authorId: 2, timestamp: 1625637867, body: 'Salut' },
]

describe('getMessages', () => {
  it('returns the messages of the conversation', async () => {
    server.use(http.get(url('/messages/1'), () => HttpResponse.json(messages)))

    await expect(getMessages(1)).resolves.toEqual(messages)
  })

  it('converts string timestamps to numbers', async () => {
    server.use(http.get(url('/messages/1'), () => HttpResponse.json([{ ...messages[0], timestamp: '1625637849' }])))

    await expect(getMessages(1)).resolves.toEqual([messages[0]])
  })

  it('returns an empty list when the API answers 404', async () => {
    server.use(http.get(url('/messages/1'), () => new HttpResponse(null, { status: 404 })))

    await expect(getMessages(1)).resolves.toEqual([])
  })

  it('propagates server errors', async () => {
    server.use(http.get(url('/messages/1'), () => new HttpResponse(null, { status: 503 })))

    await expect(getMessages(1)).rejects.toMatchObject({ kind: 'http', status: 503 })
  })
})

describe('sendMessage', () => {
  const input = { conversationId: 1, authorId: 1, body: '  Hello  ' }
  let requests = 0

  beforeEach(() => {
    requests = 0
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('posts the full message and rebuilds it from the returned id', async () => {
    let body: unknown
    server.use(
      http.post(url('/messages/1'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 42 })
      }),
    )

    const expected = { conversationId: 1, authorId: 1, body: 'Hello', timestamp: 1767225600 }

    await expect(sendMessage(input)).resolves.toEqual({ id: 42, ...expected })
    expect(body).toEqual(expected)
  })

  it.each([
    ['an empty message', '   '],
    ['a message that is too long', 'a'.repeat(MESSAGE_MAX_LENGTH + 1)],
  ])('rejects %s without calling the API', async (_, body) => {
    server.use(
      http.post(url('/messages/1'), () => {
        requests++
        return HttpResponse.json({ id: 42 })
      }),
    )

    await expect(sendMessage({ ...input, body })).rejects.toBeInstanceOf(ZodError)
    expect(requests).toBe(0)
  })

  it(`accepts a message of exactly ${MESSAGE_MAX_LENGTH} characters`, async () => {
    server.use(http.post(url('/messages/1'), () => HttpResponse.json({ id: 42 })))

    await expect(sendMessage({ ...input, body: 'a'.repeat(MESSAGE_MAX_LENGTH) })).resolves.toMatchObject({ id: 42 })
  })
})
