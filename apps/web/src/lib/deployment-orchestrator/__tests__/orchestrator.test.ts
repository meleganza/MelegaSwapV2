import { describe, expect, it } from 'vitest'
import { probeProductionAuthority } from '../authority'
import { assessSubsystemBinding, bindLiquidityBuilderCandidate } from '../binding'
import { buildOrchestratorStatus } from '../buildOrchestratorStatus'
import { getAllCanaryStatuses } from '../canary'
import { computeGlobalState, computeSubsystemState } from '../computeState'
import { DEPLOYMENT_ORDER, DEPLOYMENT_ORDER_STEPS } from '../order'
import { buildAllRollbackPlans, buildGlobalRollback } from '../rollback'

describe('deployment orchestrator readiness', () => {
  it('uses canonical LB → Create Token → Public Farm Factory order', () => {
    expect([...DEPLOYMENT_ORDER]).toEqual([
      'liquidity_builder',
      'create_token',
      'public_farm_factory',
    ])
    expect(DEPLOYMENT_ORDER_STEPS.map((s) => s.id)).toEqual([...DEPLOYMENT_ORDER])
  })

  it('builds status with global BLOCKED when authority missing and packages unbound', () => {
    const status = buildOrchestratorStatus(new Date('2026-07-30T00:00:00.000Z'))
    expect(status.schema).toBe('melega.dex.v1.deployment-orchestrator.status')
    expect(status.subsystems).toHaveLength(3)
    expect(status.globalState).toBe('BLOCKED')
    expect(status.authority.productionAuthorityPresent).toBe(false)
    expect(status.authority.blockers.some((b) => /Missing (deploy authorization|KMS|RPC)/i.test(b))).toBe(
      true,
    )
    for (const snap of status.subsystems) {
      expect(snap.state).toBe('BLOCKED')
      expect(snap.lanes.contracts).toBe(true)
      expect(snap.blockers.length).toBeGreaterThan(0)
    }
    expect(status.nextAction).toMatch(/production deployment authority/i)
  })

  it('exposes canary Pending for all subsystems before live runs', () => {
    const canary = getAllCanaryStatuses()
    expect(canary.liquidity_builder).toBe('Pending')
    expect(canary.create_token).toBe('Pending')
    expect(canary.public_farm_factory).toBe('Pending')
  })
})

describe('deployment orchestrator binding', () => {
  it('reports all three subsystems unbound without fabricating addresses', () => {
    expect(assessSubsystemBinding('liquidity_builder').bound).toBe(false)
    expect(assessSubsystemBinding('create_token').bound).toBe(false)
    expect(assessSubsystemBinding('public_farm_factory').bound).toBe(false)
  })

  it('delegates LB binding to resolveProductionBinding fail-closed helper', () => {
    const rejected = bindLiquidityBuilderCandidate({
      chainId: 56,
      deploymentReadinessState: 'BLOCKED',
      activationAuthorized: false,
      lbFactory: null,
      lbAuthorizer: null,
      lbFeeSink: null,
    })
    expect(rejected.ok).toBe(false)
    if (!rejected.ok) expect(rejected.reason).toBe('DEPLOYMENT_INPUTS_BLOCKED')
  })
})

describe('deployment orchestrator status / state machine', () => {
  it('computes subsystem and global states', () => {
    expect(
      computeSubsystemState({
        packageReady: true,
        authorityPresent: false,
        deployed: false,
        verified: false,
        bound: false,
        runtimeReady: false,
        canaryPassed: false,
      }),
    ).toBe('BLOCKED')

    expect(
      computeSubsystemState({
        packageReady: true,
        authorityPresent: true,
        deployed: false,
        verified: false,
        bound: false,
        runtimeReady: false,
        canaryPassed: false,
      }),
    ).toBe('READY')

    expect(computeGlobalState(['BLOCKED', 'BLOCKED', 'BLOCKED'])).toBe('BLOCKED')
    expect(computeGlobalState(['LIVE', 'BLOCKED', 'NOT_READY'])).toBe('BLOCKED')
    expect(computeGlobalState(['LIVE', 'LIVE', 'LIVE'])).toBe('LIVE')
  })

  it('authority probe never returns secrets — only SET/UNSET', () => {
    const auth = probeProductionAuthority()
    for (const v of Object.values(auth.env)) {
      expect(v === 'SET' || v === 'UNSET').toBe(true)
    }
  })

  it('generates per-subsystem and global rollback plans', () => {
    const plans = buildAllRollbackPlans()
    expect(plans).toHaveLength(4)
    expect(buildGlobalRollback().subsystemId).toBe('global')
    expect(plans.some((p) => p.forbid.includes('Deploying without production authority'))).toBe(true)
  })
})
