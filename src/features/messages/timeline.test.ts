import { describe, expect, it } from 'vitest'
import type { Message } from '@/services'
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

describe('buildTimeline', () => {
  it('returns an empty timeline when there is nothing to show', () => {
    expect(buildTimeline([], 1)).toEqual([])
  })

  it('marks messages written by the current user as own', () => {
    const timeline = buildTimeline([message(1, 1, MONDAY_9AM), message(2, 2, MONDAY_9AM)], 1)

    expect(timeline.map(({ isOwn }) => isOwn)).toEqual([true, false])
  })

  it('starts a new day on the first message and whenever the calendar day changes', () => {
    const timeline = buildTimeline(
      [message(1, 2, MONDAY_9AM), message(2, 2, MONDAY_9AM + 60), message(3, 2, MONDAY_9AM + DAY)],
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
      1,
    )

    expect(timeline.map(({ showAuthor }) => showAuthor)).toEqual([true, false, false, true, true])
  })
})
