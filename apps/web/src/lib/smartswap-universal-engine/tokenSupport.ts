export const TOKEN_EXECUTION_CLASS = {
  STANDARD_ERC20: 'STANDARD_ERC20',
  NATIVE: 'NATIVE',
  WRAPPED_NATIVE: 'WRAPPED_NATIVE',
  UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION: 'UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION',
} as const

export type TokenExecutionClass = (typeof TOKEN_EXECUTION_CLASS)[keyof typeof TOKEN_EXECUTION_CLASS]

export const UNSUPPORTED_TOKEN_KIND = {
  FEE_ON_TRANSFER: 'fee-on-transfer',
  REBASING: 'rebasing',
  REFLECTION: 'reflection',
  CALLBACK_HOOK: 'callback/hook-heavy',
  UNUSUAL_APPROVE: 'unusual-approve',
} as const

export function classifyTokenForFeeEnforcedExecution(input: {
  feeOnTransfer?: boolean
  rebasing?: boolean
  reflection?: boolean
  callbackHooks?: boolean
  unusualApprove?: boolean
  native?: boolean
  wrappedNative?: boolean
}): TokenExecutionClass {
  if (input.feeOnTransfer || input.rebasing || input.reflection || input.callbackHooks || input.unusualApprove) {
    return TOKEN_EXECUTION_CLASS.UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION
  }
  if (input.native) return TOKEN_EXECUTION_CLASS.NATIVE
  if (input.wrappedNative) return TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE
  return TOKEN_EXECUTION_CLASS.STANDARD_ERC20
}

export function assertTokenSupported(tokenClass: TokenExecutionClass): void {
  if (tokenClass === TOKEN_EXECUTION_CLASS.UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION) {
    throw new Error('UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION')
  }
}
