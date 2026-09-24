import { describe, expect, it } from 'vitest'
import { getConversations, getMessages, getUser, sendMessage } from '@/services'
import { conversations, messages, users } from '../fixtures'

describe('mock API', () => {
  it('returns the conversations where the user is sender or recipient', async () => {
    await expect(getConversations(1)).resolves.toEqual(conversations)
    await expect(getConversations(2)).resolves.toEqual([conversations[0]])
  })

  it('answers /user/:id with an array, like the real server', async () => {
    await expect(getUser(2)).resolves.toEqual(users[1])
  })

  it('stores sent messages', async () => {
    const sent = await sendMessage({ conversationId: 1, authorId: 1, body: 'New message' })

    await expect(getMessages(1)).resolves.toEqual([...messages, sent])
  })

  it('resets the data after each test', async () => {
    await expect(getMessages(1)).resolves.toEqual(messages)
  })
})
