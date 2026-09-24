import { createdResourceSchema, nowInSeconds } from '../common.schema'
import { httpClient, isApiError, type RequestConfig } from '../httpClient'
import {
  conversationListSchema,
  createConversationInputSchema,
  type Conversation,
  type CreateConversationInput,
} from './conversation.schema'

export async function getConversations(userId: number, config?: RequestConfig): Promise<Conversation[]> {
  try {
    return await httpClient.get(`/conversations/${userId}`, conversationListSchema, config)
  } catch (error) {
    if (isApiError(error) && error.status === 404) return []
    throw error
  }
}

export async function createConversation(
  input: CreateConversationInput,
  config?: RequestConfig,
): Promise<Conversation> {
  const payload = {
    ...createConversationInputSchema.parse(input),
    lastMessageTimestamp: nowInSeconds(),
  }
  const { id } = await httpClient.post(`/conversations/${payload.senderId}`, payload, createdResourceSchema, config)

  return { id, ...payload }
}
