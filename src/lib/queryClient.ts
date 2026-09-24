import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/services'

const MAX_RETRIES = 3

export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES && isApiError(error) && error.isRetryable

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  })
