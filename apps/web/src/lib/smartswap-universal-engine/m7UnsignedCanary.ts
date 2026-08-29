/**
 * M7 unsigned canary package. Founder authorized preparation only.
 * Agent cannot sign, fund, approve, or broadcast.
 */

import { FIRST_CANARY_SPEC } from './canarySpec'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from './m4OperatingState'
import { CANARY_SLIPPAGE_BPS } from './m5CanaryPackage'
import { M6_BNB_MAINNET_CANARY_PROOF } from './m6MainnetCanaryCertification'
import { M7_NEXT_CONTROLLED_EVM_CANARY_TARGET } from './m7ControlledEvmCanaryTarget'

export const M7_PREPARE_AUTHORIZATION = {
  present: true,
  scope: 'PREPARE_UNSIGNED_PACKAGE_ONLY',
  fundingAuthorized: false,
  signAuthorized: false,
  broadcastAuthorized: false,
  activationAuthorized: false,
  source: 'FOUNDER GRANT RECEIVED FOR AUTONOMOUS NON-IRREVERSIBLE ROADMAP CONTINUATION',
} as const

export const M7_UNSIGNED_PACKAGE_STATUS = 'UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED' as const

export const M7_FUNDING_SHORTFALL = {
  requiredWbnbWei: FIRST_CANARY_SPEC.inputAmountRaw,
  observedWbnbWei: '5000000000000000',
  shortfallWbnbWei: '5000000000000000',
  allowanceWbnbWei: '0',
  amountReducedToFitBalance: false,
  blocksBroadcast: true,
  packageRemainsUnsignedReady: true,
  founderOnly: true,
} as const

export const M7_UNSIGNED_APPROVE = {
  package: 'deployments/mainnet/m7-unsigned-approve-tx.json',
  nonce: 3206,
  to: FIRST_CANARY_SPEC.pair.inputAddress,
  spender: M6_BNB_MAINNET_CANARY_PROOF.executor,
  amount: FIRST_CANARY_SPEC.inputAmountRaw,
  unlimited: false,
  signed: false,
  broadcast: false,
} as const

export const M7_UNSIGNED_CANARY = {
  package: 'deployments/mainnet/m7-unsigned-canary-execute.json',
  nonce: 3207,
  to: M6_BNB_MAINNET_CANARY_PROOF.executor,
  intentNonce: 2,
  inputAmount: FIRST_CANARY_SPEC.inputAmountRaw,
  feeAmountWbnb: '20000000000000',
  venueInputWbnb: '9980000000000000',
  failClosedNetUsdcOut: '6876753540336322738',
  slippageBps: CANARY_SLIPPAGE_BPS,
  minUserOut: '6842369772634641124',
  deadline: 1787984605,
  intentHash: '0x637825796aa0d15739e5a31dbaf9f650fe532acefdbd75a30bba07cd0e09e5f2',
  routeHash: '0x03acd7f030e88592939ebd720a2704354c6dfd4d1d55e07e62bf3d18b6bc9e9f',
  pair: M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.pairAddress,
  output: FIRST_CANARY_SPEC.pair.outputAddress,
  treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  oneCanaryOnly: true,
  noAutomaticRetry: true,
  signed: false,
  broadcast: false,
} as const

export const M7_BROADCAST = {
  approve: false,
  swap: false,
  signMainnet: false,
  fund: false,
} as const

export function m7PrepareOnlyAuthorized(): boolean {
  return (
    M7_PREPARE_AUTHORIZATION.present &&
    M7_PREPARE_AUTHORIZATION.scope === 'PREPARE_UNSIGNED_PACKAGE_ONLY' &&
    !M7_PREPARE_AUTHORIZATION.signAuthorized &&
    !M7_PREPARE_AUTHORIZATION.broadcastAuthorized &&
    !M7_PREPARE_AUTHORIZATION.fundingAuthorized
  )
}

export function m7LegacyProductionStillAuthoritative(): boolean {
  return ACTIVE_V2_ROLLOUT === V2_ROLLOUT_STATE.LEGACY_PRODUCTION
}
