/**
 * Uniswap Ethereum mainnet canary final preparation.
 * Reuses certified SmartSwapExecutorV1 source/artifact with Ethereum constructor/config only.
 * Architect-certified canary: exact-in WETH→USDC, 0.002 WETH, one shot, no retry, no activation.
 * Does not broadcast, sign, approve, deploy, or assume a BSC deployer on Ethereum.
 */

import { defaultAbiCoder } from '@ethersproject/abi'
import { getContractAddress } from '@ethersproject/address'
import { hexZeroPad } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'
import { CANONICAL_EXAMPLE_ASSETS } from './assetIdentity'
import {
  PANCAKE_SWAP_VENUE,
  UNISWAP_VENUE,
  UNISWAP_VENUE_ID,
  VENUE_SUPPORT,
} from './certifiedVenues'
import { computeStructuralRouteCost } from './costTaxonomy'
import { EVM_CHAIN_IDS, solanaExecutionEnabled } from './domain'
import { computeFeeAmountRaw } from './evaluateRevenuePolicy'
import {
  DETERMINISTIC_BYTECODE,
  DETERMINISTIC_COMPILER_LOCK,
  EXECUTOR_SOURCE_GIT_BLOB,
  EXECUTOR_SOURCE_SHA256,
  SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS,
} from './executorDeterministicArtifact'
import { authorizedSmartSwapFeeBps, sealExecutionIntent, type ExecutionIntent } from './executionIntent'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from './operatingMode'
import { computeMinimumReceived } from './quote'
import { SMARTSWAP_REVENUE_POLICY_V1 } from './revenuePolicy'
import {
  UNISWAP_CANARY_NEXT_GATE,
  certifyUniswapShadowQuoteReadiness,
  firstCanonicalUniswapShadowRequest,
} from './uniswapShadowQuoteReadiness'
import { VENUE_FEE_ENFORCEMENT_FUTURE } from './venueFeeEnforcementFuture'

export const UNISWAP_ETHEREUM_CANARY_PREP_ID = 'SMARTSWAP_UNISWAP_ETHEREUM_CANARY_PREP' as const

export const UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY =
  'UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY' as const
export const UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED = 'UNISWAP_ETHEREUM_CANARY_PREP_BLOCKED' as const

export const UNISWAP_ETHEREUM_CANARY_PAIR_NOTIONAL_DECISION_REQUIRED =
  'FOUNDER_ARCHITECT_DECISION_REQUIRED_UNISWAP_ETHEREUM_CANARY_PAIR_AND_MAXIMUM_NOTIONAL' as const

export const UNISWAP_ETHEREUM_DEPLOYER_UNDEFINED = 'ETHEREUM_CANONICAL_DEPLOYER_UNDEFINED' as const

/** Remaining architecture/founder input. No repository value defines a canonical Ethereum deployer. */
export const FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED =
  'FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED' as const

export const UNISWAP_ETHEREUM_CANARY_PREP_VERDICT = UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY

export const BSC_CERTIFIED_DEPLOYER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0' as const
export const BSC_CERTIFIED_EXECUTOR = '0x296015b106F4b2FB94249cf398cbF05d4CcE0391' as const

/** Architect-certified canary input. Not the SHADOW quote example of 1 WETH. */
export const UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW = '2000000000000000' as const

/**
 * Live min-out haircut uses the existing Uniswap SHADOW request slippage.
 * Fork simulation uses exact same-block getAmountsOut (no extra haircut).
 */
export const UNISWAP_ETHEREUM_CANARY_LIVE_SLIPPAGE_BPS = firstCanonicalUniswapShadowRequest().slippageBps

/** Canonical Ethereum USDC from CANONICAL_EXAMPLE_ASSETS.usdcEthereum / existing canary-prep tests. */
export const CANONICAL_ETHEREUM_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const

/** Uniswap V2 factory already used by test/smartswap/SmartSwapExecutorV1EthereumCanaryPrep.t.sol. */
export const UNISWAP_V2_FACTORY_ETHEREUM = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' as const

export const CANDIDATE_FOUNDER_EOA_RECONNAISSANCE_ONLY = BSC_CERTIFIED_DEPLOYER

export const EXECUTOR_REUSE_PATH = {
  sourceChangeRequired: false,
  newContractDesignRequired: false,
  reusableWithoutSourceChange: true,
  constructor: 'constructor(address treasury_, address intentSigner_, address wrappedNative_, address owner_)',
  chainBinding: 'intent.chainId == block.chainid; wrappedNative is constructor immutable; router via setRouter',
  exactInOnly: true,
  feeModel: 'INPUT_ASSET_FEE + SMARTSWAP_REVENUE_POLICY_V1 authorizedFeeBps(structuralRouteCostBps)',
} as const

export function assertUniswapCatalogRouterUnchanged(): string {
  const router = UNISWAP_VENUE.routers[EVM_CHAIN_IDS.ETHEREUM]
  if (router !== '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D') {
    throw new Error('UNISWAP_CANONICAL_ROUTER_DISCREPANCY')
  }
  return router
}

export function assertCanonicalEthereumWrappedNative(): string {
  const wrapped = UNISWAP_VENUE.wrappedNative[EVM_CHAIN_IDS.ETHEREUM]
  if (wrapped !== '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2') {
    throw new Error('UNISWAP_CANONICAL_WETH_DISCREPANCY')
  }
  const example = CANONICAL_EXAMPLE_ASSETS.weth.location
  if (example.kind !== 'contract' || example.address !== wrapped.toLowerCase()) {
    throw new Error('UNISWAP_CANONICAL_WETH_DISCREPANCY')
  }
  return wrapped
}

export function assertCanonicalEthereumUsdc(): string {
  const example = CANONICAL_EXAMPLE_ASSETS.usdcEthereum.location
  if (example.kind !== 'contract' || example.address !== CANONICAL_ETHEREUM_USDC.toLowerCase()) {
    throw new Error('UNISWAP_CANONICAL_USDC_DISCREPANCY')
  }
  return CANONICAL_ETHEREUM_USDC
}

export function uniswapEthereumStructuralRouteCostBps(): number {
  const structural = computeStructuralRouteCost({
    venueFeesBps: UNISWAP_VENUE.v2LpFeeBps,
    bridgeCostsBps: 0,
    gasCostBps: null,
    venueFeesEmbeddedInGross: true,
    bridgeCostsEmbeddedInGross: false,
  })
  if (structural.structuralRouteCostBps == null) throw new Error('ROUTE_COST_UNCERTIFIED')
  return structural.structuralRouteCostBps
}

export function uniswapEthereumSmartSwapFeeBps(): number {
  return authorizedSmartSwapFeeBps(uniswapEthereumStructuralRouteCostBps())
}

export function deriveUniswapEthereumCanaryEconomics(): {
  inputAmountRaw: typeof UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW
  structuralRouteCostBps: number
  derivedSmartSwapFeeBps: number
  feeAmountRaw: string
  venueInputRaw: string
} {
  const inputAmountRaw = UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW
  const structuralRouteCostBps = uniswapEthereumStructuralRouteCostBps()
  const derivedSmartSwapFeeBps = uniswapEthereumSmartSwapFeeBps()
  const feeAmountRaw = computeFeeAmountRaw(inputAmountRaw, derivedSmartSwapFeeBps)
  const venueInputRaw = (BigInt(inputAmountRaw) - BigInt(feeAmountRaw)).toString()
  return {
    inputAmountRaw,
    structuralRouteCostBps,
    derivedSmartSwapFeeBps,
    feeAmountRaw,
    venueInputRaw,
  }
}

export function computeUniswapEthereumCanaryMinOut(quotedOutRaw: string, slippageBps = UNISWAP_ETHEREUM_CANARY_LIVE_SLIPPAGE_BPS): string {
  return computeMinimumReceived(quotedOutRaw, slippageBps)
}

export function resolveEthereumCanonicalDeployer(): null {
  return null
}

export function predictCreateAddress(deployer: string | null | undefined, nonce: number | null | undefined): null | string {
  if (!deployer || nonce == null) return null
  return getContractAddress({ from: deployer, nonce })
}

export function encodeExecutorConstructor(input: {
  treasury: string
  intentSigner: string | null
  wrappedNative: string
  owner: string | null
}): string | null {
  if (!input.intentSigner || !input.owner) return null
  return defaultAbiCoder.encode(
    ['address', 'address', 'address', 'address'],
    [input.treasury, input.intentSigner, input.wrappedNative, input.owner],
  )
}

export function encodeSetRouterCalldata(router: string, venueId: typeof UNISWAP_VENUE_ID, allowed: boolean): string {
  return defaultAbiCoder.encode(['address', 'bytes32', 'bool'], [router, keccakVenue(venueId), allowed])
}

function keccakVenue(venueId: string): string {
  return keccak256(toUtf8Bytes(venueId))
}

export function shadowQuoteExampleIsNotCanaryPair(): true {
  const shadow = firstCanonicalUniswapShadowRequest()
  if (shadow.inputAmountRaw === undefined) throw new Error('SHADOW_REQUEST_MISSING')
  if (shadow.inputAmountRaw === UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW) {
    throw new Error('SHADOW_EXAMPLE_COLLIDES_WITH_CANARY')
  }
  return true
}

export function inspectCertifiedEthereumCanaryPair(): {
  pair: {
    input: typeof CANONICAL_EXAMPLE_ASSETS.weth.location
    output: typeof CANONICAL_EXAMPLE_ASSETS.usdcEthereum.location
    path: [string, string]
  }
  inputAmountRaw: typeof UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW
  feeAmountRaw: string
  venueInputRaw: string
  minUserOut: null
  quote: null
  reason: null
} {
  const economics = deriveUniswapEthereumCanaryEconomics()
  return {
    pair: {
      input: CANONICAL_EXAMPLE_ASSETS.weth.location,
      output: CANONICAL_EXAMPLE_ASSETS.usdcEthereum.location,
      path: [assertCanonicalEthereumWrappedNative(), assertCanonicalEthereumUsdc()],
    },
    inputAmountRaw: economics.inputAmountRaw,
    feeAmountRaw: economics.feeAmountRaw,
    venueInputRaw: economics.venueInputRaw,
    minUserOut: null,
    quote: null,
    reason: null,
  }
}

export interface UnsignedPackageEnvelope<T extends Record<string, unknown>> {
  schema: string
  signed: false
  broadcast: false
  autoRetry: false
  staleOnNonceDrift: true
  chainId: 1
  payload: T
}

export function wrapUnsignedPackage<T extends Record<string, unknown>>(
  schema: string,
  payload: T,
): UnsignedPackageEnvelope<T> {
  return {
    schema,
    signed: false,
    broadcast: false,
    autoRetry: false,
    staleOnNonceDrift: true,
    chainId: 1,
    payload,
  }
}

export function buildEthereumUnsignedCreatePackage() {
  const deployer = resolveEthereumCanonicalDeployer()
  const nonce = null
  return wrapUnsignedPackage('melega.smartswap.uniswap-ethereum.unsigned-create.v1', {
    status: 'UNSIGNED_PACKAGE_BLOCKED',
    blocker: FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED,
    architectureBlockerAlias: UNISWAP_ETHEREUM_DEPLOYER_UNDEFINED,
    to: null,
    value: '0',
    deployer,
    nonce,
    predictedAddress: predictCreateAddress(deployer, nonce),
    creationBytecodeKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
    deployedTemplateKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
    constructor: {
      abi: EXECUTOR_REUSE_PATH.constructor,
      frozen: {
        treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
        wrappedNative: assertCanonicalEthereumWrappedNative(),
      },
      setAtAuthorizedDeploy: ['intentSigner', 'owner'],
      encoding: encodeExecutorConstructor({
        treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
        intentSigner: null,
        wrappedNative: assertCanonicalEthereumWrappedNative(),
        owner: null,
      }),
    },
    candidateFounderEoaReconnaissanceOnly: CANDIDATE_FOUNDER_EOA_RECONNAISSANCE_ONLY,
    bscDeployerMustNotBeAssumedOnEthereum: BSC_CERTIFIED_DEPLOYER,
    note: 'CREATE data cannot be nonce-bound until a canonical Ethereum deployer is selected. Do not reuse the BSC deployer or nonce. Reconnaissance of 0xB6eEb3… is not authorization. If nonce later drifts, STOP and rebuild. No auto-retry.',
  })
}

export function buildEthereumUnsignedSetRouterPackage() {
  const router = assertUniswapCatalogRouterUnchanged()
  return wrapUnsignedPackage('melega.smartswap.uniswap-ethereum.unsigned-setRouter.v1', {
    status: 'UNSIGNED_PACKAGE_BLOCKED',
    blocker: 'ETHEREUM_EXECUTOR_ADDRESS_UNDEFINED',
    function: 'setRouter(address,bytes32,bool)',
    router,
    venueId: UNISWAP_VENUE_ID,
    venueIdHash: keccakVenue(UNISWAP_VENUE_ID),
    allowed: true,
    to: null,
    nonce: null,
    execute: false,
    note: 'setRouter cannot be nonce-bound until CREATE is mined at a predicted address. Stale on nonce drift. No auto-retry.',
  })
}

export function uniswapEthereumCanaryMinOutMethodology() {
  const economics = deriveUniswapEthereumCanaryEconomics()
  return {
    quoteMethod: UNISWAP_VENUE.quoteMethod,
    router: assertUniswapCatalogRouterUnchanged(),
    factory: UNISWAP_V2_FACTORY_ETHEREUM,
    path: [assertCanonicalEthereumWrappedNative(), assertCanonicalEthereumUsdc()],
    quoteInput: 'venueInputRaw after SmartSwap input-asset fee',
    venueInputRaw: economics.venueInputRaw,
    liveSlippageBps: UNISWAP_ETHEREUM_CANARY_LIVE_SLIPPAGE_BPS,
    liveMinOut: 'computeMinimumReceived(getAmountsOut(venueInputRaw)[-1], liveSlippageBps)',
    forkSimulationMinOut: 'exact getAmountsOut(venueInputRaw) at the fork block; no extra haircut',
    staleOnDelay: true,
    mustRefreshAtSign: true,
    unsignedPackageDoesNotBindMinOut: true,
  } as const
}

export function buildEthereumUnsignedCanaryIntentPackage() {
  const pair = inspectCertifiedEthereumCanaryPair()
  const economics = deriveUniswapEthereumCanaryEconomics()
  return wrapUnsignedPackage('melega.smartswap.uniswap-ethereum.unsigned-canary-intent.v1', {
    status: 'UNSIGNED_PACKAGE_PREPARED_UNBOUND',
    remainingFounderInput: FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED,
    venueId: UNISWAP_VENUE_ID,
    chainId: EVM_CHAIN_IDS.ETHEREUM,
    router: assertUniswapCatalogRouterUnchanged(),
    wrappedNative: assertCanonicalEthereumWrappedNative(),
    pair: pair.pair,
    inputAmountRaw: pair.inputAmountRaw,
    feeAmountRaw: economics.feeAmountRaw,
    venueInputRaw: economics.venueInputRaw,
    minUserOut: null,
    quote: null,
    minOutMethodology: uniswapEthereumCanaryMinOutMethodology(),
    deadline: null,
    nonce: null,
    user: null,
    executor: null,
    structuralRouteCostBps: economics.structuralRouteCostBps,
    derivedSmartSwapFeeBps: economics.derivedSmartSwapFeeBps,
    beneficiary: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    exactInOnly: true,
    oneCanary: true,
    autoRetry: false,
    shadowQuoteExampleMustNotBeUsedAsCanary: {
      input: CANONICAL_EXAMPLE_ASSETS.weth.location,
      output: CANONICAL_EXAMPLE_ASSETS.usdcEthereum.location,
      amountRaw: firstCanonicalUniswapShadowRequest().inputAmountRaw,
    },
    note: 'Pair/notional are architect-certified. minUserOut, deadline, nonce, user, and executor stay unbound until Founder selects the Ethereum deployer, CREATE is mined, and a fresh getAmountsOut is taken at sign time. No auto-retry.',
  })
}

export function sealUniswapEthereumCanaryIntent(input: {
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  path: string[]
  deadline: number
  nonce: string
  nativeIn?: boolean
  nativeOut?: boolean
  feeBpsOverride?: number
}): ExecutionIntent {
  const certified = inspectCertifiedEthereumCanaryPair()
  if (input.inputAmount !== certified.inputAmountRaw) {
    throw new Error('UNISWAP_ETHEREUM_CANARY_INPUT_MISMATCH')
  }
  if (
    input.inputAsset.toLowerCase() !== certified.pair.path[0].toLowerCase() ||
    input.outputAsset.toLowerCase() !== certified.pair.path[1].toLowerCase()
  ) {
    throw new Error('UNISWAP_ETHEREUM_CANARY_PAIR_MISMATCH')
  }
  return sealExecutionIntent({
    chainId: EVM_CHAIN_IDS.ETHEREUM,
    user: input.user,
    inputAsset: input.inputAsset,
    outputAsset: input.outputAsset,
    inputAmount: input.inputAmount,
    minUserOut: input.minUserOut,
    venueId: UNISWAP_VENUE_ID,
    router: assertUniswapCatalogRouterUnchanged(),
    path: input.path,
    structuralRouteCostBps: uniswapEthereumStructuralRouteCostBps(),
    deadline: input.deadline,
    nonce: input.nonce,
    nativeIn: input.nativeIn ?? false,
    nativeOut: input.nativeOut ?? false,
    feeBpsOverride: input.feeBpsOverride,
  })
}

export function sealUniswapEthereumSimulationIntent(input: {
  user: string
  inputAsset: string
  outputAsset: string
  inputAmount: string
  minUserOut: string
  path: string[]
  deadline: number
  nonce: string
  nativeIn?: boolean
  nativeOut?: boolean
}): ExecutionIntent {
  return sealExecutionIntent({
    chainId: EVM_CHAIN_IDS.ETHEREUM,
    user: input.user,
    inputAsset: input.inputAsset,
    outputAsset: input.outputAsset,
    inputAmount: input.inputAmount,
    minUserOut: input.minUserOut,
    venueId: UNISWAP_VENUE_ID,
    router: assertUniswapCatalogRouterUnchanged(),
    path: input.path,
    structuralRouteCostBps: uniswapEthereumStructuralRouteCostBps(),
    deadline: input.deadline,
    nonce: input.nonce,
    nativeIn: input.nativeIn ?? false,
    nativeOut: input.nativeOut ?? false,
  })
}

export interface UniswapEthereumCanaryPrepCertification {
  id: typeof UNISWAP_ETHEREUM_CANARY_PREP_ID
  verdict: typeof UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY
  remainingFounderInput: typeof FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED
  pairNotionalDecision: 'ARCHITECT_CERTIFIED'
  reuse: typeof EXECUTOR_REUSE_PATH
  artifact: {
    status: typeof SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS
    sourceGitBlob: typeof EXECUTOR_SOURCE_GIT_BLOB
    sourceSha256: typeof EXECUTOR_SOURCE_SHA256
    creationKeccak: typeof DETERMINISTIC_BYTECODE.creationKeccak
    deployedTemplateKeccak: typeof DETERMINISTIC_BYTECODE.deployedKeccak
    compiler: typeof DETERMINISTIC_COMPILER_LOCK
    ethereumOnchainRuntimeHash: null
  }
  venue: {
    venueId: typeof UNISWAP_VENUE_ID
    chainId: 1
    support: typeof VENUE_SUPPORT.QUOTE_ONLY
    router: string
    wrappedNative: string
    productionEnabled: false
    executionEnabled: false
    canary: false
  }
  certifiedCanary: {
    pair: ReturnType<typeof inspectCertifiedEthereumCanaryPair>['pair']
    inputAmountRaw: typeof UNISWAP_ETHEREUM_CANARY_INPUT_AMOUNT_RAW
    exactInOnly: true
    oneCanary: true
    autoRetry: false
    economics: ReturnType<typeof deriveUniswapEthereumCanaryEconomics>
    minOutMethodology: ReturnType<typeof uniswapEthereumCanaryMinOutMethodology>
  }
  fee: {
    policyId: typeof SMARTSWAP_REVENUE_POLICY_V1.id
    structuralRouteCostBps: number
    derivedSmartSwapFeeBps: number
    maxProtocolFeeBps: 25
    treasury: typeof CANONICAL_SMARTSWAP_FEE_BENEFICIARY
    hardcodedSmartSwapFee: false
    venueFeeEnforcementImplemented: false
    previewOnlyCannotBeProductionCapable: true
  }
  production: {
    productionExecutionMode: typeof PRODUCTION_EXECUTION_MODE
    universalEngineMode: typeof UNIVERSAL_ENGINE_MODE
    productionCutoverAllowed: false
    solanaExecutionEnabled: false
    robinhoodReason: 'FEASIBILITY_REQUIRED'
    pancakeBscUnchanged: true
  }
  nextGate: typeof UNISWAP_CANARY_NEXT_GATE
  unsignedPackages: {
    create: ReturnType<typeof buildEthereumUnsignedCreatePackage>
    setRouter: ReturnType<typeof buildEthereumUnsignedSetRouterPackage>
    canaryIntent: ReturnType<typeof buildEthereumUnsignedCanaryIntentPackage>
  }
  founderMinimumActions: readonly string[]
}

export function certifyUniswapEthereumCanaryPrep(): UniswapEthereumCanaryPrepCertification {
  if (isProductionCutoverAllowed()) throw new Error('PRODUCTION_CUTOVER_FORBIDDEN')
  if (PRODUCTION_EXECUTION_MODE !== 'LEGACY_PRODUCTION' || UNIVERSAL_ENGINE_MODE !== 'SHADOW') {
    throw new Error('UNISWAP_CANARY_PREP_MODE_VIOLATION')
  }
  if (solanaExecutionEnabled()) throw new Error('SOLANA_EXECUTION_FORBIDDEN')
  const shadow = certifyUniswapShadowQuoteReadiness()
  if (shadow.venue.chainId !== EVM_CHAIN_IDS.ETHEREUM) throw new Error('UNISWAP_SHADOW_QUOTE_WRONG_CHAIN')
  if (shadow.canary !== false || shadow.executionEnabled !== false || shadow.productionEnabled !== false) {
    throw new Error('UNISWAP_CANARY_ACTIVATION_FORBIDDEN')
  }
  if (VENUE_FEE_ENFORCEMENT_FUTURE.uniswap.implemented !== false) {
    throw new Error('UNISWAP_FEE_ENFORCEMENT_MUST_REMAIN_UNIMPLEMENTED')
  }
  const router = assertUniswapCatalogRouterUnchanged()
  const wrappedNative = assertCanonicalEthereumWrappedNative()
  assertCanonicalEthereumUsdc()
  if (PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC] !== '0x10ED43C718714eb63d5aA57B78B54704E256024E') {
    throw new Error('PANCAKE_BSC_CERTIFICATION_DRIFT')
  }
  const economics = deriveUniswapEthereumCanaryEconomics()
  if (economics.derivedSmartSwapFeeBps <= 0 || economics.derivedSmartSwapFeeBps > SMARTSWAP_REVENUE_POLICY_V1.maxProtocolFeeBps) {
    throw new Error('FEE_BYPASS_REJECTED')
  }
  if (economics.derivedSmartSwapFeeBps !== 15 || economics.structuralRouteCostBps !== 30) {
    throw new Error('UNISWAP_CANARY_FEE_BAND_DRIFT')
  }
  shadowQuoteExampleIsNotCanaryPair()
  const pair = inspectCertifiedEthereumCanaryPair()
  return {
    id: UNISWAP_ETHEREUM_CANARY_PREP_ID,
    verdict: UNISWAP_ETHEREUM_CANARY_FOUNDER_ACTION_READY,
    remainingFounderInput: FOUNDER_ETHEREUM_DEPLOYER_SELECTION_REQUIRED,
    pairNotionalDecision: 'ARCHITECT_CERTIFIED',
    reuse: EXECUTOR_REUSE_PATH,
    artifact: {
      status: SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS,
      sourceGitBlob: EXECUTOR_SOURCE_GIT_BLOB,
      sourceSha256: EXECUTOR_SOURCE_SHA256,
      creationKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
      deployedTemplateKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
      compiler: DETERMINISTIC_COMPILER_LOCK,
      ethereumOnchainRuntimeHash: null,
    },
    venue: {
      venueId: UNISWAP_VENUE_ID,
      chainId: 1,
      support: VENUE_SUPPORT.QUOTE_ONLY,
      router,
      wrappedNative,
      productionEnabled: false,
      executionEnabled: false,
      canary: false,
    },
    certifiedCanary: {
      pair: pair.pair,
      inputAmountRaw: pair.inputAmountRaw,
      exactInOnly: true,
      oneCanary: true,
      autoRetry: false,
      economics,
      minOutMethodology: uniswapEthereumCanaryMinOutMethodology(),
    },
    fee: {
      policyId: SMARTSWAP_REVENUE_POLICY_V1.id,
      structuralRouteCostBps: economics.structuralRouteCostBps,
      derivedSmartSwapFeeBps: economics.derivedSmartSwapFeeBps,
      maxProtocolFeeBps: 25,
      treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
      hardcodedSmartSwapFee: false,
      venueFeeEnforcementImplemented: false,
      previewOnlyCannotBeProductionCapable: true,
    },
    production: {
      productionExecutionMode: PRODUCTION_EXECUTION_MODE,
      universalEngineMode: UNIVERSAL_ENGINE_MODE,
      productionCutoverAllowed: false,
      solanaExecutionEnabled: false,
      robinhoodReason: 'FEASIBILITY_REQUIRED',
      pancakeBscUnchanged: true,
    },
    nextGate: UNISWAP_CANARY_NEXT_GATE,
    unsignedPackages: {
      create: buildEthereumUnsignedCreatePackage(),
      setRouter: buildEthereumUnsignedSetRouterPackage(),
      canaryIntent: buildEthereumUnsignedCanaryIntentPackage(),
    },
    founderMinimumActions: [
      'Select the canonical Ethereum deployer. Reconnaissance of 0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0 is not authorization. Do not assume the BSC M6 deployer/nonce.',
      'Fund that deployer on Ethereum for CREATE + setRouter gas, plus 0.002 WETH (or ETH to wrap) and canary execution gas. Refresh balances immediately before broadcast.',
      'If deployer+nonce are defined, rebuild the nonce-bound unsigned CREATE. If nonce drifts, STOP. No auto-retry.',
      'Sign and broadcast CREATE only after artifact keccak matches 0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791.',
      'Rebuild nonce-bound unsigned setRouter(Uniswap V2, keccak256(uniswap), true). Sign/broadcast only after CREATE is mined at the predicted address.',
      'Refresh getAmountsOut(venueInput=1997000000000000) immediately before sign. Bind minUserOut via computeMinimumReceived(quotedOut, 50). Seal exact-in 0.002 WETH→USDC from SMARTSWAP_REVENUE_POLICY_V1. No fee override. Treasury remains 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b.',
      'Founder-authorized one-shot canary execute only. No retry. Keep LEGACY_PRODUCTION / SHADOW / cutover=false. No global activation.',
    ],
  }
}

export function previewOnlyFeeCannotBeProductionCapable(): true {
  const preview = {
    state: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    bps: uniswapEthereumSmartSwapFeeBps(),
    formulaId: SMARTSWAP_REVENUE_POLICY_V1.id,
    amountRaw: null,
    assetSymbol: null,
    recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    collectionProven: false,
    atomicWithSwap: false,
    productionExecutionEligible: false,
    gapCode: 'SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP',
  } as const
  if (canMarkRouteProductionCapable(preview)) {
    throw new Error('PREVIEW_ONLY_MARKED_PRODUCTION_CAPABLE')
  }
  return true
}

export function constructorEncodingWord(address: string): string {
  return hexZeroPad(address.toLowerCase(), 32)
}
