import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { installFailureSimulation, parseFailureRate } from './failureSimulation'

describe('parseFailureRate', () => {
  it.each([
    [undefined, 0],
    ['', 0],
    ['abc', 0],
    ['0.3', 0.3],
    ['-1', 0],
    ['5', 1],
  ])('parses %o as %d', (value, expected) => {
    expect(parseFailureRate(value)).toBe(expected)
  })
})

describe('installFailureSimulation', () => {
  const createInstance = (random: () => number) => {
    const instance = axios.create({ adapter: 'fetch' })
    installFailureSimulation(instance, 0.5, random)
    return instance
  }

  it('fails the request with a 503 when the draw is below the rate', async () => {
    const error = await createInstance(() => 0.1)
      .get(apiUrl('/users'))
      .catch((e: unknown) => e)

    expect(axios.isAxiosError(error) && error.response?.status).toBe(503)
  })

  it('lets the request through otherwise', async () => {
    server.use(http.get(apiUrl('/users'), () => HttpResponse.json([])))

    await expect(createInstance(() => 0.9).get(apiUrl('/users'))).resolves.toMatchObject({ status: 200 })
  })
})
