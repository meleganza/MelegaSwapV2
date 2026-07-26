import type { SmartSwapHop, SmartSwapPoolRef, SmartSwapTokenRef } from 'lib/smart-swap-route-engine'
import type { SmartSwapRouteHopDisplay } from './types'

function poolLabel(pool: SmartSwapPoolRef, pathSymbols?: string[]): string {
  if (pathSymbols && pathSymbols.length >= 2) {
    // Prefer symbol pair from path when available
    return `${pathSymbols[0]}/${pathSymbols[1]} Pool`
  }
  const short = pool.address.length > 10 ? `${pool.address.slice(0, 6)}…${pool.address.slice(-4)}` : pool.address
  return pool.kind === 'stable' ? `Stable pool ${short}` : `Pool ${short}`
}

/**
 * Build user-facing hop visualization:
 * USDT → MARCO/BNB Pool → BNB → MARCO
 */
export function buildHopVisualization(input: {
  inputToken: SmartSwapTokenRef
  outputToken: SmartSwapTokenRef
  hops: SmartSwapHop[]
  pools: SmartSwapPoolRef[]
  pathSymbols?: string[]
}): SmartSwapRouteHopDisplay[] {
  const symbols =
    input.pathSymbols && input.pathSymbols.length >= 2
      ? input.pathSymbols
      : [input.inputToken.symbol, ...input.hops.map((h, i) => `Hop${i + 1}`), input.outputToken.symbol].filter(
          Boolean,
        )

  // Normalize path symbols length to hops+1
  const path: string[] = []
  path.push(input.inputToken.symbol)
  for (let i = 0; i < input.hops.length - 1; i++) {
    path.push(symbols[i + 1] ?? `Token${i + 1}`)
  }
  if (input.hops.length > 0) path.push(input.outputToken.symbol)
  else path.push(input.outputToken.symbol)

  const viz: SmartSwapRouteHopDisplay[] = []
  viz.push({ kind: 'token', label: input.inputToken.symbol })

  for (let i = 0; i < input.hops.length; i++) {
    const hop = input.hops[i]
    const pool = input.pools[i] ?? hop.pool
    const pairSymbols =
      path.length >= i + 2 ? [path[i], path[i + 1]] : [input.inputToken.symbol, input.outputToken.symbol]
    viz.push({
      kind: 'pool',
      label: poolLabel(pool, pairSymbols),
      detail: pool.kind,
    })
    if (i < input.hops.length - 1) {
      viz.push({ kind: 'token', label: path[i + 1] ?? '—' })
    }
  }

  viz.push({ kind: 'token', label: input.outputToken.symbol })
  return viz
}
