/**
 * SMART_SWAP_MODULE_004 — fee transparency display model.
 * Presentation only. Does not calculate, settle, route, or attribute fees.
 */

export const SMART_SWAP_FEE_TRANSPARENCY_MODULE = 'SMART_SWAP_MODULE_004_FEE_TRANSPARENCY' as const

export type SmartSwapFeeTransparencyState =
  | 'AVAILABLE'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'STALE'
  | 'NOT_APPLICABLE'

export type SmartSwapFeeAttributionStatus = 'factual' | 'pending' | 'unavailable'

export interface SmartSwapFeeTransparency {
  swapAmount: string | null
  feeAmount: string | null
  feeAsset: string | null
  /** Human fee rate from canonical engine (e.g. "30 bps"). Null when unavailable. */
  feeRate: string | null
  protocolFee: {
    bps: number | null
    label: string
    buyMarcoApplied: boolean | null
  }
  /** Settlement owner label when factual — never a fabricated wallet. */
  treasuryDestination: string | null
  allocationStatus: SmartSwapFeeAttributionStatus
  /** Attribution layer label when factual (e.g. KERL). Never reward amounts. */
  economicAttribution: string | null
  source: string
  freshness: string | null
  unavailableReason: string | null
  state: SmartSwapFeeTransparencyState
  explanation: string
  /** Ordered display steps for Swap → Fee → Destination → Attribution. */
  flowSteps: Array<{ label: string; value: string }>
}

/**
 * Snapshot of already-authoritative facts. Fee amounts must come from the
 * canonical fee engine (or remain null) — this module never invents values.
 */
export interface SmartSwapFeeTransparencyInput {
  swapAmount?: string | null
  /** Precomputed by canonical fee engine (`computeGrossProtocolFeeAmount`). */
  feeAmount?: string | null
  feeAsset?: string | null
  chainId?: number
  inputAddress?: string | null
  outputAddress?: string | null
  outputSymbol?: string | null
  /** Protocol fee bps when already resolved by canonical engine. */
  protocolFeeBps?: number | null
  buyMarcoApplied?: boolean | null
  pricingSourceId?: string | null
  feeSplitPolicyRef?: string | null
  treasuryStatus?: 'available' | 'unavailable' | 'pending'
  kerlStatus?: 'available' | 'unavailable' | 'pending'
  freshness?: string | null
  stale?: boolean
  notApplicable?: boolean
  unavailableReason?: string | null
}
