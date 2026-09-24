import { useRouteError } from 'react-router'

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
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Recharger la page
      </button>
    </div>
  )
}
