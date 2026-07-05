import { OrchestratorAnalysisContext, findStageInContext } from './orchestrator-analysis'
import { OrchestratorRecommendation } from './orchestrator-types'

export type OrchestratorRule = {
  id: string
  when: (ctx: OrchestratorAnalysisContext) => boolean
  build: (ctx: OrchestratorAnalysisContext) => OrchestratorRecommendation
}

const rec = (
  partial: Omit<OrchestratorRecommendation, 'blockingDependencies'> & {
    blockingDependencies?: string[]
  },
): OrchestratorRecommendation => ({
  blockingDependencies: [],
  ...partial,
})

export const ORCHESTRATOR_RULES: OrchestratorRule[] = [
  {
    id: 'labs_runtime_waiting',
    when: (ctx) => !ctx.labsConnected,
    build: () =>
      rec({
        id: 'labs_runtime_waiting',
        currentState: 'Labs runtime disconnected',
        missingRequirement: 'Labs runtime observation',
        reason: 'Narrative events cannot be observed — orchestration evidence incomplete.',
        priority: 'critical',
        status: 'waiting',
        targetSurface: 'Labs Runtime',
        targetRoute: '/runtime/labs',
        humanAction: 'Open Labs Runtime and verify connection status before narrative-driven steps.',
        aiAction: 'Probe labs://runtime/observer — do not invent narrative_created events.',
        blockingDependencies: ['labs_runtime'],
        futureDependency: 'narrative_created event stream',
      }),
  },
  {
    id: 'narrative_ready_create_project',
    when: (ctx) => {
      const narrative = findStageInContext(ctx, 'narrative')
      const project = findStageInContext(ctx, 'project')
      return narrative?.status === 'ready' && project?.status !== 'ready' && ctx.projectsIndexed === 0
    },
    build: () =>
      rec({
        id: 'narrative_ready_create_project',
        currentState: 'Narrative READY',
        missingRequirement: 'Indexed project identity',
        reason: 'Validated narrative ready for project registry binding.',
        priority: 'high',
        status: 'waiting',
        targetSurface: 'Projects',
        targetRoute: '/projects',
        humanAction: 'Create or bind project identity after Labs validation.',
        aiAction: 'Resolve UPI at /registry/projects/index.json — no fake project slugs.',
        blockingDependencies: ['narrative', 'validation'],
      }),
  },
  {
    id: 'project_ready_asset_missing',
    when: (ctx) => {
      const project = findStageInContext(ctx, 'project')
      const asset = findStageInContext(ctx, 'asset')
      return project?.status === 'ready' && asset?.status !== 'ready' && ctx.assetsIndexed === 0
    },
    build: () =>
      rec({
        id: 'project_ready_asset_missing',
        currentState: 'Project READY',
        missingRequirement: 'Canonical or presence asset binding',
        reason: 'Project indexed but no asset UAI bound.',
        priority: 'high',
        status: 'waiting',
        targetSurface: 'Assets',
        targetRoute: '/assets',
        humanAction: 'Create or bind asset registry entry for the project.',
        aiAction: 'Resolve UAI at /registry/assets/index.json.',
        blockingDependencies: ['project'],
      }),
  },
  {
    id: 'metadata_not_indexed',
    when: (ctx) => findStageInContext(ctx, 'metadata')?.status === 'not_indexed',
    build: () =>
      rec({
        id: 'metadata_not_indexed',
        currentState: 'Asset indexed — metadata missing',
        missingRequirement: 'Token list metadata and brand assets',
        reason: 'Metadata stage is not_indexed — no auto-submission from narrative.',
        priority: 'normal',
        status: 'not_indexed',
        targetSurface: 'Launch',
        targetRoute: '/build-studio#build-import',
        humanAction: 'Review Launch capabilities for metadata submission — planned handoff only.',
        aiAction: 'Do not invent token list entries — show not_indexed until indexed.',
        blockingDependencies: ['asset'],
        futureDependency: 'labs://metadata/submit',
      }),
  },
  {
    id: 'asset_ready_liquidity_missing',
    when: (ctx) => {
      const asset = findStageInContext(ctx, 'asset')
      const liquidity = findStageInContext(ctx, 'liquidity')
      return asset?.status === 'ready' && (liquidity?.status === 'waiting' || liquidity?.status === 'not_indexed')
    },
    build: () =>
      rec({
        id: 'asset_ready_liquidity_missing',
        currentState: 'Asset READY — liquidity missing',
        missingRequirement: 'On-chain liquidity provision',
        reason: 'Liquidity requires wallet action via existing /add flow — not automated.',
        priority: 'high',
        status: 'waiting',
        targetSurface: 'Launch',
        targetRoute: '/build-studio#build-import',
        humanAction: 'Open Launch and use Create Liquidity / Create Pool links to /add.',
        aiAction: 'Route live liquidity to legacy /add — never fake TVL or pool state.',
        blockingDependencies: ['asset'],
      }),
  },
  {
    id: 'liquidity_ready_presence_missing',
    when: (ctx) => {
      const liquidity = findStageInContext(ctx, 'liquidity')
      const presence = findStageInContext(ctx, 'presence')
      return liquidity?.status === 'ready' && presence?.status !== 'ready' && ctx.presenceIndexed === 0
    },
    build: () =>
      rec({
        id: 'liquidity_ready_presence_missing',
        currentState: 'Liquidity READY — presence missing',
        missingRequirement: 'Economic presence targets',
        reason: 'Liquidity provision indexed but presence targets not staged.',
        priority: 'normal',
        status: 'waiting',
        targetSurface: 'Presence',
        targetRoute: '/presence',
        humanAction: 'Activate Economic Presence targets — read model at /new-project.',
        aiAction: 'Distinguish canonical MARCO from presence-only deployments.',
        blockingDependencies: ['liquidity', 'registry'],
      }),
  },
  {
    id: 'presence_ready_execution_waiting',
    when: (ctx) => {
      const presence = findStageInContext(ctx, 'presence')
      const execution = findStageInContext(ctx, 'execution')
      return presence?.status === 'ready' && (execution?.status === 'planned' || execution?.status === 'waiting')
    },
    build: () =>
      rec({
        id: 'presence_ready_execution_waiting',
        currentState: 'Presence READY — execution waiting',
        missingRequirement: 'Execution decision review',
        reason: 'Execution surface is illustrative — pre-swap decision layer only.',
        priority: 'normal',
        status: 'planned',
        targetSurface: 'Execution',
        targetRoute: '/execution',
        humanAction: 'Review Execution samples — route live swaps to /swap.',
        aiAction: 'Never execute trades on /execution — illustrative read model only.',
        blockingDependencies: ['presence'],
        futureDependency: 'manifest://melega/platform/execution@0.2.0',
      }),
  },
  {
    id: 'execution_ready_workspace_refresh',
    when: (ctx) => {
      const execution = findStageInContext(ctx, 'execution')
      const workspace = findStageInContext(ctx, 'workspace')
      return execution?.status === 'ready' && workspace?.status === 'ready'
    },
    build: () =>
      rec({
        id: 'execution_ready_workspace_refresh',
        currentState: 'Execution READY — workspace may be stale',
        missingRequirement: 'Workspace aggregate refresh',
        reason: 'Operator hub should reflect latest indexed activity across surfaces.',
        priority: 'low',
        status: 'ready',
        targetSurface: 'Workspace',
        targetRoute: '/command-center',
        humanAction: 'Refresh Workspace to review aggregated economic activity.',
        aiAction: 'Aggregate section links from workspace manifest — no fake balances.',
        blockingDependencies: ['execution'],
      }),
  },
  {
    id: 'narrative_planned_handoff',
    when: (ctx) => findStageInContext(ctx, 'narrative')?.status === 'planned',
    build: () =>
      rec({
        id: 'narrative_planned_handoff',
        currentState: 'Narrative stage planned',
        missingRequirement: 'Labs narrative handoff',
        reason: 'No validated narrative indexed — pipeline cannot advance past narrative stage.',
        priority: 'high',
        status: 'planned',
        targetSurface: 'Activation Preview',
        targetRoute: '/new-project',
        humanAction: 'Review Activation preview and Labs pipeline — narrative not live.',
        aiAction: 'Resolve labs://narrative/preview — status planned, not ready.',
        blockingDependencies: ['labs_runtime', 'narrative'],
        futureDependency: 'narrative_ready event',
      }),
  },
  {
    id: 'orient_surface_map',
    when: () => true,
    build: () =>
      rec({
        id: 'orient_surface_map',
        currentState: 'Economic OS multi-surface',
        missingRequirement: 'Orientation',
        reason: 'Surface map provides constitutional compass for humans and agents.',
        priority: 'low',
        status: 'ready',
        targetSurface: 'Surface Map',
        targetRoute: '/map',
        humanAction: 'Open Map to understand all surfaces and manifest links.',
        aiAction: 'Fetch /registry/surfaces/index.json before routing execution.',
        blockingDependencies: [],
      }),
  },
]
