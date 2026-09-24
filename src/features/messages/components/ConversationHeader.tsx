import { Avatar, BackLink } from '@/components'
import { formatRelativeDate, toIsoString } from '@/lib'
import type { User } from '@/services'

interface ConversationHeaderProps {
  participant: User
  lastMessageTimestamp: number
}

export function ConversationHeader({ participant, lastMessageTimestamp }: ConversationHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
      <BackLink />
      <Avatar id={participant.id} name={participant.nickname} />
      <div className="flex min-w-0 flex-col">
        <h2 className="truncate font-semibold">{participant.nickname}</h2>
        <p className="text-sm text-gray-600">
          Dernier message : <time dateTime={toIsoString(lastMessageTimestamp)}>{formatRelativeDate(lastMessageTimestamp)}</time>
        </p>
      </div>
    </header>
  )
}
