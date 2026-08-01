import { describe, expect, it } from 'vitest'
import { probeProductionAuthority } from '../authority'
import { assessSubsystemBinding, bindLiquidityBuilderCandidate } from '../binding'
import { buildOrchestratorStatus } from '../buildOrchestratorStatus'
import { getAllCanaryStatuses } from '../canary'
import { computeGlobalState, computeSubsystemState } from '../computeState'
import { DEPLOYMENT_ORDER, DEPLOYMENT_ORDER_STEPS } from '../order'
import { buildAllRollbackPlans, buildGlobalRollback } from '../rollback'
import { AUTHORIZED_MELEGA_DEPLOYER } from '../founderDeployer'

describe('deployment orchestrator readiness', () => {
  it('uses canonical LB → Create Token → Public Farm Factory order', () => {
    expect([...DEPLOYMENT_ORDER]).toEqual([
      'liquidity_builder',
      'create_token',
      'public_farm_factory',
    ])
    expect(DEPLOYMENT_ORDER_STEPS.map((s) => s.id)).toEqual([...DEPLOYMENT_ORDER])
  })

  it('Founder authority present; LB BOUND advances global state; CT/PFF await Founder signature', () => {
    const status = buildOrchestratorStatus(new Date('2026-07-30T00:00:00.000Z'))
    expect(status.schema).toBe('melega.dex.v1.deployment-orchestrator.status')
    expect(status.subsystems).toHaveLength(3)
    expect(status.authority.authorityModel).toBe('FOUNDER_WALLET_SIGNED')
    expect(status.authority.productionAuthorityPresent).toBe(true)
    expect(status.authority.authorizedDeployer).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect(status.authority.blockers).toEqual([])
    expect(status.globalState).toBe('BOUND')
    const lb = status.subsystems.find((s) => s.id === 'liquidity_builder')
    expect(lb?.state).toBe('BOUND')
    expect(lb?.lanes.contracts).toBe(true)
    expect(lb?.lanes.runtime).toBe(true)
    const ct = status.subsystems.find((s) => s.id === 'create_token')
    expect(ct?.state).toBe('READY')
    expect(status.nextAction).toMatch(/Confirm Liquidity Builder runtime READY/i)
    expect(status.founderExecution.pauseState).toBe('AWAITING_FOUNDER_WALLET')
    expect(status.founderExecution.serverSideSigning).toBe(false)
  })

  it('exposes canary Pending for all subsystems before live runs', () => {
    const canary = getAllCanaryStatuses()
    expect(canary.liquidity_builder).toBe('Pending')
    expect(canary.create_token).toBe('Pending')
    expect(canary.public_farm_factory).toBe('Pending')
  })
})

describe('deployment orchestrator binding', () => {
  it('reports LB bound; Create Token and Public Farm remain unbound', () => {
    expect(assessSubsystemBinding('liquidity_builder').bound).toBe(true)
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

    expect(computeGlobalState(['READY', 'READY', 'READY'])).toBe('READY')
    expect(computeGlobalState(['LIVE', 'READY', 'READY'])).toBe('READY')
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
  })
})
