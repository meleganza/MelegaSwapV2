import { DryRunFlowStep, DryRunFlowStepId } from './dry-run-types'
import { DRY_RUN_RECORD_FLAGS } from './dry-run-scenario'

export const CIVILIZATION_DRY_RUN_FLOW: DryRunFlowStepId[] = [
  'narrative',
  'submission',
  'review_queue',
  'decision_event',
  'intake',
  'pipeline',
  'runtime',
  'orchestrator',
  'workspace',
]

export const DRY_RUN_FLOW_STEPS: DryRunFlowStep[] = [
  {
    id: 'narrative',
    label: 'Narrative',
    surface: '/new-project',
    description: 'MARCO economy narrative seed — Labs preview shape, not deployed.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'submission',
    label: 'Submission',
    surface: '/submit',
    description: 'project_narrative category submission schema example.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'review_queue',
    label: 'Review Queue',
    surface: '/review',
    description: 'Queued constitutional narrative review — no approval executed.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'decision_event',
    label: 'Decision Event',
    surface: '/registry/review/decision-events.json',
    description: 'review_deferred decision event — observable only, no intake emission.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'intake',
    label: 'Real Event Intake',
    surface: '/registry/intake/real-event-intake.json',
    description: 'labs_narrative family routing spec — liveEventsIndexed remains 0.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    surface: '/pipeline',
    description: 'Narrative stage planned — pipeline observes dry run without registry sync.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'runtime',
    label: 'Labs Runtime',
    surface: '/runtime/labs',
    description: 'Labs disconnected — narrative observation waiting, no fake connection.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'orchestrator',
    label: 'Orchestrator',
    surface: '/orchestrator',
    description: 'High-priority narrative completion recommendation — advisory only.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  {
    id: 'workspace',
    label: 'Workspace',
    surface: '/workspace',
    description: 'Projects section visibility as schema example — not live indexed from dry run.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
]

export const DRY_RUN_CROSS_LINKS = [
  { label: 'Dry Run Console', route: '/dry-run' },
  { label: 'Submission', route: '/submit' },
  { label: 'Review Queue', route: '/review' },
  { label: 'Pipeline', route: '/pipeline' },
  { label: 'Labs Runtime', route: '/runtime/labs' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Workspace', route: '/workspace' },
  { label: 'Surface Map', route: '/map' },
  { label: 'Dry Run Manifest', route: '/registry/dry-runs/civilization-dry-run.json' },
]
