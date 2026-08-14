import { isTreasuryRuntimeDecommissioned } from 'config/dexEconomicAuthority'

/** Same-origin path retained for historical clients — always returns decommissioned. */
export const TREASURY_HANDOFF_API_PATH = '/api/treasury/settlement-events'

export function getTreasuryRuntimeUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  // Obsolete — do not treat as active configuration for DEX readiness.
  return env.TREASURY_RUNTIME_URL || env.NEXT_PUBLIC_TREASURY_RUNTIME_URL || undefined
}

/** Always false — Treasury Runtime is decommissioned and never required. */
export function isTreasuryRuntimeConfigured(_env: NodeJS.ProcessEnv = process.env): boolean {
  return false
}

export function isTreasuryRuntimeActive(): boolean {
  return !isTreasuryRuntimeDecommissioned()
}

/** Upstream endpoint builder — unused; retained for dead-code compatibility. */
export function getTreasuryRuntimePublicEndpoint(env: NodeJS.ProcessEnv = process.env): string {
  const base = getTreasuryRuntimeUrlFromEnv(env)
  if (!base) return ''
  return `${base.replace(/\/$/, '')}/api/public/treasury/settlement-events`
}
