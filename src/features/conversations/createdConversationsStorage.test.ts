import { describe, expect, it } from 'vitest'
import { conversations } from '@/test/fixtures'
import { mergeCreatedConversations, rememberCreatedConversation } from './createdConversationsStorage'

const created = { ...conversations[0], id: 10, recipientId: 3, recipientNickname: 'Patrick' }
const storageKey = 'lbc:created-conversations:1'

describe('createdConversationsStorage', () => {
  it('adds remembered conversations missing from the server response', () => {
    rememberCreatedConversation(1, created)

    expect(mergeCreatedConversations(1, conversations)).toEqual([...conversations, created])
  })

  it('forgets a conversation once the server returns it', () => {
    rememberCreatedConversation(1, created)

    expect(mergeCreatedConversations(1, [...conversations, created])).toEqual([...conversations, created])
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it('keeps conversations of each user separate', () => {
    rememberCreatedConversation(1, created)

    expect(mergeCreatedConversations(2, [])).toEqual([])
  })

  it.each([
    ['corrupted JSON', '{not json'],
    ['unexpected data', JSON.stringify([{ id: 'x' }])],
  ])('ignores %s in storage', (_, value) => {
    localStorage.setItem(storageKey, value)

    expect(mergeCreatedConversations(1, conversations)).toEqual(conversations)
  })
})
