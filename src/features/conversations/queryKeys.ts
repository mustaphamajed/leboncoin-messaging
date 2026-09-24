export const conversationKeys = {
  all: ['conversations'] as const,
  list: (userId: number) => [...conversationKeys.all, 'list', userId] as const,
}
