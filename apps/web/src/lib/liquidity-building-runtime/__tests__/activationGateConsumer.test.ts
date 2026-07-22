/**
 * LB021 — Activation gate consumer (read-only, fail-closed).
 */

import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LB021_REQUIRED_GATES,
  consumeActivationGates,
  loadAndConsumeActivationGates,
} from '../../liquidity-building-runtime/activationGateConsumer'
import { LB_UX } from '../../../views/LiquidityStudio/liquidityBuilding/uxCopy'

const ROOT = path.resolve(__dirname, '../../../../../../')
const GATE_PATH = path.join(ROOT, 'deployments/liquidity-building/chain-56/activation-gate-final.v1.json')

describe('LB021 activation gate consumer', () => {
  it('consumes all required external gates as BLOCKED from live gate artifact', () => {
    const doc = JSON.parse(readFileSync(GATE_PATH, 'utf8'))
    const result = consumeActivationGates({
      activationAuthorized: doc.activationAuthorized,
      mainnetCycleAuthorized: doc.mainnetCycleAuthorized,
      manualOverrideForbidden: doc.manualOverrideForbidden,
      validatorResult: doc.validatorResult,
      deploymentReadinessState: 'BLOCKED',
      gates: doc.gates,
      addresses: { lbFactory: null, lbAuthorizer: null, lbFeeSink: null },
    })

    expect(LB021_REQUIRED_GATES).toHaveLength(7)
    expect(result.productStatus).toBe('PENDING_EXTERNAL_ACTIVATION')
    expect(result.activationAuthorized).toBe(false)
    expect(result.deploymentInputsValid).toBe(false)
    expect(result.contractsDeployed).toBe(false)
    expect(result.uiMode).toBe('pending')
    expect(result.manualOverrideForbidden).toBe(true)
    expect(result.allRequiredGatesReady).toBe(false)
    for (const id of LB021_REQUIRED_GATES) {
      const g = result.gates.find((x) => x.id === id)
      expect(g?.state).toBe('BLOCKED')
    }
  })

  it('loadAndConsumeActivationGates is fail-closed against repo artifacts', () => {
    const result = loadAndConsumeActivationGates('2026-07-20T11:30:00.000Z')
    expect(result.schemaVersion).toBe('melega.liquidity-building.activation-gate-consumer.v1')
    expect(result.productStatus).toBe('PENDING_EXTERNAL_ACTIVATION')
    expect(result.activationAuthorized).toBe(false)
    expect(result.validatorResult).toBe('DEPLOYMENT_INPUTS_BLOCKED')
  })

  it('never reports READY without addresses + authorization + all gates', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'VALID',
      gates: LB021_REQUIRED_GATES.map((id) => ({
        gate: id,
        status: 'PASS',
        blocker: id,
      })),
      addresses: {
        lbFactory: null,
        lbAuthorizer: '0x1111111111111111111111111111111111111111',
        lbFeeSink: '0x2222222222222222222222222222222222222222',
      },
    })
    expect(result.productStatus).not.toBe('READY')
    expect(result.deploymentInputsValid).toBe(false)
    expect(result.activationAuthorized).toBe(false)
  })

  it('READY only when every requirement is met — no mock gates', () => {
    const factory = '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c'
    const authorizer = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    const sink = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const result = consumeActivationGates({
      activationAuthorized: true,
      mainnetCycleAuthorized: true,
      manualOverrideForbidden: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: LB021_REQUIRED_GATES.map((id) => ({
        gate: id,
        status: 'PASS',
        blocker: id,
        evidence: 'verified',
      })),
      addresses: { lbFactory: factory, lbAuthorizer: authorizer, lbFeeSink: sink },
    })
    expect(result.productStatus).toBe('READY')
    expect(result.uiMode).toBe('available')
    expect(result.activationAuthorized).toBe(true)
    expect(result.deploymentInputsValid).toBe(true)
    expect(result.contractsDeployed).toBe(true)
    expect(result.allRequiredGatesReady).toBe(true)
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
      gates: LB021_REQUIRED_GATES.map((id) => ({ gate: id, status: 'PASS', blocker: id })),
      addresses: {
        lbFactory: '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c',
        lbAuthorizer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        lbFeeSink: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
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
