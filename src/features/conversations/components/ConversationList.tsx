import { EmptyState, ErrorState, Spinner, TextLink } from '@/components'
import { useCurrentUserId } from '@/context'
import { useConversations } from '../hooks/useConversations'
import { ConversationItem } from './ConversationItem'

export function ConversationList() {
  const currentUserId = useCurrentUserId()
  const { data: conversations = [], error, isPending, isError, isSuccess, refetch, isFetching } = useConversations()

  return (
    <>
      {isPending && <Spinner label="Chargement des conversations" />}

      {isError && (
        <ErrorState
          title="Conversations indisponibles"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}

      {isSuccess && conversations.length === 0 && (
        <EmptyState
          title="Aucune conversation pour le moment"
          description="Vos conversations avec les autres utilisateurs apparaîtront ici."
          action={
            <TextLink to="/conversations/new">
              Démarrer une conversation
            </TextLink>
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
