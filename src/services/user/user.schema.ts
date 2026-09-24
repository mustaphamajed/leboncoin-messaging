import { z } from 'zod'
import { idSchema } from '../common.schema'

// z.object strips unknown keys, so the token returned by the API never reaches client state.
export const userSchema = z.object({
  id: idSchema,
  nickname: z.string().trim().min(1),
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
