/**
 * LB021 / LB-ACT-003 — Activation gate consumer (read-only, fail-closed).
 */

import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LB021_REQUIRED_GATES,
  consumeActivationGates,
  loadAndConsumeActivationGates,
} from '../../liquidity-building-runtime/activationGateConsumer'
import { LB_EXECUTION_CRITICAL_GATE_IDS } from '../../liquidity-building-runtime/gateClassification'
import { LB_UX } from '../../../views/LiquidityStudio/liquidityBuilding/uxCopy'

const ROOT = path.resolve(__dirname, '../../../../../../')
const GATE_PATH = path.join(ROOT, 'deployments/liquidity-building/chain-56/activation-gate-final.v1.json')

const ADDR = {
  lbFactory: '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c',
  lbAuthorizer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  lbFeeSink: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  treasuryFeeReceiver: '0xcccccccccccccccccccccccccccccccccccccccc',
}

function executionGatesPass() {
  return LB_EXECUTION_CRITICAL_GATE_IDS.map((id) => ({
    gate: id,
    status: 'PASS',
    blocker: id,
    evidence: 'verified',
  }))
}

function accountingGateFail() {
  return [
    {
      gate: 'LB-G04C/G12',
      status: 'FAIL',
      blocker: 'LB-G04C/G12',
      evidence: 'Treasury Runtime ingestion not operational',
    },
  ]
}

describe('LB021 activation gate consumer', () => {
  it('consumes diagnostic gates as BLOCKED from live gate artifact', () => {
    const doc = JSON.parse(readFileSync(GATE_PATH, 'utf8'))
    const result = consumeActivationGates({
      activationAuthorized: doc.activationAuthorized,
      mainnetCycleAuthorized: doc.mainnetCycleAuthorized,
      manualOverrideForbidden: doc.manualOverrideForbidden,
      validatorResult: doc.validatorResult,
      deploymentReadinessState: 'BLOCKED',
      gates: doc.gates,
      addresses: { lbFactory: null, lbAuthorizer: null, lbFeeSink: null, treasuryFeeReceiver: null },
    })

    expect(LB021_REQUIRED_GATES).toHaveLength(7)
    expect(result.productStatus).toBe('BLOCKED')
    expect(result.activationAuthorized).toBe(false)
    expect(result.deploymentInputsValid).toBe(false)
    expect(result.contractsDeployed).toBe(false)
    expect(result.uiMode).toBe('blocked')
    expect(result.manualOverrideForbidden).toBe(true)
    expect(result.executionCriticalGatesReady).toBe(false)
    expect(result.allRequiredGatesReady).toBe(false)
    expect(result.accountingDegraded).toBe(true)
    for (const id of LB021_REQUIRED_GATES) {
      const g = result.gates.find((x) => x.id === id)
      expect(g?.state).toBe('BLOCKED')
    }
  })

  it('loadAndConsumeActivationGates is fail-closed against repo artifacts', () => {
    const result = loadAndConsumeActivationGates('2026-07-20T11:30:00.000Z')
    expect(result.schemaVersion).toBe('melega.liquidity-building.activation-gate-consumer.v1')
    expect(result.activationAuthorized).toBe(false)
    expect(result.validatorResult).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(result.executionBlockers.length).toBeGreaterThan(0)
    expect(result.accountingBlockers).toContain('LB-G04C/G12')
  })

  it('never reports READY without addresses + authorization + execution gates', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'VALID',
      gates: [...executionGatesPass(), ...accountingGateFail()],
      addresses: {
        lbFactory: null,
        lbAuthorizer: '0x1111111111111111111111111111111111111111',
        lbFeeSink: '0x2222222222222222222222222222222222222222',
        treasuryFeeReceiver: '0x3333333333333333333333333333333333333333',
      },
    })
    expect(result.productStatus).not.toBe('READY')
    expect(result.deploymentInputsValid).toBe(false)
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionBlockers).toContain('CONTRACTS_NOT_DEPLOYED')
  })

  it('READY when execution-critical requirements met — accounting may be degraded', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      mainnetCycleAuthorized: true,
      manualOverrideForbidden: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [...executionGatesPass(), ...accountingGateFail()],
      addresses: ADDR,
    })
    expect(result.productStatus).toBe('READY')
    expect(result.uiMode).toBe('available')
    expect(result.activationAuthorized).toBe(true)
    expect(result.deploymentInputsValid).toBe(true)
    expect(result.contractsDeployed).toBe(true)
    expect(result.executionCriticalGatesReady).toBe(true)
    expect(result.allRequiredGatesReady).toBe(true)
    expect(result.accountingReadiness).toBe(false)
    expect(result.accountingDegraded).toBe(true)
    expect(result.warnings).toContain('TREASURY_ACCOUNTING_DEGRADED')
    expect(result.executionBlockers).not.toContain('LB-G04C/G12')
    expect(result.executionBlockers).not.toContain('LB-G04C')
    expect(result.executionBlockers).not.toContain('LB-G12')
    expect(result.accountingBlockers).toEqual(expect.arrayContaining(['LB-G04C/G12', 'LB-G04C', 'LB-G12']))
    expect(result.gateClassifications.length).toBeGreaterThan(0)
    expect(result.gateClassifications.find((g) => g.gateId === 'LB-G04C')?.classification).toBe(
      'ACCOUNTING_ASYNC',
    )
    expect(result.secondaryWarning).toMatch(/Treasury accounting synchronization delayed/i)
  })

  it('manual activation / private key attempts → FAILED', () => {
    const a = consumeActivationGates({
      activationAuthorized: false,
      validatorResult: 'DEPLOYMENT_INPUTS_BLOCKED',
      deploymentReadinessState: 'BLOCKED',
      gates: [],
      manualActivationAttempt: true,
    })
    expect(a.productStatus).toBe('FAILED')
    expect(a.uiMode).toBe('blocked')

    const b = consumeActivationGates({
      activationAuthorized: false,
      validatorResult: 'DEPLOYMENT_INPUTS_BLOCKED',
      deploymentReadinessState: 'BLOCKED',
      gates: [],
      privateKeyConfigViolation: true,
    })
    expect(b.productStatus).toBe('FAILED')
  })

  it('rejects override-disabled flag as FAILED', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'VALID',
      manualOverrideForbidden: false,
      gates: [...executionGatesPass(), ...accountingGateFail()],
      addresses: ADDR,
    })
    expect(result.productStatus).toBe('FAILED')
    expect(result.activationAuthorized).toBe(false)
  })

  it('UI copy stays free of infrastructure jargon', () => {
    const blob = [
      LB_UX.activationAvailableBody,
      LB_UX.activationWaitingBody,
      LB_UX.activationBlockedBody,
      LB_UX.activationPendingBody,
    ].join(' ')
    expect(blob).not.toMatch(/KMS|BC003S|Treasury Runtime|HSM|relay infrastructure/i)
  })
})
