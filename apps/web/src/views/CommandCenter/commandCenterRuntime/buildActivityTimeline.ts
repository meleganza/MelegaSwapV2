import type { ActivityEvent } from '../commandCenterData'

interface TimelineInput {
  tradeTxs: Array<{ label: string; time: string }>
  poolActivity: Array<{ label: string; time: string }>
  farmActivity: Array<{ label: string; time: string }>
  buildActivity: Array<{ label: string; time: string }>
  liquidityActivity: Array<{ label: string; time: string }>
}

const ICONS: Record<string, string> = {
  swap: '↔',
  trade: '↔',
  stake: '🏊',
  pool: '🏊',
  farm: '🌾',
  import: '📥',
  liquidity: '💧',
  claim: '💰',
  radar: '📡',
  manifest: '📋',
}

function formatTimeAgo(isoOrUnix: string | number): string {
  const ms = typeof isoOrUnix === 'number' ? isoOrUnix * 1000 : Date.parse(isoOrUnix)
  if (!ms || Number.isNaN(ms)) return '—'
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function iconFor(label: string): string {
  const lower = label.toLowerCase()
  for (const [key, icon] of Object.entries(ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '•'
}

export function buildActivityTimeline(input: TimelineInput): ActivityEvent[] {
  const raw: Array<{ id: string; label: string; time: string; sort: number }> = []

  const push = (prefix: string, items: Array<{ label: string; time: string }>) => {
    items.forEach((item, i) => {
      const ms = Date.parse(item.time) || Number(item.time) * 1000 || 0
      raw.push({ id: `${prefix}-${i}`, label: item.label, time: item.time, sort: ms })
    })
  }

  push('trade', input.tradeTxs)
  push('pool', input.poolActivity)
  push('farm', input.farmActivity)
  push('build', input.buildActivity)
  push('liq', input.liquidityActivity)

  return raw
    .sort((a, b) => b.sort - a.sort)
    .slice(0, 8)
    .map((e) => ({
      id: e.id,
      label: e.label,
      time: formatTimeAgo(e.time),
      icon: iconFor(e.label),
    }))
}
