import type { AIRecommendation, NotificationItem } from '../commandCenterData'

interface NotificationInput {
  poolClaims: Array<{ name: string; time: string }>
  farmClaims: Array<{ name: string; time: string }>
  radarEvents: Array<{ title: string; time: string }>
  buildEvents: Array<{ title: string; time: string }>
  tradeTxs: Array<{ title: string; time: string }>
  collectibleUnlocked?: { title: string; time: string }
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

export function buildNotifications(input: NotificationInput): NotificationItem[] {
  const items: NotificationItem[] = []

  input.tradeTxs.forEach((tx, i) => {
    items.push({ id: `trade-${i}`, title: tx.title, time: formatTimeAgo(tx.time) })
  })

  input.poolClaims.forEach((p, i) => {
    items.push({ id: `pool-${i}`, title: `Pool reward — ${p.name}`, time: formatTimeAgo(p.time) })
  })

  input.farmClaims.forEach((f, i) => {
    items.push({ id: `farm-${i}`, title: `Farm reward — ${f.name}`, time: formatTimeAgo(f.time) })
  })

  input.radarEvents.forEach((e, i) => {
    items.push({ id: `radar-${i}`, title: `Radar — ${e.title}`, time: formatTimeAgo(e.time) })
  })

  input.buildEvents.forEach((e, i) => {
    items.push({ id: `build-${i}`, title: `Infrastructure — ${e.title}`, time: formatTimeAgo(e.time) })
  })

  if (input.collectibleUnlocked) {
    items.push({
      id: 'collectible-0',
      title: `Collectible — ${input.collectibleUnlocked.title}`,
      time: formatTimeAgo(input.collectibleUnlocked.time),
    })
  }

  return items.slice(0, 8)
}

export function buildReportsFromExtensions(
  extensions: Array<{ title: string; available: boolean }>,
): Array<{ id: string; title: string; status: 'Completed' | 'In Progress' | 'Available' }> {
  return extensions
    .filter((e) => e.title.toLowerCase().includes('audit') || e.title.toLowerCase().includes('space'))
    .slice(0, 3)
    .map((e, i) => ({
      id: `report-${i}`,
      title: e.title,
      status: e.available ? ('Available' as const) : ('In Progress' as const),
    }))
}

export function mapRecommendations(
  projectsRecs: Array<{ title: string; description: string; impact?: string }>,
  radarRec?: { title: string; description: string },
  buildSuggestions?: Array<{ title: string; description: string }>,
): AIRecommendation[] {
  const items: AIRecommendation[] = []

  projectsRecs.slice(0, 2).forEach((r, i) => {
    items.push({
      id: `proj-${i}`,
      title: r.title,
      description: r.description,
      icon: 'audit',
    })
  })

  buildSuggestions?.slice(0, 2).forEach((s, i) => {
    items.push({
      id: `build-${i}`,
      title: s.title,
      description: s.description,
      icon: 'pool',
    })
  })

  if (radarRec) {
    items.push({
      id: 'radar-0',
      title: radarRec.title,
      description: radarRec.description,
      icon: 'radar',
    })
  }

  return items.slice(0, 5)
}
