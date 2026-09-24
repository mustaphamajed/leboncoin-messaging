import { cn } from '@/lib'
import { useApiHealth } from '../hooks/useApiHealth'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const BANNERS = {
  offline: {
    className: 'bg-gray-800 text-white',
    message: 'Vous êtes hors ligne. Vos messages seront envoyés dès le retour de la connexion.',
  },
  degraded: {
    className: 'bg-amber-100 text-amber-900',
    message: 'Nos serveurs rencontrent un souci. Nous réessayons en arrière-plan, rien n’est perdu.',
  },
}

export function ConnectionBanner() {
  const isOnline = useOnlineStatus()
  const apiHealth = useApiHealth()
  const banner = !isOnline ? BANNERS.offline : apiHealth === 'degraded' ? BANNERS.degraded : null

  return (
    <div role="status" aria-label="État de la connexion" aria-live="polite" className="shrink-0">
      {banner && <p className={cn('px-4 py-2 text-center text-sm', banner.className)}>{banner.message}</p>}
    </div>
  )
}
