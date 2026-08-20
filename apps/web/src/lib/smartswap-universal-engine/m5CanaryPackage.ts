/**
 * M5 certified first-canary package. Not broadcast. Not founder-signed.
 */

import { computeStructuralRouteCost, computeTotalExecutionCost } from './costTaxonomy'
import { EVM_CHAIN_IDS } from './domain'
import { authorizedSmartSwapFeeBps, sealExecutionIntent, type ExecutionIntent } from './executionIntent'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { protocolFeeFloor } from './feeAccounting'
import { GAS_OVERHEAD_KIND, recordGasOverhead } from './gasOverhead'
import { PANCAKE_SWAP_VENUE } from './certifiedVenues'
import { SMARTSWAP_REVENUE_POLICY_V1 } from './revenuePolicy'
import { TOKEN_EXECUTION_CLASS } from './tokenSupport'

export const CANARY_VENUE_DECISION = {
  selected: 'pancakeswap' as const,
  rejected: 'melega-dex' as const,
  reason:
    'Pancake V2 WBNB-USDT has deeper certified liquidity and is isolated from the production Melega router. M3 factual Pancake quotes succeeded. Melega quotes for the same notional returned materially less output.',
}

export const FIRST_CANARY_PAIR = {
  chainId: EVM_CHAIN_IDS.BSC,
  venueId: 'pancakeswap' as const,
  inputSymbol: 'WBNB',
  outputSymbol: 'USDT',
  input: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  output: '0x55d398326f99059fF775485246999027B3197955',
  inputDecimals: 18,
  outputDecimals: 18,
  pair: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE',
  factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
  router: PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]!,
  wrappedNative: PANCAKE_SWAP_VENUE.wrappedNative[EVM_CHAIN_IDS.BSC]!,
  tokenClass: TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE,
  liquidityEvidence: {
    reserveWbnb: '67425765726157723935393',
    reserveUsdt: '43204811157586703447468079',
    source: 'Pancake V2 pair getReserves eth_call bsc.publicnode.com during M5',
  },
} as const

export const CANARY_INPUT_AMOUNT = '10000000000000000' as const
export const CANARY_STRUCTURAL_ROUTE_COST_BPS = 25 as const
export const CANARY_SLIPPAGE_BPS = 50 as const

export const CANARY_INTENT_PLACEHOLDERS = {
  user: 'SET_AT_AUTHORIZED_BROADCAST',
  deadline: 'SET_AT_AUTHORIZED_BROADCAST',
  nonce: 'SET_AT_AUTHORIZED_BROADCAST',
  signed: false as const,
  founderWallet: false as const,
} as const

export function buildCanaryEconomics() {
  const feeBps = authorizedSmartSwapFeeBps(CANARY_STRUCTURAL_ROUTE_COST_BPS)
  const split = protocolFeeFloor(CANARY_INPUT_AMOUNT, feeBps)
  const netQuote = '6378955984843176435'
  const minUserOut50Bps = ((BigInt(netQuote) * BigInt(10_000 - CANARY_SLIPPAGE_BPS)) / 10_000n).toString()
  return {
    policyId: SMARTSWAP_REVENUE_POLICY_V1.id,
    policyVersion: SMARTSWAP_REVENUE_POLICY_V1.version,
    structuralRouteCostBps: CANARY_STRUCTURAL_ROUTE_COST_BPS,
    feeBps,
    feeAmount: split.feeRaw,
    feeAsset: FIRST_CANARY_PAIR.input,
    venueInput: split.netRaw,
    beneficiary: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    inputAmount: CANARY_INPUT_AMOUNT,
    factualGrossQuoteRaw: '6392498053241215113',
    factualNetQuoteRaw: netQuote,
    minUserOut50Bps,
    broadcast: false as const,
  }
}

export function buildUnsignedCanaryIntent(input: {
  user: string
  deadline: number
  nonce: string
  minUserOut: string
}): ExecutionIntent {
  return sealExecutionIntent({
    chainId: FIRST_CANARY_PAIR.chainId,
    user: input.user,
    inputAsset: FIRST_CANARY_PAIR.input,
    outputAsset: FIRST_CANARY_PAIR.output,
    inputAmount: CANARY_INPUT_AMOUNT,
    minUserOut: input.minUserOut,
    venueId: FIRST_CANARY_PAIR.venueId,
    router: FIRST_CANARY_PAIR.router,
    path: [FIRST_CANARY_PAIR.input, FIRST_CANARY_PAIR.output],
    structuralRouteCostBps: CANARY_STRUCTURAL_ROUTE_COST_BPS,
    deadline: input.deadline,
    nonce: input.nonce,
    nativeIn: false,
    nativeOut: false,
  })
}

export function replayCanaryRouteEconomics(input: {
  directGasUnits: number
  executorGasUnits: number
  gasPriceWei: string
}): {
  feeBpsUnchanged: number
  structuralRouteCostBps: number
  incrementalGasWei: string
  gasOverheadBpsOfNotional: number
  totalExecutionCostBps: number
  stillRationalVsDirect: boolean
} {
  const economics = buildCanaryEconomics()
  const overhead = recordGasOverhead({
    venueId: FIRST_CANARY_PAIR.venueId,
    chainId: FIRST_CANARY_PAIR.chainId,
    kind: GAS_OVERHEAD_KIND.FORK_BNB,
    directGasUnits: input.directGasUnits,
    feeEnforcedGasUnits: input.executorGasUnits,
  })
  const incrementalGasWei =
    overhead.overheadUnits != null ? (BigInt(overhead.overheadUnits) * BigInt(input.gasPriceWei)).toString() : '0'
  const notional = BigInt(CANARY_INPUT_AMOUNT)
  const gasOverheadBpsOfNotional =
    notional === 0n ? 0 : Number((BigInt(incrementalGasWei) * 10_000n) / notional)
  const structural = computeStructuralRouteCost({
    venueFeesBps: CANARY_STRUCTURAL_ROUTE_COST_BPS,
    bridgeCostsBps: 0,
    gasCostBps: null,
    venueFeesEmbeddedInGross: true,
    bridgeCostsEmbeddedInGross: true,
  })
  const total = computeTotalExecutionCost({
    structural,
    gasCostBps: gasOverheadBpsOfNotional,
    smartSwapFeeBps: economics.feeBps,
  })
  return {
    feeBpsUnchanged: economics.feeBps,
    structuralRouteCostBps: CANARY_STRUCTURAL_ROUTE_COST_BPS,
    incrementalGasWei,
    gasOverheadBpsOfNotional,
    totalExecutionCostBps: total.totalExecutionCostBps ?? 0,
    stillRationalVsDirect: overhead.overheadUnits != null && overhead.overheadUnits >= 0,
  }
}

export const M5_DEPLOYMENT_PACKAGE = {
  chainId: 56,
  create2: false,
  broadcast: false,
  signed: false,
  compiler: { solc: '0.8.20', optimizer: true, optimizerRuns: 200, viaIr: true },
  constructor: {
    treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    intentSigner: 'SET_AT_AUTHORIZED_DEPLOY',
    wrappedNative: FIRST_CANARY_PAIR.wrappedNative,
    owner: 'SET_AT_AUTHORIZED_DEPLOY',
  },
  postDeploy: [
    'assert treasury == canonical',
    'assert wrappedNative == WBNB',
    'setRouter(pancakeV2, keccak256(pancakeswap), true)',
    'assert Melega router not allowlisted unless a later mission authorizes it',
    'verify source/bytecode',
    'pause remains available; V2 rollout stays LEGACY_PRODUCTION',
  ],
} as const

export const M5_CANARY_CHECKLIST = {
  preflight: [
    'executor deployed',
    'source/bytecode verified',
    'Treasury correct',
    'venue/router correct',
    'policy version correct',
    'fee cap 25 bps',
    'V2 globally disabled except explicit canary',
    'wallet funded',
    'input token balance',
    'gas balance',
    'quote fresh',
  ],
  execution: [
    'obtain fresh quote',
    'derive dynamic fee from SMARTSWAP_REVENUE_POLICY_V1',
    'seal intent',
    'approval if required',
    'execute',
    'wait receipt',
  ],
  postState: [
    'swap success',
    'user output >= min',
    'Treasury delta == fee',
    'venue exact',
    'no trapped funds',
    'nonce consumed',
    'receipt verified',
  ],
  broadcastNow: false,
} as const

export const M5_HARD_STOP = {
  deployMainnet: false,
  broadcast: false,
  founderSign: false,
  activateV2: false,
  markFeeVerified: false,
} as const
