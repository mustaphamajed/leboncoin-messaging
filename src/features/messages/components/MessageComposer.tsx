import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useCurrentUserId } from '@/context'
import { MESSAGE_MAX_LENGTH } from '@/services'
import { useSendMessage } from '../hooks/useSendMessage'

const COUNTER_THRESHOLD = 100
const DESKTOP_MEDIA_QUERY = '(min-width: 48rem)'

interface MessageComposerProps {
  conversationId: number
  recipientName: string
}

export function MessageComposer({ conversationId, recipientName }: MessageComposerProps) {
  const currentUserId = useCurrentUserId()
  const { mutate: sendMessage } = useSendMessage(conversationId)
  const [body, setBody] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const counterId = useId()
  const trimmedBody = body.trim()
  const remaining = MESSAGE_MAX_LENGTH - body.length
  const showCounter = remaining <= COUNTER_THRESHOLD

  useEffect(() => {
    if (window.matchMedia?.(DESKTOP_MEDIA_QUERY).matches) {
      textareaRef.current?.focus()
    }
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (trimmedBody) {
      sendMessage({ conversationId, authorId: currentUserId, body: trimmedBody })
      setBody('')
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-200 px-4 py-3">
      <div className="flex items-end gap-2 rounded-3xl border border-gray-300 bg-white py-1.5 pr-1.5 pl-4 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
        <label htmlFor={inputId} className="sr-only">
          Message à {recipientName}
        </label>
        <textarea
          ref={textareaRef}
          id={inputId}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="Écrire un message"
          aria-describedby={showCounter ? counterId : undefined}
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 outline-none field-sizing-content placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!trimmedBody}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:bg-gray-300"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.39 1.2L4.5 12l-2.49 7.2a1 1 0 001.39 1.2z" />
          </svg>
          <span className="sr-only">Envoyer le message</span>
        </button>
      </div>
      {showCounter && (
        <p id={counterId} aria-live="polite" className="mt-1 px-4 text-right text-xs text-gray-600">
          {remaining} caractères restants
        </p>
      )}
    </form>
  )
}
