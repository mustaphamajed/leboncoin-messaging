import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange)
const getSnapshot = () => onlineManager.isOnline()

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
