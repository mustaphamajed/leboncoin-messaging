import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { CurrentUserProvider } from '@/context'
import { createQueryClient, getLoggedUserId } from '@/lib'

interface AppProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
  userId?: number
}

export function AppProviders({ children, queryClient, userId = getLoggedUserId() }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient())

  return (
    <QueryClientProvider client={client}>
      <CurrentUserProvider userId={userId}>{children}</CurrentUserProvider>
    </QueryClientProvider>
  )
}
