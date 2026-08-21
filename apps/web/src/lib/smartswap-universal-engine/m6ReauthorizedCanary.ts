/**
 * M6 reauthorized canary. Previous M6 grant targeted superseded M5 hashes and is not reused.
 * Founder reauthorization is present for the deterministic artifact. Agent cannot sign as the
 * canonical deployer, so broadcast stays forbidden and the unsigned CREATE package is frozen.
 */

import { DETERMINISTIC_BYTECODE } from './executorDeterministicArtifact'
import { PROTOCOL_FEE_STATE } from './fee'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from './m4OperatingState'

export const M6_REAUTHORIZED_VERDICT = {
  AWAITING_FOUNDER_REAUTHORIZATION: 'MELEGASWAP_V2_SMARTSWAP_M6_AWAITING_FOUNDER_REAUTHORIZATION',
  UNSIGNED_DEPLOYMENT_PACKAGE_READY: 'MELEGASWAP_V2_SMARTSWAP_M6_UNSIGNED_DEPLOYMENT_PACKAGE_READY',
  BLOCKED_ARTIFACT_DRIFT: 'MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_ARTIFACT_DRIFT',
  BLOCKED_SIGNER_MISMATCH: 'MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_SIGNER_MISMATCH',
  BLOCKED_INSUFFICIENT_FUNDS: 'MELEGASWAP_V2_SMARTSWAP_M6_BLOCKED_INSUFFICIENT_FUNDS',
  DEPLOYMENT_CERTIFICATION_FAILED: 'MELEGASWAP_V2_SMARTSWAP_M6_EXECUTOR_DEPLOYMENT_CERTIFICATION_FAILED',
  CANARY_FAILED: 'MELEGASWAP_V2_SMARTSWAP_M6_BNB_MAINNET_CANARY_FAILED',
  CERTIFIED: 'MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M6_BNB_MAINNET_CANARY_CERTIFIED',
} as const

/** Prior M6 Founder grant applied to unreproducible M5 hashes. Do not reuse. */
export const PRIOR_M6_AUTHORIZATION = {
  reusable: false,
  target: 'SUPERSEDED_UNREPRODUCIBLE_ARTIFACT',
  creationKeccak: '0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c',
  deployedKeccak: '0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3',
} as const

export const REQUIRED_REAUTHORIZATION_SCOPE = {
  creationKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
  deployedKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
  chain: 'BNB Smart Chain',
  chainId: 56,
  treasury: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
  deployer: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
  venue: 'pancakeswap',
  route: 'WBNB→USDT',
  maxInputWei: '10000000000000000',
  oneCanary: true,
  noAutomaticRetry: true,
} as const

export const FRESH_FOUNDER_REAUTHORIZATION = {
  present: true,
  source: 'FOUNDER REAUTHORIZATION — SMARTSWAP M6 DETERMINISTIC MAINNET CANARY',
  explicitAuthorize: true,
  namesCreationKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
  namesDeployedKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
  evidenceCommitAtGrant: '33fe0062401d813e601054732d1a0ab3c0b78f81',
} as const

export function freshFounderReauthorizationPresent(input: {
  explicitAuthorize: boolean
  namesCreationKeccak: string
  namesDeployedKeccak: string
}): boolean {
  if (!input.explicitAuthorize) return false
  return (
    input.namesCreationKeccak.toLowerCase() === REQUIRED_REAUTHORIZATION_SCOPE.creationKeccak &&
    input.namesDeployedKeccak.toLowerCase() === REQUIRED_REAUTHORIZATION_SCOPE.deployedKeccak
  )
}

export const M6_UNSIGNED_CREATE = {
  nonce: 3194,
  expectedAddressIfNonce3194: '0x296015b106F4b2FB94249cf398cbF05d4CcE0391',
  dataKeccak: '0xb1c93b60890386532429a93495c3e5f3be87600096646cb1e3da7032db84a1fe',
  package: 'deployments/mainnet/m6-unsigned-create-tx.json',
  dataFile: 'deployments/mainnet/m6-unsigned-create.data.hex',
  expectedOnChainRuntimeKeccak: '0xd241f1e4dba3a04ed2f17f2d338db37e6adb9235a7de7e658554170a95885801',
  runtimeTemplateKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
  intentSigner: REQUIRED_REAUTHORIZATION_SCOPE.deployer,
  owner: REQUIRED_REAUTHORIZATION_SCOPE.deployer,
} as const

export const M6_REAUTHORIZED_ACTIVE_VERDICT = M6_REAUTHORIZED_VERDICT.UNSIGNED_DEPLOYMENT_PACKAGE_READY

export const M6_REAUTHORIZED_BROADCAST = {
  deploy: false,
  approval: false,
  swap: false,
  signMainnet: false,
} as const

export const M6_REAUTHORIZED_FEE_STATE = {
  before: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
  after: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
} as const

export function m6ReauthorizedLegacyProduction(): boolean {
  return ACTIVE_V2_ROLLOUT === V2_ROLLOUT_STATE.LEGACY_PRODUCTION
}
