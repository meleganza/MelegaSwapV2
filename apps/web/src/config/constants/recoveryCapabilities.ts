/**
 * Fail-closed switches for money-moving paths under the controlled recovery.
 * A capability may be enabled only after its receipt/economic invariants pass the
 * certification ladder defined in recovery/program.json.
 */
export const RECOVERY_CAPABILITIES = {
  separateSmartSwapProtocolFee: false,
  commercialPaymentActivation: false,
  /** Canonical BNB factory bytecode, fee/treasury reads and receipt invariants are certified. */
  createTokenExecution: true,
} as const

export const RECOVERY_PAYMENT_UNAVAILABLE =
  'Payments are temporarily unavailable while on-chain receipt verification is being upgraded.'
