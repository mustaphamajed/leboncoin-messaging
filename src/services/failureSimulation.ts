import { AxiosError, type AxiosInstance } from 'axios'

export function parseFailureRate(value: string | undefined): number {
  const rate = Number(value)
  return Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0
}

export function installFailureSimulation(instance: AxiosInstance, failureRate: number, random = Math.random) {
  if (failureRate <= 0) return

  instance.interceptors.request.use((config) => {
    if (random() < failureRate) {
      throw new AxiosError('Simulated server failure', AxiosError.ERR_BAD_RESPONSE, config, null, {
        status: 503,
        statusText: 'Service Unavailable',
        data: null,
        headers: {},
        config,
      })
    }
    return config
  })
}
