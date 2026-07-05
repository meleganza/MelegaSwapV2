import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { PIPELINE_REQUIREMENTS } from './pipeline-requirements'
import { assertPipelineStageOrder, PIPELINE_STAGE_ORDER } from './pipeline-stages'
import {
  LabsEconomicPipeline,
  LabsEconomicPipelineReadModel,
  PipelineDependency,
  PipelineStage,
  PipelineStageId,
  PipelineStageStatus,
} from './pipeline-types'

export const LABS_PIPELINE_VERSION = '0.1.0'

export const LABS_PIPELINE_AS_OF = '2026-06-29'

export const LABS_PIPELINE_DISCLAIMER =
  'Labs → Economic Pipeline read model only. No token deployment, liquidity execution, contract interaction, or router modification. Missing data surfaces as not_indexed; future execution surfaces as planned.'

export const DEFAULT_PIPELINE_ID = 'labs-preview-to-marco-economy'

export const PIPELINE_LINKED_SURFACES = [
  '/build-studio#build-import',
  '/new-project',
  '/projects',
  '/assets',
  '/presence',
  '/execution',
  '/command-center',
  '/map',
  '/pipeline',
]

export const PIPELINE_CROSS_LINKS = [
  { label: 'Launch', route: '/build-studio#build-import' },
  { label: 'Activation Preview', route: '/new-project' },
  { label: 'Projects', route: '/projects' },
  { label: 'Assets', route: '/assets' },
  { label: 'Presence', route: '/presence' },
  { label: 'Execution', route: '/execution' },
  { label: 'Workspace', route: '/command-center' },
  { label: 'Surface Map', route: '/map' },
]

const dep = (stageId: PipelineStageId, label: string, required = true): PipelineDependency => ({
  stageId,
  label,
  required,
})

const stage = (
  id: PipelineStageId,
  status: PipelineStageStatus,
  fields: Omit<PipelineStage, 'id' | 'status' | 'requiredInputs' | 'dependencies'> & {
    requiredInputs?: PipelineStage['requiredInputs']
    dependencies?: PipelineStage['dependencies']
  },
): PipelineStage => ({
  id,
  status,
  requiredInputs: (fields.requiredInputs ?? PIPELINE_REQUIREMENTS[id]).map((input) => ({ ...input })),
  dependencies: (fields.dependencies ?? []).map((dependency) => ({ ...dependency })),
  label: fields.label,
  purpose: fields.purpose,
  humanAction: fields.humanAction,
  agentAction: fields.agentAction,
  outputArtifact: fields.outputArtifact,
  linkedSurface: fields.linkedSurface,
  manifestUri: fields.manifestUri,
  blockedReason: fields.blockedReason,
  plannedReason: fields.plannedReason,
})

const buildLabsPreviewToMarcoEconomyStages = (): PipelineStage[] => [
  stage('narrative', 'planned', {
    label: 'Narrative',
    purpose: 'Capture Labs-style project narrative before economic indexing.',
    humanAction: 'Draft narrative in Labs preview — not deployed from DEX homepage.',
    agentAction: 'Resolve labs://narrative/preview — no fake validated narrative in DEX.',
    outputArtifact: 'labs://narrative/preview',
    linkedSurface: '/new-project',
    manifestUri: '/registry/activation/runtime.json',
    plannedReason: 'Labs narrative handoff pipeline not indexed in this build.',
    dependencies: [],
  }),
  stage('validation', 'planned', {
    label: 'Validation',
    purpose: 'Constitutional and capability validation before registry binding.',
    humanAction: 'Review constitutional fit — MARCO on BNB Chain remains canonical.',
    agentAction: 'Check readiness gate and activation runtime — no fake validation pass.',
    outputArtifact: 'labs://validation/constitutional',
    linkedSurface: '/new-project',
    manifestUri: '/registry/readiness/mainnet-gate.json',
    plannedReason: 'Automated Labs validation handoff is Phase C — read model only.',
    dependencies: [dep('narrative', 'Narrative draft')],
  }),
  stage('project', 'ready', {
    label: 'Project',
    purpose: 'Bind validated narrative to indexed project identity (UPI).',
    humanAction: 'Browse project registry — example: Melega DEX at /projects/melega-dex.',
    agentAction: 'Resolve UPI and /registry/projects/index.json — melega-dex indexed.',
    outputArtifact: 'manifest://melega/platform/project/melega-dex@0.1.0',
    linkedSurface: '/projects',
    manifestUri: '/registry/projects/index.json',
    dependencies: [dep('validation', 'Validation outcome', false)],
  }),
  stage('asset', 'ready', {
    label: 'Asset',
    purpose: 'Attach canonical or presence asset bindings to the project.',
    humanAction: 'Inspect MARCO canonical asset at /assets/marco.',
    agentAction: 'Resolve UAI — MARCO on BNB Chain LIVE; presence assets indexed separately.',
    outputArtifact: 'manifest://melega/platform/asset/marco@0.1.0',
    linkedSurface: '/assets',
    manifestUri: '/registry/assets/index.json',
    dependencies: [dep('project', 'Project identity')],
  }),
  stage('metadata', 'not_indexed', {
    label: 'Metadata',
    purpose: 'Token list metadata, logos, and discovery fields for new assets.',
    humanAction: 'Submit metadata via planned Labs handoff — not auto from narrative.',
    agentAction: 'Do not invent token list entries — show not_indexed when missing.',
    outputArtifact: 'labs://metadata/submission',
    linkedSurface: '/assets',
    dependencies: [dep('asset', 'Asset binding')],
  }),
  stage('liquidity', 'waiting', {
    label: 'Liquidity',
    purpose: 'On-chain liquidity provision via existing DEX flows only.',
    humanAction: 'Use /add when wallet and pair are ready — no pipeline auto-liquidity.',
    agentAction: 'Route live liquidity to legacy /add — never fake TVL or pool creation.',
    outputArtifact: 'legacy://add-liquidity',
    linkedSurface: '/build-studio#build-import',
    dependencies: [dep('asset', 'Asset binding'), dep('metadata', 'Metadata', false)],
  }),
  stage('registry', 'ready', {
    label: 'Registry',
    purpose: 'Publish project → asset → venue → event relationships in constitutional registry.',
    humanAction: 'Traverse /graph and registry manifests for indexed relationships.',
    agentAction: 'Fetch /registry/graph/index.json and traverse indexed manifests.',
    outputArtifact: 'manifest://melega/platform/registry-graph@0.1.0',
    linkedSurface: '/graph',
    manifestUri: '/registry/graph/index.json',
    dependencies: [dep('project', 'Project identity'), dep('asset', 'Asset binding')],
  }),
  stage('presence', 'ready', {
    label: 'Presence',
    purpose: 'Stage Economic Presence targets — explicitly not canonical economy replacement.',
    humanAction: 'Review presence targets at /presence — MARCO BNB canonical vs bridge deployments.',
    agentAction: 'Distinguish canonical MARCO from presence-only deployments via registry.',
    outputArtifact: 'manifest://melega/platform/presence-registry@0.1.0',
    linkedSurface: '/presence',
    manifestUri: '/registry/presence/index.json',
    dependencies: [dep('registry', 'Registry graph'), dep('asset', 'Asset binding')],
  }),
  stage('execution', 'planned', {
    label: 'Execution',
    purpose: 'Pre-swap execution-quality decision layer — illustrative in this build.',
    humanAction: 'Use /execution for samples only — swap at /swap for live on-chain exchange.',
    agentAction: 'Never execute trades on /execution — route live execution to /swap.',
    outputArtifact: 'manifest://melega/platform/execution@0.2.0',
    linkedSurface: '/execution',
    manifestUri: '/registry/execution/index.json',
    plannedReason: 'Execution surface is illustrative — not a live trading router.',
    dependencies: [dep('presence', 'Presence context', false)],
  }),
  stage('workspace', 'ready', {
    label: 'Workspace',
    purpose: 'Operator hub aggregating indexed economic activity across surfaces.',
    humanAction: 'Manage and orient from /workspace — read-only, no fake balances.',
    agentAction: 'Aggregate section links from workspace manifest without inventing portfolio data.',
    outputArtifact: 'manifest://melega/platform/user-workspace@0.1.0',
    linkedSurface: '/command-center',
    manifestUri: '/registry/workspace/index.json',
    dependencies: [
      dep('registry', 'Registry graph'),
      dep('presence', 'Presence context', false),
      dep('execution', 'Execution context', false),
    ],
  }),
]

const summarizeReadiness = (stages: PipelineStage[]): LabsEconomicPipeline['readiness'] => ({
  total: stages.length,
  ready: stages.filter((stage) => stage.status === 'ready').length,
  waiting: stages.filter((stage) => stage.status === 'waiting').length,
  blocked: stages.filter((stage) => stage.status === 'blocked').length,
  planned: stages.filter((stage) => stage.status === 'planned').length,
  notIndexed: stages.filter((stage) => stage.status === 'not_indexed').length,
})

export const buildDefaultPipeline = (): LabsEconomicPipeline => {
  const stages = buildLabsPreviewToMarcoEconomyStages()
  assertPipelineStageOrder(stages)

  return {
    id: DEFAULT_PIPELINE_ID,
    label: 'Labs Preview → MARCO Economy',
    description:
      'Reference pipeline explaining how a Labs narrative preview becomes an indexed economic project inside Melega DEX. MARCO on BNB Chain is the constitutional end-state example — new narratives remain planned/waiting where data is missing.',
    seedType: 'reference',
    constitutional: getConstitutionalCanonicalEconomy(),
    stages,
    readiness: summarizeReadiness(stages),
  }
}

export const getPipelineById = (id: string): LabsEconomicPipeline | undefined => {
  if (id === DEFAULT_PIPELINE_ID) {
    return buildDefaultPipeline()
  }
  return undefined
}

export const resolveLabsEconomicPipelineReadModel = (): LabsEconomicPipelineReadModel => {
  const constitutional = getConstitutionalCanonicalEconomy()
  const pipelines = [buildDefaultPipeline()]

  pipelines.forEach((pipeline) => {
    assertPipelineStageOrder(pipeline.stages)
    PIPELINE_STAGE_ORDER.forEach((id) => {
      if (!pipeline.stages.find((stage) => stage.id === id)) {
        throw new Error(`Missing pipeline stage: ${id}`)
      }
    })
  })

  return {
    asOf: LABS_PIPELINE_AS_OF,
    disclaimer: LABS_PIPELINE_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    phase: 'civilization_services_labs_pipeline',
    constitutional,
    pipelines,
    linkedSurfaces: [...PIPELINE_LINKED_SURFACES],
    crossLinks: PIPELINE_CROSS_LINKS.map((link) => ({ ...link })),
  }
}
