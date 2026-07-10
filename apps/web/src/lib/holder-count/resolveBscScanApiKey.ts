export type BscScanApiKeySource =
  | 'NEXT_PUBLIC_BSCSCAN_API_KEY'
  | 'NEXT_PUBLIC_BSCSAN_API_KEY'
  | 'none'

export interface ResolvedBscScanApiKey {
  apiKey?: string
  source: BscScanApiKeySource
  /** True when legacy typo env var is used — rename to NEXT_PUBLIC_BSCSCAN_API_KEY in Vercel. */
  typoAliasUsed: boolean
}

/**
 * Resolves BscScan API key from env.
 * Canonical: NEXT_PUBLIC_BSCSCAN_API_KEY
 * Migration: NEXT_PUBLIC_BSCSAN_API_KEY (typo — remove after Vercel rename)
 */
export function resolveBscScanApiKey(): ResolvedBscScanApiKey {
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
