import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUserId } from '@/context'
import { conversationKeys, rememberCreatedConversation } from '@/features/conversations'
import { appendToCachedList } from '@/lib'
import { createConversation, type CreateConversationInput } from '@/services'

export function useCreateConversation() {
  const userId = useCurrentUserId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateConversationInput) => createConversation(input),
    onSuccess: async (conversation) => {
      rememberCreatedConversation(userId, conversation)
      await appendToCachedList(queryClient, conversationKeys.list(userId), conversation)
    },
  })
}
