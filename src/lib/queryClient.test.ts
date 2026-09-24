import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services'
import { shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it.each([
    ['a 5xx error', new ApiError('x', { kind: 'http', status: 503 }), true],
    ['a network error', new ApiError('x', { kind: 'network' }), true],
    ['a timeout', new ApiError('x', { kind: 'timeout' }), true],
    ['a 4xx error', new ApiError('x', { kind: 'http', status: 404 }), false],
    ['an invalid response', new ApiError('x', { kind: 'invalid-response' }), false],
    ['an unknown error', new Error('x'), false],
  ])('retries %s: %s', (_, error, expected) => {
    expect(shouldRetry(0, error)).toBe(expected)
  })

  it('stops after 3 failures', () => {
    const error = new ApiError('x', { kind: 'network' })
    expect(shouldRetry(2, error)).toBe(true)
    expect(shouldRetry(3, error)).toBe(false)
  })
})
