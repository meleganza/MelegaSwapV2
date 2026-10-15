/**
 * SmartSwap Universal Engine M1 — operating states.
 * Global descriptors stay LEGACY_PRODUCTION / SHADOW: the SHADOW engine still runs the factual
 * Melega/Pancake competition, and every chain other than BSC keeps legacy production execution.
 * BSC (56) public V2 cutover is chain-scoped: only isProductionCutoverAllowed(56) can authorize it.
 */

export const SMARTSWAP_UNIVERSAL_ENGINE_ID = 'SMARTSWAP_UNIVERSAL_ENGINE_M1' as const
export const SMARTSWAP_UNIVERSAL_ENGINE_M2_ID = 'SMARTSWAP_UNIVERSAL_ENGINE_M2' as const
export const SMARTSWAP_UNIVERSAL_ENGINE_M3_ID = 'SMARTSWAP_UNIVERSAL_ENGINE_M3' as const

export const SMARTSWAP_OPERATING_MODE = {
  LEGACY_PRODUCTION: 'LEGACY_PRODUCTION',
  SHADOW: 'SHADOW',
  CANARY: 'CANARY',
  PRODUCTION: 'PRODUCTION',
} as const

export type SmartSwapOperatingMode = (typeof SMARTSWAP_OPERATING_MODE)[keyof typeof SMARTSWAP_OPERATING_MODE]

/** Authoritative user execution path for this mission. */
export const PRODUCTION_EXECUTION_MODE: SmartSwapOperatingMode = SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION

/** Universal engine may observe/normalize/compare only. */
export const UNIVERSAL_ENGINE_MODE: SmartSwapOperatingMode = SMARTSWAP_OPERATING_MODE.SHADOW

export const V2_SHADOW_EXECUTION_FORBIDDEN = 'V2_SHADOW_EXECUTION_FORBIDDEN' as const
export const V2_EXTERNAL_VENUE_NOT_ENABLED = 'V2_EXTERNAL_VENUE_NOT_ENABLED' as const
export const V2_SOLANA_EXECUTION_NOT_ENABLED = 'V2_SOLANA_EXECUTION_NOT_ENABLED' as const
export const V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION = 'V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION' as const
export const V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN = 'V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN' as const
export const V2_M3_FEE_COLLECTION_FORBIDDEN = 'V2_M3_FEE_COLLECTION_FORBIDDEN' as const

export function isLegacyProductionAuthoritative(): boolean {
  return PRODUCTION_EXECUTION_MODE === SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION
}

export function isUniversalEngineShadowOnly(): boolean {
  return UNIVERSAL_ENGINE_MODE === SMARTSWAP_OPERATING_MODE.SHADOW
}

export function assertV2CannotExecute(mode: SmartSwapOperatingMode = UNIVERSAL_ENGINE_MODE): never {
  throw new Error(`${V2_SHADOW_EXECUTION_FORBIDDEN}: mode=${mode}`)
}

/** Only chain with a certified, canary-proven ExecutorV2 (see #95 evidence). */
export const BSC_V2_PUBLIC_CUTOVER_CHAIN_ID = 56 as const

/**
 * Single explicit BSC public-cutover truth.
 * Software rollback: set to false -> public CTA returns to LEGACY (no contract redeploy).
 */
export const BSC_V2_PUBLIC_CUTOVER_ENABLED: boolean = true

/**
 * Chain-scoped production cutover. True ONLY for chainId 56 while the BSC truth is enabled.
 * Calls without a chainId (SHADOW/readiness modules) always return false.
 * `bscPublicCutoverEnabled` is a rollback/test seam; it can never authorize a non-BSC chain.
 */
export function isProductionCutoverAllowed(
  chainId?: number,
  bscPublicCutoverEnabled: boolean = BSC_V2_PUBLIC_CUTOVER_ENABLED,
): boolean {
  if (chainId === undefined || chainId === null) return false
  return chainId === BSC_V2_PUBLIC_CUTOVER_CHAIN_ID && bscPublicCutoverEnabled === true
}
