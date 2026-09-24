import { createdResourceSchema, nowInSeconds } from '../common.schema'
import { httpClient, isApiError, type RequestConfig } from '../httpClient'
import { messageListSchema, sendMessageInputSchema, type Message, type SendMessageInput } from './message.schema'

export async function getMessages(conversationId: number, config?: RequestConfig): Promise<Message[]> {
  try {
    return await httpClient.get(`/messages/${conversationId}`, messageListSchema, config)
  } catch (error) {
    if (isApiError(error) && error.status === 404) return []
    throw error
  }
}

export async function sendMessage(input: SendMessageInput, config?: RequestConfig): Promise<Message> {
  const payload = {
    ...sendMessageInputSchema.parse(input),
    timestamp: nowInSeconds(),
  }
  const { id } = await httpClient.post(`/messages/${payload.conversationId}`, payload, createdResourceSchema, config)

  return { id, ...payload }
}
