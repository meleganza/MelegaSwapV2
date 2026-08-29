/**
 * M7 controlled EVM canary target. Unsigned package prepared after Founder
 * prepare-only grant. Agent cannot sign, fund, approve, or broadcast.
 */

import { FIRST_CANARY_SPEC } from './canarySpec'
import { PANCAKE_SWAP_VENUE } from './certifiedVenues'
import { EVM_CHAIN_IDS } from './domain'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { FIRST_CANARY_PAIR } from './m5CanaryPackage'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from './m4OperatingState'
import { M6_BNB_MAINNET_CANARY_PROOF } from './m6MainnetCanaryCertification'

export const M7_CONTROLLED_EVM_SCOPE_ID = 'MELEGA-DEX-M7-RECORD-M6-FEE-VERIFIED-CONTROLLED-EVM-SCOPE' as const

export const M7_TARGET_STATUS = {
  TARGET_DEFINED_NOT_PREPARED: 'TARGET_DEFINED_NOT_PREPARED',
  UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED: 'UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED',
} as const

/**
 * Canonical later candidate after M6 WBNB→USDT:
 * apps/web/docs/runtime/smartswap-universal-engine-m5-bnb-canary-readiness/FIRST_CANARY_PAIR.md
 * and M4 FIRST_CANARY_SPEC / CANARY_READINESS.md.
 */
export const M7_NEXT_CONTROLLED_EVM_CANARY_TARGET = {
  status: M7_TARGET_STATUS.UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED,
  executed: false,
  prepared: true,
  signed: false,
  broadcast: false,
  chainId: EVM_CHAIN_IDS.BSC,
  venueId: 'pancakeswap' as const,
  venueAlreadyAllowlistedByM6: true,
  router: PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]!,
  factory: FIRST_CANARY_PAIR.factory,
  pair: {
    input: 'WBNB',
    output: 'USDC',
    inputAddress: FIRST_CANARY_SPEC.pair.inputAddress,
    outputAddress: FIRST_CANARY_SPEC.pair.outputAddress,
    inputDecimals: 18,
    outputDecimals: 18,
  },
  pairAddress: '0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b',
  pairResolution: 'PANCAKE_FACTORY_GET_PAIR_OF_DOCUMENTED_TOKENS',
  sameExecutor: M6_BNB_MAINNET_CANARY_PROOF.executor,
  expectedTreasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  expectedStructuralBps: 25,
  expectedSmartSwapFeeBps: FIRST_CANARY_SPEC.expectedFeeBps,
  plannedInputAmountRaw: FIRST_CANARY_SPEC.inputAmountRaw,
  distinctFromM6Pair: true,
  m6PairAddress: FIRST_CANARY_PAIR.pair,
  source: [
    'apps/web/docs/runtime/smartswap-universal-engine-m5-bnb-canary-readiness/FIRST_CANARY_PAIR.md',
    'apps/web/src/lib/smartswap-universal-engine/canarySpec.ts',
    'apps/web/docs/runtime/smartswap-universal-engine-m4-fee-enforcement/CANARY_READINESS.md',
  ],
  rollout: ACTIVE_V2_ROLLOUT,
  founderAuthorization: true,
  founderAuthorizationScope: 'PREPARE_UNSIGNED_PACKAGE_ONLY',
  unsignedPackage: 'deployments/mainnet/m7-unsigned-canary-execute.json',
  unsignedApprovePackage: 'deployments/mainnet/m7-unsigned-approve-tx.json',
  quoteSealed: true,
  intentNonce: 2,
} as const

export const M7_HARD_STOP = {
  prepareUnsignedPackage: false,
  signMainnet: false,
  broadcast: false,
  activateV2: false,
  changeUx: false,
  substituteVenueOrChain: false,
  reduceAmountToFitBalance: false,
} as const

export function m7TargetIsApprovedAdditionalPancakeBnbPair(): boolean {
  const target = M7_NEXT_CONTROLLED_EVM_CANARY_TARGET
  return (
    target.chainId === EVM_CHAIN_IDS.BSC &&
    target.venueId === 'pancakeswap' &&
    target.router.toLowerCase() === PANCAKE_SWAP_VENUE.routers[EVM_CHAIN_IDS.BSC]!.toLowerCase() &&
    target.pair.inputAddress.toLowerCase() === FIRST_CANARY_SPEC.pair.inputAddress.toLowerCase() &&
    target.pair.outputAddress.toLowerCase() === FIRST_CANARY_SPEC.pair.outputAddress.toLowerCase() &&
    target.pairAddress.toLowerCase() !== FIRST_CANARY_PAIR.pair.toLowerCase() &&
    target.rollout === V2_ROLLOUT_STATE.LEGACY_PRODUCTION
  )
}

export function m7MayPrepareOrBroadcast(): false {
  return false
}
