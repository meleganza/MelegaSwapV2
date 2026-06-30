import {
  ForbiddenFileRecord,
  PhaseDConsolidationGate,
  PhaseDManifestRecord,
  PhaseDMissionLineageRecord,
  PhaseDRouteRecord,
} from './phase-d-readiness-types'

export const PHASE_D_CONSOLIDATION_VERSION = '0.1.0'

export const PHASE_D_AS_OF = '2026-06-30'

export const PHASE_D_DISCLAIMER =
  'Phase D Consolidation Gate (Mission 32) — read-only release candidate audit for Missions 22–31. No feature changes, UI redesign, contract interaction, or registry mutation.'

export const PHASE_D_BASE_BRANCH = 'mission31-civilization-dry-run'

export const PHASE_D_CONSOLIDATION_BRANCH = 'phase-d-consolidation-m32'

export const PHASE_D_SAFE_BASE_COMMIT = '24f480d'

export const PHASE_D_MANIFEST_URI = '/registry/readiness/phase-d-consolidation.json'

export const PHASE_D_MISSION_LINEAGE: PhaseDMissionLineageRecord[] = [
  {
    id: 'mission22',
    mission: 22,
    title: 'Civilization Entry Point',
    branch: 'mission22-civilization-entry-point',
    headCommit: '3b4411d',
    route: '/',
    manifestUri: '/registry/homepage/index.json',
  },
  {
    id: 'mission23',
    mission: 23,
    title: 'Labs Economic Pipeline',
    branch: 'mission23-labs-economic-pipeline',
    headCommit: '3c692dd',
    route: '/pipeline',
    manifestUri: '/registry/pipeline/labs-economic-pipeline.json',
  },
  {
    id: 'mission24',
    mission: 24,
    title: 'Labs Runtime Connector',
    branch: 'mission24-labs-runtime-connector',
    headCommit: '7fc462f',
    route: '/runtime/labs',
    manifestUri: '/registry/runtime/labs-runtime.json',
  },
  {
    id: 'mission25',
    mission: 25,
    title: 'Economic Orchestrator',
    branch: 'mission25-economic-orchestrator',
    headCommit: '4569338',
    route: '/orchestrator',
    manifestUri: '/registry/orchestrator/index.json',
  },
  {
    id: 'mission26',
    mission: 26,
    title: 'Real Event Intake Spec',
    branch: 'mission26-real-event-intake-spec',
    headCommit: '9368841',
    manifestUri: '/registry/intake/real-event-intake.json',
  },
  {
    id: 'mission27',
    mission: 27,
    title: 'Economic Submission Service',
    branch: 'mission27-economic-submission-service',
    headCommit: '7d9f35c',
    route: '/submit',
    manifestUri: '/registry/submission/economic-submission.json',
  },
  {
    id: 'mission28',
    mission: 28,
    title: 'Economic Review Queue',
    branch: 'mission28-economic-review-queue',
    headCommit: 'ae81532',
    route: '/review',
    manifestUri: '/registry/review/economic-review.json',
  },
  {
    id: 'mission29',
    mission: 29,
    title: 'Submission Review Intake Bridge',
    branch: 'mission29-submission-review-intake-bridge',
    headCommit: 'e062d04',
    manifestUri: '/registry/bridges/submission-review-intake.json',
  },
  {
    id: 'mission30',
    mission: 30,
    title: 'Review Decision Event Spec',
    branch: 'mission30-review-decision-event-spec',
    headCommit: '87b4afb',
    manifestUri: '/registry/review/decision-events.json',
  },
  {
    id: 'mission31',
    mission: 31,
    title: 'Civilization Dry Run',
    branch: 'mission31-civilization-dry-run',
    headCommit: 'b8f0fea',
    route: '/dry-run',
    manifestUri: '/registry/dry-runs/civilization-dry-run.json',
  },
]

export const PHASE_D_ROUTES: PhaseDRouteRecord[] = [
  { route: '/', pagePath: 'src/pages/index.tsx', phase: 'phase_d', verified: true },
  { route: '/pipeline', pagePath: 'src/pages/pipeline/index.tsx', phase: 'phase_d', verified: true },
  { route: '/runtime/labs', pagePath: 'src/pages/runtime/labs/index.tsx', phase: 'phase_d', verified: true },
  { route: '/orchestrator', pagePath: 'src/pages/orchestrator/index.tsx', phase: 'phase_d', verified: true },
  { route: '/submit', pagePath: 'src/pages/submit/index.tsx', phase: 'phase_d', verified: true },
  { route: '/review', pagePath: 'src/pages/review/index.tsx', phase: 'phase_d', verified: true },
  { route: '/dry-run', pagePath: 'src/pages/dry-run/index.tsx', phase: 'phase_d', verified: true },
  { route: '/map', pagePath: 'src/pages/map/index.tsx', phase: 'shared', verified: true },
  { route: '/workspace', pagePath: 'src/pages/workspace/index.tsx', phase: 'shared', verified: true },
  { route: '/launch', pagePath: 'src/pages/launch/index.tsx', phase: 'shared', verified: true },
  { route: '/swap', pagePath: 'src/pages/swap/index.tsx', phase: 'legacy_dex', verified: true },
  { route: '/liquidity', pagePath: 'src/pages/liquidity.tsx', phase: 'legacy_dex', verified: true },
  { route: '/farms', pagePath: 'src/pages/farms/index.tsx', phase: 'legacy_dex', verified: true },
  { route: '/pools', pagePath: 'src/pages/pools/index.tsx', phase: 'legacy_dex', verified: true },
]

export const PHASE_D_MANIFESTS: PhaseDManifestRecord[] = [
  { uri: '/registry/homepage/index.json', mission: 'mission22', verified: true },
  { uri: '/registry/pipeline/labs-economic-pipeline.json', mission: 'mission23', verified: true },
  { uri: '/registry/runtime/labs-runtime.json', mission: 'mission24', verified: true },
  { uri: '/registry/orchestrator/index.json', mission: 'mission25', verified: true },
  { uri: '/registry/intake/real-event-intake.json', mission: 'mission26', verified: true },
  { uri: '/registry/submission/economic-submission.json', mission: 'mission27', verified: true },
  { uri: '/registry/review/economic-review.json', mission: 'mission28', verified: true },
  { uri: '/registry/review/decision-events.json', mission: 'mission30', verified: true },
  { uri: '/registry/bridges/submission-review-intake.json', mission: 'mission29', verified: true },
  { uri: '/registry/dry-runs/civilization-dry-run.json', mission: 'mission31', verified: true },
  { uri: '/registry/readiness/phase-d-consolidation.json', mission: 'consolidation', verified: true },
]

export const PHASE_D_FORBIDDEN_FILES: ForbiddenFileRecord[] = [
  { path: 'apps/web/src/config/constants/exchange.ts', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/config/constants/contracts.ts', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/config/constants/pools.tsx', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/utils/wagmi.ts', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/utils/exchange.ts', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/views/Swap/SmartSwap/utils/exchange.ts', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/pages/swap/index.tsx', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/pages/pools/index.tsx', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
  { path: 'apps/web/src/pages/farms/index.tsx', unchangedFromBase: true, baseCommit: PHASE_D_SAFE_BASE_COMMIT },
]

export const PHASE_D_MISSION_TEST_PATHS = [
  'src/lib/homepage-entry',
  'src/lib/labs-economic-pipeline',
  'src/lib/labs-runtime',
  'src/lib/economic-orchestrator',
  'src/lib/real-event-intake',
  'src/lib/economic-submission',
  'src/lib/economic-review',
  'src/lib/submission-review-intake',
  'src/lib/review-decision-events',
  'src/lib/civilization-dry-run',
  'src/lib/phase-d-readiness',
]

export const resolvePhaseDConsolidationGate = (
  validation: PhaseDConsolidationGate['validation'],
): PhaseDConsolidationGate => ({
  gate: 'manifest://melega/platform/phase-d-consolidation@0.1.0',
  api_version: PHASE_D_CONSOLIDATION_VERSION,
  phase: 'phase_d_consolidation_gate',
  as_of: PHASE_D_AS_OF,
  disclaimer: PHASE_D_DISCLAIMER,
  read_only: true,
  execution_enabled: false,
  registry_mutation_enabled: false,
  verdict: 'release_candidate',
  base_branch: PHASE_D_BASE_BRANCH,
  consolidation_branch: PHASE_D_CONSOLIDATION_BRANCH,
  lineage: PHASE_D_MISSION_LINEAGE.map((record) => ({ ...record })),
  routes: PHASE_D_ROUTES.map((route) => ({ ...route })),
  manifests: PHASE_D_MANIFESTS.map((manifest) => ({ ...manifest })),
  forbidden_files: PHASE_D_FORBIDDEN_FILES.map((file) => ({ ...file })),
  validation,
})

export const resolvePhaseDReadinessReadModel = (
  validation: PhaseDConsolidationGate['validation'],
) => {
  const gate = resolvePhaseDConsolidationGate(validation)
  return {
    asOf: gate.as_of,
    disclaimer: gate.disclaimer,
    readOnly: true as const,
    executionEnabled: false as const,
    registryMutationEnabled: false as const,
    phase: gate.phase,
    verdict: gate.verdict,
    baseBranch: gate.base_branch,
    consolidationBranch: gate.consolidation_branch,
    lineage: gate.lineage,
    routes: gate.routes,
    manifests: gate.manifests,
    forbiddenFiles: gate.forbidden_files,
  }
}
