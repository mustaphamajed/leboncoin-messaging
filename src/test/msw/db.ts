import { conversations, messages, users } from '../fixtures'

// In-memory copy of the API data. Handlers read and write it, and it is reset after each test.
const createDb = () => ({
  conversations: structuredClone(conversations),
  messages: structuredClone(messages),
  users: structuredClone(users),
})

export let db = createDb()

export const resetDb = () => {
  db = createDb()
}

export const nextId = (items: Array<{ id: number }>) => Math.max(0, ...items.map(({ id }) => id)) + 1
