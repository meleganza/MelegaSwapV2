/**
 * Public Farm Factory draft persistence + return-flow query contract.
 */
import {
  evaluatePublicFarmEligibility,
  type EligibilityPairInput,
  type PublicFarmEligibilityResult,
} from './publicFarmEligibility'

export const PUBLIC_FARM_DRAFT_STORAGE_KEY = 'melega.public-farm-factory.draft.v1'

export type PublicFarmPairSelectionMode = 'search_existing' | 'create_new' | null

export type PublicFarmSelectedPair = {
  pairAddress: string
  lpTokenAddress: string
  token0: string
  token1: string
  symbol0: string
  symbol1: string
  classification: string
  reserve0: string
  reserve1: string
  sourceBlock: number | null
}

export type PublicFarmFactoryDraft = {
  draftId: string
  selectionMode: PublicFarmPairSelectionMode
  selectedPair: PublicFarmSelectedPair | null
  rewardToken: string
  rewardTokenAddress: string
  rewardBudget: string
  emissionRate: string
  durationDays: string
  startMode: 'immediate' | 'scheduled'
  creatorWallet: string
  updatedAt: string
}

export function createDraftId(now: Date = new Date()): string {
  return `pff-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultPublicFarmFactoryDraft(now: Date = new Date()): PublicFarmFactoryDraft {
  return {
    draftId: createDraftId(now),
    selectionMode: null,
    selectedPair: null,
    rewardToken: '',
    rewardTokenAddress: '',
    rewardBudget: '',
    emissionRate: '',
    durationDays: '',
    startMode: 'immediate',
    creatorWallet: '',
    updatedAt: now.toISOString(),
  }
}

export function pairContainsMarco(pair: PublicFarmSelectedPair | null | undefined): boolean {
  if (!pair) return false
  const marcoSym = 'MARCO'
  if (pair.symbol0.toUpperCase() === marcoSym || pair.symbol1.toUpperCase() === marcoSym) return true
  // Address check deferred to caller when MARCO address known; symbols cover UI defaults.
  return false
}

export function pairContainsMarcoAddress(
  pair: PublicFarmSelectedPair | null | undefined,
  marcoAddress: string,
): boolean {
  if (!pair) return false
  const m = marcoAddress.toLowerCase()
  return pair.token0.toLowerCase() === m || pair.token1.toLowerCase() === m || pairContainsMarco(pair)
}

export function toEligibilityPairInput(pair: PublicFarmSelectedPair | null): EligibilityPairInput | null {
  if (!pair) return null
  return {
    pairAddress: pair.pairAddress,
    token0: pair.token0,
    token1: pair.token1,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    classification: pair.classification,
    indexed: true,
    sourceBlock: pair.sourceBlock,
  }
}

export function recheckDraftEligibility(draft: PublicFarmFactoryDraft): PublicFarmEligibilityResult {
  return evaluatePublicFarmEligibility(toEligibilityPairInput(draft.selectedPair))
}

export function saveDraftToStorage(draft: PublicFarmFactoryDraft): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PUBLIC_FARM_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* ignore quota */
  }
}

export function loadDraftFromStorage(): PublicFarmFactoryDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PUBLIC_FARM_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PublicFarmFactoryDraft
    if (!parsed?.draftId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearDraftStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PUBLIC_FARM_DRAFT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export const CREATE_FARM_RETURN_PATH = '/farms?create=1'

export function parseReturnToCreateFarm(search: string): {
  returning: boolean
  draftId: string | null
} {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  const ret = params.get('return')
  const draftId = params.get('draftId')
  return {
    returning: ret === 'create-farm',
    draftId,
  }
}
