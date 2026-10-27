/**
 * NG001 runtime. Every switch stays off.
 * A later mission may not enable one without changing this module and its test.
 */
export const BETA_RUNTIME = {
  surface: 'next-gen-beta',
  schedulers: 'disabled',
  backgroundPolling: 'disabled',
  canonicalReads: 'read-only-on-request',
  rpc: 'read-only-on-request',
  wallet: 'identity-read-only',
  quotes: 'read-only-on-request',
  transactions: 'disabled',
  feeCollection: 'disabled',
} as const

export type BetaFlag = keyof typeof BETA_RUNTIME

export function assertBetaDark(): void {
  const offenders = (Object.keys(BETA_RUNTIME) as BetaFlag[]).filter((key) => {
    if (key === 'surface') return BETA_RUNTIME[key] !== 'next-gen-beta'
    if (key === 'quotes' || key === 'canonicalReads' || key === 'rpc') return BETA_RUNTIME[key] !== 'read-only-on-request'
    if (key === 'wallet') return BETA_RUNTIME[key] !== 'identity-read-only'
    return BETA_RUNTIME[key] !== 'disabled'
  })
  if (offenders.length > 0) {
    throw new Error(`Beta runtime is not dark: ${offenders.join(', ')}`)
  }
}
