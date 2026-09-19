/**
 * LOCAL/SHADOW-only mapper: SHADOW winner → SmartSwapExecutorV2 ExecutionIntent + path.
 * Local argument construction only. No wallet, provider, or broadcast.
 * Does not reuse V1 signer-bound intent semantics.
 */

import { defaultAbiCoder, Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { assetsEqual } from './assetIdentity'
import {
  MELEGA_DEX_VENUE,
  PANCAKE_SWAP_VENUE,
  PANCAKESWAP_VENUE_ID,
  UNISWAP_VENUE,
  UNISWAP_VENUE_ID,
  type CertifiedEvmVenue,
} from './certifiedVenues'
import { MELEGA_DEX_VENUE_ID } from './melegaDexAdapter'
import { isEvmNetwork } from './domain'
import { computeNetVenueInput, evaluateRevenuePolicy } from './evaluateRevenuePolicy'
import { PROTOCOL_FEE_STATE } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from './operatingMode'
import { quoteIsStale, type SmartSwapRequest } from './quote'
import { FEE_ASSET_SOURCE } from './quoteFee'
import { SMARTSWAP_REVENUE_POLICY_ID, SMARTSWAP_REVENUE_POLICY_VERSION } from './revenuePolicy'
import { assertSingleVenueRoute, SPLIT_ROUTE_FORBIDDEN, type ShadowCandidate } from './shadowCompetition'
import { VENUE_STRUCTURAL_FEE_BPS } from './venueFeeSemantics'

export const V2_INTENT_VERSION = 2 as const
export const V2_NATIVE_ASSET = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const
export const V2_POLICY_ID_HASH = keccak256(toUtf8Bytes(SMARTSWAP_REVENUE_POLICY_ID))
export const V2_POLICY_VERSION_HASH = keccak256(toUtf8Bytes(SMARTSWAP_REVENUE_POLICY_VERSION))

export const EXECUTOR_V2_VENUE_IDS = [MELEGA_DEX_VENUE_ID, PANCAKESWAP_VENUE_ID, UNISWAP_VENUE_ID] as const
export type ExecutorV2VenueId = (typeof EXECUTOR_V2_VENUE_IDS)[number]

export const V2_BINDING_WINNER_MISSING = 'V2_BINDING_WINNER_MISSING' as const
export const V2_BINDING_WINNER_NOT_OK = 'V2_BINDING_WINNER_NOT_OK' as const
export const V2_BINDING_QUOTE_MISSING = 'V2_BINDING_QUOTE_MISSING' as const
export const V2_BINDING_QUOTE_INVALID = 'V2_BINDING_QUOTE_INVALID' as const
export const V2_BINDING_QUOTE_STALE = 'V2_BINDING_QUOTE_STALE' as const
export const V2_BINDING_VENUE_MISMATCH = 'V2_BINDING_VENUE_MISMATCH' as const
export const V2_BINDING_UNSUPPORTED_VENUE = 'V2_BINDING_UNSUPPORTED_VENUE' as const
export const V2_BINDING_ROUTER_MISSING = 'V2_BINDING_ROUTER_MISSING' as const
export const V2_BINDING_ECONOMICS_MISSING = 'V2_BINDING_ECONOMICS_MISSING' as const
export const V2_BINDING_FEE_MISMATCH = 'V2_BINDING_FEE_MISMATCH' as const
export const V2_BINDING_CHAIN_MISMATCH = 'V2_BINDING_CHAIN_MISMATCH' as const
export const V2_BINDING_SPLIT_ROUTE = 'V2_BINDING_SPLIT_ROUTE' as const
export const V2_BINDING_MULTI_HOP_FORBIDDEN = 'V2_BINDING_MULTI_HOP_FORBIDDEN' as const
export const V2_BINDING_INPUT_MISMATCH = 'V2_BINDING_INPUT_MISMATCH' as const
export const V2_BINDING_NET_INPUT_MISMATCH = 'V2_BINDING_NET_INPUT_MISMATCH' as const
export const V2_BINDING_MIN_OUT_MISSING = 'V2_BINDING_MIN_OUT_MISSING' as const
export const V2_BINDING_EXACT_OUT_UNSUPPORTED = 'V2_BINDING_EXACT_OUT_UNSUPPORTED' as const
export const V2_BINDING_USER_INVALID = 'V2_BINDING_USER_INVALID' as const
export const V2_BINDING_DEADLINE_INVALID = 'V2_BINDING_DEADLINE_INVALID' as const
export const V2_BINDING_NONCE_INVALID = 'V2_BINDING_NONCE_INVALID' as const
export const MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE = 'MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE' as const

export interface V2ExecutionIntent {
  version: typeof V2_INTENT_VERSION
  policyId: string
  policyVersion: string
  chainId: number
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  venueId: string
  router: string
  routeHash: string
  feeBps: number
  feeAmount: string
  feeAsset: string
  beneficiary: string
  structuralRouteCostBps: number
  deadline: number
  nonce: string
  nativeIn: boolean
  nativeOut: boolean
}

export interface V2ExecutionBinding {
  intent: V2ExecutionIntent
  path: string[]
  venueIdLabel: ExecutorV2VenueId
  executeArgs: {
    method: 'execute'
    intent: V2ExecutionIntent
    path: string[]
  }
  productionExecutionCapable: false
  productionActivation: false
  productionCutoverAllowed: false
  productionExecutionMode: typeof SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION
  universalEngineMode: typeof SMARTSWAP_OPERATING_MODE.SHADOW
}

export interface BuildV2ExecutionBindingInput {
  request: SmartSwapRequest
  winner: ShadowCandidate | null | undefined
  user: string
  deadline: number
  nonce: string | number
  nowIso?: string
  staleAfterMs?: number
}

function fail(code: string, detail?: string): never {
  throw new Error(detail ? `${code}:${detail}` : code)
}

export function v2VenueIdHash(venueId: string): string {
  return keccak256(toUtf8Bytes(venueId))
}

/** Solidity: keccak256(abi.encode(address[] path, bool nativeIn, bool nativeOut)) */
export function v2RouteHashOf(path: string[], nativeIn: boolean, nativeOut: boolean): string {
  return keccak256(defaultAbiCoder.encode(['address[]', 'bool', 'bool'], [path, nativeIn, nativeOut]))
}

export function certifiedVenueForExecutorV2(venueId: string): CertifiedEvmVenue | null {
  if (venueId === PANCAKESWAP_VENUE_ID) return PANCAKE_SWAP_VENUE
  if (venueId === UNISWAP_VENUE_ID) return UNISWAP_VENUE
  if (venueId === MELEGA_DEX_VENUE_ID) return MELEGA_DEX_VENUE
  return null
}

function checksumAddress(value: string, code: string): string {
  try {
    return getAddress(value)
  } catch {
    fail(code, value)
  }
}

function encodeIntentAsset(asset: SmartSwapRequest['inputAsset'], asNative: boolean): string {
  if (asNative) {
    if (asset.location.kind !== 'native') fail(V2_BINDING_CHAIN_MISMATCH, 'native-flag-asset')
    return V2_NATIVE_ASSET
  }
  if (asset.location.kind !== 'contract') fail(V2_BINDING_CHAIN_MISMATCH, 'erc20-flag-asset')
  return checksumAddress(asset.location.address, V2_BINDING_CHAIN_MISMATCH)
}

function pathEndpoint(asset: SmartSwapRequest['inputAsset'], wrappedNative: string | undefined): string {
  if (asset.location.kind === 'native') {
    if (!wrappedNative) fail(V2_BINDING_ROUTER_MISSING, 'wrapped-native')
    return checksumAddress(wrappedNative, V2_BINDING_ROUTER_MISSING)
  }
  if (asset.location.kind !== 'contract') fail(V2_BINDING_CHAIN_MISMATCH, 'non-evm-path-asset')
  return checksumAddress(asset.location.address, V2_BINDING_CHAIN_MISMATCH)
}

function parseNonce(nonce: string | number): string {
  const raw = typeof nonce === 'number' ? String(nonce) : nonce.trim()
  if (!/^\d+$/.test(raw)) fail(V2_BINDING_NONCE_INVALID)
  return raw
}

export function buildV2ExecutionBinding(input: BuildV2ExecutionBindingInput): V2ExecutionBinding {
  if (PRODUCTION_EXECUTION_MODE !== SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION) {
    fail('V2_BINDING_PRODUCTION_MODE_DRIFT')
  }
  if (UNIVERSAL_ENGINE_MODE !== SMARTSWAP_OPERATING_MODE.SHADOW) {
    fail('V2_BINDING_ENGINE_MODE_DRIFT')
  }
  if (isProductionCutoverAllowed() !== false) {
    fail('V2_BINDING_CUTOVER_DRIFT')
  }

  const { request, winner } = input
  if (request.exactOut) fail(V2_BINDING_EXACT_OUT_UNSUPPORTED)
  if (!winner) fail(V2_BINDING_WINNER_MISSING)
  if (winner.status === 'stale') fail(V2_BINDING_QUOTE_STALE)
  if (winner.status !== 'ok') fail(V2_BINDING_WINNER_NOT_OK, winner.status)
  if (!winner.quote) fail(V2_BINDING_QUOTE_MISSING)
  const quote = winner.quote
  if (quote.valid !== true) fail(V2_BINDING_QUOTE_INVALID)
  if (quote.stale === true) fail(V2_BINDING_QUOTE_STALE)
  if (input.nowIso && quoteIsStale(quote, input.nowIso, input.staleAfterMs ?? 15_000)) {
    fail(V2_BINDING_QUOTE_STALE)
  }
  if (winner.venueId !== quote.venueId) fail(V2_BINDING_VENUE_MISMATCH)
  try {
    assertSingleVenueRoute(quote)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message === SPLIT_ROUTE_FORBIDDEN) fail(V2_BINDING_SPLIT_ROUTE)
    throw error
  }
  if (quote.hops.length < 1) fail(V2_BINDING_MULTI_HOP_FORBIDDEN)
  if (!assetsEqual(quote.hops[0].tokenIn, request.inputAsset)) fail(V2_BINDING_CHAIN_MISMATCH, 'hop-in')
  if (!assetsEqual(quote.hops[quote.hops.length - 1].tokenOut, request.outputAsset)) {
    fail(V2_BINDING_CHAIN_MISMATCH, 'hop-out')
  }

  if (!isEvmNetwork(request.network) || !isEvmNetwork(quote.network)) {
    fail(V2_BINDING_CHAIN_MISMATCH, 'non-evm')
  }
  const chainId = request.network.chainId
  if (quote.network.chainId !== chainId) fail(V2_BINDING_CHAIN_MISMATCH, 'quote-chain')
  if (!isEvmNetwork(request.inputAsset.network) || !isEvmNetwork(request.outputAsset.network)) {
    fail(V2_BINDING_CHAIN_MISMATCH, 'asset-domain')
  }
  if (request.inputAsset.network.chainId !== chainId || request.outputAsset.network.chainId !== chainId) {
    fail(V2_BINDING_CHAIN_MISMATCH, 'asset-chain')
  }
  if (!assetsEqual(request.inputAsset, quote.inputAsset) || !assetsEqual(request.outputAsset, quote.outputAsset)) {
    fail(V2_BINDING_CHAIN_MISMATCH, 'quote-assets')
  }

  const venueId = winner.venueId
  if (venueId !== PANCAKESWAP_VENUE_ID && venueId !== UNISWAP_VENUE_ID && venueId !== MELEGA_DEX_VENUE_ID) {
    fail(V2_BINDING_UNSUPPORTED_VENUE, venueId)
  }

  const spec = certifiedVenueForExecutorV2(venueId)
  const routerRaw = spec?.routers[chainId]
  const wrappedNative = spec?.wrappedNative[chainId]
  if (!spec || !routerRaw || !wrappedNative) {
    if (venueId === MELEGA_DEX_VENUE_ID) {
      fail(MELEGA_V2_EXECUTION_BINDING_UNAVAILABLE, `${venueId}:${chainId}`)
    }
    fail(V2_BINDING_ROUTER_MISSING, `${venueId}:${chainId}`)
  }
  const router = checksumAddress(routerRaw, V2_BINDING_ROUTER_MISSING)

  if (
    winner.originalInputAmountRaw == null ||
    winner.netVenueInputRaw == null ||
    winner.structuralRouteCostBps == null ||
    winner.smartSwapFeeBps == null ||
    winner.sealedFee == null
  ) {
    fail(V2_BINDING_ECONOMICS_MISSING)
  }
  if (winner.originalInputAmountRaw !== request.inputAmountRaw) fail(V2_BINDING_INPUT_MISMATCH)
  if (winner.sealedFee.feeAssetSource !== FEE_ASSET_SOURCE.INPUT) fail(V2_BINDING_FEE_MISMATCH, 'fee-asset-source')
  if (winner.sealedFee.feeBps !== winner.smartSwapFeeBps) fail(V2_BINDING_FEE_MISMATCH, 'sealed-fee-bps')

  const certifiedCost = VENUE_STRUCTURAL_FEE_BPS[venueId]
  if (certifiedCost == null || certifiedCost !== winner.structuralRouteCostBps) {
    fail(V2_BINDING_FEE_MISMATCH, 'structural-cost')
  }
  const assessment = evaluateRevenuePolicy({
    structuralRouteCostBps: certifiedCost,
    swapValueNormalized: null,
    inputAmountRaw: request.inputAmountRaw,
    feeEnforcementState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
  })
  if (assessment.feeBps == null || assessment.feeBps !== winner.smartSwapFeeBps) {
    fail(V2_BINDING_FEE_MISMATCH, 'policy-fee-bps')
  }
  const derived = computeNetVenueInput(request.inputAmountRaw, assessment.feeBps)
  if (derived.feeAmountRaw !== winner.sealedFee.feeAmountRaw) fail(V2_BINDING_FEE_MISMATCH, 'fee-amount')
  if (derived.netVenueInputRaw !== winner.netVenueInputRaw) fail(V2_BINDING_NET_INPUT_MISMATCH, 'winner-net')
  if (quote.inputAmountRaw !== winner.netVenueInputRaw) fail(V2_BINDING_NET_INPUT_MISMATCH, 'quote-net')

  const minUserOut = quote.minimumReceivedRaw
  if (minUserOut == null || !/^\d+$/.test(minUserOut)) fail(V2_BINDING_MIN_OUT_MISSING)

  const nativeIn = request.inputAsset.location.kind === 'native'
  const nativeOut = request.outputAsset.location.kind === 'native'
  const path = [
    pathEndpoint(quote.hops[0].tokenIn, wrappedNative),
    ...quote.hops.map((hop) => pathEndpoint(hop.tokenOut, wrappedNative)),
  ]
  if (path.length < 2 || path[0] === path[path.length - 1]) fail(V2_BINDING_CHAIN_MISMATCH, 'identical-path-ends')

  const user = checksumAddress(input.user, V2_BINDING_USER_INVALID)
  if (user === '0x0000000000000000000000000000000000000000') fail(V2_BINDING_USER_INVALID, 'zero')
  if (!Number.isInteger(input.deadline) || input.deadline <= 0) fail(V2_BINDING_DEADLINE_INVALID)
  const nonce = parseNonce(input.nonce)

  const intent: V2ExecutionIntent = {
    version: V2_INTENT_VERSION,
    policyId: V2_POLICY_ID_HASH,
    policyVersion: V2_POLICY_VERSION_HASH,
    chainId,
    user,
    inputAsset: encodeIntentAsset(request.inputAsset, nativeIn),
    outputAsset: encodeIntentAsset(request.outputAsset, nativeOut),
    inputAmount: request.inputAmountRaw,
    minUserOut,
    venueId: v2VenueIdHash(venueId),
    router,
    routeHash: v2RouteHashOf(path, nativeIn, nativeOut),
    feeBps: winner.smartSwapFeeBps,
    feeAmount: winner.sealedFee.feeAmountRaw,
    feeAsset: nativeIn ? V2_NATIVE_ASSET : encodeIntentAsset(request.inputAsset, false),
    beneficiary: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    structuralRouteCostBps: winner.structuralRouteCostBps,
    deadline: input.deadline,
    nonce,
    nativeIn,
    nativeOut,
  }

  return {
    intent,
    path,
    venueIdLabel: venueId,
    executeArgs: {
      method: 'execute',
      intent,
      path,
    },
    productionExecutionCapable: false,
    productionActivation: false,
    productionCutoverAllowed: false,
    productionExecutionMode: SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION,
    universalEngineMode: SMARTSWAP_OPERATING_MODE.SHADOW,
  }
}

export function assertNoV1SignerFields(intent: V2ExecutionIntent): void {
  const record = intent as V2ExecutionIntent & { engineSeal?: unknown; intentSigner?: unknown; signature?: unknown }
  if (record.engineSeal != null || record.intentSigner != null || record.signature != null) {
    fail('V2_BINDING_V1_SIGNER_FIELD')
  }
}

export const V2_PREP_NOW_INVALID = 'V2_PREP_NOW_INVALID' as const
export const V2_PREP_CHAIN_MISMATCH = 'V2_PREP_CHAIN_MISMATCH' as const
export const V2_PREP_EXECUTOR_INVALID = 'V2_PREP_EXECUTOR_INVALID' as const
export const V2_PREP_DEADLINE_EXPIRED = 'V2_PREP_DEADLINE_EXPIRED' as const
export const V2_PREP_ALLOWANCE_MISSING = 'V2_PREP_ALLOWANCE_MISSING' as const
export const V2_PREP_ALLOWANCE_IDENTITY = 'V2_PREP_ALLOWANCE_IDENTITY' as const
export const V2_PREP_AMOUNT_BOUNDS = 'V2_PREP_AMOUNT_BOUNDS' as const
export const V2_PREP_MIN_OUT_ZERO = 'V2_PREP_MIN_OUT_ZERO' as const

const TEAM_OPERATOR_REF = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const UINT256_MAX = (BigInt(1) << BigInt(256)) - BigInt(1)

/** Minimal execute fragment. Tests decode against the compiled ExecutorV2 ABI. */
export const EXECUTOR_V2_EXECUTE_FRAGMENT = [
  {
    type: 'function',
    name: 'execute',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'intent',
        type: 'tuple',
        components: [
          { name: 'version', type: 'uint256' },
          { name: 'policyId', type: 'bytes32' },
          { name: 'policyVersion', type: 'bytes32' },
          { name: 'chainId', type: 'uint256' },
          { name: 'user', type: 'address' },
          { name: 'inputAsset', type: 'address' },
          { name: 'outputAsset', type: 'address' },
          { name: 'inputAmount', type: 'uint256' },
          { name: 'minUserOut', type: 'uint256' },
          { name: 'venueId', type: 'bytes32' },
          { name: 'router', type: 'address' },
          { name: 'routeHash', type: 'bytes32' },
          { name: 'feeBps', type: 'uint16' },
          { name: 'feeAmount', type: 'uint256' },
          { name: 'feeAsset', type: 'address' },
          { name: 'beneficiary', type: 'address' },
          { name: 'structuralRouteCostBps', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'nativeIn', type: 'bool' },
          { name: 'nativeOut', type: 'bool' },
        ],
      },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [{ name: 'userOutput', type: 'uint256' }],
  },
]

const ERC20_APPROVE_FRAGMENT = ['function approve(address spender, uint256 amount)']

export interface ObservedAllowanceIdentity {
  chainId: number
  token: string
  owner: string
  spender: string
  amountRaw: string
}

export interface UnsignedUserTransaction {
  from: string
  to: string
  chainId: number
  data: string
  value: string
}

export interface PrepareV2UserTransactionsInput {
  request: SmartSwapRequest
  winner: ShadowCandidate | null | undefined
  user: string
  deadline: number
  nonce: string | number
  nowIso: string
  staleAfterMs?: number
  currentChainId: number
  executorAddress: string
  observedAllowance?: ObservedAllowanceIdentity
}

export interface V2UserTransactionPreparation {
  approvalTransactions: UnsignedUserTransaction[]
  swapTransaction: UnsignedUserTransaction
  requiresRefreshBeforeSwap: boolean
  requiresOnChainPreflight: true
  productionExecutionCapable: false
}

function parseUint256(raw: string, code: string): bigint {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) fail(code, raw)
  const value = BigInt(raw)
  if (value < BigInt(0) || value > UINT256_MAX) fail(code, raw)
  return value
}

function toHexQuantity(raw: string): string {
  const value = parseUint256(raw, V2_PREP_AMOUNT_BOUNDS)
  return value === BigInt(0) ? '0x0' : `0x${value.toString(16)}`
}

function encodeExecuteCalldata(intent: V2ExecutionIntent, path: string[]): string {
  const iface = new Interface(EXECUTOR_V2_EXECUTE_FRAGMENT)
  return iface.encodeFunctionData('execute', [
    [
      intent.version,
      intent.policyId,
      intent.policyVersion,
      intent.chainId,
      intent.user,
      intent.inputAsset,
      intent.outputAsset,
      intent.inputAmount,
      intent.minUserOut,
      intent.venueId,
      intent.router,
      intent.routeHash,
      intent.feeBps,
      intent.feeAmount,
      intent.feeAsset,
      intent.beneficiary,
      intent.structuralRouteCostBps,
      intent.deadline,
      intent.nonce,
      intent.nativeIn,
      intent.nativeOut,
    ],
    path,
  ])
}

function encodeApproveCalldata(spender: string, amountRaw: string): string {
  const iface = new Interface(ERC20_APPROVE_FRAGMENT)
  return iface.encodeFunctionData('approve', [spender, amountRaw])
}

function assertAllowanceIdentity(
  allowance: ObservedAllowanceIdentity,
  intent: V2ExecutionIntent,
  executor: string,
): void {
  if (!Number.isInteger(allowance.chainId) || allowance.chainId !== intent.chainId) {
    fail(V2_PREP_ALLOWANCE_IDENTITY, 'chain')
  }
  let token: string
  let owner: string
  let spender: string
  try {
    token = getAddress(allowance.token)
    owner = getAddress(allowance.owner)
    spender = getAddress(allowance.spender)
  } catch {
    fail(V2_PREP_ALLOWANCE_IDENTITY, 'address')
  }
  if (token === ZERO_ADDRESS) fail(V2_PREP_ALLOWANCE_IDENTITY, 'token')
  if (token !== intent.inputAsset) fail(V2_PREP_ALLOWANCE_IDENTITY, 'token')
  if (owner !== intent.user) fail(V2_PREP_ALLOWANCE_IDENTITY, 'owner')
  if (spender !== executor) fail(V2_PREP_ALLOWANCE_IDENTITY, 'spender')
  parseUint256(allowance.amountRaw, V2_PREP_ALLOWANCE_IDENTITY)
}

export function prepareV2UserTransactions(input: PrepareV2UserTransactionsInput): V2UserTransactionPreparation {
  const nowMs = Date.parse(input.nowIso)
  if (!Number.isFinite(nowMs)) fail(V2_PREP_NOW_INVALID)

  const binding = buildV2ExecutionBinding({
    request: input.request,
    winner: input.winner,
    user: input.user,
    deadline: input.deadline,
    nonce: input.nonce,
    nowIso: input.nowIso,
    staleAfterMs: input.staleAfterMs,
  })
  assertNoV1SignerFields(binding.intent)

  if (!Number.isInteger(input.currentChainId) || input.currentChainId !== binding.intent.chainId) {
    fail(V2_PREP_CHAIN_MISMATCH, String(input.currentChainId))
  }

  const executor = checksumAddress(input.executorAddress, V2_PREP_EXECUTOR_INVALID)
  if (executor === ZERO_ADDRESS) fail(V2_PREP_EXECUTOR_INVALID, 'zero')
  if (executor === getAddress(TEAM_OPERATOR_REF)) fail(V2_PREP_EXECUTOR_INVALID, 'team')
  if (executor === CANONICAL_SMARTSWAP_FEE_BENEFICIARY) fail(V2_PREP_EXECUTOR_INVALID, 'treasury')
  if (executor === binding.intent.router) fail(V2_PREP_EXECUTOR_INVALID, 'router')

  const nowSec = Math.floor(nowMs / 1000)
  if (!Number.isSafeInteger(binding.intent.deadline) || binding.intent.deadline <= nowSec) {
    fail(V2_PREP_DEADLINE_EXPIRED)
  }

  parseUint256(binding.intent.inputAmount, V2_PREP_AMOUNT_BOUNDS)
  parseUint256(binding.intent.feeAmount, V2_PREP_AMOUNT_BOUNDS)
  const minUserOut = parseUint256(binding.intent.minUserOut, V2_PREP_AMOUNT_BOUNDS)
  parseUint256(binding.intent.nonce, V2_PREP_AMOUNT_BOUNDS)
  if (minUserOut === BigInt(0)) fail(V2_PREP_MIN_OUT_ZERO)
  if (!Number.isInteger(binding.intent.feeBps) || binding.intent.feeBps < 0 || binding.intent.feeBps > 65535) {
    fail(V2_PREP_AMOUNT_BOUNDS, 'feeBps')
  }

  const approvalTransactions: UnsignedUserTransaction[] = []
  let requiresRefreshBeforeSwap = false

  if (!binding.intent.nativeIn) {
    if (!input.observedAllowance) fail(V2_PREP_ALLOWANCE_MISSING)
    assertAllowanceIdentity(input.observedAllowance, binding.intent, executor)
    const observed = BigInt(input.observedAllowance.amountRaw)
    const gross = BigInt(binding.intent.inputAmount)
    if (observed < gross) {
      if (observed > BigInt(0)) {
        approvalTransactions.push({
          from: binding.intent.user,
          to: binding.intent.inputAsset,
          chainId: binding.intent.chainId,
          data: encodeApproveCalldata(executor, '0'),
          value: '0x0',
        })
      }
      approvalTransactions.push({
        from: binding.intent.user,
        to: binding.intent.inputAsset,
        chainId: binding.intent.chainId,
        data: encodeApproveCalldata(executor, binding.intent.inputAmount),
        value: '0x0',
      })
      requiresRefreshBeforeSwap = true
    }
  }

  return {
    approvalTransactions,
    swapTransaction: {
      from: binding.intent.user,
      to: executor,
      chainId: binding.intent.chainId,
      data: encodeExecuteCalldata(binding.intent, binding.path),
      value: binding.intent.nativeIn ? toHexQuantity(binding.intent.inputAmount) : '0x0',
    },
    requiresRefreshBeforeSwap,
    requiresOnChainPreflight: true,
    productionExecutionCapable: false,
  }
}
