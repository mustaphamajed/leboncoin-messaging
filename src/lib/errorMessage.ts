import { isApiError } from '@/services'

export function getErrorMessage(error: unknown): string {
  if (!isApiError(error)) return 'Something unexpected happened. Please try again.'

  switch (error.kind) {
    case 'network':
      return 'We could not reach our servers. Check your internet connection and try again.'
    case 'timeout':
      return 'Our servers are taking too long to answer. Please try again.'
    case 'invalid-response':
      return 'We received unexpected data. Please try again later.'
    case 'http':
      return error.isRetryable
        ? 'Our servers are having a hard time right now. Please try again in a moment.'
        : 'We could not complete your request.'
  }
}
