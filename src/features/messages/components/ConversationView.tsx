import { ErrorState, Spinner } from '@/components'
import { useCurrentUserId } from '@/context'
import { useConversation } from '@/features/conversations'
import { getOtherParticipant } from '@/lib'
import { ConversationHeader } from './ConversationHeader'
import { ConversationNotFound } from './ConversationNotFound'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'

export function ConversationView({ conversationId }: { conversationId: number }) {
  const currentUserId = useCurrentUserId()
  const { data: conversation, error, isPending, isError, isSuccess, refetch, isFetching } = useConversation(conversationId)
  const participant = conversation && getOtherParticipant(conversation, currentUserId)

  return (
    <>
      {isPending && <Spinner label="Loading conversation" className="flex-1" />}

      {isError && (
        <ErrorState
          title="Conversation unavailable"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
          className="flex-1 justify-center"
        />
      )}

      {isSuccess && !conversation && <ConversationNotFound />}

      {conversation && participant && (
        <div className="flex min-h-0 flex-1 flex-col">
          <title>{`${participant.nickname} · Messages · leboncoin`}</title>
          <ConversationHeader participant={participant} lastMessageTimestamp={conversation.lastMessageTimestamp} />
          <MessageList conversationId={conversation.id} currentUserId={currentUserId} participant={participant} />
          <MessageComposer conversationId={conversation.id} recipientName={participant.nickname} />
        </div>
      )}
    </>
  )
}
