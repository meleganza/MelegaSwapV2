export const SMART_SWAP_PREVIEW_FAILURES = [
  'NO_ROUTE',
  'QUOTE_UNAVAILABLE',
  'EXECUTION_UNAVAILABLE',
  'GAS_UNAVAILABLE',
  'PARTIAL_DATA',
  'STALE_DATA',
] as const

export type SmartSwapPreviewFailure = (typeof SMART_SWAP_PREVIEW_FAILURES)[number]

export interface SmartSwapPreviewFailureResult {
  status: 'failure'
  failure: SmartSwapPreviewFailure
  message: string
  preview: null
}

export function previewFailure(
  failure: SmartSwapPreviewFailure,
  message?: string,
): SmartSwapPreviewFailureResult {
  const defaults: Record<SmartSwapPreviewFailure, string> = {
    NO_ROUTE: 'No route available to preview.',
    QUOTE_UNAVAILABLE: 'Quote unavailable — execution preview cannot be built.',
    EXECUTION_UNAVAILABLE: 'Execution preview is unavailable for this trade.',
    GAS_UNAVAILABLE: 'Gas estimate unavailable. Wallet will verify before signing.',
    PARTIAL_DATA: 'Preview data is incomplete.',
    STALE_DATA: 'Preview data is stale — refresh the quote.',
  }
  return {
    status: 'failure',
    failure,
    message: message ?? defaults[failure],
    preview: null,
  }
}
