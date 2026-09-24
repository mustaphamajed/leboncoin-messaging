import { useQueryClient, type Query } from '@tanstack/react-query'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { isApiError } from '@/services'

export const RECOVERY_INTERVAL_MS = 15_000

export type ApiHealth = 'healthy' | 'degraded'

const isFailingOnServer = (query: Query) => {
  const error = query.state.status === 'error' ? query.state.error : query.state.fetchFailureReason
  return isApiError(error) && error.isRetryable
}

const isInError = (query: Query) => query.state.status === 'error'

export function useApiHealth(): ApiHealth {
  const queryClient = useQueryClient()
  const queryCache = queryClient.getQueryCache()

  const subscribe = useCallback((onChange: () => void) => queryCache.subscribe(onChange), [queryCache])
  const isDegraded = useSyncExternalStore(subscribe, () => queryCache.getAll().some(isFailingOnServer))

  useEffect(() => {
    if (!isDegraded) return
    const intervalId = setInterval(() => {
      void queryClient.refetchQueries({ predicate: isInError })
    }, RECOVERY_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [isDegraded, queryClient])

  return isDegraded ? 'degraded' : 'healthy'
}
