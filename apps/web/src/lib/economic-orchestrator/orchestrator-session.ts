import { OrchestratorRecommendation, RecommendationPriority } from './orchestrator-types'

export const ORCHESTRATOR_SESSION_ID = 'economic-orchestrator@0.1.0'

export const ORCHESTRATOR_VERSION = '0.1.0'

export const ORCHESTRATOR_AS_OF = '2026-06-29'

export const ORCHESTRATOR_DISCLAIMER =
  'Economic Orchestrator (Mission 25) — read-only decision service. Observes Economic OS state and recommends next steps. No blockchain writes, router changes, or contract interaction. Missing evidence surfaces as waiting — no fake recommendations.'

export const ORCHESTRATOR_CROSS_LINKS = [
  { label: 'Labs Pipeline', route: '/pipeline' },
  { label: 'Labs Runtime', route: '/runtime/labs' },
  { label: 'Workspace', route: '/command-center' },
  { label: 'Launch', route: '/build-studio#build-import' },
  { label: 'Surface Map', route: '/map' },
]

export const PRIORITY_ORDER: RecommendationPriority[] = ['critical', 'high', 'normal', 'low']

export const priorityRank = (priority: RecommendationPriority): number =>
  PRIORITY_ORDER.indexOf(priority)

export const sortRecommendations = (
  recommendations: OrchestratorRecommendation[],
): OrchestratorRecommendation[] =>
  [...recommendations].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
