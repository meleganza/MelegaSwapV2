/**
 * Public Farm Factory — eligibility engine (pure).
 * Minimum TVL is an eligibility threshold, not a creation fee.
 */
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'

export const PUBLIC_FARM_MINIMUM_TVL_BNB = 0.25

export const MARCO_REWARD_REJECTION_MESSAGE =
  'MARCO reward farms are protocol-managed and cannot be created through the Public Farm Factory.'

export const WBNB_BSC = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

export type PublicFarmEligibilityStatus =
  | 'missing_pair'
  | 'not_indexed'
  | 'inactive'
  | 'tvl_unavailable'
  | 'below_minimum_tvl'
  | 'eligible'

export type PublicFarmEligibilityResult = {
  status: PublicFarmEligibilityStatus
  pairAddress: string | null
  indexed: boolean
  active: boolean
  currentTvlBnb: number | null
  minimumTvlBnb: number
  missingTvlBnb: number | null
  eligible: boolean
  updatedAt: string
  sourceBlock: number | null
}

export type EligibilityPairInput = {
  pairAddress: string
  token0?: string | null
  token1?: string | null
  reserve0?: string | null
  reserve1?: string | null
  classification?: string | null
  indexed?: boolean
  sourceBlock?: number | null
}

/** TVL ≈ 2 × WBNB reserve (human). Null when pair has no WBNB side or reserves unusable. */
export function estimatePairTvlBnb(pair: {
  token0?: string | null
  token1?: string | null
  reserve0?: string | null
  reserve1?: string | null
}): number | null {
  const t0 = pair.token0?.toLowerCase()
  const t1 = pair.token1?.toLowerCase()
  if (!t0 || !t1) return null
  const r0 = Number(pair.reserve0 ?? '0')
  const r1 = Number(pair.reserve1 ?? '0')
  if (!Number.isFinite(r0) || !Number.isFinite(r1) || (r0 <= 0 && r1 <= 0)) return null

  const wbnb = WBNB_BSC.toLowerCase()
  if (t0 !== wbnb && t1 !== wbnb) return null
  const wbnbRaw = t0 === wbnb ? r0 : r1
  const tvl = (wbnbRaw / 1e18) * 2
  return Number.isFinite(tvl) && tvl > 0 ? tvl : null
}

export function isActivePairClassification(classification?: string | null): boolean {
  if (!classification) return false
  return classification === 'tradeable' || classification === 'liquidity_present'
}

export function evaluatePublicFarmEligibility(
  pair: EligibilityPairInput | null | undefined,
  now: Date = new Date(),
): PublicFarmEligibilityResult {
  const minimumTvlBnb = PUBLIC_FARM_MINIMUM_TVL_BNB
  const updatedAt = now.toISOString()

  if (!pair?.pairAddress) {
    return {
      status: 'missing_pair',
      pairAddress: null,
      indexed: false,
      active: false,
      currentTvlBnb: null,
      minimumTvlBnb,
      missingTvlBnb: null,
      eligible: false,
      updatedAt,
      sourceBlock: null,
    }
  }

  const indexed = pair.indexed !== false
  if (!indexed) {
    return {
      status: 'not_indexed',
      pairAddress: pair.pairAddress,
      indexed: false,
      active: false,
      currentTvlBnb: null,
      minimumTvlBnb,
      missingTvlBnb: null,
      eligible: false,
      updatedAt,
      sourceBlock: pair.sourceBlock ?? null,
    }
  }

  const active = isActivePairClassification(pair.classification)
  if (!active) {
    return {
      status: 'inactive',
      pairAddress: pair.pairAddress,
      indexed: true,
      active: false,
      currentTvlBnb: estimatePairTvlBnb(pair),
      minimumTvlBnb,
      missingTvlBnb: null,
      eligible: false,
      updatedAt,
      sourceBlock: pair.sourceBlock ?? null,
    }
  }

  const currentTvlBnb = estimatePairTvlBnb(pair)
  if (currentTvlBnb == null) {
    return {
      status: 'tvl_unavailable',
      pairAddress: pair.pairAddress,
      indexed: true,
      active: true,
      currentTvlBnb: null,
      minimumTvlBnb,
      missingTvlBnb: null,
      eligible: false,
      updatedAt,
      sourceBlock: pair.sourceBlock ?? null,
    }
  }

  const missingTvlBnb = Math.max(0, +(minimumTvlBnb - currentTvlBnb).toFixed(8))
  if (currentTvlBnb + 1e-12 < minimumTvlBnb) {
    return {
      status: 'below_minimum_tvl',
      pairAddress: pair.pairAddress,
      indexed: true,
      active: true,
      currentTvlBnb,
      minimumTvlBnb,
      missingTvlBnb,
      eligible: false,
      updatedAt,
      sourceBlock: pair.sourceBlock ?? null,
    }
  }

  return {
    status: 'eligible',
    pairAddress: pair.pairAddress,
    indexed: true,
    active: true,
    currentTvlBnb,
    minimumTvlBnb,
    missingTvlBnb: 0,
    eligible: true,
    updatedAt,
    sourceBlock: pair.sourceBlock ?? null,
  }
}

export function isMarcoRewardToken(addressOrSymbol: string | null | undefined): boolean {
  if (!addressOrSymbol) return false
  const raw = addressOrSymbol.trim()
  if (!raw) return false
  if (raw.toUpperCase() === 'MARCO') return true
  return raw.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()
}

export function rejectMarcoReward(addressOrSymbol: string | null | undefined): {
  rejected: boolean
  message: string | null
} {
  if (!isMarcoRewardToken(addressOrSymbol)) return { rejected: false, message: null }
  return { rejected: true, message: MARCO_REWARD_REJECTION_MESSAGE }
}
