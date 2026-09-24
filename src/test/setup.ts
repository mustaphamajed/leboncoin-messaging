import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from './msw/db'
import { server } from './msw/server'

// Any request without a handler fails the test, so nothing reaches the real network.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
})

afterAll(() => {
  server.close()
})
