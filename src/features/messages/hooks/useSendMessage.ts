import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appendToCachedList } from '@/lib'
import { sendMessage, type SendMessageInput } from '@/services'
import { messageKeys } from '../queryKeys'

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: messageKeys.send(conversationId),
    mutationFn: (input: SendMessageInput) => sendMessage(input),
    onSuccess: (message) => appendToCachedList(queryClient, messageKeys.list(message.conversationId), message),
  })
}
