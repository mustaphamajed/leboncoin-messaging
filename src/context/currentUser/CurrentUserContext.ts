import { createContext } from 'react'
import type { User } from '@/services'

export const CurrentUserContext = createContext<User['id'] | null>(null)
