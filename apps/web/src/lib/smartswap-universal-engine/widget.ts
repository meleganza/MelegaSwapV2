/**
 * Host ↔ widget contract for future embedding (Melega Space, other surfaces).
 * Types only. No Space integration. No widget redesign.
 */

import type { CanonicalAssetId } from './assetIdentity'
import type { ExecutionNetwork } from './domain'

export const SMARTSWAP_ENGINE_LAYER = 'engine' as const
export const SMARTSWAP_WIDGET_LAYER = 'widget' as const
export const SMARTSWAP_HOST_LAYER = 'host' as const

export interface SmartSwapHostContext {
  walletConnected: boolean
  walletAddress: string | null
  network: ExecutionNetwork | null
  requestedInput: CanonicalAssetId | null
  requestedOutput: CanonicalAssetId | null
  /** Host may pass existing theme tokens; engine never restyles the frozen UX. */
  runtimeEnvironment?: 'melega-dex' | 'melega-space' | 'authorized-embed'
}

export interface SmartSwapEnginePort {
  layer: typeof SMARTSWAP_ENGINE_LAYER
  /** Quotes and comparison only in M1. */
  mode: 'SHADOW'
}

export interface SmartSwapWidgetPort {
  layer: typeof SMARTSWAP_WIDGET_LAYER
  /** Existing frozen SmartSwapForm + Studio presentation. */
  surface: 'SmartSwapForm'
}

export function hostMustNotOwnRouting(): boolean {
  return true
}

export function engineMustNotOwnUx(): boolean {
  return true
}

export function hostMustNotOverrideRevenuePolicy(): boolean {
  return true
}

export function assertHostDoesNotSupplyFee(host: SmartSwapHostContext): void {
  const record = host as SmartSwapHostContext & { feeBps?: unknown; revenuePolicy?: unknown }
  if (record.feeBps != null || record.revenuePolicy != null) {
    throw new Error('HOST_CANNOT_OVERRIDE_REVENUE_POLICY')
  }
}
