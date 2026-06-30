import { EventIntakeSafetyGate } from './event-intake-types'

export const EVENT_INTAKE_SAFETY_GATES: EventIntakeSafetyGate[] = [
  {
    id: 'observation_only',
    classification: 'observation_only',
    description: 'Event may update read models and manifests only — no side effects.',
    blocksExecution: true,
    requiresHumanReview: false,
  },
  {
    id: 'human_review_required',
    classification: 'human_review_required',
    description: 'Event requires human review before any downstream action.',
    blocksExecution: true,
    requiresHumanReview: true,
  },
  {
    id: 'blocked',
    classification: 'blocked',
    description: 'Event must not propagate to execution surfaces — unsafe or forbidden payload.',
    blocksExecution: true,
    requiresHumanReview: true,
  },
  {
    id: 'future_execution',
    classification: 'future_execution',
    description: 'Event may eventually route to on-chain flows via existing DEX surfaces — not from intake.',
    blocksExecution: true,
    requiresHumanReview: true,
  },
]

export const GLOBAL_INTAKE_SAFETY_RULES = [
  'No blockchain writes from event intake in any phase.',
  'No router or contract calls triggered by intake handler.',
  'No database persistence until explicit Mission 27+ storage layer.',
  'No Labs API calls until runtime connector is indexed.',
  'Payloads containing signed_tx, router_execute, or swap_execute are always unsafe.',
  'Live events must not be synthesized — schema examples only in this build.',
]

export const getSafetyGate = (classification: string): EventIntakeSafetyGate | undefined =>
  EVENT_INTAKE_SAFETY_GATES.find((gate) => gate.classification === classification)
