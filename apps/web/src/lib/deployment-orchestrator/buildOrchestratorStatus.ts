import { probeProductionAuthority } from './authority'
import { getAllCanaryStatuses } from './canary'
import { computeGlobalState, humanNextAction } from './computeState'
import { DEPLOYMENT_ORDER } from './order'
import { buildAllRollbackPlans } from './rollback'
import {
  snapshotCreateToken,
  snapshotLiquidityBuilder,
  snapshotPublicFarmFactory,
} from './subsystems'
import type { OrchestratorStatus } from './types'

/** Compose one canonical orchestrator status from existing subsystem readiness. */
export function buildOrchestratorStatus(now: Date = new Date()): OrchestratorStatus {
  const updatedAt = now.toISOString()
  const authority = probeProductionAuthority()
  const subsystems = [
    snapshotLiquidityBuilder(authority.productionAuthorityPresent, updatedAt),
    snapshotCreateToken(authority.productionAuthorityPresent, updatedAt),
    snapshotPublicFarmFactory(authority.productionAuthorityPresent, updatedAt),
  ]
  const globalState = computeGlobalState(subsystems.map((s) => s.state))
  const firstNonLive = subsystems.find((s) => s.state !== 'LIVE') ?? subsystems[0]

  return {
    schema: 'melega.dex.v1.deployment-orchestrator.status',
    updatedAt,
    globalState,
    order: [...DEPLOYMENT_ORDER],
    subsystems,
    authority: {
      productionAuthorityPresent: authority.productionAuthorityPresent,
      authorityModel: authority.authorityModel,
      authorizedDeployer: authority.authorizedDeployer,
      blockers: authority.blockers,
      env: authority.env,
      notes: authority.notes,
    },
    canary: getAllCanaryStatuses(),
    rollback: buildAllRollbackPlans(),
    nextAction: humanNextAction(
      globalState,
      firstNonLive.label,
      authority.productionAuthorityPresent,
    ),
  }
}
