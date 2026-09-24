import { z } from 'zod'
import { idSchema, timestampSchema } from '../common.schema'

export const conversationSchema = z.object({
  id: idSchema,
  senderId: idSchema,
  senderNickname: z.string(),
  recipientId: idSchema,
  recipientNickname: z.string(),
  lastMessageTimestamp: timestampSchema,
})

export type Conversation = z.infer<typeof conversationSchema>

export const conversationListSchema = z.array(conversationSchema)

export const createConversationInputSchema = z
  .object({
    senderId: idSchema,
    senderNickname: z.string().trim().min(1),
    recipientId: idSchema,
    recipientNickname: z.string().trim().min(1),
  })
  .refine((input) => input.senderId !== input.recipientId, {
    message: 'A conversation needs two different users',
    path: ['recipientId'],
  })

export type CreateConversationInput = z.input<typeof createConversationInputSchema>
