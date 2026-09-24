import { isApiError } from '@/services'

export function getErrorMessage(error: unknown): string {
  if (!isApiError(error)) return 'Un problème inattendu est survenu. Veuillez réessayer.'

  switch (error.kind) {
    case 'network':
      return 'Impossible de joindre nos serveurs. Vérifiez votre connexion internet et réessayez.'
    case 'timeout':
      return 'Nos serveurs mettent trop de temps à répondre. Veuillez réessayer.'
    case 'invalid-response':
      return 'Nous avons reçu des données inattendues. Veuillez réessayer plus tard.'
    case 'http':
      return error.isRetryable
        ? 'Nos serveurs rencontrent des difficultés. Veuillez réessayer dans un instant.'
        : 'Nous n’avons pas pu traiter votre demande.'
  }
}
