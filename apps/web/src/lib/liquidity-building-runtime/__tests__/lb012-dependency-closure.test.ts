import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { buildActivationGates } from '../activation-gates'

describe('LB012 production dependency closure artifact', () => {
  it('closure artifact keeps activation fail-closed with explicit blockers', () => {
    const p = path.resolve(
      __dirname,
      '../../../../../../deployments/liquidity-building/chain-56/production-dependency-closure.v1.json',
    )
    const doc = JSON.parse(readFileSync(p, 'utf8'))
    expect(doc.schemaVersion).toBe('melega.liquidity-building.production-dependency-closure.v1')
    expect(doc.activationAuthorized).toBe(false)
    expect(doc.mainnetCycleAuthorized).toBe(false)
    expect(doc.authorities.productionAuthority.verdict).toBe('AUTONOMOUS_AUTHORITY_NOT_PROVISIONED')
    expect(doc.treasury.receiver.verdict).toBe('PRODUCTION_BINDING_NOT_FOUND')
    expect(doc.deployment.validatorResult).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(doc.blockersRemaining).toEqual(
      expect.arrayContaining(['LB-G03B', 'LB-G04B', 'LB-G11', 'LB-G12']),
    )
    expect(doc.securityScan.NO_PRIVATE_KEY_FALLBACK).toBe(true)
    expect(doc.securityScan.NO_MOCK_PRODUCTION_DEPENDENCY).toBe(true)
  })

  it('activation gates builder still denies authorization', () => {
    const g = buildActivationGates()
    expect(g.activationAuthorized).toBe(false)
  })

  it('activation-gate-final LB012 remains unauthorized', () => {
    const p = path.resolve(
      __dirname,
      '../../../../../../deployments/liquidity-building/chain-56/activation-gate-final.v1.json',
    )
    const doc = JSON.parse(readFileSync(p, 'utf8'))
    expect(doc.mission).toBe('LB012')
    expect(doc.activationAuthorized).toBe(false)
    expect(doc.mainnetCycleExecuted).toBe(false)
  })
})
