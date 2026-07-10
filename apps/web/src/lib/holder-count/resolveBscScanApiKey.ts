export type BscScanApiKeySource =
  | 'BSCSCAN_API_KEY'
  | 'NEXT_PUBLIC_BSCSCAN_API_KEY'
  | 'NEXT_PUBLIC_BSCSAN_API_KEY'
  | 'none'

export interface ResolvedBscScanApiKey {
  apiKey?: string
  source: BscScanApiKeySource
  /** True when legacy typo env var is used — rename to BSCSCAN_API_KEY in Vercel. */
  typoAliasUsed: boolean
}

/**
 * Resolves BscScan API key from env (server-side preferred).
 * Canonical production: BSCSCAN_API_KEY
 * Legacy browser: NEXT_PUBLIC_BSCSCAN_API_KEY
 */
export function resolveBscScanApiKey(): ResolvedBscScanApiKey {
  const server = process.env.BSCSCAN_API_KEY?.trim()
  if (server) {
    return { apiKey: server, source: 'BSCSCAN_API_KEY', typoAliasUsed: false }
  }

  const canonical = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY?.trim()
  if (canonical) {
    return { apiKey: canonical, source: 'NEXT_PUBLIC_BSCSCAN_API_KEY', typoAliasUsed: false }
  }

  const typo = process.env.NEXT_PUBLIC_BSCSAN_API_KEY?.trim()
  if (typo) {
    return { apiKey: typo, source: 'NEXT_PUBLIC_BSCSAN_API_KEY', typoAliasUsed: true }
  }

  return { source: 'none', typoAliasUsed: false }
}
