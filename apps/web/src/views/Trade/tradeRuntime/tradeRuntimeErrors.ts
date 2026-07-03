export type TradeRuntimeErrorCode =
  | 'WALLET_DISCONNECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'ROUTE_NOT_FOUND'
  | 'TOKEN_NOT_SUPPORTED'
  | 'SLIPPAGE_TOO_HIGH'
  | 'NETWORK_UNAVAILABLE'
  | 'ENTER_AMOUNT'
  | 'SELECT_TOKEN'
  | 'ROUTING'
  | 'UNKNOWN'

export interface TradeRuntimeError {
  code: TradeRuntimeErrorCode
  message: string
}

const PATTERNS: Array<{ test: RegExp; code: TradeRuntimeErrorCode; message: string }> = [
  { test: /connect wallet/i, code: 'WALLET_DISCONNECTED', message: 'Connect your wallet to trade.' },
  { test: /insufficient liquidity/i, code: 'ROUTE_NOT_FOUND', message: 'No route found for this trade.' },
  { test: /insufficient.*balance/i, code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance for this trade.' },
  { test: /enter an amount/i, code: 'ENTER_AMOUNT', message: 'Enter an amount to get a quote.' },
  { test: /select a token/i, code: 'SELECT_TOKEN', message: 'Select input and output tokens.' },
  { test: /slippage/i, code: 'SLIPPAGE_TOO_HIGH', message: 'Slippage tolerance may be too low for this trade.' },
  { test: /unsupported/i, code: 'TOKEN_NOT_SUPPORTED', message: 'This token is not supported on the current network.' },
  { test: /wrong network|switch network/i, code: 'NETWORK_UNAVAILABLE', message: 'Switch to a supported network.' },
]

export function mapSwapInputToRuntimeError(inputError?: string | null): TradeRuntimeError | null {
  if (!inputError) return null
  const match = PATTERNS.find((p) => p.test.test(inputError))
  if (match) return { code: match.code, message: match.message }
  return { code: 'UNKNOWN', message: inputError }
}

export function runtimeErrorFromPhase(phase: string, inputError?: string | null): TradeRuntimeError | null {
  if (phase === 'routing') return { code: 'ROUTING', message: 'Finding the best route…' }
  return mapSwapInputToRuntimeError(inputError)
}
