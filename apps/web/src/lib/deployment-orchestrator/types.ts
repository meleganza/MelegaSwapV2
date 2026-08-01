/**
 * Deployment Orchestrator — shared types.
 * Orchestrates LB + Create Token + Public Farm Factory. Does not duplicate readiness engines.
 */

export type DeploymentLifecycleState =
  | 'NOT_READY'
  | 'READY'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'VERIFIED'
  | 'BOUND'
  | 'LIVE'
  | 'BLOCKED'

export type SubsystemId = 'liquidity_builder' | 'create_token' | 'public_farm_factory'

export type CanaryStatus = 'Pending' | 'Executed' | 'Passed' | 'Failed'

export type SubsystemLane = {
  contracts: boolean
  deploy: boolean
  verify: boolean
  bind: boolean
  frontend: boolean
  runtime: boolean
  canary: CanaryStatus
}

export type SubsystemSnapshot = {
  id: SubsystemId
  label: string
  state: DeploymentLifecycleState
  lanes: SubsystemLane
  readiness: Record<string, unknown>
  blockers: string[]
  addresses: Record<string, string | null>
  packagePath: string
  dependsOn: SubsystemId | null
  sequence: number
  updatedAt: string
}

export type RollbackPlan = {
  subsystemId: SubsystemId | 'global'
  trigger: string
  steps: string[]
  preserve: string[]
  forbid: string[]
}

export type OrchestratorStatus = {
  schema: 'melega.dex.v1.deployment-orchestrator.status'
  updatedAt: string
  globalState: DeploymentLifecycleState
  order: SubsystemId[]
  subsystems: SubsystemSnapshot[]
  authority: {
    productionAuthorityPresent: boolean
    authorityModel: 'FOUNDER_WALLET_SIGNED'
    authorizedDeployer: string
    blockers: string[]
    env: Record<string, 'SET' | 'UNSET'>
    notes?: string[]
  }
  canary: Record<SubsystemId, CanaryStatus>
  rollback: RollbackPlan[]
  nextAction: string
}
