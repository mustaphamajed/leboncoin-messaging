import axios, { type AxiosRequestConfig } from 'axios'
import type { z } from 'zod'
import { installFailureSimulation, parseFailureRate } from './failureSimulation'

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3005').replace(/\/+$/, '')

const DEFAULT_TIMEOUT_MS = 10_000

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'invalid-response'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(message: string, options: { kind: ApiErrorKind; status?: number; cause?: unknown }) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = options.kind
    this.status = options.status
  }

  get isRetryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true
    return this.kind === 'http' && this.status !== undefined && this.status >= 500
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export interface RequestConfig {
  signal?: AbortSignal
  timeoutMs?: number
}

const axiosInstance = axios.create({
  adapter: 'fetch',
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

if (import.meta.env.DEV) {
  installFailureSimulation(axiosInstance, parseFailureRate(import.meta.env.VITE_SIMULATED_FAILURE_RATE))
}

function toApiError(error: unknown): unknown {
  if (axios.isCancel(error) || !axios.isAxiosError(error)) return error

  if (error.response) {
    return new ApiError(`Request failed with status ${error.response.status}`, {
      kind: 'http',
      status: error.response.status,
      cause: error,
    })
  }
  if (error.code === 'ETIMEDOUT') {
    return new ApiError('Request timed out', { kind: 'timeout', cause: error })
  }
  return new ApiError('Network request failed', { kind: 'network', cause: error })
}

async function request<TSchema extends z.ZodType>(
  schema: TSchema,
  { timeoutMs, ...config }: AxiosRequestConfig & { timeoutMs?: number },
): Promise<z.output<TSchema>> {
  let response
  try {
    response = await axiosInstance.request<unknown>({ ...config, timeout: timeoutMs ?? DEFAULT_TIMEOUT_MS })
  } catch (error) {
    throw toApiError(error)
  }

  const result = schema.safeParse(response.data === '' ? undefined : response.data)
  if (!result.success) {
    throw new ApiError('Response does not match the expected schema', {
      kind: 'invalid-response',
      status: response.status,
      cause: result.error,
    })
  }
  return result.data
}

export const httpClient = {
  get: <TSchema extends z.ZodType>(url: string, schema: TSchema, config?: RequestConfig) =>
    request(schema, { ...config, method: 'GET', url }),

  post: <TSchema extends z.ZodType>(url: string, data: unknown, schema: TSchema, config?: RequestConfig) =>
    request(schema, { ...config, method: 'POST', url, data }),

  delete: <TSchema extends z.ZodType>(url: string, schema: TSchema, config?: RequestConfig) =>
    request(schema, { ...config, method: 'DELETE', url }),
}
