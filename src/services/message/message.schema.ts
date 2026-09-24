import { z } from 'zod'
import { idSchema, timestampSchema } from '../common.schema'

export const MESSAGE_MAX_LENGTH = 1000

export const messageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  authorId: idSchema,
  timestamp: timestampSchema,
  body: z.string(),
})

export type Message = z.infer<typeof messageSchema>

export const messageListSchema = z.array(messageSchema)

export const sendMessageInputSchema = z.object({
  conversationId: idSchema,
  authorId: idSchema,
  body: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(MESSAGE_MAX_LENGTH, `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`),
})

export type SendMessageInput = z.input<typeof sendMessageInputSchema>
