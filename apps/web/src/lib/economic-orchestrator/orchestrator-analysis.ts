import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { resolveEconomicIdentityReadModel } from 'lib/economic-identity'
import { buildDefaultPipeline } from 'lib/labs-economic-pipeline'
import { PipelineStageStatus } from 'lib/labs-economic-pipeline/pipeline-types'
import { resolveLabsRuntimeReadModel } from 'lib/labs-runtime'
import { resolveSmartExecutionReadModel } from 'lib/smart-execution'
import { resolveUserLaunchReadModel } from 'lib/user-launch'
import { resolveUserWorkspaceReadModel } from 'lib/user-workspace'
import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAllPresence } from 'registry/presence/getAllPresence'
import { getAllProjects } from 'registry/projects/getAllProjects'
import {
  EconomicStateSnapshot,
  OrchestratorInputSnapshot,
  OrchestratorStatus,
  PipelineStageSnapshot,
} from './orchestrator-types'

export interface OrchestratorAnalysisContext {
  constitutional: ReturnType<typeof getConstitutionalCanonicalEconomy>
  pipelineStages: PipelineStageSnapshot[]
  labsConnected: boolean
  projectsIndexed: number
  assetsIndexed: number
  presenceIndexed: number
  launchCapabilitiesLive: number
  executionIllustrative: boolean
  identityStatus: OrchestratorStatus
  inputs: OrchestratorInputSnapshot[]
  currentState: EconomicStateSnapshot
}

const mapStatus = (status: string): OrchestratorStatus => {
  if (status === 'ready' || status === 'LIVE') return 'ready'
  if (status === 'waiting' || status === 'AVAILABLE_EXISTING_FLOW') return 'waiting'
  if (status === 'planned' || status === 'PLANNED') return 'planned'
  if (status === 'blocked' || status === 'BLOCKED') return 'blocked'
  if (status === 'not_indexed' || status === 'NOT_SUPPORTED') return 'not_indexed'
  if (status === 'connected') return 'ready'
  return 'not_indexed'
}

const stageStatus = (status: PipelineStageStatus): OrchestratorStatus => mapStatus(status)

const findPipelineStage = (stages: PipelineStageSnapshot[], id: string) =>
  stages.find((stage) => stage.stageId === id)

export const analyzeEconomicState = (): OrchestratorAnalysisContext => {
  const constitutional = getConstitutionalCanonicalEconomy()
  const pipeline = buildDefaultPipeline()
  const runtime = resolveLabsRuntimeReadModel()
  const workspace = resolveUserWorkspaceReadModel()
  const launch = resolveUserLaunchReadModel()
  const execution = resolveSmartExecutionReadModel()
  const identity = resolveEconomicIdentityReadModel()
  const projects = getAllProjects()
  const assets = getAllAssets()
  const presence = getAllPresence()

  const pipelineStages: PipelineStageSnapshot[] = pipeline.stages.map((stage) => ({
    stageId: stage.id,
    label: stage.label,
    status: stageStatus(stage.status),
  }))

  const launchLive = launch.capabilities.filter(
    (capability) =>
      capability.status === 'LIVE' || capability.status === 'AVAILABLE_EXISTING_FLOW',
  ).length

  const inputs: OrchestratorInputSnapshot[] = [
    {
      id: 'pipeline',
      label: 'Labs Economic Pipeline',
      status: mapStatus('ready'),
      route: '/pipeline',
      manifestUri: '/registry/pipeline/labs-economic-pipeline.json',
      notes: `${pipeline.readiness.ready}/${pipeline.readiness.total} stages ready in reference pipeline.`,
    },
    {
      id: 'labs_runtime',
      label: 'Labs Runtime',
      status: runtime.labsConnected ? 'ready' : 'waiting',
      route: '/runtime/labs',
      manifestUri: '/registry/runtime/labs-runtime.json',
      notes: runtime.labsConnected ? 'Runtime connected.' : 'Labs runtime not indexed — observation waiting.',
    },
    {
      id: 'workspace',
      label: 'Workspace',
      status: 'ready',
      route: '/workspace',
      manifestUri: '/registry/workspace/index.json',
      notes: `${workspace.sections.filter((section) => section.hasActivity).length} active sections.`,
    },
    {
      id: 'launch',
      label: 'Launch',
      status: launchLive > 0 ? 'ready' : 'waiting',
      route: '/launch',
      manifestUri: '/registry/launch/index.json',
      notes: `${launchLive} live or existing-flow capabilities.`,
    },
    {
      id: 'projects',
      label: 'Projects',
      status: projects.length > 0 ? 'ready' : 'not_indexed',
      route: '/projects',
      manifestUri: '/registry/projects/index.json',
      notes: `${projects.length} indexed projects.`,
    },
    {
      id: 'assets',
      label: 'Assets',
      status: assets.length > 0 ? 'ready' : 'not_indexed',
      route: '/assets',
      manifestUri: '/registry/assets/index.json',
      notes: `${assets.length} indexed assets.`,
    },
    {
      id: 'presence',
      label: 'Presence',
      status: presence.length > 0 ? 'ready' : 'not_indexed',
      route: '/presence',
      manifestUri: '/registry/presence/index.json',
      notes: `${presence.length} presence targets indexed.`,
    },
    {
      id: 'execution',
      label: 'Execution',
      status: 'planned',
      route: '/execution',
      manifestUri: '/registry/execution/index.json',
      notes: 'Illustrative execution surface — live swaps route to /swap.',
    },
    {
      id: 'identity',
      label: 'Identity',
      status: mapStatus(identity.wallet.status),
      route: '/identity',
      manifestUri: '/registry/identity/index.json',
      notes: identity.wallet.notes,
    },
  ]

  const currentState: EconomicStateSnapshot = {
    summary: runtime.labsConnected
      ? 'Labs runtime connected — orchestrating from observed narrative and pipeline sync.'
      : `Economic OS indexed with ${projects.length} projects and ${assets.length} assets. Labs narrative observation waiting — recommendations derived from pipeline evidence only.`,
    labsConnected: runtime.labsConnected,
    pipelineStages,
    projectsIndexed: projects.length,
    assetsIndexed: assets.length,
    presenceIndexed: presence.length,
    launchCapabilitiesLive: launchLive,
  }

  return {
    constitutional,
    pipelineStages,
    labsConnected: runtime.labsConnected,
    projectsIndexed: projects.length,
    assetsIndexed: assets.length,
    presenceIndexed: presence.length,
    launchCapabilitiesLive: launchLive,
    executionIllustrative: true,
    identityStatus: mapStatus(identity.wallet.status),
    inputs,
    currentState,
  }
}

export const buildDependencyGraph = (
  ctx: OrchestratorAnalysisContext,
): import('./orchestrator-types').DependencyGraphNode[] => {
  const stageRoute: Record<string, string> = {
    narrative: '/new-project',
    validation: '/new-project',
    project: '/projects',
    asset: '/assets',
    metadata: '/assets',
    liquidity: '/launch',
    registry: '/graph',
    presence: '/presence',
    execution: '/execution',
    workspace: '/workspace',
  }

  const order = ctx.pipelineStages.map((stage) => stage.stageId)
  const dependsOnMap: Record<string, string[]> = {
    narrative: [],
    validation: ['narrative'],
    project: ['validation'],
    asset: ['project'],
    metadata: ['asset'],
    liquidity: ['asset', 'metadata'],
    registry: ['project', 'asset'],
    presence: ['registry', 'asset'],
    execution: ['presence'],
    workspace: ['registry', 'presence'],
  }

  return ctx.pipelineStages.map((stage) => ({
    id: stage.stageId,
    label: stage.label,
    status: stage.status,
    route: stageRoute[stage.stageId] ?? '/pipeline',
    dependsOn: (dependsOnMap[stage.stageId] ?? []).filter((dep) => order.includes(dep)),
  }))
}

export const findStageInContext = (ctx: OrchestratorAnalysisContext, id: string) =>
  findPipelineStage(ctx.pipelineStages, id)
