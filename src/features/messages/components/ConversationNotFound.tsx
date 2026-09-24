import { Link } from 'react-router'
import { EmptyState } from '@/components'

export function ConversationNotFound() {
  return (
    <>
      <title>Conversation not found · leboncoin</title>
      <EmptyState
        title="Conversation not found"
        description="This conversation does not exist or the link is invalid."
        action={
          <Link to="/" className="font-medium text-brand underline-offset-4 hover:underline">
            Back to conversations
          </Link>
        }
      />
    </>
  )
}
