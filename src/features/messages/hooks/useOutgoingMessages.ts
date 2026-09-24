import { useMutationState, useQueryClient, type Mutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { Message, SendMessageInput } from '@/services'
import { messageKeys } from '../queryKeys'
import type { OutgoingStatus } from '../types'
import { useSendMessage } from './useSendMessage'

export interface OutgoingMessage {
  mutationId: number
  input: SendMessageInput
  status: OutgoingStatus
  submittedAt: number
  error: unknown
}

type SendMessageMutation = Mutation<Message, Error, SendMessageInput>

const isOutgoing = (mutation: Mutation<unknown, Error, unknown>) =>
  mutation.state.status === 'pending' || mutation.state.status === 'error'

const toOutgoingMessage = (mutation: Mutation<unknown, Error, unknown>): OutgoingMessage => {
  const { state, mutationId } = mutation as SendMessageMutation
  return {
    mutationId,
    input: state.variables!,
    status: state.status === 'error' ? 'failed' : state.isPaused ? 'waiting' : 'sending',
    submittedAt: state.submittedAt,
    error: state.error,
  }
}

export function useOutgoingMessages(conversationId: number) {
  const queryClient = useQueryClient()
  const { mutate: send } = useSendMessage(conversationId)

  const outgoingMessages = useMutationState({
    filters: { mutationKey: messageKeys.send(conversationId), predicate: isOutgoing },
    select: toOutgoingMessage,
  })

  const discard = useCallback(
    (mutationId: number) => {
      const mutationCache = queryClient.getMutationCache()
      const mutation = mutationCache.getAll().find((m) => m.mutationId === mutationId)
      if (mutation) mutationCache.remove(mutation)
    },
    [queryClient],
  )

  const retry = useCallback(
    (message: OutgoingMessage) => {
      discard(message.mutationId)
      send(message.input)
    },
    [discard, send],
  )

  return { outgoingMessages, retry, discard }
}
