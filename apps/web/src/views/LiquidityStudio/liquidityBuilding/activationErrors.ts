/**
 * Honest user-facing activation / execution failure messages.
 * No fabricated success. No infrastructure jargon in product strings.
 */

export type ActivationFailureCode =
  | 'DEPLOYMENT_INPUTS_BLOCKED'
  | 'LB_PROGRAM_NOT_DEPLOYED'
  | 'LB_FACTORY_MISSING'
  | 'LB_AUTHORIZER_MISSING'
  | 'LB_FEE_SINK_MISSING'
  | 'WALLET_NOT_CONNECTED'
  | 'WALLET_REJECTED'
  | 'WRONG_CHAIN'
  | 'PAIR_MISSING'
  | 'UNSUPPORTED_TOKEN'
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'APPROVAL_LIMIT'
  | 'SLIPPAGE'
  | 'DEADLINE'
  | 'RPC_UNAVAILABLE'
  | 'TX_REPLACED'
  | 'RECEIPT_FAILED'
  | 'REPLAY_REJECTED'
  | 'ACTIVATION_NOT_AUTHORIZED'
  | 'UNKNOWN'

const MESSAGES: Record<ActivationFailureCode, string> = {
  DEPLOYMENT_INPUTS_BLOCKED:
    'Liquidity Building contracts are not deployed on BNB Smart Chain yet. Configuration can be completed; activation is unavailable.',
  LB_PROGRAM_NOT_DEPLOYED:
    'Liquidity Building contracts are not deployed on BNB Smart Chain yet. Configuration can be completed; activation is unavailable.',
  LB_FACTORY_MISSING: 'Liquidity Building Factory is not bound on this deployment.',
  LB_AUTHORIZER_MISSING: 'Liquidity Building Authorizer is not bound on this deployment.',
  LB_FEE_SINK_MISSING: 'Liquidity Building Fee Sink is not bound on this deployment.',
  WALLET_NOT_CONNECTED: 'Connect your wallet to continue.',
  WALLET_REJECTED: 'Wallet request was rejected. No transaction was sent.',
  WRONG_CHAIN: 'Switch to BNB Smart Chain to continue.',
  PAIR_MISSING: 'No Melega pool detected for this token and quote.',
  UNSUPPORTED_TOKEN: 'This token is not supported for Liquidity Building on Melega.',
  INSUFFICIENT_BALANCE: 'Budget exceeds your available wallet balance.',
  INSUFFICIENT_LIQUIDITY: 'Pool liquidity is too thin for a safe activation path.',
  APPROVAL_LIMIT: 'Token approval was insufficient for the requested budget.',
  SLIPPAGE: 'Price moved beyond the allowed slippage. Try again.',
  DEADLINE: 'Transaction deadline expired. Submit again.',
  RPC_UNAVAILABLE: 'Network RPC is temporarily unavailable. Try again shortly.',
  TX_REPLACED: 'A replacement transaction was detected. Check your wallet activity.',
  RECEIPT_FAILED: 'Transaction mined but failed on-chain. No program was activated.',
  REPLAY_REJECTED: 'This activation request was already processed.',
  ACTIVATION_NOT_AUTHORIZED: 'Activation is not authorized on this deployment yet.',
  UNKNOWN: 'Activation could not complete. No fake success was recorded.',
}

export function humanizeActivationFailure(code: string | null | undefined): string {
  if (!code) return MESSAGES.UNKNOWN
  const key = code as ActivationFailureCode
  return MESSAGES[key] ?? code.replace(/_/g, ' ')
}

export function classifyWalletError(err: unknown): ActivationFailureCode {
  const msg = String((err as { message?: string })?.message ?? err ?? '').toLowerCase()
  if (/user rejected|denied|rejected the request|action_rejected/i.test(msg)) return 'WALLET_REJECTED'
  if (/network|rpc|fetch failed|timeout|econnrefused/i.test(msg)) return 'RPC_UNAVAILABLE'
  if (/wrong network|chain|unsupported chain/i.test(msg)) return 'WRONG_CHAIN'
  if (/insufficient funds|exceeds balance/i.test(msg)) return 'INSUFFICIENT_BALANCE'
  if (/slippage|price impact/i.test(msg)) return 'SLIPPAGE'
  if (/deadline|expired/i.test(msg)) return 'DEADLINE'
  if (/replacement|nonce too low/i.test(msg)) return 'TX_REPLACED'
  return 'UNKNOWN'
}
