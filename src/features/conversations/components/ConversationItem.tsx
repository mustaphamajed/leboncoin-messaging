import { NavLink } from 'react-router'
import { Avatar } from '@/components'
import { formatRelativeDate, getOtherParticipant, toIsoString } from '@/lib'
import type { Conversation } from '@/services'

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: number
}

export function ConversationItem({ conversation, currentUserId }: ConversationItemProps) {
  const participant = getOtherParticipant(conversation, currentUserId)

  return (
    <li>
      <NavLink
        to={`/conversations/${conversation.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand aria-[current=page]:bg-orange-50"
      >
        <Avatar id={participant.id} name={participant.nickname} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{participant.nickname}</span>
          <time dateTime={toIsoString(conversation.lastMessageTimestamp)} className="text-sm text-gray-600">
            {formatRelativeDate(conversation.lastMessageTimestamp)}
          </time>
        </span>
      </NavLink>
    </li>
  )
}
