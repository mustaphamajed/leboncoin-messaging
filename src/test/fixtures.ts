import type { Conversation, Message, User } from '@/services'

// The logged user is Thibaut (id 1). Conversation 3 is one where he is the recipient.
export const users: User[] = [
  { id: 1, nickname: 'Thibaut' },
  { id: 2, nickname: 'Jeremie' },
  { id: 3, nickname: 'Patrick' },
  { id: 4, nickname: 'Elodie' },
]

export const conversations: Conversation[] = [
  {
    id: 1,
    senderId: 1,
    senderNickname: 'Thibaut',
    recipientId: 2,
    recipientNickname: 'Jeremie',
    lastMessageTimestamp: 1625637849,
  },
  {
    id: 3,
    senderId: 4,
    senderNickname: 'Elodie',
    recipientId: 1,
    recipientNickname: 'Thibaut',
    lastMessageTimestamp: 1625648667,
  },
]

export const messages: Message[] = [
  { id: 1, conversationId: 1, authorId: 1, timestamp: 1625637849, body: 'Bonjour' },
  { id: 2, conversationId: 1, authorId: 2, timestamp: 1625648667, body: 'Salut !' },
]
