import type { ReactNode } from 'react'
import type { User } from '@/services'
import { CurrentUserContext } from './CurrentUserContext'

interface CurrentUserProviderProps {
  userId: User['id']
  children: ReactNode
}

export function CurrentUserProvider({ userId, children }: CurrentUserProviderProps) {
  return <CurrentUserContext value={userId}>{children}</CurrentUserContext>
}
