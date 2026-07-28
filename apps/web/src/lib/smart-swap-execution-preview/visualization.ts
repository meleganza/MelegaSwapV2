import type { SmartSwapHop, SmartSwapPoolRef, SmartSwapTokenRef } from 'lib/smart-swap-route-engine'
import type { SmartSwapRouteHopDisplay } from './types'

function poolLabel(pool: SmartSwapPoolRef, pathSymbols?: string[]): string {
  if (pathSymbols && pathSymbols.length >= 2) {
    return `${pathSymbols[0]}/${pathSymbols[1]} Pool`
  }
  const short = pool.address.length > 10 ? `${pool.address.slice(0, 6)}…${pool.address.slice(-4)}` : pool.address
  return pool.kind === 'stable' ? `Stable pool ${short}` : `Pool ${short}`
}

function normalizePathAddresses(
  input: SmartSwapTokenRef,
  output: SmartSwapTokenRef,
  hops: SmartSwapHop[],
  pathAddresses?: string[],
): string[] {
  if (pathAddresses && pathAddresses.length >= 2) {
    return pathAddresses.map((a) => a.toLowerCase())
  }
  // Reconstruct from hop tokenIn/tokenOut when pathAddresses missing.
  if (hops.length === 0) {
    return [input.address.toLowerCase(), output.address.toLowerCase()]
  }
  const path = [hops[0].tokenIn.toLowerCase()]
  for (const hop of hops) {
    path.push(hop.tokenOut.toLowerCase())
  }
  // Ensure ends with output
  if (path[path.length - 1] !== output.address.toLowerCase()) {
    path[path.length - 1] = output.address.toLowerCase()
  }
  path[0] = input.address.toLowerCase()
  return path
}

/**
 * Build user-facing hop visualization with exact addresses for logo mapping:
 * USDT → MARCO/BNB Pool → BNB → MARCO
 */
export function buildHopVisualization(input: {
  inputToken: SmartSwapTokenRef
  outputToken: SmartSwapTokenRef
  hops: SmartSwapHop[]
  pools: SmartSwapPoolRef[]
  pathSymbols?: string[]
  pathAddresses?: string[]
}): SmartSwapRouteHopDisplay[] {
  const symbols =
    input.pathSymbols && input.pathSymbols.length >= 2
      ? input.pathSymbols
      : [input.inputToken.symbol, ...input.hops.map((h, i) => `Hop${i + 1}`), input.outputToken.symbol].filter(
          Boolean,
        )

  const path: string[] = []
  path.push(input.inputToken.symbol)
  for (let i = 0; i < input.hops.length - 1; i++) {
    path.push(symbols[i + 1] ?? `Token${i + 1}`)
  }
  if (input.hops.length > 0) path.push(input.outputToken.symbol)
  else path.push(input.outputToken.symbol)

  const addresses = normalizePathAddresses(
    input.inputToken,
    input.outputToken,
    input.hops,
    input.pathAddresses,
  )
  const chainId = input.inputToken.chainId || input.outputToken.chainId || 56

  const viz: SmartSwapRouteHopDisplay[] = []
  viz.push({
    kind: 'token',
    label: input.inputToken.symbol,
    address: addresses[0] ?? input.inputToken.address,
    chainId,
  })

  for (let i = 0; i < input.hops.length; i++) {
    const hop = input.hops[i]
    const pool = input.pools[i] ?? hop.pool
    const pairSymbols =
      path.length >= i + 2 ? [path[i], path[i + 1]] : [input.inputToken.symbol, input.outputToken.symbol]
    const t0 = (pool.token0 || hop.tokenIn || addresses[i] || '').toLowerCase()
    const t1 = (pool.token1 || hop.tokenOut || addresses[i + 1] || '').toLowerCase()
    viz.push({
      kind: 'pool',
      label: poolLabel(pool, pairSymbols),
      detail: pool.kind,
      token0Address: t0 || undefined,
      token1Address: t1 || undefined,
      chainId,
    })
    if (i < input.hops.length - 1) {
      viz.push({
        kind: 'token',
        label: path[i + 1] ?? '—',
        address: addresses[i + 1] ?? hop.tokenOut,
        chainId,
      })
    }
  }

  viz.push({
    kind: 'token',
    label: input.outputToken.symbol,
    address: addresses[addresses.length - 1] ?? input.outputToken.address,
    chainId,
  })
  return viz
}
