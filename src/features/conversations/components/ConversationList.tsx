import { Link } from 'react-router'
import { EmptyState, ErrorState, Spinner } from '@/components'
import { useCurrentUserId } from '@/context'
import { useConversations } from '../hooks/useConversations'
import { ConversationItem } from './ConversationItem'

export function ConversationList() {
  const currentUserId = useCurrentUserId()
  const { data: conversations = [], error, isPending, isError, isSuccess, refetch, isFetching } = useConversations()

  return (
    <>
      {isPending && <Spinner label="Loading conversations" />}

      {isError && (
        <ErrorState
          title="Conversations unavailable"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {isSuccess && conversations.length === 0 && (
        <EmptyState
          title="No conversations yet"
          description="Your conversations with other users will appear here."
          action={
            <Link to="/conversations/new" className="font-medium text-brand underline-offset-4 hover:underline">
              Start a conversation
            </Link>
          }
        />
      )}

      {conversations.length > 0 && (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
          {conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} currentUserId={currentUserId} />
          ))}
        </ul>
      )}
    </>
  )
}
