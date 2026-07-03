export type PoolsRuntimeErrorCode =
  | 'POOL_NOT_FOUND'
  | 'STAKE_TOO_LOW'
  | 'INSUFFICIENT_BALANCE'
  | 'POOL_LOCKED'
  | 'POOL_ENDED'
  | 'APPROVAL_REQUIRED'
  | 'NETWORK_UNAVAILABLE'
  | 'REWARD_NOT_AVAILABLE'
  | 'WALLET_DISCONNECTED'
  | 'CALCULATING'
  | 'UNKNOWN'

export interface PoolsRuntimeError {
  code: PoolsRuntimeErrorCode
  message: string
}

const PATTERNS: Array<{ test: RegExp; code: PoolsRuntimeErrorCode; message: string }> = [
  { test: /connect wallet/i, code: 'WALLET_DISCONNECTED', message: 'Connect your wallet to stake.' },
  { test: /insufficient/i, code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance for this stake.' },
  { test: /minimum|too low|stake too/i, code: 'STAKE_TOO_LOW', message: 'Stake amount is below the pool minimum.' },
  { test: /lock|locked/i, code: 'POOL_LOCKED', message: 'This position is still locked.' },
  { test: /finished|ended|expired/i, code: 'POOL_ENDED', message: 'This pool has ended.' },
  { test: /approve/i, code: 'APPROVAL_REQUIRED', message: 'Approve your staking token to continue.' },
  { test: /wrong network|switch network/i, code: 'NETWORK_UNAVAILABLE', message: 'Switch to a supported network.' },
  { test: /no reward|nothing to harvest/i, code: 'REWARD_NOT_AVAILABLE', message: 'No rewards available to claim.' },
  { test: /pool not found/i, code: 'POOL_NOT_FOUND', message: 'Pool not found on this network.' },
]

export function mapPoolsErrorToRuntime(error?: string | null): PoolsRuntimeError | null {
  if (!error) return null
  const match = PATTERNS.find((p) => p.test.test(error))
  if (match) return { code: match.code, message: match.message }
  return { code: 'UNKNOWN', message: error }
}

export function runtimeErrorFromPhase(phase: string, error?: string | null): PoolsRuntimeError | null {
  if (phase === 'loading_pools') return { code: 'CALCULATING', message: 'Loading pools…' }
  if (phase === 'reading_wallet') return { code: 'CALCULATING', message: 'Reading wallet stakes…' }
  if (phase === 'calculating_rewards') return { code: 'CALCULATING', message: 'Calculating rewards…' }
  return mapPoolsErrorToRuntime(error)
}
