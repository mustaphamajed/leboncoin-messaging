import { isSameDay } from '@/lib'
import type { Message } from '@/services'
import type { OutgoingMessage } from './hooks/useOutgoingMessages'
import type { DeliveryStatus } from './types'

export interface TimelineItem {
  key: string
  body: string
  timestamp: number
  authorId: number
  isOwn: boolean
  status: DeliveryStatus
  startsNewDay: boolean
  showAuthor: boolean
  outgoing?: OutgoingMessage
}

type UngroupedItem = Omit<TimelineItem, 'startsNewDay' | 'showAuthor'>

const fromMessage = (message: Message, currentUserId: number): UngroupedItem => ({
  key: `message-${message.id}`,
  body: message.body,
  timestamp: message.timestamp,
  authorId: message.authorId,
  isOwn: message.authorId === currentUserId,
  status: 'sent',
})

const fromOutgoing = (outgoing: OutgoingMessage, currentUserId: number): UngroupedItem => ({
  key: `outgoing-${outgoing.mutationId}`,
  body: outgoing.input.body.trim(),
  timestamp: Math.floor(outgoing.submittedAt / 1000),
  authorId: currentUserId,
  isOwn: true,
  status: outgoing.status,
  outgoing,
})

export function buildTimeline(
  messages: Message[],
  outgoingMessages: OutgoingMessage[],
  currentUserId: number,
): TimelineItem[] {
  const items = [
    ...messages.map((message) => fromMessage(message, currentUserId)),
    ...outgoingMessages.map((outgoing) => fromOutgoing(outgoing, currentUserId)),
  ]

  return items.map((item, index) => {
    const previous = items[index - 1]
    const startsNewDay = !previous || !isSameDay(previous.timestamp, item.timestamp)
    return {
      ...item,
      startsNewDay,
      showAuthor: !item.isOwn && (startsNewDay || previous.authorId !== item.authorId),
    }
  })
}
