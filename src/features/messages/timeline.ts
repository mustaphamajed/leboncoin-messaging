import { isSameDay } from '@/lib'
import type { Message } from '@/services'

export interface TimelineItem {
  key: string
  body: string
  timestamp: number
  authorId: number
  isOwn: boolean
  startsNewDay: boolean
  showAuthor: boolean
}

export function buildTimeline(messages: Message[], currentUserId: number): TimelineItem[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1]
    const isOwn = message.authorId === currentUserId
    const startsNewDay = !previous || !isSameDay(previous.timestamp, message.timestamp)

    return {
      key: `message-${message.id}`,
      body: message.body,
      timestamp: message.timestamp,
      authorId: message.authorId,
      isOwn,
      startsNewDay,
      showAuthor: !isOwn && (startsNewDay || previous.authorId !== message.authorId),
    }
  })
}
