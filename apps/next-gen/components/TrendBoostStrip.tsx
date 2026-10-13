import React from 'react'

type Placement = {
  orderId: string
  projectSlug: string
  chainId: number
  startsAt: string
  endsAt: string
}

type ActiveBoostResponse = {
  schema: 'melega.trend-boost-active.v1'
  placements: Placement[]
}

function validPlacement(value: unknown): value is Placement {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Placement>
  return (
    typeof row.orderId === 'string' &&
    typeof row.projectSlug === 'string' &&
    row.projectSlug.length > 0 &&
    Number.isInteger(row.chainId) &&
    typeof row.startsAt === 'string' &&
    typeof row.endsAt === 'string'
  )
}

export function TrendBoostStrip() {
  const [placements, setPlacements] = React.useState<Placement[]>([])

  React.useEffect(() => {
    const controller = new AbortController()
    fetch('/api/trend-boost-active', { signal: controller.signal, credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null
        return (await response.json()) as Partial<ActiveBoostResponse>
      })
      .then((payload) => {
        if (payload?.schema !== 'melega.trend-boost-active.v1' || !Array.isArray(payload.placements)) return
        setPlacements(payload.placements.filter(validPlacement).slice(0, 4))
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  if (placements.length === 0) return null

  return (
    <aside className="trend-boost-strip" aria-label="Active Trend Boost placements">
      <strong>Trend Boost</strong>
      <div>
        {placements.map((placement) => (
          <span key={placement.orderId}>{placement.projectSlug}</span>
        ))}
      </div>
    </aside>
  )
}
