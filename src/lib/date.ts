const DAY_MS = 86_400_000
const LOCALE = 'fr-FR'

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const weekdayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' })
const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const fullDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// French writes weekdays in lower case, but they start the label here.
const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase(LOCALE) + text.slice(1)

export const fromUnixSeconds = (timestamp: number) => new Date(timestamp * 1000)

export const toIsoString = (timestamp: number) => fromUnixSeconds(timestamp).toISOString()

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS)

export const isSameDay = (a: number, b: number) => daysBetween(fromUnixSeconds(a), fromUnixSeconds(b)) === 0

export const formatTime = (timestamp: number) => timeFormat.format(fromUnixSeconds(timestamp))

export function formatRelativeDate(timestamp: number, now: Date = new Date()): string {
  const date = fromUnixSeconds(timestamp)
  const daysAgo = daysBetween(date, now)

  if (daysAgo <= 0) return timeFormat.format(date)
  if (daysAgo === 1) return 'Hier'
  if (daysAgo < 7) return capitalize(weekdayFormat.format(date))
  if (date.getFullYear() === now.getFullYear()) return dayMonthFormat.format(date)
  return fullDateFormat.format(date)
}

export function formatDayLabel(timestamp: number, now: Date = new Date()): string {
  const date = fromUnixSeconds(timestamp)
  const daysAgo = daysBetween(date, now)

  if (daysAgo === 0) return 'Aujourd’hui'
  if (daysAgo === 1) return 'Hier'
  return capitalize(longDateFormat.format(date))
}
