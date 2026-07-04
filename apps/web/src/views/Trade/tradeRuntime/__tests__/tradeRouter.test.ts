import { describe, expect, it } from 'vitest'
import { buildRouterLines, routerLineStatus, routerStatusLabel } from '../formatTradeRouter'
import type { TradeRouteEntry } from '../useTradeSwapRuntime'

describe('trade router runtime', () => {
  const entries: TradeRouteEntry[] = [
    {
      rank: 1,
      chain: 'BNB',
      source: 'Smart Router',
      amount: '100 MARCO',
      delta: 'Best route',
      gas: '~0.001 BNB',
      best: true,
    },
    {
      rank: 2,
      chain: 'BNB',
      source: 'MelegaSwap V2',
      amount: '98 MARCO',
      delta: '-2%',
      gas: '~0.001 BNB',
      best: false,
    },
  ]

  it('labels available when route quoted', () => {
    const lines = buildRouterLines({ entries, phase: 'ready', hasAmount: true, routerOnline: true })
    expect(lines[0].status).toBe('available')
    expect(lines[1].status).toBe('available')
    expect(routerStatusLabel(lines[0].status)).toBe('Available')
  })

  it('labels insufficient data when no amount', () => {
    const lines = buildRouterLines({ entries: [], phase: 'idle', hasAmount: false, routerOnline: true })
    expect(lines.every((l) => l.status === 'insufficient_data')).toBe(true)
  })

  it('labels unavailable when router offline', () => {
    expect(routerLineStatus(true, 'ready', true, false)).toBe('unavailable')
  })

  it('does not include fake execution times', () => {
    const lines = buildRouterLines({ entries, phase: 'ready', hasAmount: true, routerOnline: true })
    lines.forEach((line) => {
      expect(line).not.toHaveProperty('time')
    })
  })
})
