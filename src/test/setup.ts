import '@testing-library/jest-dom/vitest'
import { onlineManager } from "@tanstack/react-query";
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from './msw/db'
import { server } from './msw/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
  onlineManager.setOnline(true);
})

afterAll(() => {
  server.close()
})
