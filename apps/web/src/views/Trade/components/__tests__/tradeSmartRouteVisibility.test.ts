import { describe, expect, it } from 'vitest'

function formatRouteHops(steps: string[]): { kind: 'direct' | 'multi' | 'unavailable'; hops: string[] } {
  if (!steps.length) return { kind: 'unavailable', hops: [] }
  if (steps.length === 2) return { kind: 'direct', hops: steps }
  return { kind: 'multi', hops: steps }
}

describe('Smart route visibility', () => {
  it('labels two-hop as direct route', () => {
    expect(formatRouteHops(['BNB', 'MARCO'])).toEqual({ kind: 'direct', hops: ['BNB', 'MARCO'] })
  })

  it('keeps multi-hop path honest', () => {
    expect(formatRouteHops(['BNB', 'MARCO/BNB Pool', 'MARCO']).kind).toBe('multi')
  })

  it('never fakes unavailable routes', () => {
    expect(formatRouteHops([])).toEqual({ kind: 'unavailable', hops: [] })
  })
})
