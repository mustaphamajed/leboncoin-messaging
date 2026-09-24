import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { API_URL } from '@/services'
import { useUsers } from './useUsers'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useUsers', () => {
  it('loads the users', async () => {
    server.use(http.get(`${API_URL}/users`, () => HttpResponse.json([{ id: 1, nickname: 'Thibaut', token: 'x' }])))

    const { result } = renderHook(useUsers, { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 1, nickname: 'Thibaut' }])
  })

  it('exposes the API error when loading fails', async () => {
    server.use(http.get(`${API_URL}/users`, () => new HttpResponse(null, { status: 503 })))

    const { result } = renderHook(useUsers, { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ kind: 'http', status: 503 })
  })
})
