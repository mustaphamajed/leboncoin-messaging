import { EmptyState } from '@/components'

export function SelectConversationPage() {
  return (
    <>
      <title>Messages · leboncoin</title>
      <EmptyState title="Sélectionnez une conversation" description="Choisissez une conversation dans la liste pour lire et envoyer des messages." />
    </>
  )
}
