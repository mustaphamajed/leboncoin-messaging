import { Fragment, useMemo } from 'react'
import { EmptyState, ErrorState, Spinner } from '@/components'
import { formatDayLabel, toIsoString } from '@/lib'
import type { User } from '@/services'
import { useMessages } from '../hooks/useMessages'
import { useOutgoingMessages } from '../hooks/useOutgoingMessages'
import { useStickToBottom } from '../hooks/useStickToBottom'
import { buildTimeline } from '../timeline'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  conversationId: number
  currentUserId: User['id']
  participant: User
}

export function MessageList({ conversationId, currentUserId, participant }: MessageListProps) {
  const { data: messages, error, isPending, isError, isSuccess, refetch, isFetching } = useMessages(conversationId)
  const { outgoingMessages, retry, discard } = useOutgoingMessages(conversationId)
  const timeline = useMemo(
    () => buildTimeline(messages ?? [], outgoingMessages, currentUserId),
    [messages, outgoingMessages, currentUserId],
  )
  const { containerRef, onScroll } = useStickToBottom<HTMLDivElement>(timeline.length, outgoingMessages.length)

  return (
    <>
      {isPending && <Spinner label="Loading messages" className="flex-1" />}

      {isError && (
        <ErrorState
          title="Messages unavailable"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
          className="flex-1 justify-center"
        />
      )}

      {isSuccess && timeline.length === 0 && (
        <EmptyState title="No messages yet" description={`Say hello to ${participant.nickname}!`} />
      )}

      {timeline.length > 0 && (
        <div ref={containerRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ol role="log" aria-label={`Messages with ${participant.nickname}`} className="flex flex-col gap-2">
            {timeline.map(({ key, outgoing, ...item }) => (
              <Fragment key={key}>
                {item.startsNewDay && (
                  <li className="my-2 self-center text-xs font-medium text-gray-600">
                    <time dateTime={toIsoString(item.timestamp)}>{formatDayLabel(item.timestamp)}</time>
                  </li>
                )}
                <MessageBubble
                  body={item.body}
                  timestamp={item.timestamp}
                  status={item.status}
                  isOwn={item.isOwn}
                  authorName={item.isOwn ? 'You' : participant.nickname}
                  showAuthor={item.showAuthor}
                  onRetry={outgoing && (() => retry(outgoing))}
                  onDiscard={outgoing && (() => discard(outgoing.mutationId))}
                />
              </Fragment>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
