export type ProtocolSourceType = 'amm' | 'masterchef' | 'smartchef'

/** Canonical protocol activity row — merge output only, no display formatting. */
export interface CanonicalProtocolActivityRow {
  chainId: number
  sourceType: ProtocolSourceType
  eventType: string
  transactionHash: string
  logIndex: number
  blockNumber: number
  timestamp: number
  wallet?: string
  contractAddress?: string
  pairOrPoolIdentity?: string
  assetAddresses?: string[]
  resolvedSymbols?: string[]
  amounts?: string[]
  explorerUrl: string
}

export interface MergeProtocolActivitySources {
  amm?: readonly CanonicalProtocolActivityRow[]
  masterchef?: readonly CanonicalProtocolActivityRow[]
  smartchef?: readonly CanonicalProtocolActivityRow[]
}

export interface MergeProtocolActivityResult {
  rows: CanonicalProtocolActivityRow[]
  duplicatesRemoved: number
}

export function protocolActivityDedupKey(row: {
  chainId: number
  transactionHash: string
  logIndex: number
}): string {
  return `${row.chainId}:${row.transactionHash.toLowerCase()}:${row.logIndex}`
}

function compareNewestFirst(a: CanonicalProtocolActivityRow, b: CanonicalProtocolActivityRow): number {
  if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp
  if (b.blockNumber !== a.blockNumber) return b.blockNumber - a.blockNumber
  return b.logIndex - a.logIndex
}

/**
 * Merge AMM, MasterChef, and SmartChef canonical events.
 * Deduplicates strictly by chainId + transactionHash + logIndex.
 * Returns canonical rows only, sorted newest first.
 */
export function mergeCanonicalProtocolActivity(
  sources: MergeProtocolActivitySources,
): MergeProtocolActivityResult {
  const seen = new Set<string>()
  const merged: CanonicalProtocolActivityRow[] = []
  let duplicatesRemoved = 0

  const ingest = (row: CanonicalProtocolActivityRow) => {
    const key = protocolActivityDedupKey(row)
    if (seen.has(key)) {
      duplicatesRemoved += 1
      return
    }
    seen.add(key)
    merged.push(row)
  }

  for (const row of sources.amm ?? []) ingest(row)
  for (const row of sources.masterchef ?? []) ingest(row)
  for (const row of sources.smartchef ?? []) ingest(row)

  merged.sort(compareNewestFirst)

  return { rows: merged, duplicatesRemoved }
}
