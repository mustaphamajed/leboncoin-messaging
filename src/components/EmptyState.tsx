import type { ReactNode } from 'react'
import { cn } from '@/lib'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-gray-600">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
