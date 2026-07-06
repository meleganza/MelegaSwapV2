import type { DexAuthorityBoundaries } from './schemas/types'
import { DEX_DELEGATED_AUTHORITIES, DEX_FORBIDDEN_AUTHORITIES } from './constants'

export const DEX_AUTHORITY_BOUNDARIES: DexAuthorityBoundaries = {
  owns: [
    'Civilization Liquidity',
    'routing-to-liquidity',
    'exchange efficiency',
    'swap/LP execution quality',
    'exchange/liquidity machine surfaces',
    'execution evidence',
    'exchange receipts to Treasury',
  ],
  delegated: [...DEX_DELEGATED_AUTHORITIES],
  forbidden: [...DEX_FORBIDDEN_AUTHORITIES],
  receiptOnlySettlement: true,
}

export function buildProvenance(): { module: 'dex-gravity'; kap: 'KAP-006C'; emittedAt: string } {
  return {
    module: 'dex-gravity',
    kap: 'KAP-006C',
    emittedAt: new Date().toISOString(),
  }
}
