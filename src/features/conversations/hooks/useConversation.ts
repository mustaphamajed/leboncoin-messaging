import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useCurrentUserId } from '@/context'
import type { Conversation } from '@/services'
import { conversationsQueryOptions } from './useConversations'

export function useConversation(conversationId: number) {
  const userId = useCurrentUserId()
  const selectConversation = useCallback(
    (conversations: Conversation[]) => conversations.find(({ id }) => id === conversationId) ?? null,
    [conversationId],
  )

  return useQuery({ ...conversationsQueryOptions(userId), select: selectConversation })
}
