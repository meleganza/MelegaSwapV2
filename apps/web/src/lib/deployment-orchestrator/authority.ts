/**
 * Production deployment authority — Founder wallet model.
 * Supersedes AWS KMS / server-side MAINNET_DEPLOYER signing for permanent platform deploys.
 *
 * Optional env (non-mandatory for Founder-signed deploy):
 * - BNB_MAINNET_RPC_URL — read/gas/receipt polling
 * - BSCSCAN_API_KEY — automated verification only (VERIFICATION_PENDING if unset)
 */

import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'

const OPTIONAL_KEYS = ['BNB_MAINNET_RPC_URL', 'BSCSCAN_API_KEY'] as const

/** Historical keys — no longer mandatory blockers. Recorded as superseded. */
export const SUPERSEDED_KMS_AUTHORITY_KEYS = [
  'MAINNET_DEPLOYER',
  'AWS_KMS_KEY_ID',
  'LB_PRODUCTION_AUTHORITY',
  'LB_MAINNET_DEPLOY_AUTHORIZED',
  'CT_MAINNET_DEPLOY_AUTHORIZED',
  'PFF_MAINNET_DEPLOY_AUTHORIZED',
] as const

function present(key: string): boolean {
  const v = process.env[key]
  return typeof v === 'string' && v.trim().length > 0 && v !== '0' && v.toLowerCase() !== 'false'
}

export function probeProductionAuthority(): {
  productionAuthorityPresent: boolean
  authorityModel: 'FOUNDER_WALLET_SIGNED'
  authorizedDeployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  blockers: string[]
  env: Record<string, 'SET' | 'UNSET'>
  supersededKmsKeys: readonly string[]
  notes: string[]
} {
  const env: Record<string, 'SET' | 'UNSET'> = {}
  for (const key of OPTIONAL_KEYS) {
    env[key] = present(key) ? 'SET' : 'UNSET'
  }
  for (const key of SUPERSEDED_KMS_AUTHORITY_KEYS) {
    env[key] = present(key) ? 'SET' : 'UNSET'
  }

  // Founder-signed model: authority is the known MELEGA DEPLOYER address.
  // Absence of KMS / server deployer is NOT a blocker.
  const blockers: string[] = []
  // Optional operational hints (not hard blockers for interface readiness)
  const notes: string[] = [
    'Deployment authority is Founder wallet signature via MELEGA DEPLOYER.',
    'AWS KMS and server-side MAINNET_DEPLOYER are superseded and not required.',
  ]
  if (env.BNB_MAINNET_RPC_URL === 'UNSET') {
    notes.push('BNB_MAINNET_RPC_URL unset — wallet provider RPC may be used for broadcast; configure RPC for receipt polling.')
  }
  if (env.BSCSCAN_API_KEY === 'UNSET') {
    notes.push('BSCSCAN_API_KEY unset — automated verification pending; manual BscScan verification allowed.')
  }

  return {
    productionAuthorityPresent: true,
    authorityModel: 'FOUNDER_WALLET_SIGNED',
    authorizedDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    blockers,
    env,
    supersededKmsKeys: SUPERSEDED_KMS_AUTHORITY_KEYS,
    notes,
  }
}
