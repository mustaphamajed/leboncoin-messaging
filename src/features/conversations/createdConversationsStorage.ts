import { type Conversation, conversationListSchema } from '@/services'

const storageKey = (userId: number) => `lbc:created-conversations:${userId}`

function read(userId: number): Conversation[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const result = conversationListSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : []
  } catch {
    return []
  }
}

function write(userId: number, conversations: Conversation[]) {
  try {
    if (conversations.length === 0) localStorage.removeItem(storageKey(userId))
    else localStorage.setItem(storageKey(userId), JSON.stringify(conversations))
  } catch {
    // Storage can be unavailable (private mode, quota): the conversation then only lives in memory.
  }
}

export function rememberCreatedConversation(userId: number, conversation: Conversation) {
  const stored = read(userId).filter(({ id }) => id !== conversation.id)
  write(userId, [...stored, conversation])
}

export function mergeCreatedConversations(userId: number, fromServer: Conversation[]): Conversation[] {
  const serverIds = new Set(fromServer.map(({ id }) => id))
  const stored = read(userId)
  const notYetOnServer = stored.filter(({ id }) => !serverIds.has(id))

  if (notYetOnServer.length !== stored.length) write(userId, notYetOnServer)

  return [...fromServer, ...notYetOnServer]
}
