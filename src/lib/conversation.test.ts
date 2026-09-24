import { describe, expect, it } from 'vitest'
import { conversations } from '@/test/fixtures'
import { getOtherParticipant, sortByLatestMessage } from './conversation'

describe('getOtherParticipant', () => {
  it('returns the recipient when the current user started the conversation', () => {
    expect(getOtherParticipant(conversations[0], 1)).toEqual({ id: 2, nickname: 'Jeremie' })
  })

  it('returns the sender when the current user is the recipient', () => {
    expect(getOtherParticipant(conversations[1], 1)).toEqual({ id: 4, nickname: 'Elodie' })
  })
})

describe('sortByLatestMessage', () => {
  it('puts the most recent conversation first without mutating the input', () => {
    const input = [...conversations]

    expect(sortByLatestMessage(input).map(({ id }) => id)).toEqual([3, 1])
    expect(input).toEqual(conversations)
  })
})
