export const messageKeys = {
  all: ['messages'] as const,
  list: (conversationId: number) => [...messageKeys.all, 'list', conversationId] as const,
}
