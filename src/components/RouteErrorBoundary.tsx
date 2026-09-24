import { useRouteError } from 'react-router'
import { Button } from './Button'

const CHUNK_LOAD_ERROR = /dynamically imported module|Importing a module script failed|Loading chunk/i

const isChunkLoadError = (error: unknown) => error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)

export function RouteErrorBoundary() {
  const error = useRouteError()
  const isOutdatedVersion = isChunkLoadError(error)

  return (
    <div role="alert" className="flex h-full flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <title>Une erreur est survenue · leboncoin</title>
      <h2 className="text-lg font-semibold">
        {isOutdatedVersion ? 'Une nouvelle version est disponible' : 'Une erreur est survenue'}
      </h2>
      <p className="max-w-sm text-sm text-gray-600">
        {isOutdatedVersion
          ? 'Rechargez la page pour obtenir la dernière version de l’application.'
          : 'Une erreur inattendue s’est produite. Recharger la page résout généralement le problème.'}
      </p>
      <Button onClick={() => window.location.reload()} className="mt-2">
        Recharger la page
      </Button>
    </div>
  )
}
