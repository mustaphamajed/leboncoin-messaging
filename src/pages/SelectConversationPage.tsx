import { EmptyState } from '@/components'

export function SelectConversationPage() {
  return (
    <>
      <title>Messages · leboncoin</title>
      <EmptyState title="Select a conversation" description="Choose a conversation from the list to read and send messages." />
    </>
  )
}
