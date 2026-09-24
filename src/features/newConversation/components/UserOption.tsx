import { Avatar } from '@/components'
import type { User } from '@/services'

interface UserOptionProps {
  user: User
  hasConversation: boolean
  isStarting: boolean
  disabled: boolean
  onSelect: (user: User) => void
}

export function UserOption({ user, hasConversation, isStarting, disabled, onSelect }: UserOptionProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(user)}
        disabled={disabled}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
      >
        <Avatar id={user.id} name={user.nickname} />
        <span className="min-w-0 flex-1 truncate font-medium">{user.nickname}</span>
        {isStarting && <span className="text-sm text-gray-600">Création…</span>}
        {!isStarting && hasConversation && <span className="text-sm text-gray-600">Ouvrir la conversation</span>}
      </button>
    </li>
  )
}
