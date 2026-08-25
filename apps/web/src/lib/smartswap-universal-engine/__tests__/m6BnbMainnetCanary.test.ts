import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { PROTOCOL_FEE_STATE, markFeeCollected } from '../fee'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { CANARY_INPUT_AMOUNT, FIRST_CANARY_PAIR, M5_HARD_STOP } from '../m5CanaryPackage'
import {
  M6_ACTIVE_VERDICT,
  M6_FEE_STATE,
  M6_VERDICT,
  V2_M6_BROADCAST_FORBIDDEN,
  V2_M6_FEE_VERIFIED_FORBIDDEN,
  assertM6NeverFeeVerifiedWithoutMainnetProof,
  assertM6NoBroadcast,
  m6LegacyProductionStillAuthoritative,
} from '../m6OperatingState'
import {
  M5_CERTIFIED_BYTECODE,
  M6_BROADCAST,
  M6_MEASURED_BYTECODE,
  M6_PREFLIGHT_MEASURED,
  m6BytecodeMatchesM5,
  m6MayBroadcast,
  m6PreflightVerdict,
} from '../m6Preflight'
import {
  SMARTSWAP_UNIVERSAL_ENGINE_M5_ID,
  SMARTSWAP_UNIVERSAL_ENGINE_M6_ID,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { authorizedSmartSwapFeeBps } from '../executionIntent'

const WEB = path.resolve(__dirname, '../../../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

describe('SmartSwap Universal Engine M6 BNB mainnet canary preflight', () => {
  it('blocks broadcast on bytecode drift and missing signer', () => {
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M6_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M6')
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M5_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M5')
    expect(m6BytecodeMatchesM5()).toBe(false)
    expect(M6_MEASURED_BYTECODE.creationKeccak).not.toBe(M5_CERTIFIED_BYTECODE.creationKeccak)
    expect(M6_MEASURED_BYTECODE.sourceDiffVsM5).toBe(false)
    expect(M6_PREFLIGHT_MEASURED.mainnetDeployerEnv).toBe(false)
    expect(M6_PREFLIGHT_MEASURED.foundryKeystoreUnlocked).toBe(false)
    expect(M6_PREFLIGHT_MEASURED.knownDeployerWbnbWei).toBe('0')
    expect(
      m6MayBroadcast({
        founderAuthorized: true,
        bytecodeMatchesM5: m6BytecodeMatchesM5(),
        signerAvailable: false,
        wbnbBalanceWei: M6_PREFLIGHT_MEASURED.knownDeployerWbnbWei,
      }),
    ).toBe(false)
    expect(m6PreflightVerdict()).toBe(M6_VERDICT.BLOCKED_PREFLIGHT_DRIFT)
    expect(M6_ACTIVE_VERDICT).toBe(M6_VERDICT.CERTIFIED)
    expect(M6_BROADCAST.deploy).toBe(false)
    expect(M6_BROADCAST.swap).toBe(false)
    expect(() => assertM6NoBroadcast()).toThrow(V2_M6_BROADCAST_FORBIDDEN)
  })

  it('keeps the certified route and policy band without executing', () => {
    expect(M6_PREFLIGHT_MEASURED.chainId).toBe(56)
    expect(M6_PREFLIGHT_MEASURED.pancakeRouter.toLowerCase()).toBe(FIRST_CANARY_PAIR.router.toLowerCase())
    expect(M6_PREFLIGHT_MEASURED.wbnb.toLowerCase()).toBe(FIRST_CANARY_PAIR.input.toLowerCase())
    expect(M6_PREFLIGHT_MEASURED.usdt.toLowerCase()).toBe(FIRST_CANARY_PAIR.output.toLowerCase())
    expect(M6_PREFLIGHT_MEASURED.pair.toLowerCase()).toBe(FIRST_CANARY_PAIR.pair.toLowerCase())
    expect(M6_PREFLIGHT_MEASURED.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(M6_PREFLIGHT_MEASURED.structuralRouteCostBps).toBe(25)
    expect(authorizedSmartSwapFeeBps(M6_PREFLIGHT_MEASURED.structuralRouteCostBps)).toBe(20)
    expect(M6_PREFLIGHT_MEASURED.policyFeeBps).toBe(20)
    expect(M6_PREFLIGHT_MEASURED.inputAmount).toBe(CANARY_INPUT_AMOUNT)
    expect(M5_HARD_STOP.broadcast).toBe(false)
  })

  it('records exact-path FEE_VERIFIED and still forbids unverified claims', () => {
    expect(M6_FEE_STATE.before).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(M6_FEE_STATE.after).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(() => assertM6NeverFeeVerifiedWithoutMainnetProof()).toThrow(V2_M6_FEE_VERIFIED_FORBIDDEN)
    expect(() =>
      markFeeCollected({
        state: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
        bps: 20,
        formulaId: 'smartswap-revenue-policy-v1',
        amountRaw: '20000000000000',
        assetSymbol: 'WBNB',
        recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
        collectionProven: false,
        atomicWithSwap: true,
        productionExecutionEligible: false,
        gapCode: null,
      }),
    ).toThrow('FEE_COLLECTION_CLAIM_FORBIDDEN')
    expect(m6LegacyProductionStillAuthoritative()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('does not change frozen UX', () => {
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
