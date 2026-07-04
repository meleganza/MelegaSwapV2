/** Client posts to same-origin proxy — server forwards to Treasury Runtime. */
export const TREASURY_HANDOFF_API_PATH = '/api/treasury/settlement-events'

export function getTreasuryRuntimeUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.TREASURY_RUNTIME_URL || env.NEXT_PUBLIC_TREASURY_RUNTIME_URL || undefined
}

export function isTreasuryRuntimeConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(getTreasuryRuntimeUrlFromEnv(env))
}

export function getTreasuryRuntimePublicEndpoint(env: NodeJS.ProcessEnv = process.env): string {
  const base = getTreasuryRuntimeUrlFromEnv(env)
  if (!base) return ''
  return `${base.replace(/\/$/, '')}/api/public/treasury/settlement-events`
}
