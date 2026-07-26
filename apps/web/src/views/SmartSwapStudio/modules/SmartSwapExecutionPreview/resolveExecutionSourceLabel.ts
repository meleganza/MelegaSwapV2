/**
 * Presentation-only execution source labels for the Smart route cockpit.
 * Does not change routing — only how the source is described to the user.
 */

import type { SmartSwapExecutionPreview } from 'lib/smart-swap-execution-preview'

export type ExecutionSourceKind =
  | 'melega_router_direct'
  | 'melega_smart_router'
  | 'melega_v2'
  | 'stable_pool'
  | 'external_liquidity'
  | 'unavailable'

export function resolveExecutionSourceLabel(preview: SmartSwapExecutionPreview | null | undefined): {
  kind: ExecutionSourceKind
  label: string
  detail: string
} {
  if (!preview || preview.routeHops.length === 0) {
    return { kind: 'unavailable', label: 'Route unavailable', detail: 'No execution source yet' }
  }

  const pools = preview.liquiditySources ?? []
  const hops = preview.routeHops.length
  const hasStable = pools.some((p) => p.kind === 'stable')
  const hasUnknown = pools.some((p) => p.kind === 'unknown')

  if (hasUnknown && !hasStable) {
    return {
      kind: 'external_liquidity',
      label: 'External liquidity source',
      detail: hops === 1 ? 'Single-hop venue' : `${hops} hops`,
    }
  }

  if (hasStable) {
    return {
      kind: 'stable_pool',
      label: 'Melega Router',
      detail: hops === 1 ? 'Stable pool' : `Stable path · ${hops} hops`,
    }
  }

  if (hops === 1) {
    return {
      kind: 'melega_router_direct',
      label: 'Melega Router',
      detail: 'Direct Pool',
    }
  }

  return {
    kind: 'melega_smart_router',
    label: 'Melega Smart Router',
    detail: `${hops} hops`,
  }
}
