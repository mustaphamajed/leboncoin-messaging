import { useQuery } from '@tanstack/react-query'
import { getMessages, type Message } from '@/services'
import { messageKeys } from '../queryKeys'

const POLL_INTERVAL_MS = 5_000

const sortChronologically = (messages: Message[]) =>
  messages.toSorted((a, b) => a.timestamp - b.timestamp || a.id - b.id)

export function useMessages(conversationId: number) {
  return useQuery({
    queryKey: messageKeys.list(conversationId),
    queryFn: ({ signal }) => getMessages(conversationId, { signal }),
    select: sortChronologically,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
