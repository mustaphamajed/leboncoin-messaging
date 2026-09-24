import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { API_URL } from '../httpClient'
import { getUser, getUsers } from './user.service'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const url = (path: string) => `${API_URL}${path}`

const users = [
  { id: 1, nickname: 'Thibaut' },
  { id: 2, nickname: 'Jeremie' },
]
const withToken = <T extends object>(user: T) => ({ ...user, token: 'secret' })

describe('getUsers', () => {
  it('returns users without their token', async () => {
    server.use(http.get(url('/users'), () => HttpResponse.json(users.map(withToken))))

    const result = await getUsers()

    expect(result).toEqual(users)
    expect(result[0]).not.toHaveProperty('token')
  })

  it('rejects users with an empty nickname', async () => {
    server.use(http.get(url('/users'), () => HttpResponse.json([{ id: 1, nickname: '  ' }])))

    await expect(getUsers()).rejects.toMatchObject({ kind: 'invalid-response' })
  })
})

describe('getUser', () => {
  it('unwraps the array returned by the rewritten route', async () => {
    server.use(http.get(url('/user/2'), () => HttpResponse.json([withToken(users[1])])))

    await expect(getUser(2)).resolves.toEqual(users[1])
  })

  it('accepts a single object as documented by the API contract', async () => {
    server.use(http.get(url('/user/2'), () => HttpResponse.json(withToken(users[1]))))

    await expect(getUser(2)).resolves.toEqual(users[1])
  })

  it('throws a 404 error when the user does not exist', async () => {
    server.use(http.get(url('/user/99'), () => HttpResponse.json([])))

    await expect(getUser(99)).rejects.toMatchObject({ kind: 'http', status: 404 })
  })
})
