/**
 * Avalanche V2 Router Founder deploy gates — chain 43114 only.
 * Does not alter BNB Smart Chain Founder gates (FOUNDER_DEPLOY_CHAIN_ID = 56).
 */
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  isAuthorizedMelegaDeployer,
  normalizeAddress,
} from './founderDeployer'
import { AVAX_ROUTER_CHAIN_ID } from './founderAvalancheRouterArtifacts'

export type AvaxRouterDeployGateCode =
  | 'FOUNDER_WALLET_CONNECTED'
  | 'AUTHORIZED_DEPLOYER_MATCH'
  | 'CHAIN_43114'
  | 'ARTIFACT_VALID'
  | 'CONSTRUCTOR_VALID'
  | 'FOUNDER_SIGNATURE_REQUIRED'
  | 'WRONG_WALLET'
  | 'WRONG_CHAIN'
  | 'ARTIFACT_INVALID'
  | 'CONSTRUCTOR_INVALID'
  | 'WALLET_DISCONNECTED'

export type AvaxRouterDeployGateResult = {
  ok: boolean
  deployEnabled: boolean
  codes: AvaxRouterDeployGateCode[]
  blockers: string[]
  expectedDeployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  connectedWallet: string | null
  chainId: number | null
  message: string | null
  statusLabel: 'READY FOR FOUNDER SIGNATURE' | 'NOT READY'
}

export function assessAvalancheRouterDeployGates(input: {
  connectedWallet: string | null | undefined
  chainId: number | null | undefined
  artifactValid: boolean
  constructorValid: boolean
}): AvaxRouterDeployGateResult {
  const codes: AvaxRouterDeployGateCode[] = []
  const blockers: string[] = []
  const connected = normalizeAddress(input.connectedWallet)
  const chainId = input.chainId ?? null

  if (!connected) {
    codes.push('WALLET_DISCONNECTED')
    blockers.push('Connect the authorized MELEGA DEPLOYER.')
  } else {
    codes.push('FOUNDER_WALLET_CONNECTED')
    if (!isAuthorizedMelegaDeployer(connected)) {
      codes.push('WRONG_WALLET')
      blockers.push('Connect the authorized MELEGA DEPLOYER.')
    } else {
      codes.push('AUTHORIZED_DEPLOYER_MATCH')
    }
  }

  if (chainId !== AVAX_ROUTER_CHAIN_ID) {
    codes.push('WRONG_CHAIN')
    blockers.push('Switch to Avalanche C-Chain (43114).')
  } else {
    codes.push('CHAIN_43114')
  }

  if (!input.artifactValid) {
    codes.push('ARTIFACT_INVALID')
    blockers.push('Contract artifact checksum does not match certified source.')
  } else {
    codes.push('ARTIFACT_VALID')
  }

  if (!input.constructorValid) {
    codes.push('CONSTRUCTOR_INVALID')
    blockers.push('Constructor arguments failed validation.')
  } else {
    codes.push('CONSTRUCTOR_VALID')
  }

  const ok =
    codes.includes('AUTHORIZED_DEPLOYER_MATCH') &&
    codes.includes('CHAIN_43114') &&
    codes.includes('ARTIFACT_VALID') &&
    codes.includes('CONSTRUCTOR_VALID')

  if (ok) codes.push('FOUNDER_SIGNATURE_REQUIRED')

  return {
    ok,
    deployEnabled: ok,
    codes,
    blockers,
    expectedDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    connectedWallet: connected,
    chainId,
    message: ok ? null : blockers[0] ?? 'Deployment not ready.',
    statusLabel: ok ? 'READY FOR FOUNDER SIGNATURE' : 'NOT READY',
  }
}
