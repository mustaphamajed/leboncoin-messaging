import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface TextLinkProps {
  to: string
  children: ReactNode
}

export function TextLink({ to, children }: TextLinkProps) {
  return (
    <Link
      to={to}
      className="rounded-sm font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </Link>
  )
}
