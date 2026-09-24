import { cn, getErrorMessage } from '@/lib'
import { Button } from './Button'

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
        <Button onClick={onRetry} disabled={isRetrying} className="mt-2">
          {isRetrying ? 'Nouvelle tentative…' : 'Réessayer'}
        </Button>
      )}
    </div>
  )
}
