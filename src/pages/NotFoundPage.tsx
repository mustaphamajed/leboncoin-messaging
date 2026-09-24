import { Link } from 'react-router'
import { EmptyState } from '@/components'

export function NotFoundPage() {
  return (
    <main className="flex h-dvh">
      <title>Page introuvable · leboncoin</title>
      <EmptyState
        title="Page introuvable"
        description="La page que vous cherchez n’existe pas."
        action={
          <Link to="/" className="font-medium text-brand underline-offset-4 hover:underline">
            Aller aux messages
          </Link>
        }
      />
    </main>
  )
}
