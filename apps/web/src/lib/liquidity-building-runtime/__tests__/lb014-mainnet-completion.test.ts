import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { assessLiquidityBuildingRuntimeHealth } from '../readiness'

const ROOT = path.resolve(__dirname, '../../../../../../')
const CHAIN56 = path.join(ROOT, 'deployments/liquidity-building/chain-56')

describe('LB014 mainnet completion gates', () => {
  it('runtime health remains fail-closed (not READY)', () => {
    const report = assessLiquidityBuildingRuntimeHealth()
    expect(report.status).not.toBe('READY')
    expect(report.reasons.join(' ')).toMatch(/DEPLOYMENT_INPUTS_BLOCKED|LB-G/)
  })

  it('activation-gate-final forbids mainnet cycle', () => {
    const gate = JSON.parse(readFileSync(path.join(CHAIN56, 'activation-gate-final.v1.json'), 'utf8'))
    expect(gate.activationAuthorized).toBe(false)
    expect(gate.mainnetCycleAuthorized).toBe(false)
    expect(gate.mainnetCycleExecuted).toBe(false)
    expect(gate.manualOverrideForbidden).toBe(true)
  })

  it('LB014 completion artifact records exact external blockers', () => {
    const artifactPath = path.join(CHAIN56, 'lb014-mainnet-completion.v1.json')
    expect(existsSync(artifactPath)).toBe(true)
    const doc = JSON.parse(readFileSync(artifactPath, 'utf8'))
    expect(doc.verdict).toBe('LB014_IMPLEMENTED_WITH_EXTERNAL_BLOCKERS')
    expect(doc.mainnetCycleExecuted).toBe(false)
    expect(doc.ui.liquidityBuildingCard).toBe('INTEGRATED')
    expect(Array.isArray(doc.externalBlockers)).toBe(true)
    expect(doc.externalBlockers.length).toBeGreaterThanOrEqual(5)
    expect(doc.scopeFrozen).toBe(true)
  })

  it('does not invent Treasury receiver or quote policies', () => {
    const inputs = JSON.parse(readFileSync(path.join(CHAIN56, 'LiquidityBuildingV1.inputs.json'), 'utf8'))
    expect(inputs.treasury.receiverAddress).toBeNull()
    expect(inputs.quotePolicies).toEqual([])
    expect(inputs.deploymentReadinessState).toBe('BLOCKED')
  })
})
