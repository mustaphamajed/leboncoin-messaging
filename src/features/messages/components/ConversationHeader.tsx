import { Link } from 'react-router'
import { Avatar } from '@/components'
import { formatRelativeDate, toIsoString } from '@/lib'
import type { User } from '@/services'

interface ConversationHeaderProps {
  participant: User
  lastMessageTimestamp: number
}

export function ConversationHeader({ participant, lastMessageTimestamp }: ConversationHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
      <Link
        to="/"
        className="-ml-2 rounded-full p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-brand md:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        <span className="sr-only">Back to conversations</span>
      </Link>
      <Avatar id={participant.id} name={participant.nickname} />
      <div className="flex min-w-0 flex-col">
        <h2 className="truncate font-semibold">{participant.nickname}</h2>
        <p className="text-sm text-gray-600">
          Last message <time dateTime={toIsoString(lastMessageTimestamp)}>{formatRelativeDate(lastMessageTimestamp)}</time>
        </p>
      </div>
    </header>
  )
}
