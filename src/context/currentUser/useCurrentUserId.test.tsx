import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CurrentUserProvider } from './CurrentUserProvider'
import { useCurrentUserId } from './useCurrentUserId'

describe('useCurrentUserId', () => {
  it('returns the id provided by CurrentUserProvider', () => {
    const { result } = renderHook(useCurrentUserId, {
      wrapper: ({ children }) => <CurrentUserProvider userId={4}>{children}</CurrentUserProvider>,
    })

    expect(result.current).toBe(4)
  })

  it('throws when used outside CurrentUserProvider', () => {
    expect(() => renderHook(useCurrentUserId)).toThrow('useCurrentUserId must be used within a CurrentUserProvider')
  })
})
