const DAY_MS = 86_400_000

export function formatWhen(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayDiff = Math.floor((date.getTime() - startOfToday) / DAY_MS)
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (dayDiff === 0) return `Today · ${time}`
  if (dayDiff === 1) return `Tomorrow · ${time}`
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${time}`
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
