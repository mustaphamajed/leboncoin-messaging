import { cn } from '@/lib'

interface SpinnerProps {
  label?: string
  className?: string
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  return (
    <div role="status" className={cn('flex items-center justify-center p-6', className)}>
      <span aria-hidden="true" className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
