import { useRouteError } from 'react-router'

const CHUNK_LOAD_ERROR = /dynamically imported module|Importing a module script failed|Loading chunk/i

const isChunkLoadError = (error: unknown) => error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)

export function RouteErrorBoundary() {
  const error = useRouteError()
  const isOutdatedVersion = isChunkLoadError(error)

  return (
    <div role="alert" className="flex h-full flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <title>Something went wrong · leboncoin</title>
      <h2 className="text-lg font-semibold">
        {isOutdatedVersion ? 'A new version is available' : 'Something went wrong'}
      </h2>
      <p className="max-w-sm text-sm text-gray-600">
        {isOutdatedVersion
          ? 'Reload the page to get the latest version of the app.'
          : 'An unexpected error occurred. Reloading the page usually fixes it.'}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Reload the page
      </button>
    </div>
  )
}
