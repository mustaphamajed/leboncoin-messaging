import { cn } from '@/lib'
import { useApiHealth } from '../hooks/useApiHealth'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const BANNERS = {
  offline: {
    className: 'bg-gray-800 text-white',
    message: 'You are offline. Your messages will be sent as soon as you are back online.',
  },
  degraded: {
    className: 'bg-amber-100 text-amber-900',
    message: 'Our servers are having a hiccup. We keep retrying in the background, nothing is lost.',
  },
}

export function ConnectionBanner() {
  const isOnline = useOnlineStatus()
  const apiHealth = useApiHealth()
  const banner = !isOnline ? BANNERS.offline : apiHealth === 'degraded' ? BANNERS.degraded : null

  return (
    <div role="status" aria-label="Connection status" aria-live="polite" className="shrink-0">
      {banner && <p className={cn('px-4 py-2 text-center text-sm', banner.className)}>{banner.message}</p>}
    </div>
  )
}
