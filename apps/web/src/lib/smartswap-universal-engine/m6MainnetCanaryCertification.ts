/**
 * Immutable M6 BNB mainnet canary proof.
 * Exact-path FEE_VERIFIED only. Does not activate V2 globally.
 */

import { PROTOCOL_FEE_STATE, type ProtocolFeeFact } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { FIRST_CANARY_PAIR } from './m5CanaryPackage'
import { SMARTSWAP_REVENUE_POLICY_V1 } from './revenuePolicy'

const V2_M6_FEE_VERIFIED_FORBIDDEN = 'V2_M6_FEE_VERIFIED_FORBIDDEN'

export const M6_BNB_MAINNET_CANARY_CERTIFIED =
  'MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M6_BNB_MAINNET_CANARY_CERTIFIED' as const

export const M6_BNB_MAINNET_CANARY_PROOF = {
  createTx: '0x3f9d56f0e0d1094a304ed66d256db2e3e55539ae022128e8be7d2ca4d6664b70',
  setRouterTx: '0xbc9b4f30c7aca55679a6002d2c4ac3b56a969d498cd0e97ab37dc917e4fcdbbc',
  approvalTx: '0x25b28862e960a0e1606c97279c797ba34af0c4cd7301cf677b319b0a763f41e1',
  canaryTx: '0x5c0ded0d0381529d8c4d6edcde2e34f0360d4f8b1a60969e92ab7ae09fb9a4fd',
  executor: '0x296015b106F4b2FB94249cf398cbF05d4CcE0391',
  treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  deployer: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
  chainId: 56,
  venueId: 'pancakeswap' as const,
  router: FIRST_CANARY_PAIR.router,
  inputAsset: FIRST_CANARY_PAIR.input,
  outputAsset: FIRST_CANARY_PAIR.output,
  pair: FIRST_CANARY_PAIR.pair,
  inputAmountWbnb: '10000000000000000',
  feeAmountWbnb: '20000000000000',
  venueInputWbnb: '9980000000000000',
  userOutUsdt: '6946714420281522671',
  minUserOutUsdt: '6902565143504913705',
  structuralBps: 25,
  smartSwapFeeBps: 20,
  intentNonce: 1,
  intentNonceConsumedOnce: true,
  usedNonce0: false,
  trappedBnbWei: '0',
  trappedWbnbWei: '0',
  trappedUsdtWei: '0',
  createBlock: 117392440,
  setRouterBlock: 117988109,
  approvalBlock: 117991454,
  canaryBlock: 117993157,
  createNonce: 3194,
  setRouterNonce: 3202,
  approvalNonce: 3203,
  canaryNonce: 3204,
  approvalAmountWbnb: '10000000000000000',
  approvalUnlimited: false,
  intentHash: '0xcd59541eb34973bb4ce19d6f27b0ef282a3791a0e78ca7ab57d5177b70bd4f9b',
  policyId: SMARTSWAP_REVENUE_POLICY_V1.id,
} as const

export type M6ExactPathProofInput = {
  createTx: string
  setRouterTx: string
  approvalTx: string
  canaryTx: string
  executor: string
  treasury: string
  feeAmountWbnb: string
  venueInputWbnb: string
  userOutUsdt: string
  structuralBps: number
  smartSwapFeeBps: number
  intentNonce: number
}

function sameHex(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

export function exactM6MainnetProofMatches(input: M6ExactPathProofInput): boolean {
  const proof = M6_BNB_MAINNET_CANARY_PROOF
  return (
    sameHex(input.createTx, proof.createTx) &&
    sameHex(input.setRouterTx, proof.setRouterTx) &&
    sameHex(input.approvalTx, proof.approvalTx) &&
    sameHex(input.canaryTx, proof.canaryTx) &&
    sameHex(input.executor, proof.executor) &&
    sameHex(input.treasury, proof.treasury) &&
    input.feeAmountWbnb === proof.feeAmountWbnb &&
    input.venueInputWbnb === proof.venueInputWbnb &&
    input.userOutUsdt === proof.userOutUsdt &&
    input.structuralBps === proof.structuralBps &&
    input.smartSwapFeeBps === proof.smartSwapFeeBps &&
    input.intentNonce === proof.intentNonce
  )
}

export function classifyM6ExactPathFeeState(input: M6ExactPathProofInput): typeof PROTOCOL_FEE_STATE.FEE_VERIFIED {
  if (!exactM6MainnetProofMatches(input)) {
    throw new Error(V2_M6_FEE_VERIFIED_FORBIDDEN)
  }
  return PROTOCOL_FEE_STATE.FEE_VERIFIED
}

/** Exact M6 path only. collectionProven does not authorize production cutover. */
export function exactM6PathFeeFact(): ProtocolFeeFact {
  const proof = M6_BNB_MAINNET_CANARY_PROOF
  return {
    state: PROTOCOL_FEE_STATE.FEE_VERIFIED,
    bps: proof.smartSwapFeeBps,
    formulaId: proof.policyId,
    amountRaw: proof.feeAmountWbnb,
    assetSymbol: 'WBNB',
    recipient: proof.treasury,
    collectionProven: true,
    atomicWithSwap: true,
    productionExecutionEligible: false,
    gapCode: null,
  }
}

export function m6CanaryCertifiedComplete(): boolean {
  return (
    M6_BNB_MAINNET_CANARY_PROOF.intentNonceConsumedOnce &&
    M6_BNB_MAINNET_CANARY_PROOF.trappedBnbWei === '0' &&
    M6_BNB_MAINNET_CANARY_PROOF.trappedWbnbWei === '0' &&
    M6_BNB_MAINNET_CANARY_PROOF.trappedUsdtWei === '0' &&
    BigInt(M6_BNB_MAINNET_CANARY_PROOF.userOutUsdt) >= BigInt(M6_BNB_MAINNET_CANARY_PROOF.minUserOutUsdt)
  )
}
