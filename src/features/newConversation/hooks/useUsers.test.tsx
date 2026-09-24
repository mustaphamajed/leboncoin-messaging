import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { users } from '@/test/fixtures'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { useUsers } from './useUsers'

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useUsers', () => {
  it('loads the users without their token', async () => {
    const { result } = renderHook(useUsers, { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(users)
  })

  it('exposes the API error when loading fails', async () => {
    server.use(http.get(apiUrl('/users'), () => new HttpResponse(null, { status: 503 })))

    const { result } = renderHook(useUsers, { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ kind: 'http', status: 503 })
  })
})
