/**
 * Canonical Founder-signed permanent contract deployment authority.
 * MELEGA DEPLOYER signs one-time platform deploys via connected wallet.
 * No KMS. No server-side signing. No private-key handling.
 */

import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'

/** Canonical one-time platform deployer — Founder connects this wallet. */
export const AUTHORIZED_MELEGA_DEPLOYER =
  '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0' as const

export const FOUNDER_DEPLOY_CHAIN_ID = 56 as const

export const FOUNDER_TREASURY_DESTINATION = MELEGA_TREASURY_FEE_DESTINATION

export type FounderDeployGateCode =
  | 'FOUNDER_WALLET_CONNECTED'
  | 'AUTHORIZED_DEPLOYER_MATCH'
  | 'CHAIN_56'
  | 'ARTIFACT_VALID'
  | 'CONSTRUCTOR_VALID'
  | 'SUBSYSTEM_READY'
  | 'FOUNDER_SIGNATURE_REQUIRED'
  | 'WRONG_WALLET'
  | 'WRONG_CHAIN'
  | 'ARTIFACT_INVALID'
  | 'CONSTRUCTOR_INVALID'
  | 'SUBSYSTEM_NOT_READY'
  | 'WALLET_DISCONNECTED'

export type FounderDeployGateResult = {
  ok: boolean
  deployEnabled: boolean
  codes: FounderDeployGateCode[]
  blockers: string[]
  expectedDeployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  connectedWallet: string | null
  chainId: number | null
  balanceWei: string | null
  message: string | null
}

export function normalizeAddress(address: string | null | undefined): string | null {
  if (!address || typeof address !== 'string') return null
  const a = address.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) return null
  return a.toLowerCase()
}

export function isAuthorizedMelegaDeployer(address: string | null | undefined): boolean {
  const n = normalizeAddress(address)
  return n != null && n === AUTHORIZED_MELEGA_DEPLOYER.toLowerCase()
}

export function assessFounderDeployGates(input: {
  connectedWallet: string | null | undefined
  chainId: number | null | undefined
  balanceWei?: bigint | null | undefined
  artifactValid: boolean
  constructorValid: boolean
  subsystemReady: boolean
}): FounderDeployGateResult {
  const codes: FounderDeployGateCode[] = []
  const blockers: string[] = []
  const connected = normalizeAddress(input.connectedWallet)
  const chainId = input.chainId ?? null
  const balance = input.balanceWei ?? null

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

  if (chainId !== FOUNDER_DEPLOY_CHAIN_ID) {
    codes.push('WRONG_CHAIN')
    blockers.push('Switch to BNB Smart Chain.')
  } else {
    codes.push('CHAIN_56')
  }

  // Funding is decided only by assessFounderGasReadiness after a real estimate.
  // Do not emit INSUFFICIENT_BNB / FUNDING_REQUIRED from a fixed floor here.

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

  if (!input.subsystemReady) {
    codes.push('SUBSYSTEM_NOT_READY')
    blockers.push('Previous subsystem must be validated and bound first.')
  } else {
    codes.push('SUBSYSTEM_READY')
  }

  const ok =
    codes.includes('AUTHORIZED_DEPLOYER_MATCH') &&
    codes.includes('CHAIN_56') &&
    codes.includes('ARTIFACT_VALID') &&
    codes.includes('CONSTRUCTOR_VALID') &&
    codes.includes('SUBSYSTEM_READY')

  if (ok) codes.push('FOUNDER_SIGNATURE_REQUIRED')

  return {
    ok,
    deployEnabled: ok,
    codes,
    blockers,
    expectedDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    connectedWallet: connected,
    chainId,
    balanceWei: balance == null ? null : balance.toString(),
    message: ok ? null : blockers[0] ?? 'Deployment not ready.',
  }
}

/** User operations must never require MELEGA DEPLOYER. */
export function userOperationRequiresMelegaDeployer(_operation: 'create_token' | 'create_farm' | 'liquidity_builder'): false {
  return false
}

/** Only MARCO-reward Pool creation remains a protocol-owner operation. */
export function poolCreationRequiresMelegaDeployer(rewardTokenIsMarco: boolean): boolean {
  return rewardTokenIsMarco
}
