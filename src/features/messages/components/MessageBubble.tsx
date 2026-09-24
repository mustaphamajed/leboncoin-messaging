import { cn, formatTime, toIsoString } from '@/lib'

interface MessageBubbleProps {
  body: string
  timestamp: number
  authorName: string
  isOwn: boolean
  showAuthor: boolean
}

export function MessageBubble({ body, timestamp, authorName, isOwn, showAuthor }: MessageBubbleProps) {
  return (
    <li className={cn('flex max-w-[80%] flex-col md:max-w-[65%]', isOwn ? 'items-end self-end' : 'items-start self-start')}>
      {showAuthor && (
        <span aria-hidden="true" className="mb-1 px-3 text-xs text-gray-600">
          {authorName}
        </span>
      )}
      <p
        className={cn(
          'rounded-2xl px-4 py-2 wrap-break-word whitespace-pre-wrap',
          isOwn ? 'rounded-br-sm bg-bubble-own text-white' : 'rounded-bl-sm bg-bubble-other text-gray-900',
        )}
      >
        <span className="sr-only">{isOwn ? 'You' : authorName}: </span>
        {body}
      </p>
      <time dateTime={toIsoString(timestamp)} className="mt-1 px-1 text-xs text-gray-500">
        {formatTime(timestamp)}
      </time>
    </li>
  )
}
