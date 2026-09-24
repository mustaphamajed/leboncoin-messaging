export const messageKeys = {
  all: ['messages'] as const,
  list: (conversationId: number) => [...messageKeys.all, 'list', conversationId] as const,
  send: (conversationId: number) => [...messageKeys.all, 'send', conversationId] as const,
}
