import { EmptyState, TextLink } from '@/components'

export function ConversationNotFound() {
  return (
    <>
      <title>Conversation introuvable · leboncoin</title>
      <EmptyState
        title="Conversation introuvable"
        description="Cette conversation n’existe pas ou le lien est invalide."
        action={<TextLink to="/">Retour aux conversations</TextLink>}
      />
    </>
  )
}
