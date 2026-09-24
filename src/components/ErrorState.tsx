import { cn, getErrorMessage } from '@/lib'

interface ErrorStateProps {
  title: string
  error: unknown
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorState({ title, error, onRetry, isRetrying = false, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-2 p-6 text-center', className)}>
      <h3 className="font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-gray-600">{getErrorMessage(error)}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {isRetrying ? 'Nouvelle tentative…' : 'Réessayer'}
        </button>
      )}
    </div>
  )
}
