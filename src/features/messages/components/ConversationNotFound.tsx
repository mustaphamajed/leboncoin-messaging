import { Link } from 'react-router'
import { EmptyState } from '@/components'

export function ConversationNotFound() {
  return (
    <>
      <title>Conversation introuvable · leboncoin</title>
      <EmptyState
        title="Conversation introuvable"
        description="Cette conversation n’existe pas ou le lien est invalide."
        action={
          <Link to="/" className="font-medium text-brand underline-offset-4 hover:underline">
            Retour aux conversations
          </Link>
        }
      />
    </>
  )
}
