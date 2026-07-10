import { KRMP_TESTNET_CHAIN_ID } from './registry'

/** True when KERL owns routing authority — DEX must not discover routes. */
export function isKerlRoutingAuthorityEnforced(chainId: number | undefined): boolean {
  return chainId === KRMP_TESTNET_CHAIN_ID
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

/** Constitutional authority matrix for KRMP testnet audit. */
export function buildKrmpAuthorityMatrix(chainId: number): AuthorityMatrixRow[] {
  const kerlEnforced = isKerlRoutingAuthorityEnforced(chainId)
  return [
    {
      domain: 'routing',
      constitutionalOwner: 'KERL',
      actualOwner: kerlEnforced ? 'KERL' : 'DEX',
      compliant: kerlEnforced,
    },
    {
      domain: 'execution',
      constitutionalOwner: 'DEX',
      actualOwner: 'DEX',
      compliant: true,
    },
    {
      domain: 'execution_enforcement',
      constitutionalOwner: 'Wrapper',
      actualOwner: kerlEnforced ? 'Wrapper' : 'DEX (direct router)',
      compliant: kerlEnforced,
    },
    {
      domain: 'settlement',
      constitutionalOwner: 'Treasury Runtime',
      actualOwner: 'Treasury Runtime',
      compliant: true,
    },
    {
      domain: 'settlement_attestation',
      constitutionalOwner: 'KERL',
      actualOwner: kerlEnforced ? 'KERL' : 'DEX (bypass)',
      compliant: kerlEnforced,
    },
  ]
}

export function isKrmpAuthorityCompliant(chainId: number): boolean {
  return buildKrmpAuthorityMatrix(chainId).every((row) => row.compliant)
}
