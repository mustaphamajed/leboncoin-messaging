import { Link } from 'react-router'
import { EmptyState } from '@/components'

export function NotFoundPage() {
  return (
    <main className="flex h-dvh">
      <title>Page not found · leboncoin</title>
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        action={
          <Link to="/" className="font-medium text-brand underline-offset-4 hover:underline">
            Go to messages
          </Link>
        }
      />
    </main>
  )
}
