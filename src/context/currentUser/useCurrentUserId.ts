import { use } from 'react'
import { CurrentUserContext } from './CurrentUserContext'

export function useCurrentUserId() {
  const userId = use(CurrentUserContext)
  if (userId === null) {
    throw new Error('useCurrentUserId must be used within a CurrentUserProvider')
  }
  return userId
}
