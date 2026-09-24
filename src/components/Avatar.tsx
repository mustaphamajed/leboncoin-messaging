import { cn } from '@/lib'

const COLORS = ['bg-orange-600', 'bg-sky-700', 'bg-emerald-700', 'bg-violet-600', 'bg-rose-600', 'bg-teal-700']

const SIZES = {
  md: 'size-10 text-base',
  lg: 'size-12 text-lg',
}

interface AvatarProps {
  id: number
  name: string
  size?: keyof typeof SIZES
}

export function Avatar({ id, name, size = 'md' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white uppercase',
        COLORS[id % COLORS.length],
        SIZES[size],
      )}
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}
