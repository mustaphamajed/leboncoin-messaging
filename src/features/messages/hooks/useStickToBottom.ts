import { useCallback, useLayoutEffect, useRef } from 'react'

const NEAR_BOTTOM_THRESHOLD_PX = 80

// Keeps the newest message in view, unless the user scrolled up to read older messages.
// Sending a message always scrolls down, wherever the user was.
export function useStickToBottom<TElement extends HTMLElement>(contentVersion: unknown, ownContentCount: number) {
  const containerRef = useRef<TElement>(null)
  const isNearBottomRef = useRef(true)
  const previousOwnContentCountRef = useRef(ownContentCount)

  const onScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    const hasNewOwnContent = ownContentCount > previousOwnContentCountRef.current
    previousOwnContentCountRef.current = ownContentCount

    if (container && (isNearBottomRef.current || hasNewOwnContent)) {
      container.scrollTop = container.scrollHeight
      isNearBottomRef.current = true
    }
  }, [contentVersion, ownContentCount])

  return { containerRef, onScroll }
}
