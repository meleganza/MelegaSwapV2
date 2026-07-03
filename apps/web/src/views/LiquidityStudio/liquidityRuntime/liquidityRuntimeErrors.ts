export type LiquidityRuntimeErrorCode =
  | 'LIQUIDITY_POOL_NOT_FOUND'
  | 'INSUFFICIENT_TOKEN_A'
  | 'INSUFFICIENT_TOKEN_B'
  | 'APPROVAL_REQUIRED'
  | 'POOL_CLOSED'
  | 'NETWORK_UNAVAILABLE'
  | 'INVALID_RATIO'
  | 'SLIPPAGE_TOO_HIGH'
  | 'WALLET_DISCONNECTED'
  | 'ENTER_AMOUNT'
  | 'SELECT_TOKEN'
  | 'NO_LP_POSITION'
  | 'CALCULATING'
  | 'UNKNOWN'

export interface LiquidityRuntimeError {
  code: LiquidityRuntimeErrorCode
  message: string
}

const PATTERNS: Array<{ test: RegExp; code: LiquidityRuntimeErrorCode; message: string }> = [
  { test: /connect wallet/i, code: 'WALLET_DISCONNECTED', message: 'Connect your wallet to manage liquidity.' },
  { test: /insufficient.*a|insufficient.*0/i, code: 'INSUFFICIENT_TOKEN_A', message: 'Insufficient balance for token A.' },
  { test: /insufficient.*b|insufficient.*1/i, code: 'INSUFFICIENT_TOKEN_B', message: 'Insufficient balance for token B.' },
  { test: /insufficient liquidity/i, code: 'LIQUIDITY_POOL_NOT_FOUND', message: 'Pool not found or insufficient liquidity.' },
  { test: /enter an amount/i, code: 'ENTER_AMOUNT', message: 'Enter an amount to preview liquidity.' },
  { test: /select/i, code: 'SELECT_TOKEN', message: 'Select both tokens for the pair.' },
  { test: /slippage/i, code: 'SLIPPAGE_TOO_HIGH', message: 'Slippage tolerance may be too low for this transaction.' },
  { test: /wrong network|switch network/i, code: 'NETWORK_UNAVAILABLE', message: 'Switch to a supported network.' },
  { test: /invalid ratio|price/i, code: 'INVALID_RATIO', message: 'Token amounts do not match the pool ratio.' },
  { test: /pool.*closed|disabled/i, code: 'POOL_CLOSED', message: 'This pool is not available for liquidity.' },
]

export function mapMintErrorToRuntimeError(error?: string | null): LiquidityRuntimeError | null {
  if (!error) return null
  const match = PATTERNS.find((p) => p.test.test(error))
  if (match) return { code: match.code, message: match.message }
  return { code: 'UNKNOWN', message: error }
}

export function runtimeErrorFromPhase(
  phase: string,
  error?: string | null,
): LiquidityRuntimeError | null {
  if (phase === 'calculating') return { code: 'CALCULATING', message: 'Calculating liquidity preview…' }
  if (phase === 'reading_lp') return { code: 'CALCULATING', message: 'Reading LP positions…' }
  return mapMintErrorToRuntimeError(error)
}
