import { z } from 'zod'
import { ApiError, httpClient, type RequestConfig } from '../httpClient'
import { userListSchema, userSchema, type User } from './user.schema'

export const getUsers = (config?: RequestConfig): Promise<User[]> =>
  httpClient.get('/users', userListSchema, config)

export async function getUser(userId: number, config?: RequestConfig): Promise<User> {
  const result = await httpClient.get(`/user/${userId}`, z.union([userSchema, userListSchema]), config)
  const user = Array.isArray(result) ? result[0] : result

  if (!user) {
    throw new ApiError(`User ${userId} not found`, { kind: 'http', status: 404 })
  }
  return user
}
