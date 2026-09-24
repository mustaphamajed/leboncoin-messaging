import { useCallback, useLayoutEffect, useRef } from 'react'

const NEAR_BOTTOM_THRESHOLD_PX = 80

export function useStickToBottom<TElement extends HTMLElement>(contentVersion: unknown) {
  const containerRef = useRef<TElement>(null)
  const isNearBottomRef = useRef(true)

  const onScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <= NEAR_BOTTOM_THRESHOLD_PX
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container && isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight
    }
  }, [contentVersion])

  return { containerRef, onScroll }
}
