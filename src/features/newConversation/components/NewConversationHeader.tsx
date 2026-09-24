import { BackLink } from '@/components'

export function NewConversationHeader() {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
      <BackLink />
      <h2 className="font-semibold">Nouvelle conversation</h2>
    </header>
  )
}
