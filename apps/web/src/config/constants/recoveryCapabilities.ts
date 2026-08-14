/**
 * Fail-closed switches for money-moving paths under the controlled recovery.
 * A capability may be enabled only after its receipt/economic invariants pass the
 * certification ladder defined in recovery/program.json.
 */
export const RECOVERY_CAPABILITIES = {
  separateSmartSwapProtocolFee: false,
  /** Direct BNB/ERC-20 settlement is enabled only with canonical RPC receipt verification. */
  commercialPaymentActivation: true,
  /** Canonical BNB factory bytecode, fee/treasury reads and receipt invariants are certified. */
  createTokenExecution: true,
} as const

export const RECOVERY_PAYMENT_UNAVAILABLE =
  'Payments are temporarily unavailable while on-chain receipt verification is being upgraded.'
