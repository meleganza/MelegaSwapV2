/**
 * M7 unsigned canary package. Founder authorized preparation only.
 * Agent cannot sign, fund, approve, or broadcast.
 * 0c12c69e, a6af056e, 6f4eb29e, 09c5777f, 86648984, 76907639, 2331fea5, and b780ff6e packages are STALE; this is the JIT reseal.
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
  observedWbnbWei: '12000000000000000',
  shortfallWbnbWei: '0',
  allowanceWbnbWei: '0',
  amountReducedToFitBalance: false,
  blocksBroadcast: false,
  packageRemainsUnsignedReady: true,
  founderOnly: true,
} as const

export const M7_UNSIGNED_APPROVE = {
  package: 'deployments/mainnet/m7-unsigned-approve-tx.json',
  nonce: 3207,
  to: FIRST_CANARY_SPEC.pair.inputAddress,
  spender: M6_BNB_MAINNET_CANARY_PROOF.executor,
  amount: FIRST_CANARY_SPEC.inputAmountRaw,
  unlimited: false,
  signed: false,
  broadcast: false,
} as const

export const M7_UNSIGNED_CANARY = {
  package: 'deployments/mainnet/m7-unsigned-canary-execute.json',
  nonce: 3208,
  to: M6_BNB_MAINNET_CANARY_PROOF.executor,
  intentNonce: 2,
  inputAmount: FIRST_CANARY_SPEC.inputAmountRaw,
  feeAmountWbnb: '20000000000000',
  venueInputWbnb: '9980000000000000',
  failClosedNetUsdcOut: '6875994901120396706',
  slippageBps: CANARY_SLIPPAGE_BPS,
  minUserOut: '6841614926614794722',
  deadline: 1788023918,
  intentHash: '0x36d594a4b92a76adcbe56e27e600b4a9bbd243ce2270e05d40c9a372ba182486',
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
