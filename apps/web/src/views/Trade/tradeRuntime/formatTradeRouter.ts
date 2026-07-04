import type { TradeRouteEntry } from './useTradeSwapRuntime'
import type { TradeRuntimePhase } from './useTradeSwapRuntime'

export type RouterLineStatus = 'available' | 'unavailable' | 'insufficient_data'

export interface RouterLineView {
  id: string
  label: string
  amount: string
  delta: string
  gas?: string
  status: RouterLineStatus
  best: boolean
}

export function routerLineStatus(
  hasAmount: boolean,
  phase: TradeRuntimePhase,
  hasRoute: boolean,
  routerOnline: boolean,
): RouterLineStatus {
  if (!routerOnline) return 'unavailable'
  if (!hasAmount) return 'insufficient_data'
  if (phase === 'routing') return 'insufficient_data'
  if (!hasRoute) return 'unavailable'
  return 'available'
}

export function buildRouterLines(input: {
  entries: TradeRouteEntry[]
  phase: TradeRuntimePhase
  hasAmount: boolean
  routerOnline: boolean
}): RouterLineView[] {
  const { entries, phase, hasAmount, routerOnline } = input

  const smart = entries.find((e) => e.source.toLowerCase().includes('smart') || e.best)
  const v2 = entries.find((e) => e.source.includes('V2'))

  const lines: RouterLineView[] = [
    {
      id: 'smart-router',
      label: smart?.source ?? 'SmartSwap Router',
      amount: smart?.amount ?? '—',
      delta: smart?.delta ?? '—',
      gas: smart?.gas,
      status: routerLineStatus(hasAmount, phase, Boolean(smart), routerOnline),
      best: Boolean(smart?.best),
    },
    {
      id: 'melega-v2',
      label: v2?.source ?? 'MelegaSwap V2',
      amount: v2?.amount ?? '—',
      delta: v2?.delta ?? '—',
      gas: v2?.gas,
      status: routerLineStatus(hasAmount, phase, Boolean(v2), routerOnline),
      best: Boolean(v2?.best),
    },
  ]

  return lines
}

export function routerStatusLabel(status: RouterLineStatus): string {
  if (status === 'available') return 'Available'
  if (status === 'unavailable') return 'Unavailable'
  return 'Insufficient Data'
}
