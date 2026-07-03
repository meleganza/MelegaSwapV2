export type FarmsRuntimeErrorCode =
  | 'FARM_NOT_FOUND'
  | 'NO_LP_AVAILABLE'
  | 'INSUFFICIENT_LP'
  | 'APPROVAL_REQUIRED'
  | 'FARM_ENDED'
  | 'REWARD_UNAVAILABLE'
  | 'NETWORK_UNAVAILABLE'
  | 'INVALID_MULTIPLIER'
  | 'WALLET_DISCONNECTED'
  | 'CALCULATING'
  | 'UNKNOWN'

export interface FarmsRuntimeError {
  code: FarmsRuntimeErrorCode
  message: string
}

const PATTERNS: Array<{ test: RegExp; code: FarmsRuntimeErrorCode; message: string }> = [
  { test: /connect wallet/i, code: 'WALLET_DISCONNECTED', message: 'Connect your wallet to farm.' },
  { test: /no lp|lp not available/i, code: 'NO_LP_AVAILABLE', message: 'No LP tokens available in your wallet.' },
  { test: /insufficient/i, code: 'INSUFFICIENT_LP', message: 'Insufficient LP balance for this action.' },
  { test: /approve/i, code: 'APPROVAL_REQUIRED', message: 'Approve your LP token to continue.' },
  { test: /finished|ended|expired|0x/i, code: 'FARM_ENDED', message: 'This farm has ended.' },
  { test: /wrong network|switch network/i, code: 'NETWORK_UNAVAILABLE', message: 'Switch to a supported network.' },
  { test: /no reward|nothing to harvest|reward unavailable/i, code: 'REWARD_UNAVAILABLE', message: 'No rewards available to claim.' },
  { test: /farm not found/i, code: 'FARM_NOT_FOUND', message: 'Farm not found on this network.' },
  { test: /multiplier/i, code: 'INVALID_MULTIPLIER', message: 'Farm multiplier is not valid for staking.' },
]

export function mapFarmsErrorToRuntime(error?: string | null): FarmsRuntimeError | null {
  if (!error) return null
  const match = PATTERNS.find((p) => p.test.test(error))
  if (match) return { code: match.code, message: match.message }
  return { code: 'UNKNOWN', message: error }
}

export function runtimeErrorFromPhase(phase: string, error?: string | null): FarmsRuntimeError | null {
  if (phase === 'loading_farms') return { code: 'CALCULATING', message: 'Loading farms…' }
  if (phase === 'reading_wallet') return { code: 'CALCULATING', message: 'Reading wallet…' }
  if (phase === 'calculating_rewards') return { code: 'CALCULATING', message: 'Calculating rewards…' }
  if (phase === 'preparing_deposit') return { code: 'CALCULATING', message: 'Preparing deposit…' }
  if (phase === 'preparing_withdraw') return { code: 'CALCULATING', message: 'Preparing withdraw…' }
  if (phase === 'claiming') return { code: 'CALCULATING', message: 'Claiming rewards…' }
  return mapFarmsErrorToRuntime(error)
}
