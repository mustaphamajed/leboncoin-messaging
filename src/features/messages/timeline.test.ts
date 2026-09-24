import { describe, expect, it } from 'vitest'
import type { Message } from '@/services'
import type { OutgoingMessage } from './hooks/useOutgoingMessages'
import { buildTimeline } from './timeline'

const DAY = 86_400
const MONDAY_9AM = 1_781_514_000

const message = (id: number, authorId: number, timestamp: number): Message => ({
  id,
  conversationId: 1,
  authorId,
  timestamp,
  body: `message ${id}`,
})

const outgoing = (mutationId: number, overrides: Partial<OutgoingMessage> = {}): OutgoingMessage => ({
  mutationId,
  input: { conversationId: 1, authorId: 1, body: `  outgoing ${mutationId}  ` },
  status: 'sending',
  submittedAt: (MONDAY_9AM + 60) * 1000,
  error: null,
  ...overrides,
})

describe('buildTimeline', () => {
  it('returns an empty timeline when there is nothing to show', () => {
    expect(buildTimeline([], [], 1)).toEqual([])
  })

  it('marks messages written by the current user as own', () => {
    const timeline = buildTimeline([message(1, 1, MONDAY_9AM), message(2, 2, MONDAY_9AM)], [], 1)

    expect(timeline.map(({ isOwn }) => isOwn)).toEqual([true, false])
  })

  it('starts a new day on the first message and whenever the calendar day changes', () => {
    const timeline = buildTimeline(
      [message(1, 2, MONDAY_9AM), message(2, 2, MONDAY_9AM + 60), message(3, 2, MONDAY_9AM + DAY)],
      [],
      1,
    )

    expect(timeline.map(({ startsNewDay }) => startsNewDay)).toEqual([true, false, true])
  })

  it('shows the author only at the start of a run of messages from the other participant', () => {
    const timeline = buildTimeline(
      [
        message(1, 2, MONDAY_9AM),
        message(2, 2, MONDAY_9AM + 1),
        message(3, 1, MONDAY_9AM + 2),
        message(4, 2, MONDAY_9AM + 3),
        message(5, 2, MONDAY_9AM + DAY),
      ],
      [],
      1,
    )

    expect(timeline.map(({ showAuthor }) => showAuthor)).toEqual([true, false, false, true, true])
  })

  it('appends outgoing messages as own messages with their delivery status', () => {
    const failed = outgoing(8, { status: 'failed' })
    const timeline = buildTimeline([message(1, 2, MONDAY_9AM)], [outgoing(7), failed], 1)

    expect(timeline.slice(1)).toEqual([
      expect.objectContaining({ key: 'outgoing-7', body: 'outgoing 7', isOwn: true, status: 'sending', showAuthor: false }),
      expect.objectContaining({ key: 'outgoing-8', status: 'failed', outgoing: failed }),
    ])
  })

  it('dates outgoing messages from their submission time in seconds', () => {
    const [item] = buildTimeline([], [outgoing(7)], 1)

    expect(item).toMatchObject({ timestamp: MONDAY_9AM + 60, startsNewDay: true })
  })
})
