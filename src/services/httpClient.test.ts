import axios from 'axios'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { ApiError, httpClient } from './httpClient'

const schema = z.object({ id: z.number() })
describe('httpClient', () => {
  it('returns parsed data on success', async () => {
    server.use(http.get(apiUrl('/ok'), () => HttpResponse.json({ id: 1 })))
    await expect(httpClient.get('/ok', schema)).resolves.toEqual({ id: 1 })
  })

  it('throws a non-retryable http error on 4xx', async () => {
    server.use(http.get(apiUrl('/x'), () => new HttpResponse(null, { status: 404 })))
    const error = await httpClient.get('/x', schema).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'http', status: 404, isRetryable: false })
  })

  it('throws a retryable http error on 5xx', async () => {
    server.use(http.get(apiUrl('/x'), () => new HttpResponse(null, { status: 503 })))
    const error = await httpClient.get('/x', schema).catch((e) => e)
    expect(error).toMatchObject({ kind: 'http', status: 503, isRetryable: true })
  })

  it('throws a retryable network error when the server is unreachable', async () => {
    server.use(http.get(apiUrl('/x'), () => HttpResponse.error()))
    const error = await httpClient.get('/x', schema).catch((e) => e)
    expect(error).toMatchObject({ kind: 'network', isRetryable: true })
  })

  it('throws a retryable timeout error when the server is too slow', async () => {
    server.use(
      http.get(apiUrl('/x'), async () => {
        await delay(200)
        return HttpResponse.json({ id: 1 })
      }),
    )
    const error = await httpClient.get('/x', schema, { timeoutMs: 20 }).catch((e) => e)
    expect(error).toMatchObject({ kind: 'timeout', isRetryable: true })
  })

  it('throws an invalid-response error on malformed JSON', async () => {
    server.use(
      http.get(apiUrl('/x'), () => new HttpResponse('{not json', { headers: { 'Content-Type': 'application/json' } })),
    )
    const error = await httpClient.get('/x', schema).catch((e) => e)
    expect(error).toMatchObject({ kind: 'invalid-response', isRetryable: false })
  })

  it('throws an invalid-response error when the data does not match the schema', async () => {
    server.use(http.get(apiUrl('/x'), () => HttpResponse.json({ id: 'not-a-number' })))
    const error = await httpClient.get('/x', schema).catch((e) => e)
    expect(error).toMatchObject({ kind: 'invalid-response', status: 200 })
    expect(error.cause).toBeInstanceOf(z.ZodError)
  })

  it('rethrows cancellations untouched instead of wrapping them', async () => {
    server.use(
      http.get(apiUrl('/x'), async () => {
        await delay(200)
        return HttpResponse.json({ id: 1 })
      }),
    )
    const controller = new AbortController()
    const promise = httpClient.get('/x', schema, { signal: controller.signal }).catch((e) => e)
    controller.abort()
    const error = await promise
    expect(axios.isCancel(error)).toBe(true)
    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('sends the body with post', async () => {
    let body: unknown
    server.use(
      http.post(apiUrl('/items'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 2 }, { status: 201 })
      }),
    )
    await expect(httpClient.post('/items', { text: 'hi' }, schema)).resolves.toEqual({ id: 2 })
    expect(body).toEqual({ text: 'hi' })
  })

  it('sends a DELETE request and accepts an empty response', async () => {
    server.use(http.delete(apiUrl('/items/1'), () => new HttpResponse(null, { status: 204 })))
    await expect(httpClient.delete('/items/1', z.undefined())).resolves.toBeUndefined()
  })
})

describe('ApiError.isRetryable', () => {
  it.each([
    [{ kind: 'http', status: 400 }, false],
    [{ kind: 'http', status: 499 }, false],
    [{ kind: 'http', status: 500 }, true],
    [{ kind: 'invalid-response' }, false],
  ] as const)('%o → %s', (options, expected) => {
    expect(new ApiError('x', options).isRetryable).toBe(expected)
  })
})
