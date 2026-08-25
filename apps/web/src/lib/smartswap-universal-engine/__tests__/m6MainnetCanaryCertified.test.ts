import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_FEE_STATE, markFeeCollected } from '../fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import {
  M6_BNB_MAINNET_CANARY_CERTIFIED,
  M6_BNB_MAINNET_CANARY_PROOF,
  classifyM6ExactPathFeeState,
  exactM6MainnetProofMatches,
  exactM6PathFeeFact,
  m6CanaryCertifiedComplete,
} from '../m6MainnetCanaryCertification'
import {
  M6_ACTIVE_VERDICT,
  M6_FEE_STATE,
  M6_VERDICT,
  V2_M6_FEE_VERIFIED_FORBIDDEN,
  assertM6NeverFeeVerifiedWithoutMainnetProof,
  m6LegacyProductionStillAuthoritative,
} from '../m6OperatingState'
import { isProductionCutoverAllowed } from '../operatingMode'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

describe('SmartSwap M6 BNB mainnet canary certification', () => {
  it('locks the independently proven exact-path FEE_VERIFIED facts', () => {
    expect(M6_ACTIVE_VERDICT).toBe(M6_VERDICT.CERTIFIED)
    expect(M6_ACTIVE_VERDICT).toBe(M6_BNB_MAINNET_CANARY_CERTIFIED)
    expect(M6_FEE_STATE.after).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(M6_BNB_MAINNET_CANARY_PROOF.createTx).toBe(
      '0x3f9d56f0e0d1094a304ed66d256db2e3e55539ae022128e8be7d2ca4d6664b70',
    )
    expect(M6_BNB_MAINNET_CANARY_PROOF.setRouterTx).toBe(
      '0xbc9b4f30c7aca55679a6002d2c4ac3b56a969d498cd0e97ab37dc917e4fcdbbc',
    )
    expect(M6_BNB_MAINNET_CANARY_PROOF.approvalTx).toBe(
      '0x25b28862e960a0e1606c97279c797ba34af0c4cd7301cf677b319b0a763f41e1',
    )
    expect(M6_BNB_MAINNET_CANARY_PROOF.canaryTx).toBe(
      '0x5c0ded0d0381529d8c4d6edcde2e34f0360d4f8b1a60969e92ab7ae09fb9a4fd',
    )
    expect(M6_BNB_MAINNET_CANARY_PROOF.executor).toBe('0x296015b106F4b2FB94249cf398cbF05d4CcE0391')
    expect(M6_BNB_MAINNET_CANARY_PROOF.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(M6_BNB_MAINNET_CANARY_PROOF.feeAmountWbnb).toBe('20000000000000')
    expect(M6_BNB_MAINNET_CANARY_PROOF.venueInputWbnb).toBe('9980000000000000')
    expect(M6_BNB_MAINNET_CANARY_PROOF.userOutUsdt).toBe('6946714420281522671')
    expect(M6_BNB_MAINNET_CANARY_PROOF.structuralBps).toBe(25)
    expect(M6_BNB_MAINNET_CANARY_PROOF.smartSwapFeeBps).toBe(20)
    expect(M6_BNB_MAINNET_CANARY_PROOF.intentNonce).toBe(1)
    expect(M6_BNB_MAINNET_CANARY_PROOF.intentNonceConsumedOnce).toBe(true)
    expect(m6CanaryCertifiedComplete()).toBe(true)
    expect(
      classifyM6ExactPathFeeState({
        createTx: M6_BNB_MAINNET_CANARY_PROOF.createTx,
        setRouterTx: M6_BNB_MAINNET_CANARY_PROOF.setRouterTx,
        approvalTx: M6_BNB_MAINNET_CANARY_PROOF.approvalTx,
        canaryTx: M6_BNB_MAINNET_CANARY_PROOF.canaryTx,
        executor: M6_BNB_MAINNET_CANARY_PROOF.executor,
        treasury: M6_BNB_MAINNET_CANARY_PROOF.treasury,
        feeAmountWbnb: M6_BNB_MAINNET_CANARY_PROOF.feeAmountWbnb,
        venueInputWbnb: M6_BNB_MAINNET_CANARY_PROOF.venueInputWbnb,
        userOutUsdt: M6_BNB_MAINNET_CANARY_PROOF.userOutUsdt,
        structuralBps: M6_BNB_MAINNET_CANARY_PROOF.structuralBps,
        smartSwapFeeBps: M6_BNB_MAINNET_CANARY_PROOF.smartSwapFeeBps,
        intentNonce: M6_BNB_MAINNET_CANARY_PROOF.intentNonce,
      }),
    ).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(markFeeCollected(exactM6PathFeeFact()).state).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(exactM6PathFeeFact().productionExecutionEligible).toBe(false)
    expect(m6LegacyProductionStillAuthoritative()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('keeps V2_M6_FEE_VERIFIED_FORBIDDEN for any drifted proof', () => {
    expect(() => assertM6NeverFeeVerifiedWithoutMainnetProof()).toThrow(V2_M6_FEE_VERIFIED_FORBIDDEN)
    expect(
      exactM6MainnetProofMatches({
        createTx: M6_BNB_MAINNET_CANARY_PROOF.createTx,
        setRouterTx: M6_BNB_MAINNET_CANARY_PROOF.setRouterTx,
        approvalTx: M6_BNB_MAINNET_CANARY_PROOF.approvalTx,
        canaryTx: '0x0000000000000000000000000000000000000000000000000000000000000001',
        executor: M6_BNB_MAINNET_CANARY_PROOF.executor,
        treasury: M6_BNB_MAINNET_CANARY_PROOF.treasury,
        feeAmountWbnb: M6_BNB_MAINNET_CANARY_PROOF.feeAmountWbnb,
        venueInputWbnb: M6_BNB_MAINNET_CANARY_PROOF.venueInputWbnb,
        userOutUsdt: M6_BNB_MAINNET_CANARY_PROOF.userOutUsdt,
        structuralBps: M6_BNB_MAINNET_CANARY_PROOF.structuralBps,
        smartSwapFeeBps: M6_BNB_MAINNET_CANARY_PROOF.smartSwapFeeBps,
        intentNonce: M6_BNB_MAINNET_CANARY_PROOF.intentNonce,
      }),
    ).toBe(false)
    expect(() =>
      classifyM6ExactPathFeeState({
        createTx: M6_BNB_MAINNET_CANARY_PROOF.createTx,
        setRouterTx: M6_BNB_MAINNET_CANARY_PROOF.setRouterTx,
        approvalTx: M6_BNB_MAINNET_CANARY_PROOF.approvalTx,
        canaryTx: M6_BNB_MAINNET_CANARY_PROOF.canaryTx,
        executor: M6_BNB_MAINNET_CANARY_PROOF.executor,
        treasury: M6_BNB_MAINNET_CANARY_PROOF.treasury,
        feeAmountWbnb: '1',
        venueInputWbnb: M6_BNB_MAINNET_CANARY_PROOF.venueInputWbnb,
        userOutUsdt: M6_BNB_MAINNET_CANARY_PROOF.userOutUsdt,
        structuralBps: M6_BNB_MAINNET_CANARY_PROOF.structuralBps,
        smartSwapFeeBps: M6_BNB_MAINNET_CANARY_PROOF.smartSwapFeeBps,
        intentNonce: M6_BNB_MAINNET_CANARY_PROOF.intentNonce,
      }),
    ).toThrow(V2_M6_FEE_VERIFIED_FORBIDDEN)
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
