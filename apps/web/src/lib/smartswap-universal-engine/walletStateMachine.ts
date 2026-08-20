/**
 * Future engine transaction states behind the frozen SmartSwap UI.
 * M5 does not change visible copy, buttons, or layout.
 */

export const ENGINE_TX_STATE = {
  QUOTE_READY: 'QUOTE_READY',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  WAITING_APPROVAL_SIGNATURE: 'WAITING_APPROVAL_SIGNATURE',
  APPROVAL_SUBMITTED: 'APPROVAL_SUBMITTED',
  APPROVAL_CONFIRMED: 'APPROVAL_CONFIRMED',
  EXECUTION_READY: 'EXECUTION_READY',
  WAITING_EXECUTION_SIGNATURE: 'WAITING_EXECUTION_SIGNATURE',
  EXECUTION_SUBMITTED: 'EXECUTION_SUBMITTED',
  EXECUTION_CONFIRMED: 'EXECUTION_CONFIRMED',
  FEE_VERIFIED: 'FEE_VERIFIED',
  FAILED: 'FAILED',
} as const

export type EngineTxState = (typeof ENGINE_TX_STATE)[keyof typeof ENGINE_TX_STATE]

/**
 * Internal mapping only. Frozen surfaces keep current labels
 * (e.g. Confirm / Enable / Not collected).
 */
export const FROZEN_UX_ENGINE_STATE_MAP = {
  quoteDisplayed: ENGINE_TX_STATE.QUOTE_READY,
  enableToken: ENGINE_TX_STATE.APPROVAL_REQUIRED,
  waitingWalletApprove: ENGINE_TX_STATE.WAITING_APPROVAL_SIGNATURE,
  approveTxPending: ENGINE_TX_STATE.APPROVAL_SUBMITTED,
  approveTxMined: ENGINE_TX_STATE.APPROVAL_CONFIRMED,
  swapEnabled: ENGINE_TX_STATE.EXECUTION_READY,
  waitingWalletSwap: ENGINE_TX_STATE.WAITING_EXECUTION_SIGNATURE,
  swapTxPending: ENGINE_TX_STATE.EXECUTION_SUBMITTED,
  swapTxMined: ENGINE_TX_STATE.EXECUTION_CONFIRMED,
  feeReceiptProven: ENGINE_TX_STATE.FEE_VERIFIED,
  anyRevert: ENGINE_TX_STATE.FAILED,
} as const

export function m5MustNotExposeEngineStatesInUx(): true {
  return true
}
