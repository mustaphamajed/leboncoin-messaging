import { z } from 'zod'

export const idSchema = z.number().int().positive()

export const timestampSchema = z
  .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
  .pipe(z.number().int().nonnegative())
