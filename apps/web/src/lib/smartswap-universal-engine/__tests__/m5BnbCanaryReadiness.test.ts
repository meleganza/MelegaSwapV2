import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { FIRST_CANARY_SPEC } from '../canarySpec'
import { PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { EVM_CHAIN_IDS } from '../domain'
import { EXECUTION_ELIGIBILITY, requireExecutionTarget } from '../executionTargetRegistry'
import { APPROVAL_MODEL, assertNeverFeeVerified, simulateFeeEnforcedExecution } from '../executorSimulation'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, markFeeCollected } from '../fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { GAS_OVERHEAD_KIND, recordGasOverhead } from '../gasOverhead'
import {
  ACTIVE_V2_ROLLOUT,
  M4_ACTIVE_CERTIFICATION,
  M4_CERTIFICATION_STATE,
  V2_M4_FEE_VERIFIED_FORBIDDEN,
  V2_ROLLOUT_STATE,
} from '../m4OperatingState'
import {
  CANARY_INPUT_AMOUNT,
  CANARY_INTENT_PLACEHOLDERS,
  CANARY_STRUCTURAL_ROUTE_COST_BPS,
  CANARY_VENUE_DECISION,
  FIRST_CANARY_PAIR,
  M5_CANARY_CHECKLIST,
  M5_DEPLOYMENT_PACKAGE,
  M5_HARD_STOP,
  buildCanaryEconomics,
  buildUnsignedCanaryIntent,
  replayCanaryRouteEconomics,
} from '../m5CanaryPackage'
import {
  M5_ACTIVE_CERTIFICATION,
  M5_CANARY_ROLLBACK,
  M5_CERTIFICATION_STATE,
  V2_M5_FEE_VERIFIED_FORBIDDEN,
  V2_M5_FOUNDER_SIGN_FORBIDDEN,
  V2_M5_MAINNET_BROADCAST_FORBIDDEN,
  assertM5NeverFeeVerified,
  assertM5NoFounderSign,
  assertM5NoMainnetBroadcast,
  classifyM5FeeState,
} from '../m5OperatingState'
import {
  SMARTSWAP_UNIVERSAL_ENGINE_ID,
  SMARTSWAP_UNIVERSAL_ENGINE_M2_ID,
  SMARTSWAP_UNIVERSAL_ENGINE_M3_ID,
  SMARTSWAP_UNIVERSAL_ENGINE_M4_ID,
  SMARTSWAP_UNIVERSAL_ENGINE_M5_ID,
  isProductionCutoverAllowed,
  isUniversalEngineShadowOnly,
} from '../operatingMode'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { receiptToFeeState, verifyForkEconomics } from '../receiptVerifier'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { TOKEN_EXECUTION_CLASS } from '../tokenSupport'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { ENGINE_TX_STATE, FROZEN_UX_ENGINE_STATE_MAP, m5MustNotExposeEngineStatesInUx } from '../walletStateMachine'
import { engineMustNotOwnUx, hostMustNotOwnRouting } from '../widget'
import { authorizedSmartSwapFeeBps } from '../executionIntent'
import { protocolFeeFloor } from '../feeAccounting'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import { buildVenueRegistry } from '../venueRegistry'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const USER = '0x1111111111111111111111111111111111111111'
const NOW = 1_777_000_000

describe('SmartSwap Universal Engine M5 BNB canary readiness', () => {
  it('keeps production on legacy and M5 canary-ready without FEE_VERIFIED', () => {
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M5_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M5')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M4_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M4')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M3_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M3')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M2_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M2')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M1')
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(isUniversalEngineShadowOnly()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(M4_ACTIVE_CERTIFICATION).toBe(M4_CERTIFICATION_STATE.CANARY_PREPARED)
    expect(M5_ACTIVE_CERTIFICATION).toBe(M5_CERTIFICATION_STATE.CANARY_READY)
    expect(M5_CERTIFICATION_STATE.FEE_VERIFIED).toBe('FEE_VERIFIED')
    expect(M5_HARD_STOP.broadcast).toBe(false)
    expect(M5_HARD_STOP.markFeeVerified).toBe(false)
    expect(M5_HARD_STOP.founderSign).toBe(false)
    expect(M5_HARD_STOP.deployMainnet).toBe(false)
    expect(M5_HARD_STOP.activateV2).toBe(false)
  })

  it('selects Pancake WBNB-USDT from policy, not branding, with canonical Treasury', () => {
    expect(CANARY_VENUE_DECISION.selected).toBe('pancakeswap')
    expect(CANARY_VENUE_DECISION.rejected).toBe('melega-dex')
    expect(FIRST_CANARY_PAIR.chainId).toBe(EVM_CHAIN_IDS.BSC)
    expect(FIRST_CANARY_PAIR.router).toBe(PANCAKE_SWAP_VENUE.routers[56])
    expect(FIRST_CANARY_PAIR.output).toBe('0x55d398326f99059fF775485246999027B3197955')
    expect(FIRST_CANARY_PAIR.inputDecimals).toBe(18)
    expect(FIRST_CANARY_PAIR.outputDecimals).toBe(18)
    expect(FIRST_CANARY_PAIR.tokenClass).toBe(TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE)
    const pancake = requireExecutionTarget('pancakeswap', 56)
    expect(pancake.router.toLowerCase()).toBe(FIRST_CANARY_PAIR.router.toLowerCase())
    expect(pancake.eligibility).toBe(EXECUTION_ELIGIBILITY.ELIGIBLE)
    expect(CANONICAL_SMARTSWAP_FEE_BENEFICIARY).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(M5_DEPLOYMENT_PACKAGE.constructor.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
  })

  it('derives the 20 bps band from SMARTSWAP_REVENUE_POLICY_V1', () => {
    expect(authorizedSmartSwapFeeBps(CANARY_STRUCTURAL_ROUTE_COST_BPS)).toBe(20)
    const economics = buildCanaryEconomics()
    expect(economics.policyId).toBe(SMARTSWAP_REVENUE_POLICY_V1.id)
    expect(economics.policyVersion).toBe(SMARTSWAP_REVENUE_POLICY_V1.version)
    expect(economics.feeBps).toBe(20)
    expect(economics.feeAmount).toBe('20000000000000')
    expect(economics.venueInput).toBe('9980000000000000')
    expect(economics.inputAmount).toBe(CANARY_INPUT_AMOUNT)
    expect(economics.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(economics.broadcast).toBe(false)
    expect(protocolFeeFloor(CANARY_INPUT_AMOUNT, 20).feeRaw).toBe(economics.feeAmount)
    expect(BigInt(economics.feeAmount) + BigInt(economics.venueInput)).toBe(BigInt(CANARY_INPUT_AMOUNT))
  })

  it('seals an unsigned canary intent without a founder key', () => {
    const economics = buildCanaryEconomics()
    const intent = buildUnsignedCanaryIntent({
      user: USER,
      deadline: NOW + 30,
      nonce: '1',
      minUserOut: economics.minUserOut50Bps,
    })
    expect(intent.feeBps).toBe(20)
    expect(intent.feeAmount).toBe(economics.feeAmount)
    expect(intent.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase())
    expect(intent.chainId).toBe(56)
    expect(intent.outputAsset).toBe(FIRST_CANARY_PAIR.output.toLowerCase())
    expect(CANARY_INTENT_PLACEHOLDERS.signed).toBe(false)
    expect(CANARY_INTENT_PLACEHOLDERS.founderWallet).toBe(false)
    expect(FIRST_CANARY_SPEC.executed).toBe(false)
  })

  it('classifies fork success as FEE_ENFORCEABLE and never FEE_VERIFIED', () => {
    const economics = buildCanaryEconomics()
    const intent = buildUnsignedCanaryIntent({
      user: USER,
      deadline: NOW + 30,
      nonce: '101',
      minUserOut: economics.minUserOut50Bps,
    })
    const fork = verifyForkEconomics({
      intent,
      treasuryDelta: economics.feeAmount,
      userOutput: economics.factualNetQuoteRaw,
      chainId: 56,
    })
    expect(fork.txStatus).toBe('fork')
    expect(fork.collectionProven).toBe(false)
    expect(receiptToFeeState(fork)).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(classifyM5FeeState({ forkSucceeded: true, mainnetTxHash: null })).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(() => classifyM5FeeState({ forkSucceeded: true, mainnetTxHash: '0xabc' })).toThrow(V2_M5_FEE_VERIFIED_FORBIDDEN)
    const fact = {
      state: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
      bps: 20,
      formulaId: 'smartswap-revenue-policy-v1',
      amountRaw: economics.feeAmount,
      assetSymbol: 'WBNB',
      recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
      collectionProven: false,
      atomicWithSwap: true,
      productionExecutionEligible: false,
      gapCode: null,
    }
    expect(canMarkRouteProductionCapable(fact)).toBe(false)
    expect(() => markFeeCollected(fact)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(() => assertNeverFeeVerified()).toThrow(V2_M4_FEE_VERIFIED_FORBIDDEN)
    expect(() => assertM5NeverFeeVerified()).toThrow(V2_M5_FEE_VERIFIED_FORBIDDEN)
  })

  it('simulates atomic canary economics and rollback without broadcast', () => {
    const economics = buildCanaryEconomics()
    const intent = buildUnsignedCanaryIntent({
      user: USER,
      deadline: NOW + 30,
      nonce: '201',
      minUserOut: economics.minUserOut50Bps,
    })
    const ok = simulateFeeEnforcedExecution({
      intent,
      path: [FIRST_CANARY_PAIR.input, FIRST_CANARY_PAIR.output],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE,
      venueOutputOnNetInput: economics.factualNetQuoteRaw,
    })
    expect(ok.ok).toBe(true)
    expect(ok.broadcast).toBe(false)
    expect(ok.feeState).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(ok.treasuryDelta).toBe(economics.feeAmount)
    expect(ok.netVenueInput).toBe(economics.venueInput)
    expect(BigInt(ok.userOutput) >= BigInt(intent.minUserOut)).toBe(true)

    const revertIntent = buildUnsignedCanaryIntent({
      user: USER,
      deadline: NOW + 30,
      nonce: '202',
      minUserOut: economics.minUserOut50Bps,
    })
    const revert = simulateFeeEnforcedExecution({
      intent: revertIntent,
      path: [FIRST_CANARY_PAIR.input, FIRST_CANARY_PAIR.output],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE,
      venueOutputOnNetInput: economics.factualNetQuoteRaw,
      venueReverts: true,
    })
    expect(revert.ok).toBe(false)
    expect(revert.treasuryDelta).toBe('0')

    const minFail = simulateFeeEnforcedExecution({
      intent,
      path: [FIRST_CANARY_PAIR.input, FIRST_CANARY_PAIR.output],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.WRAPPED_NATIVE,
      venueOutputOnNetInput: '1',
    })
    expect(minFail.reason).toBe('MINIMUM_OUTPUT_FAILURE')
    expect(minFail.treasuryDelta).toBe('0')
  })

  it('keeps approval separate from execution and spender = executor', () => {
    expect(APPROVAL_MODEL.userApproves).toBe('SmartSwapExecutorV1')
    expect(APPROVAL_MODEL.approvalIsNotFeePayment).toBe(true)
    expect(APPROVAL_MODEL.unlimitedApprovals).toBe(false)
    expect(ENGINE_TX_STATE.APPROVAL_REQUIRED).toBe('APPROVAL_REQUIRED')
    expect(ENGINE_TX_STATE.FEE_VERIFIED).toBe('FEE_VERIFIED')
    expect(FROZEN_UX_ENGINE_STATE_MAP.enableToken).toBe(ENGINE_TX_STATE.APPROVAL_REQUIRED)
    expect(FROZEN_UX_ENGINE_STATE_MAP.feeReceiptProven).toBe(ENGINE_TX_STATE.FEE_VERIFIED)
    expect(m5MustNotExposeEngineStatesInUx()).toBe(true)
  })

  it('replays route economics without changing the M2 fee band', () => {
    const replay = replayCanaryRouteEconomics({
      directGasUnits: 120_000,
      executorGasUnits: 180_000,
      gasPriceWei: '1000000000',
    })
    expect(replay.feeBpsUnchanged).toBe(20)
    expect(replay.structuralRouteCostBps).toBe(25)
    expect(authorizedSmartSwapFeeBps(25)).toBe(20)
    expect(replay.stillRationalVsDirect).toBe(true)
    const overhead = recordGasOverhead({
      venueId: 'pancakeswap',
      chainId: 56,
      kind: GAS_OVERHEAD_KIND.FORK_BNB,
      directGasUnits: 120_000,
      feeEnforcedGasUnits: 180_000,
    })
    expect(overhead.overheadUnits).toBe(60_000)
  })

  it('defines disable/rollback without UX or user migration', () => {
    expect(M5_CANARY_ROLLBACK.uxChange).toBe(false)
    expect(M5_CANARY_ROLLBACK.userMigration).toBe(false)
    expect(M5_CANARY_ROLLBACK.returnAuthority).toContain('LEGACY_PRODUCTION')
    expect(M5_DEPLOYMENT_PACKAGE.broadcast).toBe(false)
    expect(M5_DEPLOYMENT_PACKAGE.create2).toBe(false)
    expect(M5_CANARY_CHECKLIST.broadcastNow).toBe(false)
    expect(() => assertM5NoMainnetBroadcast()).toThrow(V2_M5_MAINNET_BROADCAST_FORBIDDEN)
    expect(() => assertM5NoFounderSign()).toThrow(V2_M5_FOUNDER_SIGN_FORBIDDEN)
  })

  it('preserves adapter EXECUTE=false and production isolation', async () => {
    const pancake = createPancakeSwapVenueAdapter(
      createSyntheticQuoteSource({
        [`56:${FIRST_CANARY_PAIR.input.toLowerCase()}>${FIRST_CANARY_PAIR.output.toLowerCase()}`]: {
          amountOutRaw: '1',
        },
      }),
    )
    expect(pancake.capabilities().EXECUTE).toBe(false)
    const melega = createMelegaDexAdapter(null)
    expect(melega.capabilities().EXECUTE).toBe(false)
    expect(buildVenueRegistry(null).adapters).toHaveLength(1)
    expect(hostMustNotOwnRouting()).toBe(true)
    expect(engineMustNotOwnUx()).toBe(true)
  })

  it('does not change production wiring or frozen UX', () => {
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(callback).not.toContain('SmartSwapExecutorV1')
    expect(callback).not.toContain('buildUnsignedCanaryIntent')
    expect(callback).not.toContain('m5CanaryPackage')
    expect(readFileSync(path.join(ENGINE, 'm5CanaryPackage.ts'), 'utf8')).not.toContain('window.ethereum')
    expect(readFileSync(path.join(ENGINE, 'walletStateMachine.ts'), 'utf8')).not.toContain('SmartSwapForm')
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as { files: Record<string, string> }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })
})
