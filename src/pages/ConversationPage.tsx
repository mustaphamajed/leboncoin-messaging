import { useParams } from 'react-router'
import { ConversationNotFound, ConversationView } from '@/features/messages'
import { idSchema } from '@/services'

export function ConversationPage() {
  const { conversationId } = useParams()
  const parsedId = idSchema.safeParse(Number(conversationId))

  return parsedId.success ? (
    <ConversationView key={parsedId.data} conversationId={parsedId.data} />
  ) : (
    <ConversationNotFound />
  )
}
