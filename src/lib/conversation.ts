import type { Conversation, User } from '@/services'

export function getOtherParticipant(conversation: Conversation, currentUserId: User['id']): User {
  return conversation.senderId === currentUserId
    ? { id: conversation.recipientId, nickname: conversation.recipientNickname }
    : { id: conversation.senderId, nickname: conversation.senderNickname }
}

export const sortByLatestMessage = (conversations: Conversation[]): Conversation[] =>
  conversations.toSorted((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
