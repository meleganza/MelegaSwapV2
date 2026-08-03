/**
 * Canonical DEX economic authority — single source of truth for fee beneficiary
 * and Treasury Runtime decommission status.
 *
 * Treasury Runtime has no authority in Melega DEX. Do not present the beneficiary
 * wallet as a runtime, signer, custodian, or execution controller.
 */

import { MELEGA_TREASURY_BSC } from 'lib/bsc-indexer/constants'

export const MELEGA_TREASURY_WALLET_ADDRESS = MELEGA_TREASURY_BSC

export const MELEGA_TREASURY_WALLET_LABEL = 'MELEGA TREASURY WALLET' as const

export const DEX_ECONOMIC_AUTHORITY = {
  schema: 'melega.dex.economic-authority.v1',
  beneficiaryLabel: MELEGA_TREASURY_WALLET_LABEL,
  beneficiaryAddress: MELEGA_TREASURY_WALLET_ADDRESS,
  /** Short display form for UI (checksummed truncated). */
  beneficiaryAddressShort: `${MELEGA_TREASURY_WALLET_ADDRESS.slice(0, 6)}…${MELEGA_TREASURY_WALLET_ADDRESS.slice(-4)}`,
  treasuryRuntime: {
    status: 'DECOMMISSIONED' as const,
    authority: 'NONE' as const,
    runtime_dependency: false,
    replacement_beneficiary: MELEGA_TREASURY_WALLET_ADDRESS,
  },
  /** Chains where the canonical beneficiary applies for DEX-owned application fees. */
  chainIdsSupported: [56, 8453, 137, 1, 42161] as const,
  /** Testnet-only collectors remain documented separately; never substitute for mainnet. */
  testnetOnlyNote:
    'Chain 97 may use a published testnet collector; mainnet beneficiary is always MELEGA_TREASURY_WALLET.',
  executionModel: 'Non-custodial wallet transaction' as const,
} as const

export type DexEconomicAuthority = typeof DEX_ECONOMIC_AUTHORITY

export function getDexEconomicAuthority(): DexEconomicAuthority {
  return DEX_ECONOMIC_AUTHORITY
}

export function isTreasuryRuntimeDecommissioned(): boolean {
  return DEX_ECONOMIC_AUTHORITY.treasuryRuntime.status === 'DECOMMISSIONED'
}

export function isCanonicalBeneficiary(address: string | null | undefined): boolean {
  if (!address || !address.startsWith('0x')) return false
  return address.toLowerCase() === MELEGA_TREASURY_WALLET_ADDRESS.toLowerCase()
}

/** Mainnet (56) and Base (8453) resolve to the canonical wallet (native gas asset differs). */
export function resolveCanonicalFeeBeneficiary(chainId: number): {
  label: typeof MELEGA_TREASURY_WALLET_LABEL
  address: string
  source: 'dex-economic-authority'
} | null {
  if ((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(chainId)) {
    return {
      label: MELEGA_TREASURY_WALLET_LABEL,
      address: MELEGA_TREASURY_WALLET_ADDRESS,
      source: 'dex-economic-authority',
    }
  }
  return null
}
