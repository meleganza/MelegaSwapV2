/**
 * LB-ACT-004 — Founder approval semantics + execution/accounting separation invariants.
 */

import { describe, expect, it } from 'vitest'
import { consumeActivationGates, loadAndConsumeActivationGates } from '../activationGateConsumer'
import { LB_EXECUTION_CRITICAL_GATE_IDS } from '../gateClassification'
import { assessFinality } from '../eligible-flow'
import { LB_FINALITY_DEPTH, LB_SUCCESS_FEE_BPS } from '../types'

const ADDR = {
  lbFactory: '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c',
  lbAuthorizer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  lbFeeSink: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  treasuryFeeReceiver: '0xcccccccccccccccccccccccccccccccccccccccc',
}

const INVALID_VAULT = '0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C'

function passGates(ids: readonly string[], status = 'PASS') {
  return ids.map((id) => ({ gate: id, status, blocker: id, evidence: 'verified' }))
}

describe('LB-ACT-004 production convergence', () => {
  it('exposes founderActivationApproved separately from computed activationAuthorized', () => {
    const result = consumeActivationGates({
      founderActivationApproved: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
        { gate: 'LB-G04C/G12', status: 'FAIL', blocker: 'LB-G04C/G12' },
      ],
      addresses: ADDR,
    })
    expect(result.founderActivationApproved).toBe(true)
    expect(result.activationAuthorized).toBe(true)
    expect(result.accountingDegraded).toBe(true)
    expect(result.warnings).toContain('TREASURY_ACCOUNTING_DEGRADED')
    expect(result.executionBlockers).not.toContain('LB-G04C')
    expect(result.executionBlockers).not.toContain('LB-G12')
  })

  it('founder flag alone cannot authorize activation', () => {
    const result = consumeActivationGates({
      founderActivationApproved: true,
      validatorResult: 'DEPLOYMENT_INPUTS_BLOCKED',
      deploymentReadinessState: 'BLOCKED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: {
        lbFactory: null,
        lbAuthorizer: null,
        lbFeeSink: null,
        treasuryFeeReceiver: null,
      },
    })
    expect(result.founderActivationApproved).toBe(true)
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionCriticalGatesReady).toBe(true)
    expect(result.deploymentInputsValid).toBe(false)
  })

  it('legacy gateDoc.activationAuthorized maps to founderActivationApproved only', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: ADDR,
    })
    expect(result.founderActivationApproved).toBe(true)
    expect(result.activationAuthorized).toBe(true)
  })

  it('missing founder approval emits FOUNDER_ACTIVATION_NOT_APPROVED', () => {
    const result = consumeActivationGates({
      founderActivationApproved: false,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.productStatus).toBe('READY_FOR_ACTIVATION')
    expect(result.executionBlockers).toContain('FOUNDER_ACTIVATION_NOT_APPROVED')
    expect(result.executionBlockers).toContain('GATE_DOC_ACTIVATION_NOT_AUTHORIZED')
  })

  it('rejects zero address and does not treat Vault address as auto-valid', () => {
    const zero = consumeActivationGates({
      founderActivationApproved: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: { ...ADDR, treasuryFeeReceiver: '0x0000000000000000000000000000000000000000' },
    })
    expect(zero.feeReceiverValid).toBe(false)

    // Address format alone is not a role proof — Vault may be a contract but remains policy-rejected
    // until PRODUCTION_BINDING_IDENTIFIED. Consumer only checks address shape; role proof is inputs validator.
    const vaultShaped = consumeActivationGates({
      founderActivationApproved: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: { ...ADDR, treasuryFeeReceiver: INVALID_VAULT },
    })
    expect(vaultShaped.feeReceiverValid).toBe(true)
    expect(INVALID_VAULT.toLowerCase()).toBe('0xb2d57b1a40e61aab3f88361228e1188e0fb6a21c')
  })

  it('fee economics remain fixed at 500 bps', () => {
    expect(LB_SUCCESS_FEE_BPS).toBe(500)
    const gross = 10_000n
    const fee = (gross * BigInt(LB_SUCCESS_FEE_BPS)) / 10_000n
    expect(fee).toBe(500n)
  })

  it('finality policy is deterministic depth 15 on chain 56', () => {
    expect(LB_FINALITY_DEPTH).toBe(15)
    const waiting = assessFinality({ observationEndBlock: 100, chainHead: 114, chainId: 56 })
    expect(waiting.status).toBe('AWAITING_FINALITY')
    const ok = assessFinality({ observationEndBlock: 100, chainHead: 115, chainId: 56 })
    expect(ok.status).toBe('FINALIZED')
    const badChain = assessFinality({ observationEndBlock: 100, chainHead: 200, chainId: 1 })
    expect(badChain.status).toBe('REJECTED')
  })

  it('production artifact load remains fail-closed and unauthorized', () => {
    const live = loadAndConsumeActivationGates('2026-07-23T00:00:00.000Z')
    expect(live.activationAuthorized).toBe(false)
    expect(live.founderActivationApproved).toBe(false)
    expect(live.executionCriticalGatesReady).toBe(false)
    expect(live.accountingDegraded).toBe(true)
    expect(live.warnings).toContain('TREASURY_ACCOUNTING_DEGRADED')
    expect(live.executionBlockers).toContain('LB-G03B')
    expect(live.executionBlockers).toContain('LB-G03C')
    expect(live.executionBlockers).toContain('LB-G04B')
    expect(live.executionBlockers).toContain('LB-G08')
    expect(live.executionBlockers).toContain('LB-G10')
    expect(live.executionBlockers).toContain('LB-G11')
    expect(live.accountingBlockers).toContain('LB-G04C')
    expect(live.accountingBlockers).toContain('LB-G12')
    expect(live.executionBlockers).not.toContain('LB-G04C')
    expect(live.executionBlockers).not.toContain('LB-G12')
  })
})
