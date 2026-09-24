import { EmptyState, TextLink } from '@/components'

export function NotFoundPage() {
  return (
    <main className="flex h-dvh">
      <title>Page introuvable · leboncoin</title>
      <EmptyState
        title="Page introuvable"
        description="La page que vous cherchez n’existe pas."
        action={<TextLink to="/">Aller aux messages</TextLink>}
      />
    </main>
  )
}
