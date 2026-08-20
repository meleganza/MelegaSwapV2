import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { FIRST_CANARY_SPEC } from '../canarySpec'
import { PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { EVM_CHAIN_IDS, EXECUTION_DOMAIN, solanaNetwork } from '../domain'
import { EXECUTION_INTENT_TRUST, assertExecutionIntent, authorizedSmartSwapFeeBps, sealExecutionIntent } from '../executionIntent'
import { EXECUTION_ELIGIBILITY, executionTargetRegistry, requireExecutionTarget } from '../executionTargetRegistry'
import {
  APPROVAL_MODEL,
  FEE_COLLECTION_STRATEGY,
  assertNeverFeeVerified,
  assertSimulationCannotBroadcast,
  markSimulatedPathEnforceable,
  simulateFeeEnforcedExecution,
} from '../executorSimulation'
import { DECIMAL_CASES, FEE_ROUNDING, protocolFeeFloor, unitsForDecimals } from '../feeAccounting'
import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, markFeeCollected } from '../fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { GAS_OVERHEAD_KIND, recordGasOverhead } from '../gasOverhead'
import { SMARTSWAP_UNIVERSAL_ENGINE_M3_ID, SMARTSWAP_UNIVERSAL_ENGINE_M4_ID, isProductionCutoverAllowed } from '../operatingMode'
import {
  ACTIVE_V2_ROLLOUT,
  M4_ACTIVE_CERTIFICATION,
  M4_CERTIFICATION_STATE,
  V2_M4_FEE_VERIFIED_FORBIDDEN,
  V2_ROLLOUT_STATE,
  venueExecutionEnabled,
} from '../m4OperatingState'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { V2_SHADOW_EXECUTION_FORBIDDEN } from '../operatingMode'
import { receiptToFeeState, verifySimulatedEconomics } from '../receiptVerifier'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { TOKEN_EXECUTION_CLASS, classifyTokenForFeeEnforcedExecution } from '../tokenSupport'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { engineMustNotOwnUx, hostMustNotOwnRouting } from '../widget'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import { buildVenueRegistry } from '../venueRegistry'

const WEB = path.resolve(__dirname, '../../../..')
const ENGINE = path.join(WEB, 'src/lib/smartswap-universal-engine')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const USER = '0x1111111111111111111111111111111111111111'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const NOW = 1_777_000_000
const DEADLINE = NOW + 30

function pancakeIntent(partial: Partial<Parameters<typeof sealExecutionIntent>[0]> = {}) {
  const router = PANCAKE_SWAP_VENUE.routers[56]!
  return sealExecutionIntent({
    chainId: 56,
    user: USER,
    inputAsset: WBNB,
    outputAsset: USDC,
    inputAmount: '1000000',
    minUserOut: '1',
    venueId: 'pancakeswap',
    router,
    path: [WBNB, USDC],
    structuralRouteCostBps: 25,
    deadline: DEADLINE,
    nonce: '1',
    nativeIn: false,
    nativeOut: false,
    ...partial,
  })
}

describe('SmartSwap Universal Engine M4 fee enforcement', () => {
  it('keeps production on legacy and M4 in simulation/canary-prepared', () => {
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M4_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M4')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M3_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M3')
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(M4_ACTIVE_CERTIFICATION).toBe(M4_CERTIFICATION_STATE.CANARY_PREPARED)
    expect(M4_CERTIFICATION_STATE.PRODUCTION).toBe('PRODUCTION')
    expect(FEE_COLLECTION_STRATEGY).toBe('INPUT_ASSET_FEE')
    expect(SMARTSWAP_REVENUE_POLICY_V1.bands.map((b) => b.feeBps)).toEqual([25, 20, 15, 10, 5])
  })

  it('seals execution intent from policy and rejects fee=0 / wrong beneficiary / seal mutation', () => {
    const sealed = pancakeIntent()
    expect(sealed.feeBps).toBe(20)
    expect(sealed.feeAmount).toBe('2000')
    expect(sealed.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase())
    expect(() => pancakeIntent({ feeBpsOverride: 0 })).toThrow('FEE_BYPASS_REJECTED')
    expect(() => pancakeIntent({ beneficiaryOverride: USER })).toThrow('FEE_BENEFICIARY_NOT_CANONICAL')
    expect(() => assertExecutionIntent({ ...sealed, feeBps: 0, engineSeal: sealed.engineSeal }, NOW, 56)).toThrow(
      'FEE_BYPASS_REJECTED',
    )
    expect(() => assertExecutionIntent({ ...sealed, feeBps: 5 }, NOW, 56)).toThrow('WRONG_FEE')
    expect(() => assertExecutionIntent({ ...sealed, beneficiary: USER }, NOW, 56)).toThrow('WRONG_BENEFICIARY')
    expect(() => assertExecutionIntent(sealed, NOW, 1)).toThrow('WRONG_CHAIN')
    expect(() => assertExecutionIntent(sealed, DEADLINE + 1, 56)).toThrow('EXPIRED_INTENT')
    expect(() => assertExecutionIntent({ ...sealed, engineSeal: '0x00' }, NOW, 56)).toThrow('INTENT_SEAL_MISMATCH')
    expect(EXECUTION_INTENT_TRUST.eip712).toContain('Not required')
  })

  it('rejects wrong router, replay, expired, and fee above max', () => {
    const sealed = pancakeIntent()
    expect(
      simulateFeeEnforcedExecution({
        intent: { ...sealed, router: USER },
        path: [WBNB, USDC],
        nowTs: NOW,
        chainId: 56,
        tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
        venueOutputOnNetInput: '100',
      }).reason,
    ).toMatch(/INTENT_SEAL_MISMATCH|WRONG_ROUTER/)
    const used = new Set<string>()
    const first = simulateFeeEnforcedExecution({
      intent: sealed,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '50',
      usedNonces: used,
    })
    expect(first.ok).toBe(true)
    const replay = simulateFeeEnforcedExecution({
      intent: sealed,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '50',
      usedNonces: used,
    })
    expect(replay.ok).toBe(false)
    expect(replay.reason).toBe('REPLAY')
    expect(authorizedSmartSwapFeeBps(0)).toBe(25)
    expect(() => assertExecutionIntent({ ...sealed, feeBps: 30, feeAmount: '3000' }, NOW, 56)).toThrow()
  })

  it('accounts every M2 band on 1,000,000 units', () => {
    const cases: Array<[number, number, string]> = [
      [10, 25, '2500'],
      [25, 20, '2000'],
      [40, 15, '1500'],
      [60, 10, '1000'],
      [61, 5, '500'],
    ]
    for (const [structural, bps, fee] of cases) {
      const split = protocolFeeFloor('1000000', bps)
      expect(split.feeRaw).toBe(fee)
      expect(authorizedSmartSwapFeeBps(structural)).toBe(bps)
      const intent = pancakeIntent({ structuralRouteCostBps: structural, nonce: String(structural) })
      expect(intent.feeBps).toBe(bps)
      expect(intent.feeAmount).toBe(fee)
    }
    expect(FEE_ROUNDING.neverChargeAboveSealedBps).toBe(true)
  })

  it('is decimal-aware and floors so the user is never overcharged', () => {
    for (const decimals of DECIMAL_CASES) {
      const amount = unitsForDecimals('1', decimals)
      const fee = protocolFeeFloor(amount, 25)
      expect(BigInt(fee.feeRaw) * 10_000n <= BigInt(amount) * 25n).toBe(true)
      expect(BigInt(fee.feeRaw) + BigInt(fee.netRaw)).toBe(BigInt(amount))
    }
    expect(protocolFeeFloor('1', 25).feeRaw).toBe('0')
  })

  it('uses post-fee venue input and treats minimum received as user output', () => {
    const intent = pancakeIntent({ minUserOut: '980000' })
    const sim = simulateFeeEnforcedExecution({
      intent,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '990000',
    })
    expect(sim.ok).toBe(true)
    expect(sim.netVenueInput).toBe('998000')
    expect(sim.userOutput).toBe('990000')
    expect(sim.minUserOutSatisfied).toBe(true)
    expect(sim.balances?.treasuryFee).toBe('2000')
    const tooLow = simulateFeeEnforcedExecution({
      intent,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '10',
    })
    expect(tooLow.reason).toBe('MINIMUM_OUTPUT_FAILURE')
    expect(tooLow.treasuryDelta).toBe('0')
  })

  it('reverts atomically on venue failure and fee settlement failure', () => {
    const intent = pancakeIntent({ nonce: '9' })
    const venue = simulateFeeEnforcedExecution({
      intent,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '100',
      venueReverts: true,
    })
    expect(venue.ok).toBe(false)
    expect(venue.reason).toBe('VENUE_REVERT')
    expect(venue.treasuryDelta).toBe('0')
    const feeFail = simulateFeeEnforcedExecution({
      intent: pancakeIntent({ nonce: '10' }),
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '100',
      feeSettlementFails: true,
    })
    expect(feeFail.reason).toBe('FEE_SETTLEMENT_FAILURE')
    expect(feeFail.treasuryDelta).toBe('0')
  })

  it('classifies non-standard tokens as unsupported and native paths as supported', () => {
    expect(classifyTokenForFeeEnforcedExecution({ feeOnTransfer: true })).toBe(
      TOKEN_EXECUTION_CLASS.UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION,
    )
    expect(classifyTokenForFeeEnforcedExecution({ rebasing: true })).toBe(
      TOKEN_EXECUTION_CLASS.UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION,
    )
    expect(classifyTokenForFeeEnforcedExecution({ native: true })).toBe(TOKEN_EXECUTION_CLASS.NATIVE)
    const fot = simulateFeeEnforcedExecution({
      intent: pancakeIntent({ nonce: '11', nativeIn: true, inputAsset: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' }),
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION,
      venueOutputOnNetInput: '1',
    })
    expect(fot.reason).toBe('UNSUPPORTED_FOR_FEE_ENFORCED_EXECUTION')
    const native = simulateFeeEnforcedExecution({
      intent: pancakeIntent({
        nonce: '12',
        nativeIn: true,
        inputAsset: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      }),
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.NATIVE,
      venueOutputOnNetInput: '5',
    })
    expect(native.ok).toBe(true)
  })

  it('allowlists only verified execution targets and keeps Uniswap not execution-eligible', () => {
    const pancake = requireExecutionTarget('pancakeswap', 56)
    const melega = requireExecutionTarget('melega-dex', 56)
    expect(pancake.router.toLowerCase()).toBe(PANCAKE_SWAP_VENUE.routers[56]!.toLowerCase())
    expect(melega.router.toLowerCase()).toBe('0xc25033218d181b27d4a2944fbb04fc055da4eab3')
    expect(() => requireExecutionTarget('uniswap', 1)).toThrow('NOT_EXECUTION_ELIGIBLE')
    expect(executionTargetRegistry().find((row) => row.venueId === 'uniswap')?.eligibility).toBe(
      EXECUTION_ELIGIBILITY.NOT_EXECUTION_ELIGIBLE,
    )
    expect(APPROVAL_MODEL.permit2).toBe(false)
    expect(APPROVAL_MODEL.userApproves).toBe('SmartSwapExecutorV1')
  })

  it('simulates Melega and Pancake BSC fee-enforced exact-in without broadcast', () => {
    const pancake = simulateFeeEnforcedExecution({
      intent: pancakeIntent({ nonce: '20' }),
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '610000',
    })
    expect(pancake.ok).toBe(true)
    expect(pancake.broadcast).toBe(false)
    expect(pancake.feeState).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    const melega = simulateFeeEnforcedExecution({
      intent: pancakeIntent({
        nonce: '21',
        venueId: 'melega-dex',
        router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
      }),
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '600000',
    })
    expect(melega.ok).toBe(true)
    expect(melega.intent.venueId).toBe('melega-dex')
    assertSimulationCannotBroadcast(pancake)
  })

  it('verifies simulated receipts without marking FEE_VERIFIED', () => {
    const intent = pancakeIntent({ nonce: '30' })
    const sim = simulateFeeEnforcedExecution({
      intent,
      path: [WBNB, USDC],
      nowTs: NOW,
      chainId: 56,
      tokenClass: TOKEN_EXECUTION_CLASS.STANDARD_ERC20,
      venueOutputOnNetInput: '500',
    })
    const evidence = verifySimulatedEconomics({
      intent,
      treasuryDelta: sim.treasuryDelta,
      userOutput: sim.userOutput,
      chainId: 56,
    })
    expect(evidence.collectionProven).toBe(false)
    expect(receiptToFeeState(evidence)).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    const fact = markSimulatedPathEnforceable(sim)
    expect(fact.state).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(fact.collectionProven).toBe(false)
    expect(canMarkRouteProductionCapable(fact)).toBe(false)
    expect(() => markFeeCollected(fact)).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(() => assertNeverFeeVerified()).toThrow(V2_M4_FEE_VERIFIED_FORBIDDEN)
  })

  it('exposes executor overhead to total execution cost without using it for fee bands', () => {
    const overhead = recordGasOverhead({
      venueId: 'pancakeswap',
      chainId: 56,
      kind: GAS_OVERHEAD_KIND.LOCAL_SIMULATION,
      directGasUnits: 120_000,
      feeEnforcedGasUnits: 165_000,
    })
    expect(overhead.overheadUnits).toBe(45_000)
    expect(authorizedSmartSwapFeeBps(25)).toBe(20)
  })

  it('preserves adapter EXECUTE=false and requires the canonical executor', async () => {
    const pancake = createPancakeSwapVenueAdapter(
      createSyntheticQuoteSource({
        [`56:${WBNB}>${USDC}`]: { amountOutRaw: '1' },
      }),
    )
    expect(pancake.capabilities().EXECUTE).toBe(false)
    await expect(pancake.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    await expect(pancake.prepareExecution!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    expect(await pancake.simulate!({} as never, {} as never, new AbortController().signal)).toEqual({
      ok: false,
      reason: 'CANONICAL_EXECUTOR_REQUIRED',
    })
    const melega = createMelegaDexAdapter(null)
    await expect(melega.execute!({} as never, {} as never)).rejects.toThrow(V2_SHADOW_EXECUTION_FORBIDDEN)
    expect(buildVenueRegistry(null).adapters).toHaveLength(1)
  })

  it('does not split routes, cross-chain, Solana, or Robinhood', () => {
    expect(solanaNetwork().domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(CANONICAL_EXAMPLE_ASSETS.usdcSolana.domain).toBe(EXECUTION_DOMAIN.SOLANA)
    expect(venueExecutionEnabled('robinhood', {})).toBe(false)
    expect(FIRST_CANARY_SPEC.executed).toBe(false)
    expect(FIRST_CANARY_SPEC.chainId).toBe(EVM_CHAIN_IDS.BSC)
    expect(hostMustNotOwnRouting()).toBe(true)
    expect(engineMustNotOwnUx()).toBe(true)
  })

  it('does not change production wiring or frozen UX', () => {
    const callback = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(callback).not.toContain('simulateFeeEnforcedExecution')
    expect(callback).not.toContain('SmartSwapExecutorV1')
    expect(callback).not.toContain('settleGasProtocolFeeOnChain')
    for (const name of ['executorSimulation.ts', 'executionIntent.ts', 'SmartSwapExecutorV1.sol']) {
      void name
    }
    expect(readFileSync(path.join(ENGINE, 'executorSimulation.ts'), 'utf8')).not.toContain('window.ethereum')
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
