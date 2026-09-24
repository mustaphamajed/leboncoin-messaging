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
    .min(1, 'Le message ne peut pas être vide')
    .max(MESSAGE_MAX_LENGTH, `Le message ne peut pas dépasser ${MESSAGE_MAX_LENGTH} caractères`),
})

export type SendMessageInput = z.input<typeof sendMessageInputSchema>
