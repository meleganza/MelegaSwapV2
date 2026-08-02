import { MELEGA_TREASURY_WALLET_LABEL } from 'config/dexEconomicAuthority'
import { KRMP_TESTNET_CHAIN_ID } from './registry'

/**
 * KERL routing authority — DECOMMISSIONED.
 * Historical KRMP testnet (97) enforcement is archived; Smart Swap always uses
 * Melega / Pancake smart-router discovery on every chain.
 */
export const KERL_ROUTING_AUTHORITY_DECOMMISSIONED = true as const

/** True when KERL owns routing authority — always false after decommission. */
export function isKerlRoutingAuthorityEnforced(_chainId: number | undefined): boolean {
  return false
}

export function isKrmpTestnetOperationalChain(chainId: number | undefined): boolean {
  return chainId === KRMP_TESTNET_CHAIN_ID
}

export interface AuthorityMatrixRow {
  domain: string
  constitutionalOwner: string
  actualOwner: string
  compliant: boolean
}

/** Post-decommission authority matrix — DEX owns routing/execution on all chains. */
export function buildKrmpAuthorityMatrix(chainId: number): AuthorityMatrixRow[] {
  const kerlEnforced = isKerlRoutingAuthorityEnforced(chainId)
  return [
    {
      domain: 'routing',
      constitutionalOwner: 'DEX (Smart Swap)',
      actualOwner: kerlEnforced ? 'KERL' : 'DEX',
      compliant: !kerlEnforced,
    },
    {
      domain: 'execution',
      constitutionalOwner: 'DEX',
      actualOwner: 'DEX',
      compliant: true,
    },
    {
      domain: 'execution_enforcement',
      constitutionalOwner: 'DEX (direct router)',
      actualOwner: kerlEnforced ? 'Wrapper' : 'DEX (direct router)',
      compliant: !kerlEnforced,
    },
    {
      domain: 'settlement',
      constitutionalOwner: MELEGA_TREASURY_WALLET_LABEL,
      actualOwner: 'DECOMMISSIONED',
      compliant: true,
    },
    {
      domain: 'settlement_attestation',
      constitutionalOwner: 'DEX (no KERL)',
      actualOwner: kerlEnforced ? 'KERL' : 'DEX (bypass)',
      compliant: !kerlEnforced,
    },
  ]
}

export function isKrmpAuthorityCompliant(chainId: number): boolean {
  return buildKrmpAuthorityMatrix(chainId).every((row) => row.compliant)
}
