import type { SmartSwapAIAssistanceFailureResult, SmartSwapAIFailure } from './types'

export const SMART_SWAP_AI_FAILURES = [
  'AI_UNAVAILABLE',
  'CONTEXT_UNAVAILABLE',
  'INSUFFICIENT_DATA',
  'TIMEOUT',
  'PARTIAL_CONTEXT',
] as const satisfies readonly SmartSwapAIFailure[]

export function aiAssistanceFailure(
  failure: SmartSwapAIFailure,
  message?: string,
): SmartSwapAIAssistanceFailureResult {
  const defaults: Record<SmartSwapAIFailure, string> = {
    AI_UNAVAILABLE: 'AI assistance is temporarily unavailable. You can still continue the swap.',
    CONTEXT_UNAVAILABLE: 'Assistance context is unavailable.',
    INSUFFICIENT_DATA: 'Information unavailable.',
    TIMEOUT: 'AI assistance timed out. You can still continue the swap.',
    PARTIAL_CONTEXT: 'Only partial context is available for explanation.',
  }
  return {
    status: 'failure',
    failure,
    message: message ?? defaults[failure],
    assistance: null,
    optional: true,
  }
}
