/**
 * Shared production-authority probe — reads env only, never secrets.
 * Do not print key material; only SET/UNSET.
 */

const AUTHORITY_KEYS = [
  'MAINNET_DEPLOYER',
  'AWS_KMS_KEY_ID',
  'BNB_MAINNET_RPC_URL',
  'BSCSCAN_API_KEY',
  'LB_MAINNET_DEPLOY_AUTHORIZED',
  'CT_MAINNET_DEPLOY_AUTHORIZED',
  'PFF_MAINNET_DEPLOY_AUTHORIZED',
  'LB_PRODUCTION_AUTHORITY',
] as const

function present(key: string): boolean {
  const v = process.env[key]
  return typeof v === 'string' && v.trim().length > 0 && v !== '0' && v.toLowerCase() !== 'false'
}

export function probeProductionAuthority(): {
  productionAuthorityPresent: boolean
  blockers: string[]
  env: Record<string, 'SET' | 'UNSET'>
} {
  const env: Record<string, 'SET' | 'UNSET'> = {}
  for (const key of AUTHORITY_KEYS) {
    env[key] = present(key) ? 'SET' : 'UNSET'
  }

  const blockers: string[] = []
  if (env.MAINNET_DEPLOYER === 'UNSET') blockers.push('Missing deploy authorization (MAINNET_DEPLOYER)')
  if (env.AWS_KMS_KEY_ID === 'UNSET') blockers.push('Missing KMS (AWS_KMS_KEY_ID)')
  if (env.BNB_MAINNET_RPC_URL === 'UNSET') blockers.push('Missing RPC (BNB_MAINNET_RPC_URL)')
  if (env.BSCSCAN_API_KEY === 'UNSET') blockers.push('Missing BscScan verification (BSCSCAN_API_KEY)')
  if (env.LB_MAINNET_DEPLOY_AUTHORIZED === 'UNSET') {
    blockers.push('Missing deploy authorization (LB_MAINNET_DEPLOY_AUTHORIZED)')
  }
  if (env.CT_MAINNET_DEPLOY_AUTHORIZED === 'UNSET') {
    blockers.push('Missing deploy authorization (CT_MAINNET_DEPLOY_AUTHORIZED)')
  }
  if (env.PFF_MAINNET_DEPLOY_AUTHORIZED === 'UNSET') {
    blockers.push('Missing deploy authorization (PFF_MAINNET_DEPLOY_AUTHORIZED)')
  }

  // Authority is "present" only when shared deployer + RPC + KMS + at least one system flag is set.
  const productionAuthorityPresent =
    env.MAINNET_DEPLOYER === 'SET' &&
    env.BNB_MAINNET_RPC_URL === 'SET' &&
    env.AWS_KMS_KEY_ID === 'SET' &&
    (env.LB_MAINNET_DEPLOY_AUTHORIZED === 'SET' ||
      env.CT_MAINNET_DEPLOY_AUTHORIZED === 'SET' ||
      env.PFF_MAINNET_DEPLOY_AUTHORIZED === 'SET')

  return { productionAuthorityPresent, blockers, env }
}
