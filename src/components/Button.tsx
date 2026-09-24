import type { ReactNode } from 'react'
import { cn } from '@/lib'

interface ButtonProps {
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function Button({ onClick, children, disabled = false, className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60',
        className,
      )}
    >
      {children}
    </button>
  )
}
