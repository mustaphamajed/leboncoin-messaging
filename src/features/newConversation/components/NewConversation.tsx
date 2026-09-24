import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { EmptyState, ErrorState, Spinner } from '@/components'
import { useCurrentUserId } from '@/context'
import { useConversations } from '@/features/conversations'
import { getErrorMessage, getOtherParticipant } from '@/lib'
import type { User } from '@/services'
import { useCreateConversation } from '../hooks/useCreateConversation'
import { useUsers } from '../hooks/useUsers'
import { NewConversationHeader } from './NewConversationHeader'
import { UserOption } from './UserOption'

export function NewConversation() {
  const currentUserId = useCurrentUserId()
  const navigate = useNavigate()
  const searchId = useId()
  const [search, setSearch] = useState('')
  const users = useUsers()
  const conversations = useConversations()
  const createConversation = useCreateConversation()

  const conversationIdByParticipant = useMemo(
    () =>
      new Map(
        (conversations.data ?? []).map((conversation) => [
          getOtherParticipant(conversation, currentUserId).id,
          conversation.id,
        ]),
      ),
    [conversations.data, currentUserId],
  )

  const candidates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return (users.data ?? [])
      .filter((user) => user.id !== currentUserId && user.nickname.toLocaleLowerCase().includes(query))
      .toSorted((a, b) => a.nickname.localeCompare(b.nickname))
  }, [users.data, search, currentUserId])

  const currentUser = users.data?.find(({ id }) => id === currentUserId)
  const isLoading = users.isPending || conversations.isPending
  const hasLoadError = !isLoading && (users.isError || conversations.isError)
  const isReady = users.isSuccess && conversations.isSuccess

  const startConversation = (recipient: User) => {
    const existingConversationId = conversationIdByParticipant.get(recipient.id)

    if (existingConversationId) {
      void navigate(`/conversations/${existingConversationId}`)
    } else if (currentUser) {
      createConversation.mutate(
        {
          senderId: currentUser.id,
          senderNickname: currentUser.nickname,
          recipientId: recipient.id,
          recipientNickname: recipient.nickname,
        },
        { onSuccess: (conversation) => void navigate(`/conversations/${conversation.id}`) },
      )
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <title>Nouvelle conversation · leboncoin</title>
      <NewConversationHeader />

      <div className="shrink-0 px-4 py-3">
        <label htmlFor={searchId} className="sr-only">
          Rechercher un utilisateur
        </label>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un utilisateur"
          autoComplete="off"
          className="w-full rounded-full border border-gray-300 px-4 py-2 outline-none placeholder:text-gray-500 focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {createConversation.isError && (
        <p role="alert" className="mx-4 mb-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-800">
          Impossible de démarrer la conversation. {getErrorMessage(createConversation.error)}
        </p>
      )}

      {isLoading && <Spinner label="Chargement des utilisateurs" />}

      {hasLoadError && (
        <ErrorState
          title="Utilisateurs indisponibles"
          error={users.error ?? conversations.error}
          onRetry={() => {
            void users.refetch()
            void conversations.refetch()
          }}
          isRetrying={users.isFetching || conversations.isFetching}
        />
      )}

      {isReady && !currentUser && (
        <EmptyState title="Profil indisponible" description="Nous n’avons pas trouvé votre profil. Veuillez réessayer plus tard." />
      )}

      {isReady && currentUser && candidates.length === 0 && (
        <EmptyState title="Aucun utilisateur trouvé" description={`Aucun utilisateur ne correspond à « ${search.trim()} ».`} />
      )}

      {isReady && currentUser && candidates.length > 0 && (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
          {candidates.map((user) => (
            <UserOption
              key={user.id}
              user={user}
              hasConversation={conversationIdByParticipant.has(user.id)}
              isStarting={createConversation.isPending && createConversation.variables?.recipientId === user.id}
              disabled={createConversation.isPending}
              onSelect={startConversation}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
