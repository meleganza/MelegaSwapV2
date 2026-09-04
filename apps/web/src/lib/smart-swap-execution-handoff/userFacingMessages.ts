/**
 * Actionable user-facing copy for handoff / execution blockers.
 * Technical certification strings stay in developer diagnostics only.
 */

import type { SmartSwapHandoffFailure } from './types'
import { sanitizeSwapUserError } from 'utils/swapExecutionUserError'

const FAILURE_MESSAGES: Record<SmartSwapHandoffFailure, string> = {
  WALLET_NOT_CONNECTED: 'Wallet connection required.',
  WRONG_NETWORK: 'Switch to BNB Smart Chain.',
  NO_ROUTE: 'No route available. Try a different pair or amount.',
  STALE_QUOTE: 'Route expired. Refresh quote.',
  INSUFFICIENT_BALANCE: 'Insufficient token balance for this swap.',
  INSUFFICIENT_ALLOWANCE: 'Token approval required before swapping.',
  GAS_ESTIMATION_FAILED: 'Gas estimation failed. Refresh quote and try again.',
  SIMULATION_FAILED: 'Execution preparation unavailable. Refresh quote.',
  CALLDATA_INVALID: 'Execution preparation unavailable. Refresh quote.',
  EXECUTION_UNAVAILABLE: 'Execution preparation unavailable. Refresh quote.',
}

export function userFacingHandoffFailureMessage(failure: SmartSwapHandoffFailure | undefined): string {
  if (!failure) return 'Execution preparation unavailable. Refresh quote.'
  return FAILURE_MESSAGES[failure] ?? 'Execution preparation unavailable. Refresh quote.'
}

export function userFacingHandoffReadyMessage(): string {
  return 'Ready to swap. Confirm in the form to request your wallet signature.'
}

/** Remap known technical gate strings for end users. */
export function toUserFacingExecutionError(message: string | undefined | null): string {
  if (!message) return 'Execution preparation unavailable. Refresh quote.'
  const sanitized = sanitizeSwapUserError(message)
  if (sanitized !== message) return sanitized
  const lower = message.toLowerCase()
  if (lower.includes('certified handoff')) {
    return 'Execution preparation unavailable. Refresh quote.'
  }
  if (lower.includes('wallet account must be available') || lower.includes('wallet')) {
    if (lower.includes('connect') || lower.includes('available')) {
      return 'Wallet connection required.'
    }
  }
  if (lower.includes('testnet') && lower.includes('chain')) {
    return 'Switch to BNB Smart Chain.'
  }
  if (lower.includes('mainnet execution is constitutionally')) {
    return 'Execution preparation unavailable. Refresh quote.'
  }
  return message
}
