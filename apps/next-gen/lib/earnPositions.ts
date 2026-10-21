/**
 * Receipt balances for the listed Beefy vaults only.
 * A missing receipt token is unsupported. A failed read is unavailable. Zero is a real zero.
 */
import type { EarnCatalog, EarnOpportunity } from './earnCatalog'

export const MAX_EARN_POSITION_RPC = 14

export interface EarnPositionRow {
  id: string
  assets: string[]
  href: string
  status: 'balance' | 'unsupported' | 'unavailable'
  raw: string | null
  display: string | null
}

export interface EarnPositions {
  ok: boolean
  code?: 'CHAIN_MISMATCH' | 'ADDRESS_REJECTED' | 'TIMEOUT' | 'UNAVAILABLE'
  chainId: 56 | null
  address: string | null
  executable: false
  deposit: false
  withdraw: false
  rpcCalls: number
  rows: EarnPositionRow[]
}

export function emptyPositions(code: EarnPositions['code'], rpcCalls = 0): EarnPositions {
  return {
    ok: false,
    code,
    chainId: code === 'CHAIN_MISMATCH' ? null : 56,
    address: null,
    executable: false,
    deposit: false,
    withdraw: false,
    rpcCalls,
    rows: [],
  }
}

export function listedReceipts(catalog: EarnCatalog): Array<EarnOpportunity & { receiptAddress: string }> {
  if (!catalog.ok) return []
  return catalog.opportunities.filter((row): row is EarnOpportunity & { receiptAddress: string } => row.receiptAddress !== null)
}

export function unsupportedRows(catalog: EarnCatalog): EarnPositionRow[] {
  if (!catalog.ok) return []
  return catalog.opportunities
    .filter((row) => row.receiptAddress === null)
    .map((row) => ({
      id: row.id,
      assets: row.assets,
      href: row.href,
      status: 'unsupported',
      raw: null,
      display: null,
    }))
}
