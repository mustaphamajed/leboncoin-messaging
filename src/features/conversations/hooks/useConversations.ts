import { queryOptions, useQuery } from '@tanstack/react-query'
import { useCurrentUserId } from '@/context'
import { sortByLatestMessage } from '@/lib'
import { getConversations } from '@/services'
import { mergeCreatedConversations } from '../createdConversationsStorage'
import { conversationKeys } from '../queryKeys'

export const conversationsQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: conversationKeys.list(userId),
    queryFn: async ({ signal }) => mergeCreatedConversations(userId, await getConversations(userId, { signal })),
  })

export function useConversations() {
  const userId = useCurrentUserId()

  return useQuery({ ...conversationsQueryOptions(userId), select: sortByLatestMessage })
}
