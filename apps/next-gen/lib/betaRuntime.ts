/**
 * NG001 runtime. Every switch stays off.
 * A later mission may not enable one without changing this module and its test.
 */
export const BETA_RUNTIME = {
  surface: 'next-gen-beta',
  schedulers: 'disabled',
  backgroundPolling: 'disabled',
  canonicalReads: 'disabled',
  rpc: 'disabled',
  wallet: 'disabled',
  quotes: 'disabled',
  transactions: 'disabled',
  feeCollection: 'disabled',
} as const

export type BetaFlag = keyof typeof BETA_RUNTIME

export function assertBetaDark(): void {
  const offenders = (Object.keys(BETA_RUNTIME) as BetaFlag[]).filter((key) => {
    if (key === 'surface') return BETA_RUNTIME[key] !== 'next-gen-beta'
    return BETA_RUNTIME[key] !== 'disabled'
  })
  if (offenders.length > 0) {
    throw new Error(`Beta runtime is not dark: ${offenders.join(', ')}`)
  }
}
